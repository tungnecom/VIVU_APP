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
  sm: {
    shadowColor: '#5B47FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: '#5B47FB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
