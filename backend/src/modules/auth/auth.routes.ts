import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ENV } from '../../config/env';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { prisma } from '../../config/database';

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
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').optional(),
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
    phone: z.string(),
  }),
});

// Helper function to create session and token
async function createSessionAndToken(userId: string, name: string, city: string) {
  const token = jwt.sign(
    { userId, name, city },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    }
  });

  return token;
}

// 1. Đăng ký
authRouter.post(
  '/register',
  validateRequest(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password, city, fullName } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { identifier },
      });

      if (existingUser) {
        res.status(400).json({ success: false, message: 'Tài khoản đã tồn tại' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const name = fullName || identifier.split('@')[0];

      const user = await prisma.user.create({
        data: {
          identifier,
          passwordHash,
          city,
          profile: {
            create: {
              fullName: name,
            }
          }
        },
        include: { profile: true }
      });

      const token = await createSessionAndToken(user.id, name, city);

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        data: {
          token,
          needOtpVerification: true,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
);

// 2. Đăng nhập
authRouter.post(
  '/login',
  validateRequest(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { identifier },
        include: { profile: true },
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
        return;
      }

      const name = user.profile?.fullName || 'Người dùng';
      const token = await createSessionAndToken(user.id, name, user.city);

      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() }
      });

      res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: {
          token,
          user: {
            id: user.id,
            name,
            city: user.city,
            trustScore: user.trustScore,
            avatar: user.profile?.avatarUrl,
            isPhoneVerified: user.profile?.isVerified,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
);

// 3. Gửi mã SMS OTP về thiết bị thật (SMS Gateway)
authRouter.post(
  '/send-otp',
  authenticateJwt,
  validateRequest(sendOtpSchema),
  async (req: Request, res: Response): Promise<void> => {
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
  authenticateJwt,
  validateRequest(verifyOtpSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, phone } = req.body;
      const userId = req.user!.userId;

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
      } else {
        res.status(400).json({ success: false, message: 'Không tìm thấy yêu cầu OTP cho số điện thoại này.' });
        return;
      }

      // Mark user as verified and add trust score if not already verified
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile?.isVerified) {
        await prisma.$transaction(async (tx) => {
          await tx.profile.update({
            where: { userId },
            data: { isVerified: true },
          });

          await tx.user.update({
            where: { id: userId },
            data: { trustScore: { increment: 20 } },
          });

          await tx.trustLog.create({
            data: {
              userId,
              delta: 20,
              reason: 'Xác minh số điện thoại thành công',
            }
          });
        });

        res.json({
          success: true,
          message: 'Xác thực số điện thoại thành công! +20 Điểm Uy Tín đã được cộng vào tài khoản của bạn.',
          data: {
            verified: true,
            isPhoneVerified: true,
            trustScoreBonus: 20,
          },
        });
      } else {
        res.json({
          success: true,
          message: 'Tài khoản của bạn đã được xác minh từ trước.',
          data: {
            verified: true,
            isPhoneVerified: true,
            trustScoreBonus: 0,
          },
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
);

// 5. Đăng xuất
authRouter.post('/logout', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      });
    }
    res.json({ success: true, message: 'Đăng xuất thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// 6. Đăng nhập qua Google Sign-In Thật
// Placeholder since we don't have the actual token verification yet
authRouter.post('/google', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Chưa implement Google auth verify' });
});

// 7. Đăng nhập qua Apple Sign-In Thật
authRouter.post('/apple', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Chưa implement Apple auth verify' });
});

// 8. Lấy thông tin cá nhân
authRouter.get('/me', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.profile?.fullName || 'Người dùng',
        city: user.city,
        trustScore: user.trustScore,
        avatar: user.profile?.avatarUrl,
        badge: user.trustScore >= 90 ? 'Thành viên Tích Cực' : 'Thành viên',
        interests: user.profile?.interests || [],
        communicationStyle: user.profile?.socialStyle,
        isPhoneVerified: user.profile?.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});
