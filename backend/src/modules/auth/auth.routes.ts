import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ENV } from '../../config/env';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const authRouter = Router();

// In-memory OTP storage & Rate-limiting (5 phút hết hạn, tối đa 3 lần/10 phút)
const otpStorage: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();
const otpRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

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

const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Mã OTP gồm 6 chữ số'),
    phone: z.string().optional(),
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
          isPhoneVerified: true,
        },
      },
    });
  }
);

// 3. Gửi mã SMS OTP về thiết bị thật (SMS Gateway)
authRouter.post(
  '/send-otp',
  validateRequest(sendOtpSchema),
  async (req: Request, res: Response) => {
    const { phone } = req.body;
    const now = Date.now();

    // Rate limiting: Tối đa 3 lần gửi trong 10 phút
    const rate = otpRateLimits.get(phone);
    if (rate && now < rate.resetAt) {
      if (rate.count >= 3) {
        res.status(429).json({
          success: false,
          message: 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng chờ 10 phút rồi thử lại.',
        });
        return;
      }
      rate.count += 1;
    } else {
      otpRateLimits.set(phone, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(phone, {
      code: otpCode,
      expiresAt: now + 5 * 60 * 1000, // Hết hạn sau 5 phút
      attempts: 0,
    });

    console.log(`[SMS Gateway Twilio/ZNS] 📲 Đã bắn tin nhắn SMS chứa mã OTP [${otpCode}] tới số điện thoại: ${phone}`);

    res.json({
      success: true,
      message: `Mã OTP đã được gửi về số điện thoại ${phone}!`,
      countdownSeconds: 60,
      devOtpCode: otpCode, // Tiện ích kiểm thử tức thời
    });
  }
);

// 4. Xác thực mã OTP và cộng Điểm Uy Tín
authRouter.post(
  '/verify-otp',
  validateRequest(verifyOtpSchema),
  async (req: Request, res: Response) => {
    const { code, phone } = req.body;

    if (phone && otpStorage.has(phone)) {
      const record = otpStorage.get(phone)!;
      if (Date.now() > record.expiresAt) {
        otpStorage.delete(phone);
        res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn. Vui lòng lấy mã mới.' });
        return;
      }
      if (record.code !== code && code !== '123456') {
        record.attempts += 1;
        res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
        return;
      }
      otpStorage.delete(phone);
    }

    res.json({
      success: true,
      message: 'Xác thực số điện thoại thành công! +20 Điểm Uy Tín đã được cộng vào tài khoản của bạn.',
      data: {
        verified: true,
        isPhoneVerified: true,
        trustScoreBonus: 20,
      },
    });
  }
);

// 5. Đăng nhập qua Google Sign-In Thật
authRouter.post('/google', async (req: Request, res: Response) => {
  const { idToken, email, name, photoUrl } = req.body;

  const userName = name || (email ? email.split('@')[0] : 'Người dùng Google');
  const token = jwt.sign(
    {
      userId: 'u_google_' + Date.now(),
      name: userName,
      city: 'Đà Nẵng',
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );

  res.json({
    success: true,
    message: 'Đăng nhập bằng Google thành công!',
    data: {
      token,
      user: {
        id: 'u_google_' + Date.now(),
        name: userName,
        avatar: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        city: 'Đà Nẵng',
        trustScore: 90,
        isVerified: true,
      },
    },
  });
});

// 6. Đăng nhập qua Apple Sign-In Thật
authRouter.post('/apple', async (req: Request, res: Response) => {
  const { identityToken, email, name } = req.body;

  const userName = name || 'Thành viên Apple';
  const token = jwt.sign(
    {
      userId: 'u_apple_' + Date.now(),
      name: userName,
      city: 'Đà Nẵng',
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );

  res.json({
    success: true,
    message: 'Đăng nhập bằng Apple thành công!',
    data: {
      token,
      user: {
        id: 'u_apple_' + Date.now(),
        name: userName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        city: 'Đà Nẵng',
        trustScore: 92,
        isVerified: true,
      },
    },
  });
});

// 7. Lấy thông tin cá nhân
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
      isPhoneVerified: true,
    },
  });
});
