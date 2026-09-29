import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class FriendsService {
  /**
   * 1. Lấy danh sách bạn bè chính thức
   */
  public static async getFriends(currentUserId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: currentUserId },
          { addresseeId: currentUserId }
        ]
      },
      include: {
        requester: { include: { profile: true } },
        addressee: { include: { profile: true } }
      }
    });

    return friendships.map(f => {
      const friend = f.requesterId === currentUserId ? f.addressee : f.requester;
      return {
        id: friend.id,
        name: friend.profile?.fullName,
        avatar: friend.profile?.avatarUrl,
        city: friend.city,
        trustScore: friend.trustScore,
        bio: friend.profile?.bio,
        interests: friend.profile?.interests || [],
        verified: friend.profile?.isVerified,
      };
    });
  }

  /**
   * 2. Lấy danh sách lời mời kết bạn đang chờ duyệt
   */
  public static async getPendingRequests(currentUserId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: currentUserId,
        status: 'PENDING'
      },
      include: {
        requester: { include: { profile: true } }
      }
    });

    return requests.map(r => ({
      id: r.id,
      sender: {
        id: r.requester.id,
        name: r.requester.profile?.fullName,
        avatar: r.requester.profile?.avatarUrl,
        city: r.requester.city,
        trustScore: r.requester.trustScore,
        bio: r.requester.profile?.bio,
        verified: r.requester.profile?.isVerified,
      },
      createdAt: r.createdAt,
    }));
  }

  /**
   * 3. Gửi lời mời kết bạn mới
   */
  public static async sendFriendRequest(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new Error('Không thể tự kết bạn với chính mình.');
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new Error('Không tìm thấy người dùng này trong hệ thống.');
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: currentUserId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') throw new Error('Hai bạn đã là bạn bè trên VIVU rồi.');
      if (existing.status === 'PENDING') throw new Error('Đã có lời mời kết bạn đang chờ xử lý.');
      if (existing.status === 'DECLINED') {
        // Có thể cho phép gửi lại bằng cách update trạng thái thành PENDING
        await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'PENDING', requesterId: currentUserId, addresseeId: targetUserId }
        });
        return { success: true, message: `Đã gửi lại lời mời kết bạn!` };
      }
    }

    await prisma.friendship.create({
      data: {
        requesterId: currentUserId,
        addresseeId: targetUserId,
        status: 'PENDING'
      }
    });

    return { success: true, message: `Đã gửi lời mời kết bạn!` };
  }

  /**
   * 4. Phản hồi lời mời kết bạn (Chấp nhận hoặc Từ chối)
   */
  public static async respondToRequest(currentUserId: string, requestId: string, action: 'ACCEPT' | 'DECLINE') {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING') {
      throw new Error('Lời mời kết bạn không tồn tại hoặc đã được xử lý.');
    }
    
    if (request.addresseeId !== currentUserId) {
      throw new Error('Không có quyền xử lý lời mời này.');
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' }
    });

    return {
      success: true,
      message: action === 'ACCEPT' ? `Đã chấp nhận lời mời kết bạn.` : `Đã bỏ qua lời mời kết bạn.`,
    };
  }

  /**
   * 5. Hủy kết bạn
   */
  public static async removeFriend(currentUserId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: currentUserId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: currentUserId }
        ]
      }
    });

    if (!friendship) {
      throw new Error('Không tìm thấy quan hệ bạn bè.');
    }

    await prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return {
      success: true,
      message: 'Đã hủy kết bạn thành công.',
    };
  }

  /**
   * 6. Tìm kiếm bạn bè đa tiêu chí (theo tên, thành phố, sở thích)
   */
  public static async searchUsers(currentUserId: string, query: string, city?: string, interest?: string) {
    // Để MVP đơn giản, chỉ tìm User có profile chứa chuỗi tương đối
    const where: Prisma.UserWhereInput = {
      id: { not: currentUserId }, // ko tìm chính mình
      isBanned: false,
    };

    if (city && city !== 'Tất cả') {
      where.city = city;
    }

    const profileFilters: any = {};
    if (query && query.trim()) {
      profileFilters.fullName = { contains: query, mode: 'insensitive' };
    }
    if (interest && interest !== 'Tất cả') {
      profileFilters.interests = { has: interest };
    }

    if (Object.keys(profileFilters).length > 0) {
      where.profile = { is: profileFilters };
    }

    const users = await prisma.user.findMany({
      where,
      take: 20,
      include: { profile: true },
    });

    return users.map(u => ({
      id: u.id,
      name: u.profile?.fullName,
      avatar: u.profile?.avatarUrl,
      city: u.city,
      trustScore: u.trustScore,
      bio: u.profile?.bio,
      interests: u.profile?.interests || [],
      verified: u.profile?.isVerified,
    }));
  }

  /**
   * 7. Gợi ý bạn đồng hành AI Matchmaking
   */
  public static async getSuggestedBuddies(currentUserId: string, city = 'Đà Nẵng') {
    // Tạm thời lấy các user cùng city và chưa kết bạn
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }]
      }
    });
    const excludeIds = friends.map(f => f.requesterId === currentUserId ? f.addresseeId : f.requesterId);
    excludeIds.push(currentUserId);

    const users = await prisma.user.findMany({
      where: {
        city,
        id: { notIn: excludeIds },
        isBanned: false,
      },
      take: 10,
      include: { profile: true },
    });

    return users.map(u => ({
      id: u.id,
      name: u.profile?.fullName,
      avatar: u.profile?.avatarUrl,
      city: u.city,
      trustScore: u.trustScore,
      bio: u.profile?.bio,
      interests: u.profile?.interests || [],
      verified: u.profile?.isVerified,
    }));
  }
}
