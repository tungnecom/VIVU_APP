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
    videoUrl: z.string().optional(),
    videoDuration: z.number().optional(),
    hashtags: z.array(z.string()).default([]),
    location: z.string().optional(),
    time: z.string().optional(),
    slots: z.string().optional(),
    taggedVenue: z
      .object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        platformSource: z.string().optional(),
      })
      .optional(),
    taggedCompanions: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        })
      )
      .optional(),
    isRecruitment: z.boolean().optional(),
    recruitmentSlots: z.number().optional(),
    recruitmentBudget: z.string().optional(),
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
      id: 'p3_video',
      author: {
        id: 'u3',
        name: 'Lan Anh (VIVU VIP)',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        location: 'Sơn Trà, Đà Nẵng',
        trustScore: 96,
      },
      timeAgo: '1 giờ trước',
      content:
        'Hoàng hôn buông xuống trên vịnh Sơn Trà Marina đẹp như Santorini thu nhỏ 🌊☕ Bật loa lên để nghe trọn tiếng sóng biển và gió đại dương nha mọi người!',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: 15,
      hashtags: ['#SonTraMarina', '#VideoDuLich', '#ShopeeFoodTop', '#AmThanhThuc'],
      likes: 246,
      commentsCount: 38,
      sharesCount: 19,
      taggedVenue: {
        id: 'dn_sontra_marina',
        name: 'Sơn Trà Marina Cafe & Lounge',
        address: 'Đường Hồ Xanh, Bán đảo Sơn Trà, Đà Nẵng',
        platformSource: 'SHOPEEFOOD',
      },
      isRecruitment: false,
    },
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
        'Tuyển cạ cùng lượn Food Tour Đà Nẵng cuối tuần: Bánh tráng thịt heo Đại Lộc, Bún mắm nêm, Chè sầu Liên. Ai đi cùng đăng ký ngay nhé! 🍲🛵',
      images: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      ],
      hashtags: ['#CafeĐàNẵng', '#DuLịch', '#GrabFoodReview'],
      likes: 128,
      commentsCount: 22,
      sharesCount: 9,
      taggedVenue: {
        id: 'dn_dacsan_trang',
        name: 'Đặc Sản Trần - Bánh Tráng Cuốn',
        address: '04 Lê Duẩn, Hải Châu, Đà Nẵng',
        platformSource: 'GRABFOOD',
      },
      isRecruitment: true,
      recruitmentSlots: 4,
      recruitmentJoined: 2,
      activitySnippet: {
        location: 'Hải Châu, Đà Nẵng',
        time: 'Thứ 7, 18:00 - 21:00',
        slots: '2/4 người',
        budget: '150k - 200k / người',
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
    const {
      content,
      images,
      videoUrl,
      videoDuration,
      hashtags,
      location,
      time,
      slots,
      taggedVenue,
      taggedCompanions,
      isRecruitment,
      recruitmentSlots,
      recruitmentBudget,
    } = req.body;

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
      images: images || [],
      videoUrl,
      videoDuration,
      hashtags: hashtags || [],
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      taggedVenue,
      taggedCompanions,
      isRecruitment: !!isRecruitment,
      recruitmentSlots,
      recruitmentJoined: 1,
      activitySnippet: location
        ? {
            location,
            time: time || 'Hôm nay',
            slots: slots || '4 người',
            budget: recruitmentBudget,
          }
        : undefined,
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
