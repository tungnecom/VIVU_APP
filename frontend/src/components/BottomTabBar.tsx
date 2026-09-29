import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '../constants/theme';
import { ScreenKey } from '../types';

export interface BottomTabBarProps {
  // Khi dùng trong Expo Router <Tabs tabBar={props => <BottomTabBar {...props} />} />
  state?: any;
  navigation?: any;
  descriptors?: any;
  // Khi dùng độc lập với onNavigate
  currentScreen?: ScreenKey;
  onNavigate?: (screen: ScreenKey) => void;
  unreadCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
  currentScreen,
  onNavigate,
  unreadCount = 2,
}) => {
  const router = useRouter();

  // Xác định tab đang active
  const activeRouteName = state ? state.routes[state.index]?.name : null;

  const tabs = [
    {
      key: 'home_feed' as ScreenKey,
      routeName: 'index',
      label: 'Trang chủ',
      iconActive: 'home',
      iconInactive: 'home-outline',
    },
    {
      key: 'match_home' as ScreenKey,
      routeName: 'match',
      label: 'Đi cùng',
      iconActive: 'compass',
      iconInactive: 'compass-outline',
    },
    {
      key: 'create_post' as ScreenKey,
      routeName: 'create',
      label: 'Tạo',
      isCenter: true,
    },
    {
      key: 'message_home' as ScreenKey,
      routeName: 'messages',
      label: 'Tin nhắn',
      iconActive: 'chatbubbles',
      iconInactive: 'chatbubbles-outline',
      badge: unreadCount,
    },
    {
      key: 'profile' as ScreenKey,
      routeName: 'profile',
      label: 'Cá nhân',
      iconActive: 'person',
      iconInactive: 'person-outline',
    },
  ];

  const handlePress = (tab: typeof tabs[0]) => {
    if (tab.isCenter) {
      if (onNavigate) {
        onNavigate('create_post');
      } else {
        router.push('/create_post');
      }
      return;
    }

    if (navigation && tab.routeName) {
      const isFocused = activeRouteName === tab.routeName;
      const event = navigation.emit({
        type: 'tabPress',
        target: tab.routeName,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(tab.routeName);
      }
    } else if (onNavigate) {
      onNavigate(tab.key);
    }
  };

  const isTabActive = (tab: typeof tabs[0]) => {
    if (state && activeRouteName) {
      return activeRouteName === tab.routeName;
    }
    return currentScreen === tab.key;
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <View key="center-btn" style={styles.centerWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handlePress(tab)}
                  style={styles.centerBtnTouch}
                  accessibilityLabel="Tạo kèo hoặc bài viết mới"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={COLORS.primaryGradient}
                    style={styles.centerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          }

          const active = isTabActive(tab);

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => handlePress(tab)}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={active ? (tab.iconActive as any) : (tab.iconInactive as any)}
                  size={24}
                  color={active ? COLORS.primaryCoral : COLORS.textLight}
                />
                {!!tab.badge && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active ? COLORS.primaryCoral : COLORS.textLight,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    ...SHADOWS.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 52,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: COLORS.primaryCoral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerBtnTouch: {
    ...SHADOWS.glow,
  },
  centerGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
