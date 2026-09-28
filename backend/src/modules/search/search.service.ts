import { redisCache } from '../../config/redis';
import { EmbeddingService } from '../ai/embedding.service';

export interface SearchItem {
  id: string;
  type: 'post' | 'activity' | 'place' | 'group';
  title: string;
  description: string;
  category: string;
  location: string;
  tags: string[];
  rating?: number;
  score?: number;
}

export class SearchService {
  /**
   * Thuật toán Hybrid Search (Keyword + Vector Semantic Similarity)
   * Có tích hợp bộ nhớ đệm Redis để chịu tải 10k CCU
   */
  public static async hybridSearch(
    query: string,
    category?: string,
    city = 'Đà Nẵng'
  ): Promise<SearchItem[]> {
    const cacheKey = `search:${city}:${category || 'all'}:${query.toLowerCase().trim()}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }

    // Mock dataset phong phú của VIVU
    const dataset: SearchItem[] = [
      {
        id: 'act_1',
        type: 'activity',
        title: 'Food tour Đà Nẵng',
        description: 'Khám phá ẩm thực đường phố: Bánh tráng thịt heo Đại Lộc, Bún chả cá, Kem bơ chợ Bắc Mỹ An.',
        category: 'Ăn uống',
        location: 'Hải Châu, Đà Nẵng',
        tags: ['food', 'ẩm thực', 'chợ đêm', 'kết bạn'],
        rating: 4.8,
      },
      {
        id: 'act_2',
        type: 'activity',
        title: 'Săn hoàng hôn đỉnh Bàn Cờ',
        description: 'Chạy xe máy lên bán đảo Sơn Trà ngắm hoàng hôn, ngắm vịnh biển Đà Nẵng từ trên cao cực chill.',
        category: 'Phượt',
        location: 'Sơn Trà, Đà Nẵng',
        tags: ['phượt', 'camping', 'hoàng hôn', 'sơn trà', 'view đẹp'],
        rating: 4.9,
      },
      {
        id: 'place_1',
        type: 'place',
        title: 'Quán Nối Cafe',
        description: 'Quán cafe phong cách vintage cổ điển, không gian yên tĩnh, ban công tầng 2 ngắm phố phường.',
        category: 'Cafe',
        location: 'Hải Châu, Đà Nẵng',
        tags: ['cafe', 'vintage', 'làm việc', 'yên tĩnh'],
        rating: 4.7,
      },
      {
        id: 'place_2',
        type: 'place',
        title: 'Bãi biển Mỹ Khê',
        description: 'Bãi cát trắng mịn, thích hợp tắm biển buổi sáng sớm hoặc dạo bộ hóng gió chiều tà.',
        category: 'Du lịch',
        location: 'Sơn Trà, Đà Nẵng',
        tags: ['biển', 'tắm biển', 'checkin', 'hoàng hôn'],
        rating: 4.8,
      },
      {
        id: 'group_1',
        type: 'group',
        title: 'Foodie Đà Nẵng',
        description: 'Cộng đồng những người yêu ẩm thực, review quán ngon và cùng nhau tụ tập ăn uống.',
        category: 'Ăn uống',
        location: 'Đà Nẵng',
        tags: ['ẩm thực', 'nhóm', 'food tour'],
        rating: 4.9,
      },
    ];

    const queryVector = EmbeddingService.createFeatureVector([], [query]);

    // Xếp hạng kết quả theo điểm kết hợp Hybrid
    const scored = dataset
      .filter((item) => {
        if (category && category !== 'Tất cả' && item.category !== category) {
          return false;
        }
        return true;
      })
      .map((item) => {
        // 1. Text match score (BM25 heuristic)
        let textScore = 0;
        const q = query.toLowerCase();
        if (item.title.toLowerCase().includes(q)) textScore += 0.5;
        if (item.description.toLowerCase().includes(q)) textScore += 0.3;
        if (item.tags.some((t) => t.includes(q))) textScore += 0.4;

        // 2. Vector semantic score
        const itemVector = EmbeddingService.createFeatureVector(
          item.tags,
          [item.title, item.category]
        );
        const vectorScore = EmbeddingService.cosineSimilarity(queryVector, itemVector);

        // Kết hợp Hybrid
        const totalScore = 0.5 * textScore + 0.5 * vectorScore;
        return { ...item, score: Math.round(totalScore * 100) };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Cache kết quả vào Redis 120s
    await redisCache.set(cacheKey, JSON.stringify(scored), 120);
    return scored;
  }
}
