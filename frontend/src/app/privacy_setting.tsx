import { useRouter } from 'expo-router';
import { PrivacySettingScreen } from '../screens/onboarding/PrivacySettingScreen';
import { ScreenKey } from '../types';

export default function PrivacySettingRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'home_feed' || (screen as string) === 'onboarding_complete') {
      router.replace('/(tabs)');
    } else if (screen === 'social_level' || screen === 'profile') {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)/profile');
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  return <PrivacySettingScreen onNavigate={handleNavigate} />;
}
