import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const profileRouter = Router();

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    gender: z.string().optional(),
    birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    goal: z.string().optional(),
    interests: z.array(z.string()).optional(),
    socialStyle: z.string().optional(),
    city: z.string().optional(),
  }),
});

// Lấy hồ sơ người dùng khác
profileRouter.get('/:id', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = String(req.params.id);
    const currentUserId = req.user!.userId;

    // Check if blocked
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: currentUserId },
        ]
      }
    });

    if (block) {
      res.status(403).json({ success: false, message: 'Không thể xem hồ sơ người dùng này.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    // Check friendship status
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: currentUserId },
        ]
      }
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.profile?.fullName,
        city: user.city,
        trustScore: user.trustScore,
        avatarUrl: user.profile?.avatarUrl,
        bio: user.profile?.bio,
        interests: user.profile?.interests || [],
        socialStyle: user.profile?.socialStyle,
        isVerified: user.profile?.isVerified,
        friendshipStatus: friendship?.status || 'NONE',
        friendshipId: friendship?.id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Cập nhật hồ sơ cá nhân
profileRouter.put('/me', authenticateJwt, validateRequest(updateProfileSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { city, fullName, ...profileData } = req.body;

    await prisma.$transaction(async (tx) => {
      if (city) {
        await tx.user.update({
          where: { id: userId },
          data: { city },
        });
      }

      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: fullName || req.user!.name,
          ...profileData,
        },
        update: {
          ...(fullName && { fullName }),
          ...profileData,
        },
      });
    });

    res.json({ success: true, message: 'Cập nhật hồ sơ thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Lấy danh sách block
profileRouter.get('/blocks', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          include: { profile: true }
        }
      }
    });

    res.json({
      success: true,
      data: blocks.map(b => ({
        id: b.id,
        blockedUserId: b.blockedId,
        name: b.blocked.profile?.fullName,
        avatarUrl: b.blocked.profile?.avatarUrl,
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Block người dùng
profileRouter.post('/blocks/:id', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = String(req.params.id);
    const currentUserId = req.user!.userId;

    if (targetUserId === currentUserId) {
      res.status(400).json({ success: false, message: 'Không thể tự block chính mình.' });
      return;
    }

    // Delete friendship if exists
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: currentUserId },
        ]
      }
    });

    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: targetUserId } },
      create: { blockerId: currentUserId, blockedId: targetUserId },
      update: {},
    });

    res.json({ success: true, message: 'Đã chặn người dùng này.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Bỏ block
profileRouter.delete('/blocks/:id', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = String(req.params.id);
    const currentUserId = req.user!.userId;

    await prisma.block.deleteMany({
      where: { blockerId: currentUserId, blockedId: targetUserId }
    });

    res.json({ success: true, message: 'Đã bỏ chặn người dùng này.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});
