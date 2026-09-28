import { Request, Response, Router } from 'express';
import { MatchmakingService, UserMatchProfile } from '../ai/matchmaking.service';

export const activitiesRouter = Router();

// GET /api/activities/matchmaking -> Trả về danh sách ứng viên bạn đồng hành được AI xếp hạng
activitiesRouter.get('/matchmaking', async (req: Request, res: Response) => {
  const currentUser: UserMatchProfile = {
    id: 'u_me',
    name: 'Tùng',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    city: 'Đà Nẵng',
    trustScore: 94,
    communicationStyle: 'normal',
    interests: ['Food', 'Cafe', 'Photography', 'Travel'],
    goals: ['Làm quen bạn mới', 'Tìm người đi ăn'],
    latitude: 16.0544,
    longitude: 108.2022,
  };

  const candidatePool: UserMatchProfile[] = [
    {
      id: 'u1',
      name: 'Minh Thư',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      city: 'Đà Nẵng',
      trustScore: 94,
      communicationStyle: 'easy',
      interests: ['Food', 'Cafe', 'Photography'],
      goals: ['Làm quen bạn mới', 'Tìm người đi ăn'],
      latitude: 16.0612,
      longitude: 108.2215,
    },
    {
      id: 'u2',
      name: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      city: 'Đà Nẵng',
      trustScore: 88,
      communicationStyle: 'easy',
      interests: ['Phượt', 'Camping', 'Photography'],
      goals: ['Khám phá thành phố', 'Tìm hội nhóm'],
      latitude: 16.12,
      longitude: 108.28,
    },
    {
      id: 'u3',
      name: 'Lan Anh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      city: 'Đà Nẵng',
      trustScore: 92,
      communicationStyle: 'shy',
      interests: ['Cafe', 'Travel', 'Art', 'Music'],
      goals: ['Làm quen bạn mới', 'Khám phá thành phố'],
      latitude: 16.068,
      longitude: 108.239,
    },
  ];

  const matches = MatchmakingService.rankCandidates(currentUser, candidatePool);

  res.json({
    success: true,
    data: matches,
  });
});
