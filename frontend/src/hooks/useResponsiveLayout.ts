import { useWindowDimensions, Platform } from 'react-native';
import { BREAKPOINTS } from '../constants/theme';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWeb = Platform.OS === 'web';

  return {
    windowWidth: width,
    windowHeight: height,
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    isLargeScreen: isTablet || isDesktop, // Helper boolean
  };
}
