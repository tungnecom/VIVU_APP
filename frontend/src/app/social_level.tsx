import { useRouter } from 'expo-router';
import { SocialLevelScreen } from '../screens/onboarding/SocialLevelScreen';
import { ScreenKey } from '../types';

export default function SocialLevelRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'privacy_setting') {
      router.push('/privacy_setting');
    } else if (screen === 'interest_select') {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return <SocialLevelScreen onNavigate={handleNavigate} />;
}
