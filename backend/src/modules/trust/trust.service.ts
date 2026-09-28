export interface TrustCriteria {
  identityVerified: boolean; // Xác thực CCCD / SĐT (+20)
  completedActivitiesCount: number; // Mỗi chuyến đi hoàn thành +5đ, max 30đ
  averageRating: number; // Đánh giá sao từ bạn bè (0 - 5.0) -> max 20đ
  punctualRate: number; // Tỷ lệ đúng giờ (0 - 1.0) -> max 15đ
  positiveFeedbacksCount: number; // Lời khen từ cộng đồng -> max 15đ
  reportedCount: number; // Số lần vi phạm (-15đ mỗi lần)
}

export class TrustScoreEngine {
  /**
   * Tính toán điểm uy tín minh bạch từ 0 đến 100 điểm
   */
  public static calculateScore(criteria: TrustCriteria): {
    totalScore: number;
    breakdown: {
      identityScore: number;
      activityScore: number;
      ratingScore: number;
      punctualityScore: number;
      communityScore: number;
      penaltyScore: number;
    };
    badge: string;
  } {
    // 1. Xác thực tài khoản (Max 20)
    const identityScore = criteria.identityVerified ? 20 : 5;

    // 2. Hoạt động dã ngoại & giao lưu (Max 30)
    const activityScore = Math.min(30, criteria.completedActivitiesCount * 5);

    // 3. Đánh giá từ bạn bè (Max 20)
    const ratingScore = Math.round((criteria.averageRating / 5.0) * 20);

    // 4. Đúng hẹn khi tham gia sự kiện (Max 15)
    const punctualityScore = Math.round(criteria.punctualRate * 15);

    // 5. Đóng góp & phản hồi cộng đồng (Max 15)
    const communityScore = Math.min(15, criteria.positiveFeedbacksCount * 3);

    // 6. Điểm trừ vi phạm
    const penaltyScore = criteria.reportedCount * 15;

    const rawTotal =
      identityScore +
      activityScore +
      ratingScore +
      punctualityScore +
      communityScore -
      penaltyScore;

    const totalScore = Math.max(0, Math.min(100, rawTotal));

    let badge = 'Thành viên Mới';
    if (totalScore >= 90) badge = 'Thành viên Xuất Sắc (90+)';
    else if (totalScore >= 80) badge = 'Thành viên Tích Cực (80+)';
    else if (totalScore >= 60) badge = 'Thành viên Đáng Tin Cậy';

    return {
      totalScore,
      breakdown: {
        identityScore,
        activityScore,
        ratingScore,
        punctualityScore,
        communityScore,
        penaltyScore,
      },
      badge,
    };
  }
}
