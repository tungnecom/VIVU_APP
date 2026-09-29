import { Platform, ViewStyle } from 'react-native';

/**
 * Vivu Design System Tokens
 * Căn cứ đặc tả VIVU_UI_UX_GUIDELINES.md (Mục 4.1)
 */
export const COLORS = {
  // Lời hứa sản phẩm & Bảng màu chủ đạo
  coral: '#FF6B5E',            // CTA chính: Tạo kèo, Tham gia kèo, Gửi yêu cầu
  primaryCoral: '#FF6B5E',
  purple: '#7559E8',           // Matching, định danh thương hiệu, nhấn mạnh phụ
  secondaryPurple: '#7559E8',
  mint: '#27B58A',             // Xác nhận, thành công, trạng thái đã xác minh
  accentMint: '#27B58A',

  // Tương thích ngược với các component cũ
  primary: '#7559E8',          // Tím Vivu (Brand & Matching)
  primaryDark: '#5E44C4',
  primaryLight: '#947DF5',
  primarySoft: '#F2EFFF',
  primaryGradient: ['#FF6B5E', '#7559E8'] as const, // Coral to Purple gradient

  accentOrange: '#FF6B5E',
  accentPink: '#EC4899',
  accentTeal: '#06B6D4',
  accentGreen: '#27B58A',
  accentYellow: '#F59E0B',

  // Nền & Bề mặt (Ấm, dịu mắt theo đặc tả)
  background: '#FAF8F5',       // Nền tổng thể ấm, không quá trắng gắt
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardSecondary: '#F5F3EF',

  // Chữ & Độ tương phản (Theo đặc tả mục 4.1)
  textDark: '#292633',         // Nội dung chính
  textPrimary: '#292633',
  textMedium: '#5C5766',
  textLight: '#797482',        // Mô tả, thời gian, metadata
  textMuted: '#797482',
  textSecondary: '#797482',
  textWhite: '#FFFFFF',
  secondary: '#7559E8',

  // Trạng thái & Đường viền
  success: '#27B58A',
  warning: '#F59E0B',
  danger: '#EF4444',
  error: '#EF4444',
  border: '#E9E4DF',           // Phân tách nhẹ
  divider: '#E9E4DF',
};

const smShadow = Platform.select({
  web: { boxShadow: '0px 2px 6px rgba(41, 38, 51, 0.04)' } as ViewStyle,
  default: {
    shadowColor: '#292633',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
});

export const SHADOWS = {
  sm: smShadow,
  card: smShadow,
  md: Platform.select({
    web: { boxShadow: '0px 4px 12px rgba(41, 38, 51, 0.08)' } as ViewStyle,
    default: {
      shadowColor: '#292633',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: '0px 4px 14px rgba(255, 107, 94, 0.35)' } as ViewStyle,
    default: {
      shadowColor: '#FF6B5E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  purpleGlow: Platform.select({
    web: { boxShadow: '0px 4px 14px rgba(117, 89, 232, 0.35)' } as ViewStyle,
    default: {
      shadowColor: '#7559E8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
};

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export const LAYOUT = {
  maxWidth: 1200,
  sidebarWidth: 280,
  contentMaxWidth: 800,
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 11,
  s: 13,
  m: 15,
  l: 18,
  xl: 22,
  xxl: 28,
};

export const BORDER_RADIUS = {
  s: 6,
  m: 12,
  l: 16,
  xl: 20,
  full: 9999,
};
