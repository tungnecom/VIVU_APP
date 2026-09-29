import React, { useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ScreenNavigatorModal } from '../components/ScreenNavigatorModal';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { COLORS, SHADOWS } from '../constants/theme';
import { ScreenKey } from '../types';

export default function RootLayout() {
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const { navigateTo } = useAppNavigation();

  const handleSelectScreen = (screen: ScreenKey) => {
    setShowNavigatorModal(false);
    navigateTo(screen);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {/* Global Floating Quick Switcher Pill (luôn truy cập được để test 28 màn hình) */}
        <TouchableOpacity
          style={styles.floatingSwitcherPill}
          activeOpacity={0.85}
          onPress={() => setShowNavigatorModal(true)}
          accessibilityLabel="Mở danh sách 28 màn hình"
        >
          <Ionicons name="apps" size={15} color="#FFFFFF" />
          <Text style={styles.switcherPillText}>28 Màn hình</Text>
        </TouchableOpacity>

        {/* Screen Showcase Modal */}
        <ScreenNavigatorModal
          visible={showNavigatorModal}
          currentScreen={'home_feed' as ScreenKey}
          onClose={() => setShowNavigatorModal(false)}
          onSelectScreen={handleSelectScreen}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingSwitcherPill: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 12 : 54,
    right: 14,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(117, 89, 232, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    ...SHADOWS.purpleGlow,
  },
  switcherPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
