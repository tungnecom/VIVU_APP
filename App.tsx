import React, { useState } from 'react';
import {
  LogBox,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Bỏ qua cảnh báo kết nối Expo CLI không ảnh hưởng tính năng khi test qua Wi-Fi
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'SafeAreaView has been deprecated',
]);



import { ScreenNavigatorModal } from './src/components/ScreenNavigatorModal';
import { ViViMascotModal } from './src/components/ViViMascotModal';
import { COLORS, SHADOWS } from './src/constants/theme';
import { ScreenKey } from './src/types';

// Screen Imports
import { SplashScreen } from './src/screens/onboarding/SplashScreen';
import { WelcomeScreen } from './src/screens/onboarding/WelcomeScreen';
import { RegisterScreen } from './src/screens/onboarding/RegisterScreen';
import { LoginScreen } from './src/screens/onboarding/LoginScreen';
import { OtpVerificationScreen } from './src/screens/onboarding/OtpVerificationScreen';
import { CitySelectScreen } from './src/screens/onboarding/CitySelectScreen';
import { GoalSelectScreen } from './src/screens/onboarding/GoalSelectScreen';
import { InterestSelectScreen } from './src/screens/onboarding/InterestSelectScreen';
import { SocialLevelScreen } from './src/screens/onboarding/SocialLevelScreen';
import { PrivacySettingScreen } from './src/screens/onboarding/PrivacySettingScreen';

import { HomeFeedScreen } from './src/screens/feed/HomeFeedScreen';
import { PostDetailScreen } from './src/screens/feed/PostDetailScreen';
import { CreatePostScreen } from './src/screens/feed/CreatePostScreen';
import { EditPostScreen } from './src/screens/feed/EditPostScreen';
import { CommentSheetScreen } from './src/screens/feed/CommentSheetScreen';

import { MatchHomeScreen } from './src/screens/match/MatchHomeScreen';
import { ActivityDetailScreen } from './src/screens/match/ActivityDetailScreen';
import { ParticipantListScreen } from './src/screens/match/ParticipantListScreen';

import { GroupHomeScreen } from './src/screens/groups/GroupHomeScreen';
import { GroupDetailScreen } from './src/screens/groups/GroupDetailScreen';
import { GroupChatScreen } from './src/screens/groups/GroupChatScreen';

import { MessageHomeScreen } from './src/screens/messages/MessageHomeScreen';
import { PersonalChatScreen } from './src/screens/messages/PersonalChatScreen';

import { MapScreen } from './src/screens/discovery/MapScreen';
import { PlaceReviewScreen } from './src/screens/discovery/PlaceReviewScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';

import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('welcome');
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const [showViViModal, setShowViViModal] = useState(false);

  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const loadSession = useAuthStore((state) => state.loadSession);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  React.useEffect(() => {
    if (hasCompletedOnboarding && currentScreen === 'welcome') {
      setCurrentScreen('home_feed');
    }
  }, [hasCompletedOnboarding, currentScreen]);

  const navigateTo = (screen: ScreenKey) => {
    if (screen === 'vivi_assistant') {
      setShowViViModal(true);
    } else {
      setCurrentScreen(screen);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // 1-10 Onboarding & Auth
      case 'splash':
        return <SplashScreen onNavigate={navigateTo} />;
      case 'welcome':
        return <WelcomeScreen onNavigate={navigateTo} />;
      case 'register':
        return <RegisterScreen onNavigate={navigateTo} />;
      case 'login':
        return <LoginScreen onNavigate={navigateTo} />;
      case 'otp':
        return <OtpVerificationScreen onNavigate={navigateTo} />;
      case 'city_select':
        return <CitySelectScreen onNavigate={navigateTo} />;
      case 'goal_select':
        return <GoalSelectScreen onNavigate={navigateTo} />;
      case 'interest_select':
        return <InterestSelectScreen onNavigate={navigateTo} />;
      case 'social_level':
        return <SocialLevelScreen onNavigate={navigateTo} />;
      case 'privacy_setting':
        return <PrivacySettingScreen onNavigate={navigateTo} />;

      // 11-15 Feed & Posts
      case 'home_feed':
        return (
          <HomeFeedScreen
            onNavigate={navigateTo}
            onOpenQuickSwitcher={() => setShowNavigatorModal(true)}
          />
        );
      case 'post_detail':
        return <PostDetailScreen onNavigate={navigateTo} />;
      case 'create_post':
        return <CreatePostScreen onNavigate={navigateTo} />;
      case 'edit_post':
        return <EditPostScreen onNavigate={navigateTo} />;
      case 'comment':
        return <CommentSheetScreen onNavigate={navigateTo} />;

      // 16-18 Match & Activities
      case 'match_home':
        return <MatchHomeScreen onNavigate={navigateTo} />;
      case 'activity_detail':
        return <ActivityDetailScreen onNavigate={navigateTo} />;
      case 'participant_list':
        return <ParticipantListScreen onNavigate={navigateTo} />;

      // 19-21 Groups
      case 'group_home':
        return <GroupHomeScreen onNavigate={navigateTo} />;
      case 'group_detail':
        return <GroupDetailScreen onNavigate={navigateTo} />;
      case 'group_chat':
        return <GroupChatScreen onNavigate={navigateTo} />;

      // 22-23 Messages
      case 'message_home':
        return <MessageHomeScreen onNavigate={navigateTo} />;
      case 'personal_chat':
        return <PersonalChatScreen onNavigate={navigateTo} />;

      // 24-25 Map & Reviews
      case 'map':
        return <MapScreen onNavigate={navigateTo} />;
      case 'review':
        return <PlaceReviewScreen onNavigate={navigateTo} />;

      // 27 Profile
      case 'profile':
        return <ProfileScreen onNavigate={navigateTo} />;

      default:
        return <WelcomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style={currentScreen === 'splash' ? 'light' : 'dark'} />

        {/* Current Screen View */}
        <View style={styles.screenContainer}>{renderCurrentScreen()}</View>

        {/* Global Floating Quick Switcher Pill (always accessible for showcase) */}
        {currentScreen !== 'splash' && (
          <TouchableOpacity
            style={styles.floatingSwitcherPill}
            activeOpacity={0.85}
            onPress={() => setShowNavigatorModal(true)}
          >
            <Ionicons name="apps" size={16} color="#FFFFFF" />
            <Text style={styles.switcherPillText}>28 Màn hình</Text>
          </TouchableOpacity>
        )}

        {/* Screen Showcase Modal */}
        <ScreenNavigatorModal
          visible={showNavigatorModal}
          currentScreen={currentScreen}
          onClose={() => setShowNavigatorModal(false)}
          onSelectScreen={navigateTo}
        />

        {/* ViVi Assistant Modal */}
        <ViViMascotModal
          visible={showViViModal}
          onClose={() => setShowViViModal(false)}
          onSelectAction={() => setShowViViModal(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
  },
  floatingSwitcherPill: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 12 : 54,
    right: 14,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 71, 251, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    ...SHADOWS.glow,
  },
  switcherPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
