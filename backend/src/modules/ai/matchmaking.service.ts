import { EmbeddingService } from './embedding.service';

export interface UserMatchProfile {
  id: string;
  name: string;
  avatar: string;
  city: string;
  trustScore: number;
  communicationStyle: 'easy' | 'normal' | 'shy' | 'very_shy' | string;
  interests: string[];
  goals: string[];
  latitude?: number;
  longitude?: number;
}

export interface MatchResult {
  candidate: UserMatchProfile;
  compatibilityScore: number; // 0 - 100%
  breakdown: {
    interestSimilarity: number;
    socialCompatibility: number;
    geoProximity: number;
    trustWeight: number;
  };
  highlightMatchReasons: string[];
}

export class MatchmakingService {
  /**
   * Tính khoảng cách địa lý theo công thức Haversine (km)
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Ma trận tương thích mức độ giao tiếp (Communication Style Compatibility)
   */
  public static getSocialCompatibility(styleA: string, styleB: string): number {
    const matrix: Record<string, Record<string, number>> = {
      easy: { easy: 0.95, normal: 0.92, shy: 0.88, very_shy: 0.85 },
      normal: { easy: 0.92, normal: 0.95, shy: 0.85, very_shy: 0.8 },
      shy: { easy: 0.9, normal: 0.85, shy: 0.8, very_shy: 0.75 },
      very_shy: { easy: 0.85, normal: 0.8, shy: 0.75, very_shy: 0.7 },
    };

    const sA = styleA.toLowerCase();
    const sB = styleB.toLowerCase();
    return matrix[sA]?.[sB] ?? 0.85;
  }

  /**
   * Thuật toán ghép bạn đồng hành đa nhân tố (Multi-factor Companion Matching)
   */
  public static calculateMatch(
    currentUser: UserMatchProfile,
    candidate: UserMatchProfile
  ): MatchResult {
    // 1. Tương đồng sở thích qua Cosine Similarity Vector
    const currentVector = EmbeddingService.createFeatureVector(
      currentUser.interests,
      currentUser.goals
    );
    const candidateVector = EmbeddingService.createFeatureVector(
      candidate.interests,
      candidate.goals
    );
    const interestSim = Math.max(
      0.3,
      EmbeddingService.cosineSimilarity(currentVector, candidateVector)
    );

    // 2. Tương thích phong cách giao tiếp
    const socialComp = this.getSocialCompatibility(
      currentUser.communicationStyle,
      candidate.communicationStyle
    );

    // 3. Khoảng cách địa lý
    let geoProx = 0.8;
    if (
      currentUser.latitude &&
      currentUser.longitude &&
      candidate.latitude &&
      candidate.longitude
    ) {
      const distance = this.calculateHaversineDistance(
        currentUser.latitude,
        currentUser.longitude,
        candidate.latitude,
        candidate.longitude
      );
      // Hàm suy giảm khoảng cách
      if (distance <= 3) geoProx = 1.0;
      else if (distance <= 8) geoProx = 0.85;
      else if (distance <= 20) geoProx = 0.65;
      else geoProx = 0.4;
    }

    // 4. Trọng số điểm uy tín
    const trustWeight = Math.min(1.0, candidate.trustScore / 100);

    // 5. Tổng hợp theo trọng số đa nhân tố
    // 40% Sở thích + 20% Tính cách giao tiếp + 20% Vị trí gần + 20% Độ uy tín
    const finalScore =
      0.4 * interestSim +
      0.2 * socialComp +
      0.2 * geoProx +
      0.2 * trustWeight;

    // Tìm các lý do match nổi bật
    const sharedInterests = currentUser.interests.filter((item) =>
      candidate.interests.includes(item)
    );
    const reasons: string[] = [];
    if (sharedInterests.length > 0) {
      reasons.push(`Cùng đam mê ${sharedInterests.slice(0, 3).join(', ')}`);
    }
    if (candidate.trustScore >= 90) {
      reasons.push(`Độ uy tín cao (${candidate.trustScore}/100 điểm)`);
    }
    if (geoProx >= 0.85) {
      reasons.push('Đang ở gần khu vực của bạn');
    }

    return {
      candidate,
      compatibilityScore: Math.round(finalScore * 100),
      breakdown: {
        interestSimilarity: Math.round(interestSim * 100),
        socialCompatibility: Math.round(socialComp * 100),
        geoProximity: Math.round(geoProx * 100),
        trustWeight: Math.round(trustWeight * 100),
      },
      highlightMatchReasons: reasons,
    };
  }

  /**
   * Xếp hạng danh sách ứng viên phù hợp nhất (Re-ranking)
   */
  public static rankCandidates(
    currentUser: UserMatchProfile,
    candidates: UserMatchProfile[]
  ): MatchResult[] {
    return candidates
      .filter((c) => c.id !== currentUser.id)
      .map((c) => this.calculateMatch(currentUser, c))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
