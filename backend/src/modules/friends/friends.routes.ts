import { Request, Response, Router } from 'express';
import { FriendsService } from './friends.service';

export const friendsRouter = Router();

/**
 * GET /api/friends
 * Lấy danh sách bạn bè chính thức của người dùng
 */
friendsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const friends = await FriendsService.getFriends();
    res.json({
      success: true,
      total: friends.length,
      data: friends,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/friends/requests
 * Lấy danh sách lời mời kết bạn đang chờ duyệt
 */
friendsRouter.get('/requests', async (req: Request, res: Response) => {
  try {
    const requests = await FriendsService.getPendingRequests();
    res.json({
      success: true,
      total: requests.length,
      data: requests,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/friends/request/:targetUserId
 * Gửi lời mời kết bạn kèm ghi chú
 */
friendsRouter.post('/request/:targetUserId', async (req: Request, res: Response) => {
  try {
    const targetUserId = String(req.params.targetUserId);
    const { message } = req.body;
    const result = await FriendsService.sendFriendRequest(targetUserId, message);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/friends/respond/:requestId
 * Phản hồi lời mời kết bạn (Chấp nhận hoặc Từ chối)
 */
friendsRouter.put('/respond/:requestId', async (req: Request, res: Response) => {
  try {
    const requestId = String(req.params.requestId);
    const { action } = req.body; // 'ACCEPT' | 'DECLINE'
    const result = await FriendsService.respondToRequest(requestId, action);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/friends/:friendId
 * Hủy kết bạn
 */
friendsRouter.delete('/:friendId', async (req: Request, res: Response) => {
  try {
    const friendId = String(req.params.friendId);
    const result = await FriendsService.removeFriend(friendId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/friends/search
 * Tìm kiếm bạn bè đa tiêu chí
 */
friendsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const city = req.query.city as string;
    const interest = req.query.interest as string;
    const users = await FriendsService.searchUsers(query, city, interest);
    res.json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/friends/suggestions
 * Gợi ý bạn bè phù hợp dựa trên thuật toán AI Matchmaking
 */
friendsRouter.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Đà Nẵng';
    const suggestions = await FriendsService.getSuggestedBuddies(city);
    res.json({
      success: true,
      total: suggestions.length,
      data: suggestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
