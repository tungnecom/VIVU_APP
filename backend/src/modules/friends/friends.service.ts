/**
 * Friends & Social Graph Service
 * Quản lý quan hệ bạn bè, tìm kiếm cạ đồng hành và lời mời kết bạn thời gian thực
 */

export interface FriendUser {
  id: string;
  name: string;
  avatar: string;
  city: string;
  trustScore: number;
  bio: string;
  interests: string[];
  mutualFriendsCount: number;
  isOnline: boolean;
  lastActive: string;
  badge?: string;
  verified?: boolean;
}

export interface FriendRequestItem {
  id: string;
  sender: FriendUser;
  createdAt: string;
  message?: string;
}

export class FriendsService {
  // Bộ nhớ đệm danh sách người dùng thực tế mô phỏng và bạn bè
  private static usersDatabase: FriendUser[] = [
    {
      id: 'u_mai_anh',
      name: 'Mai Anh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      city: 'Đà Nẵng',
      trustScore: 96,
      bio: 'Thích cafe ngắm biển hoàng hôn, chụp ảnh film và thử các quán ăn vặt vỉa hè.',
      interests: ['Cafe', 'Chụp ảnh', 'Ẩm thực', 'Biển'],
      mutualFriendsCount: 8,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Thành viên Tích Cực',
      verified: true,
    },
    {
      id: 'u_hoang_nam',
      name: 'Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      city: 'Đà Nẵng',
      trustScore: 92,
      bio: 'Đam mê trekking bán đảo Sơn Trà, phượt đèo Hải Vân và cắm trại cuối tuần.',
      interests: ['Phượt', 'Cắm trại', 'Trekking', 'Xe máy'],
      mutualFriendsCount: 5,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Cạ Cứng Trekking',
      verified: true,
    },
    {
      id: 'u_thao_vy',
      name: 'Thảo Vy',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      city: 'Hà Nội',
      trustScore: 94,
      bio: 'Food tour phố cổ, lượn hồ Tây mùa sen và tìm bạn đi triển lãm nghệ thuật.',
      interests: ['Ẩm thực', 'Nghệ thuật', 'Cafe', 'Đọc sách'],
      mutualFriendsCount: 3,
      isOnline: false,
      lastActive: '15 phút trước',
      badge: 'Food Reviewer',
      verified: true,
    },
    {
      id: 'u_quoc_bao',
      name: 'Quốc Bảo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      city: 'TP. Hồ Chí Minh',
      trustScore: 90,
      bio: 'Board game, acoustic night phố Bùi Viện và cafe làm việc chill chill.',
      interests: ['Board game', 'Âm nhạc', 'Cafe', 'Nightlife'],
      mutualFriendsCount: 12,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Host Hoạt Động',
      verified: true,
    },
    {
      id: 'u_lan_huong',
      name: 'Lan Hương',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      city: 'Đà Nẵng',
      trustScore: 88,
      bio: 'Tín đồ yoga bãi biển Mỹ Khê sáng sớm, ăn chay lành mạnh và chèo SUP.',
      interests: ['Yoga', 'Chèo SUP', 'Ăn chay', 'Bãi biển'],
      mutualFriendsCount: 4,
      isOnline: false,
      lastActive: '1 giờ trước',
      badge: 'Sống Xanh',
      verified: false,
    },
    {
      id: 'u_minh_tri',
      name: 'Minh Trí',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      city: 'Hội An',
      trustScore: 95,
      bio: 'Thổ địa Hội An, đạp xe ngắm lúa Cẩm Châu, ăn cao lầu và chụp ảnh ngõ vôi vàng.',
      interests: ['Chụp ảnh', 'Xe đạp', 'Ẩm thực', 'Di sản'],
      mutualFriendsCount: 6,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Thổ Địa Hội An',
      verified: true,
    },
  ];

  // Danh sách ID bạn bè chính thức của tài khoản hiện tại
  private static myFriendIds: Set<string> = new Set(['u_mai_anh', 'u_hoang_nam']);

  // Danh sách lời mời kết bạn đang chờ duyệt
  private static pendingRequests: FriendRequestItem[] = [
    {
      id: 'req_1',
      sender: {
        id: 'u_thao_vy',
        name: 'Thảo Vy',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        city: 'Hà Nội',
        trustScore: 94,
        bio: 'Food tour phố cổ, lượn hồ Tây mùa sen và tìm bạn đi triển lãm nghệ thuật.',
        interests: ['Ẩm thực', 'Nghệ thuật', 'Cafe', 'Đọc sách'],
        mutualFriendsCount: 3,
        isOnline: false,
        lastActive: '15 phút trước',
        badge: 'Food Reviewer',
        verified: true,
      },
      createdAt: '10 phút trước',
      message: 'Chào bạn! Thấy bạn cũng thích khám phá ẩm thực, kết bạn cùng đi ăn nhé! ✨',
    },
    {
      id: 'req_2',
      sender: {
        id: 'u_lan_huong',
        name: 'Lan Hương',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        city: 'Đà Nẵng',
        trustScore: 88,
        bio: 'Tín đồ yoga bãi biển Mỹ Khê sáng sớm, ăn chay lành mạnh và chèo SUP.',
        interests: ['Yoga', 'Chèo SUP', 'Ăn chay', 'Bãi biển'],
        mutualFriendsCount: 4,
        isOnline: false,
        lastActive: '1 giờ trước',
        badge: 'Sống Xanh',
        verified: false,
      },
      createdAt: 'Hôm qua',
      message: 'Mình chuẩn bị đi chèo SUP ở Mân Thái, kết bạn nếu muốn tham gia nhé!',
    },
  ];

  /**
   * 1. Lấy danh sách bạn bè chính thức
   */
  public static async getFriends(currentUserId = 'u_me'): Promise<FriendUser[]> {
    return this.usersDatabase.filter((u) => this.myFriendIds.has(u.id));
  }

  /**
   * 2. Lấy danh sách lời mời kết bạn đang chờ duyệt
   */
  public static async getPendingRequests(currentUserId = 'u_me'): Promise<FriendRequestItem[]> {
    return this.pendingRequests;
  }

  /**
   * 3. Gửi lời mời kết bạn mới
   */
  public static async sendFriendRequest(targetUserId: string, message?: string) {
    const targetUser = this.usersDatabase.find((u) => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('Không tìm thấy người dùng này trong hệ thống.');
    }

    if (this.myFriendIds.has(targetUserId)) {
      throw new Error('Hai bạn đã là bạn bè trên VIVU rồi.');
    }

    return {
      success: true,
      message: `Đã gửi lời mời kết bạn tới ${targetUser.name}!`,
      targetUserId,
    };
  }

  /**
   * 4. Phản hồi lời mời kết bạn (Chấp nhận hoặc Từ chối)
   */
  public static async respondToRequest(requestId: string, action: 'ACCEPT' | 'DECLINE') {
    const reqIndex = this.pendingRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) {
      throw new Error('Lời mời kết bạn không tồn tại hoặc đã được xử lý.');
    }

    const reqItem = this.pendingRequests[reqIndex];
    this.pendingRequests.splice(reqIndex, 1);

    if (action === 'ACCEPT') {
      this.myFriendIds.add(reqItem.sender.id);
      return {
        success: true,
        message: `Đã chấp nhận lời mời kết bạn của ${reqItem.sender.name}! Hai bạn giờ có thể nhắn tin cho nhau.`,
        friend: reqItem.sender,
      };
    } else {
      return {
        success: true,
        message: `Đã bỏ qua lời mời kết bạn của ${reqItem.sender.name}.`,
      };
    }
  }

  /**
   * 5. Hủy kết bạn
   */
  public static async removeFriend(friendId: string) {
    this.myFriendIds.delete(friendId);
    return {
      success: true,
      message: 'Đã hủy kết bạn thành công.',
    };
  }

  /**
   * 6. Tìm kiếm bạn bè đa tiêu chí (theo tên, thành phố, sở thích)
   */
  public static async searchUsers(query: string, city?: string, interest?: string): Promise<FriendUser[]> {
    let results = this.usersDatabase;

    if (city && city !== 'Tất cả') {
      results = results.filter((u) => u.city.toLowerCase() === city.toLowerCase());
    }

    if (interest && interest !== 'Tất cả') {
      results = results.filter((u) => u.interests.some((i) => i.toLowerCase().includes(interest.toLowerCase())));
    }

    if (query && query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.bio.toLowerCase().includes(q) ||
          u.interests.some((i) => i.toLowerCase().includes(q))
      );
    }

    return results;
  }

  /**
   * 7. Gợi ý bạn đồng hành AI Matchmaking
   */
  public static async getSuggestedBuddies(city = 'Đà Nẵng'): Promise<FriendUser[]> {
    return this.usersDatabase.filter((u) => !this.myFriendIds.has(u.id));
  }
}
