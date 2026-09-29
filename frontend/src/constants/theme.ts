import { Platform, ViewStyle } from 'react-native';

export const COLORS = {
  primary: '#5B47FB',
  primaryDark: '#4535C8',
  primaryLight: '#7E6FFB',
  primarySoft: '#F0EEFF',
  primaryGradient: ['#7C3AED', '#5B47FB', '#4F46E5'] as const,
  accentOrange: '#FF7643',
  accentPink: '#EC4899',
  accentTeal: '#06B6D4',
  accentGreen: '#10B981',
  accentYellow: '#F59E0B',
  
  // Backgrounds
  background: '#F8F9FE',
  card: '#FFFFFF',
  cardSecondary: '#F3F4F6',
  
  // Texts
  textDark: '#111827',
  textMedium: '#4B5563',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E5E7EB',
  divider: '#F3F4F6',
};

export const SHADOWS = {
  sm: Platform.select({
    web: { boxShadow: '0px 2px 6px rgba(91, 71, 251, 0.06)' } as ViewStyle,
    default: {
      shadowColor: '#5B47FB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  }),
  md: Platform.select({
    web: { boxShadow: '0px 4px 10px rgba(31, 41, 55, 0.08)' } as ViewStyle,
    default: {
      shadowColor: '#1F2937',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: '0px 4px 12px rgba(91, 71, 251, 0.35)' } as ViewStyle,
    default: {
      shadowColor: '#5B47FB',
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
