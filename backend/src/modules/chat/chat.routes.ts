import { Request, Response, Router } from 'express';
import { prisma } from '../../config/database';
import { authenticateJwt } from '../../middlewares/auth.middleware';

export const chatRouter = Router();

// Bắt buộc đăng nhập
chatRouter.use(authenticateJwt);

// Lấy danh sách các cuộc hội thoại của user
chatRouter.get('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            activity: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Lấy tin nhắn mới nhất
              include: { sender: { include: { profile: true } } }
            },
            members: {
              where: { userId: { not: userId } },
              include: { user: { include: { profile: true } } }
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: 'desc' } }
    });

    const data = memberships.map(m => {
      const conv = m.conversation;
      const lastMessage = conv.messages[0];
      
      let name = conv.name;
      let avatar = null;

      if (conv.type === 'DIRECT') {
        const otherMember = conv.members[0]?.user;
        name = otherMember?.profile?.fullName || 'Người dùng';
        avatar = otherMember?.profile?.avatarUrl;
      } else if (conv.type === 'EVENT_GROUP' && conv.activity) {
        name = conv.activity.title;
        avatar = conv.activity.image;
      }

      return {
        id: conv.id,
        type: conv.type,
        name,
        avatar,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          senderName: lastMessage.sender.profile?.fullName,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead,
        } : null,
        unreadCount: 0, // Tính sau
        updatedAt: conv.updatedAt,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Lấy lịch sử tin nhắn của một cuộc hội thoại
chatRouter.get('/conversations/:id/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const conversationId = String(req.params.id);
    const userId = req.user!.userId;

    // Check quyền truy cập
    const membership = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } }
    });

    if (!membership) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập nhóm chat này.' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { include: { profile: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 100, // Pagination sau
    });

    res.json({
      success: true,
      data: messages.map(m => ({
        id: m.id,
        text: m.text,
        mediaUrl: m.mediaUrl,
        isBot: m.isBot,
        createdAt: m.createdAt,
        sender: {
          id: m.sender.id,
          name: m.sender.profile?.fullName,
          avatarUrl: m.sender.profile?.avatarUrl,
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});
