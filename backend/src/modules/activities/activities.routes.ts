import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const activitiesRouter = Router();

const createActivitySchema = z.object({
  body: z.object({
    title: z.string().min(5),
    category: z.string(),
    city: z.string(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    maxCount: z.number().int().min(2).max(50),
    image: z.string().url().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const joinRequestSchema = z.object({
  body: z.object({
    message: z.string().optional(),
  }),
});

// Lấy danh sách các kèo đang mở (Khám phá kèo)
activitiesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, category, status } = req.query;

    const where: any = {
      status: (status as string) || 'OPEN',
    };

    if (city) where.city = city as string;
    if (category) where.category = category as string;

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        host: { include: { profile: true } },
        _count: { select: { participants: true, joinRequests: true } }
      },
      take: 50,
    });

    res.json({
      success: true,
      data: activities.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        city: a.city,
        date: a.date,
        time: a.time,
        location: a.location,
        joinedCount: a.joinedCount,
        maxCount: a.maxCount,
        image: a.image,
        status: a.status,
        host: {
          id: a.host.id,
          name: a.host.profile?.fullName,
          avatarUrl: a.host.profile?.avatarUrl,
          trustScore: a.host.trustScore,
        },
        participantsCount: a._count.participants,
        requestsCount: a._count.joinRequests,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Tạo kèo mới
activitiesRouter.post('/', authenticateJwt, validateRequest(createActivitySchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const hostId = req.user!.userId;
    const data = req.body;

    const activity = await prisma.$transaction(async (tx) => {
      const act = await tx.activity.create({
        data: {
          ...data,
          image: data.image || 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
          hostId,
          joinedCount: 1, // Chủ kèo
          status: 'OPEN',
        }
      });

      // Thêm host vào danh sách participants
      await tx.activityParticipant.create({
        data: {
          activityId: act.id,
          userId: hostId,
          role: 'HOST',
        }
      });

      // Tạo group chat (Conversation) cho kèo
      const conversation = await tx.conversation.create({
        data: {
          type: 'EVENT_GROUP',
          name: `Nhóm chat: ${act.title}`,
          activityId: act.id,
        }
      });

      await tx.conversationMember.create({
        data: {
          conversationId: conversation.id,
          userId: hostId,
          role: 'ADMIN',
        }
      });

      return act;
    });

    res.status(201).json({ success: true, message: 'Tạo kèo thành công', data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Lấy chi tiết kèo
activitiesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        host: { include: { profile: true } },
        participants: { include: { user: { include: { profile: true } } } },
      }
    });

    if (!activity) {
      res.status(404).json({ success: false, message: 'Không tìm thấy kèo' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...activity,
        participants: (activity as any).participants.map((p: any) => ({
          userId: p.userId,
          name: p.user.profile?.fullName,
          avatarUrl: p.user.profile?.avatarUrl,
          role: p.role,
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Yêu cầu tham gia kèo
activitiesRouter.post('/:id/join', authenticateJwt, validateRequest(joinRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = String(req.params.id);
    const userId = req.user!.userId;
    const { message } = req.body;

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) {
      res.status(404).json({ success: false, message: 'Không tìm thấy kèo' });
      return;
    }

    if (activity.status !== 'OPEN' || activity.joinedCount >= activity.maxCount) {
      res.status(400).json({ success: false, message: 'Kèo đã đóng hoặc đã đầy.' });
      return;
    }

    if (activity.hostId === userId) {
      res.status(400).json({ success: false, message: 'Bạn là chủ kèo.' });
      return;
    }

    const existingRequest = await prisma.joinRequest.findFirst({
      where: { activityId, userId }
    });

    if (existingRequest) {
      res.status(400).json({ success: false, message: 'Bạn đã gửi yêu cầu tham gia kèo này rồi.' });
      return;
    }

    const request = await prisma.joinRequest.create({
      data: {
        activityId,
        userId,
        message,
        status: 'PENDING',
      }
    });

    res.json({ success: true, message: 'Gửi yêu cầu thành công, chờ chủ kèo duyệt.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Lấy danh sách yêu cầu tham gia (Dành cho host)
activitiesRouter.get('/:id/requests', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = String(req.params.id);
    const userId = req.user!.userId;

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity || activity.hostId !== userId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xem yêu cầu của kèo này.' });
      return;
    }

    const requests = await prisma.joinRequest.findMany({
      where: { activityId, status: 'PENDING' },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: requests.map((r: any) => ({
        id: r.id,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.profile?.fullName,
          avatarUrl: r.user.profile?.avatarUrl,
          trustScore: r.user.trustScore,
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Duyệt hoặc từ chối yêu cầu tham gia
activitiesRouter.put('/:id/requests/:requestId', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = String(req.params.id);
    const requestId = String(req.params.requestId);
    const userId = req.user!.userId;
    const { action } = req.body; // ACCEPT or DECLINE

    if (action !== 'ACCEPT' && action !== 'DECLINE') {
      res.status(400).json({ success: false, message: 'Action không hợp lệ.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findUnique({ where: { id: activityId } });
      if (!activity || activity.hostId !== userId) {
        throw new Error('FORBIDDEN');
      }

      const request = await tx.joinRequest.findUnique({ where: { id: requestId, activityId } });
      if (!request || request.status !== 'PENDING') {
        throw new Error('NOT_FOUND');
      }

      if (action === 'ACCEPT') {
        if (activity.joinedCount >= activity.maxCount) {
          throw new Error('FULL');
        }

        // Cập nhật trạng thái
        await tx.joinRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
        });

        // Tăng count
        const updatedActivity = await tx.activity.update({
          where: { id: activityId },
          data: { joinedCount: { increment: 1 } }
        });

        if (updatedActivity.joinedCount >= updatedActivity.maxCount) {
          await tx.activity.update({
            where: { id: activityId },
            data: { status: 'FULL' }
          });
        }

        // Thêm vào danh sách participant
        await tx.activityParticipant.create({
          data: {
            activityId,
            userId: request.userId,
            role: 'MEMBER',
          }
        });

        // Thêm vào nhóm chat
        const conversation = await tx.conversation.findUnique({ where: { activityId } });
        if (conversation) {
          await tx.conversationMember.create({
            data: {
              conversationId: conversation.id,
              userId: request.userId,
              role: 'MEMBER',
            }
          });
        }

      } else {
        // DECLINE
        await tx.joinRequest.update({
          where: { id: requestId },
          data: { status: 'DECLINED' }
        });
      }
    });

    res.json({ success: true, message: action === 'ACCEPT' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.' });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({ success: false, message: 'Không có quyền.' });
    } else if (error.message === 'NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Yêu cầu không hợp lệ.' });
    } else if (error.message === 'FULL') {
      res.status(400).json({ success: false, message: 'Kèo đã đầy.' });
    } else {
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
});
