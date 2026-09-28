import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { redisCache } from '../../config/redis';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const feedRouter = Router();

const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Nội dung bài viết không được để trống'),
    images: z.array(z.string()).default([]),
    hashtags: z.array(z.string()).default([]),
    location: z.string().optional(),
    time: z.string().optional(),
    slots: z.string().optional(),
  }),
});

// Cache-aside pattern for 10k CCU
feedRouter.get('/', async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'all';
  const cacheKey = `feed:home:${category}`;

  const cached = await redisCache.get(cacheKey);
  if (cached) {
    res.json({
      success: true,
      fromCache: true,
      data: JSON.parse(cached),
    });
    return;
  }

  const posts = [
    {
      id: 'p1',
      author: {
        id: 'u1',
        name: 'Minh Thư',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        location: 'Hải Châu, Đà Nẵng',
        trustScore: 94,
      },
      timeAgo: '2 giờ trước',
      content:
        'Cuối tuần tuyệt vời ở Đà Nẵng 🌊. Ai có gợi ý quán cafe view đẹp ở đây không nhỉ? ✨ Mình muốn tìm nơi yên tĩnh để vừa chill vừa ngắm hoàng hôn.',
      images: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      ],
      hashtags: ['#CafeĐàNẵng', '#DuLịch', '#Checkin'],
      likes: 128,
      commentsCount: 22,
      sharesCount: 9,
      activitySnippet: {
        location: 'Hải Châu, Đà Nẵng',
        time: 'Thứ 7, 25/05 - 17:00',
        slots: '5 người',
      },
    },
    {
      id: 'p2',
      author: {
        id: 'u2',
        name: 'Quang Anh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: 'Sơn Trà, Đà Nẵng',
        trustScore: 88,
      },
      timeAgo: '4 giờ trước',
      content:
        'Chiều nay chạy xe lên đỉnh Bàn Cờ đón hoàng hôn săn mây cực đã anh em ơi! Ai đi cùng không 16h30 xuất phát chân núi nhé! 🛵🌄',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
      ],
      hashtags: ['#PhượtSơnTrà', '#HoàngHôn', '#ViVuĐàNẵng'],
      likes: 95,
      commentsCount: 14,
      sharesCount: 5,
    },
  ];

  await redisCache.set(cacheKey, JSON.stringify(posts), 60);

  res.json({
    success: true,
    fromCache: false,
    data: posts,
  });
});

feedRouter.post(
  '/posts',
  authenticateJwt,
  validateRequest(createPostSchema),
  async (req: Request, res: Response) => {
    const { content, images, hashtags, location, time, slots } = req.body;

    const newPost = {
      id: 'p_' + Date.now(),
      author: {
        id: req.user?.userId || 'u_me',
        name: req.user?.name || 'Tùng',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        location: location || 'Đà Nẵng',
      },
      timeAgo: 'Vừa xong',
      content,
      images,
      hashtags,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      activitySnippet: location ? { location, time, slots } : undefined,
    };

    // Invalidate cache
    await redisCache.del('feed:home:all');

    res.status(201).json({
      success: true,
      message: 'Đăng bài viết thành công!',
      data: newPost,
    });
  }
);
