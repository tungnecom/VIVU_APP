export type ScreenKey =
  | 'splash'            // 1. Splash Screen
  | 'welcome'           // 2. Welcome
  | 'register'          // 3. Đăng ký
  | 'login'             // 4. Đăng nhập
  | 'otp'               // 5. Xác thực tài khoản
  | 'city_select'       // 6. Chọn thành phố
  | 'goal_select'       // 7. Chọn mục tiêu
  | 'interest_select'   // 8. Chọn sở thích
  | 'social_level'      // 9. Mức độ giao tiếp
  | 'privacy_setting'   // 10. Thiết lập quyền riêng tư
  | 'home_feed'         // 11. Home Feed
  | 'post_detail'       // 12. Chi tiết bài viết
  | 'create_post'       // 13. Tạo bài viết
  | 'edit_post'         // 14. Chỉnh sửa bài viết
  | 'comment'           // 15. Comment
  | 'match_home'        // 16. Match Home
  | 'activity_detail'   // 17. Chi tiết hoạt động
  | 'participant_list'  // 18. Danh sách người tham gia
  | 'group_home'        // 19. Group Home
  | 'group_detail'      // 20. Group chi tiết
  | 'group_chat'        // 21. Group chat room
  | 'message_home'      // 22. Message Home
  | 'personal_chat'     // 23. Chat cá nhân
  | 'map'               // 24. Map
  | 'review'            // 25. Review
  | 'profile'           // 27. Profile
  | 'vivi_assistant';   // 28. ViVi Floating Assistant

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  city: string;
  trustScore: number;
  badge?: string;
  verified: boolean;
  postsCount: number;
  activitiesCount: number;
  friendsCount: number;
  communicationStyle: string;
  interests: string[];
  identifier?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  joinDate?: string;
  badges?: string[];
  coverPhoto?: string;
}

export interface PostItem {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    location: string;
  };
  timeAgo: string;
  content: string;
  images: string[];
  videoUrl?: string;
  videoDuration?: number;
  hashtags: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  activitySnippet?: {
    location: string;
    time: string;
    slots: string;
    budget?: string;
  };
  taggedVenue?: {
    id: string;
    name: string;
    address: string;
    platformSource?: string;
    latitude?: number;
    longitude?: number;
  };
  taggedCompanions?: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  isRecruitment?: boolean;
  recruitmentSlots?: number;
  recruitmentJoined?: number;
  isWish?: boolean;
  wishDestination?: string;
  wishDate?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  date: string;
  time: string;
  location: string;
  joinedCount: number;
  maxCount: number;
  image: string;
  host: {
    name: string;
    trustScore: number;
    avatar: string;
  };
  description: string;
  tags: string[];
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    role?: string;
    trustScore: number;
  }>;
}

export interface GroupItem {
  id: string;
  name: string;
  membersCount: string;
  avatar: string;
  coverImage: string;
  description: string;
  tags: string[];
  activeUsers: number;
  recentPostSnippet: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isViViSuggestion?: boolean;
}

export interface ConversationItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  time: string;
  unreadCount: number;
  isGroup?: boolean;
}
