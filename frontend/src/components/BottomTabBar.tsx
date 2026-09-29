import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';
import { ScreenKey } from '../types';

interface BottomTabBarProps {
  currentScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
  unreadCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onNavigate,
  unreadCount = 2,
}) => {
  const tabs = [
    { key: 'home_feed' as ScreenKey, label: 'Trang chủ', iconActive: 'home', iconInactive: 'home-outline' },
    { key: 'match_home' as ScreenKey, label: 'Match', iconActive: 'compass', iconInactive: 'compass-outline' },
    { key: 'create_post' as ScreenKey, label: 'Tạo', isCenter: true },
    { key: 'message_home' as ScreenKey, label: 'Tin nhắn', iconActive: 'chatbubbles', iconInactive: 'chatbubbles-outline', badge: unreadCount },
    { key: 'profile' as ScreenKey, label: 'Cá nhân', iconActive: 'person', iconInactive: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab, idx) => {
          if (tab.isCenter) {
            return (
              <View key="center-btn" style={styles.centerWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onNavigate('create_post')}
                  style={styles.centerBtnTouch}
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

          const isActive = currentScreen === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => onNavigate(tab.key)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? (tab.iconActive as any) : (tab.iconInactive as any)}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.textLight}
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
                  { color: isActive ? COLORS.primary : COLORS.textLight, fontWeight: isActive ? '700' : '500' },
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
    borderTopColor: '#EEEEF2',
    paddingBottom: 8,
    paddingTop: 6,
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
    backgroundColor: COLORS.danger,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
