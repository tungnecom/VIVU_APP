import { ActivityItem, ConversationItem, GroupItem, PostItem, UserProfile } from '../types';
import { CITIES_63 } from '../services/locationData';

export const CITIES = CITIES_63;

export const GOALS = [
  { id: '1', title: 'Làm quen bạn mới', icon: 'person-add', desc: 'Mở rộng vòng kết nối bạn bè' },
  { id: '2', title: 'Tìm người đi ăn', icon: 'restaurant', desc: 'Khám phá ẩm thực cùng cạ cứng' },
  { id: '3', title: 'Khám phá thành phố', icon: 'compass', desc: 'Du lịch và trải nghiệm địa điểm hot' },
  { id: '4', title: 'Tìm hội nhóm', icon: 'people', desc: 'Tham gia các cộng đồng chung đam mê' },
  { id: '5', title: 'Tìm người cùng sở thích', icon: 'heart', desc: 'Chia sẻ đam mê cá nhân' },
];

export const INTERESTS = [
  { id: 'food', label: 'Food', icon: 'fast-food', color: '#FF7643', bg: '#FFF1E8' },
  { id: 'cafe', label: 'Cafe', icon: 'cafe', color: '#8B5CF6', bg: '#F3E8FF' },
  { id: 'photo', label: 'Photography', icon: 'camera', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'phuot', label: 'Phượt', icon: 'bicycle', color: '#10B981', bg: '#ECFDF5' },
  { id: 'camping', label: 'Camping', icon: 'bonfire', color: '#06B6D4', bg: '#ECFEFF' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'movie', label: 'Movie', icon: 'film', color: '#A855F7', bg: '#FAF5FF' },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'sing', label: 'Hát', icon: 'mic', color: '#F43F5E', bg: '#FFF1F2' },
  { id: 'sport', label: 'Sport', icon: 'football', color: '#0284C7', bg: '#F0F9FF' },
  { id: 'music', label: 'Music', icon: 'musical-notes', color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'art', label: 'Art', icon: 'color-palette', color: '#EA580C', bg: '#FFF7ED' },
];

export const SOCIAL_LEVELS = [
  { id: 'easy', title: 'Dễ bắt chuyện', emoji: '😄', desc: 'Tự tin bắt đầu cuộc trò chuyện với bất kỳ ai' },
  { id: 'normal', title: 'Bình thường', emoji: '😊', desc: 'Thoải mái trò chuyện khi có chủ đề phù hợp' },
  { id: 'shy', title: 'Hơi ngại', emoji: '😅', desc: 'Cần một chút thời gian để mở lòng với người lạ' },
  { id: 'very_shy', title: 'Khá rụt rè', emoji: '🙈', desc: 'Thích lắng nghe và quan sát trước khi chia sẻ' },
];

export const CURRENT_USER: UserProfile = {
  id: 'u_me',
  name: 'Tùng',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  city: 'Đà Nẵng',
  trustScore: 94,
  badge: 'Thành viên Tích Cực',
  verified: true,
  postsCount: 12,
  activitiesCount: 16,
  friendsCount: 148,
  communicationStyle: 'Bình thường',
  interests: ['Food', 'Cafe', 'Photography', 'Travel'],
};

export const MOCK_POSTS: PostItem[] = [
  {
    id: 'p3_video',
    author: {
      id: 'u3',
      name: 'Lan Anh (VIVU VIP)',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      location: 'Sơn Trà, Đà Nẵng',
    },
    timeAgo: '1 giờ trước',
    content:
      'Hoàng hôn buông xuống trên vịnh Sơn Trà Marina đẹp như Santorini thu nhỏ 🌊☕ Bật loa lên để nghe trọn tiếng sóng biển và gió đại dương nha mọi người!',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: 15,
    hashtags: ['#SonTraMarina', '#VideoDuLich', '#ShopeeFoodTop', '#AmThanhThuc'],
    likes: 246,
    commentsCount: 38,
    sharesCount: 19,
    isLiked: false,
    taggedVenue: {
      id: 'dn_sontra_marina',
      name: 'Sơn Trà Marina Cafe & Lounge',
      address: 'Đường Hồ Xanh, Bán đảo Sơn Trà, Đà Nẵng',
      platformSource: 'SHOPEEFOOD',
    },
    isRecruitment: false,
  },
  {
    id: 'p1',
    author: {
      id: 'u1',
      name: 'Minh Thư',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      location: 'Hải Châu, Đà Nẵng',
    },
    timeAgo: '2 giờ trước',
    content: 'Tuyển cạ cùng lượn Food Tour Đà Nẵng cuối tuần: Bánh tráng thịt heo Đại Lộc, Bún mắm nêm, Chè sầu Liên. Ai đi cùng đăng ký ngay nhé! 🍲🛵',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    ],
    hashtags: ['#FoodTour', '#GrabFoodReview', '#CaCungViVu'],
    likes: 128,
    commentsCount: 22,
    sharesCount: 9,
    isLiked: false,
    taggedVenue: {
      id: 'dn_dacsan_trang',
      name: 'Đặc Sản Trần - Bánh Tráng Cuốn',
      address: '04 Lê Duẩn, Hải Châu, Đà Nẵng',
      platformSource: 'GRABFOOD',
    },
    isRecruitment: true,
    recruitmentSlots: 4,
    recruitmentJoined: 2,
    activitySnippet: {
      location: 'Hải Châu, Đà Nẵng',
      time: 'Thứ 7, 18:00 - 21:00',
      slots: '2/4 người',
      budget: '150k - 200k / người',
    },
  },
  {
    id: 'p2',
    author: {
      id: 'u2',
      name: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      location: 'Sơn Trà, Đà Nẵng',
    },
    timeAgo: '4 giờ trước',
    content: 'Chiều nay chạy xe lên đỉnh Bàn Cờ đón hoàng hôn săn mây cực đã anh em ơi! Ai đi cùng không 16h30 xuất phát chân núi nhé! 🛵🌄',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
    ],
    hashtags: ['#PhượtSơnTrà', '#HoàngHôn', '#ViVuĐàNẵng'],
    likes: 95,
    commentsCount: 14,
    sharesCount: 5,
    isLiked: true,
  },
];

export const MOCK_ACTIVITY: ActivityItem = {
  id: 'act_1',
  title: 'Food tour Đà Nẵng',
  category: 'Ăn uống',
  rating: 4.8,
  reviewsCount: 56,
  date: 'Thứ 7, 25/05/2025',
  time: '17:00 - 21:00',
  location: 'Hải Châu, Đà Nẵng',
  joinedCount: 5,
  maxCount: 8,
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  host: {
    name: 'Minh Thư',
    trustScore: 94,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  description: 'Chào cả nhà! Mình muốn rủ một nhóm 6-8 bạn cùng khám phá ẩm thực đường phố Đà Nẵng: Bánh tráng cuốn thịt heo Đại Lộc, Bún chả cá, Kem bơ cô Vân chợ Bắc Mỹ An. Cùng trò chuyện kết bạn cuối tuần vui vẻ nhé!',
  tags: ['Ẩm thực', 'Chợ Đêm', 'Gặp gỡ bạn mới', 'Vui vẻ'],
  participants: [
    { id: '1', name: 'Minh Thư', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Trưởng nhóm', trustScore: 94 },
    { id: '2', name: 'Quang Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Thành viên', trustScore: 88 },
    { id: '3', name: 'Lan Anh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Thành viên', trustScore: 92 },
    { id: '4', name: 'Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Thành viên', trustScore: 85 },
    { id: '5', name: 'Mai Phương', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'Thành viên', trustScore: 90 },
  ],
};

export const MOCK_GROUPS: GroupItem[] = [
  {
    id: 'g1',
    name: 'Foodie Đà Nẵng',
    membersCount: '1.2k',
    avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    description: 'Cộng đồng đam mê ẩm thực Đà Nẵng, review chân thực và rủ rê cùng nhau vi vu hàng quán mỗi tuần.',
    tags: ['Ẩm thực', 'Du lịch', 'Chụp ảnh'],
    activeUsers: 24,
    recentPostSnippet: 'Tối nay có ai đi ăn nem lụi bà Dưỡng không?',
  },
  {
    id: 'g2',
    name: 'Phượt Club Miền Trung',
    membersCount: '3.8k',
    avatar: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
    description: 'Giao lưu cung đường đèo Hải Vân, bán đảo Sơn Trà, săn mây Đỉnh Gió.',
    tags: ['Phượt', 'Camping', 'Khám phá'],
    activeUsers: 48,
    recentPostSnippet: 'Chủ nhật này tụi mình đổ đèo Hải Vân ngắm bình minh nhé.',
  },
  {
    id: 'g3',
    name: 'Camping Việt Nam Real',
    membersCount: '5.1k',
    avatar: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=150',
    coverImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
    description: 'Hội những người yêu cắm trại qua đêm, bếp lửa và sao trời.',
    tags: ['Camping', 'Chill', 'Thiên nhiên'],
    activeUsers: 33,
    recentPostSnippet: 'Review bãi cắm trại hồ Đồng Xanh - Đồng Nghệ mới nhất.',
  },
  {
    id: 'g4',
    name: 'Photography Group ĐN',
    membersCount: '1.8k',
    avatar: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=150',
    coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600',
    description: 'Cùng nhau săn góc ảnh đẹp Đà Nẵng - Hội An, chia sẻ preset và kĩ thuật chụp.',
    tags: ['Chụp ảnh', 'Streetlife', 'Portraits'],
    activeUsers: 19,
    recentPostSnippet: 'Bộ ảnh Hội An lúc 5h sáng thanh bình.',
  },
];

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'c1',
    user: {
      id: 'u1',
      name: 'Minh Thư',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      online: true,
    },
    lastMessage: 'Hẹn gặp bạn 17h chiều thứ 7 nhé!',
    time: '12:30',
    unreadCount: 2,
  },
  {
    id: 'c_group1',
    user: {
      id: 'g1',
      name: 'Foodie Đà Nẵng',
      avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150',
      online: true,
    },
    lastMessage: 'Quang Anh: Quán này ngon lắm nè 🍜',
    time: '11:45',
    unreadCount: 0,
    isGroup: true,
  },
  {
    id: 'c2',
    user: {
      id: 'u2',
      name: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      online: true,
    },
    lastMessage: 'Okie hẹn gặp nhé! Để mình chuẩn bị xe.',
    time: '10:20',
    unreadCount: 0,
  },
  {
    id: 'c3',
    user: {
      id: 'u3',
      name: 'Travel Buddies',
      avatar: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=150',
      online: false,
    },
    lastMessage: 'Mai Phương: Có ai đi Hội An tối nay không?',
    time: 'Hôm qua',
    unreadCount: 0,
    isGroup: true,
  },
  {
    id: 'c4',
    user: {
      id: 'u4',
      name: 'Lan Anh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      online: false,
    },
    lastMessage: 'Cảm ơn bạn nhiều nhé!',
    time: '2 ngày trước',
    unreadCount: 0,
  },
];

export const MAP_LOCATIONS = [
  {
    id: 'loc_1',
    name: 'Sơn Trà Peninsula',
    category: 'Điểm ngắm cảnh',
    rating: 4.9,
    reviews: 320,
    distance: '3.2 km',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    desc: 'Khám phá cung đường ven biển, ngắm hoàng hôn cực chill và đàn khỉ tinh nghịch.',
    latitude: 16.12,
    longitude: 108.28,
  },
  {
    id: 'loc_2',
    name: 'Cầu Rồng Đà Nẵng',
    category: 'Điểm checkin',
    rating: 4.8,
    reviews: 580,
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400',
    desc: 'Biểu tượng Đà Nẵng với màn phun lửa và nước ấn tượng vào 21h cuối tuần.',
    latitude: 16.06,
    longitude: 108.22,
  },
  {
    id: 'loc_3',
    name: 'Biển Mỹ Khê',
    category: 'Bãi biển',
    rating: 4.8,
    reviews: 940,
    distance: '2.0 km',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    desc: 'Một trong những bãi biển quyến rũ nhất hành tinh với cát trắng và sóng êm.',
    latitude: 16.05,
    longitude: 108.24,
  },
];
