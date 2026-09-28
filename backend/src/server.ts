import http from 'http';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Server } from 'socket.io';

import { ENV } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { activitiesRouter } from './modules/activities/activities.routes';
import { viviRouter } from './modules/ai/vivi.routes';
import { authRouter } from './modules/auth/auth.routes';
import { ChatGateway } from './modules/chat/chat.gateway';
import { feedRouter } from './modules/feed/feed.routes';

const app = express();
const server = http.createServer(app);

// 1. Bảo mật với Helmet & CORS
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Chống DDoS & Rate limiting bảo vệ 10k CCU
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tối đa 1000 requests / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.',
  },
});
app.use(limiter);

// 3. Phân tích dữ liệu JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VIVU Backend API Server',
    version: '1.0.0',
    concurrency_capability: '10,000 CCU Ready',
  });
});

import { connectDatabase } from './config/database';
import { crawlerRouter } from './modules/crawler/crawler.routes';
import { PlaceCrawlerEngine } from './modules/crawler/crawler.service';
import { friendsRouter } from './modules/friends/friends.routes';

// 5. Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/feed', feedRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/ai', viviRouter);
app.use('/api/crawler', crawlerRouter);
app.use('/api/friends', friendsRouter);

// 6. Global Centralized Error Handler
app.use(errorHandler);

// 7. Khởi tạo Socket.io WebSocket Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
ChatGateway.init(io);

// 8. Khởi chạy Server
const PORT = ENV.PORT;
server.listen(PORT, async () => {
  await connectDatabase();
  PlaceCrawlerEngine.initAutomatedCron(60);
  console.log('====================================================');
  console.log(`🚀 VIVU Backend Server đang chạy tại cổng http://localhost:${PORT}`);
  console.log(`📡 WebSocket Real-time Engine: Sẵn sàng`);
  console.log(`🧠 AI Matchmaking & Semantic Search Engine: Sẵn sàng`);
  console.log(`🛡️ Khả năng chịu tải: Thiết kế tối ưu cho 10,000 CCU`);
  console.log('====================================================');
});


