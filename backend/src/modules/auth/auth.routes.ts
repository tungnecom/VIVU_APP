import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ENV } from '../../config/env';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const authRouter = Router();

// Validation Schemas
const registerSchema = z.object({
  body: z.object({
    identifier: z.string().min(5, 'Số điện thoại hoặc email tối thiểu 5 ký tự'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    city: z.string().default('Đà Nẵng'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(5),
    password: z.string().min(6),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Mã OTP gồm 6 chữ số'),
  }),
});

// 1. Đăng ký
authRouter.post(
  '/register',
  validateRequest(registerSchema),
  async (req: Request, res: Response) => {
    const { identifier, city } = req.body;

    const token = jwt.sign(
      {
        userId: 'u_' + Date.now(),
        name: identifier.split('@')[0],
        city,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        token,
        needOtpVerification: true,
      },
    });
  }
);

// 2. Đăng nhập
authRouter.post(
  '/login',
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    const { identifier } = req.body;

    const token = jwt.sign(
      {
        userId: 'u_tung_travel',
        name: 'Tùng',
        city: 'Đà Nẵng',
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token,
        user: {
          id: 'u_tung_travel',
          name: 'Tùng',
          city: 'Đà Nẵng',
          trustScore: 94,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        },
      },
    });
  }
);

// 3. Xác thực OTP
authRouter.post(
  '/verify-otp',
  validateRequest(verifyOtpSchema),
  async (req: Request, res: Response) => {
    const { code } = req.body;

    // Trong môi trường development / staging, chấp nhận mã hoặc bất kỳ mã 6 số
    if (code) {
      res.json({
        success: true,
        message: 'Xác thực OTP thành công!',
        data: { verified: true },
      });
      return;
    }

    res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
  }
);

// 4. Lấy thông tin cá nhân
authRouter.get('/me', authenticateJwt, async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.user?.userId,
      name: req.user?.name || 'Tùng',
      city: 'Đà Nẵng',
      trustScore: 94,
      badge: 'Thành viên Tích Cực',
      interests: ['Food', 'Cafe', 'Photography', 'Travel'],
      communicationStyle: 'Bình thường',
    },
  });
});
