import { useRouter } from 'expo-router';
import { InterestSelectScreen } from '../screens/onboarding/InterestSelectScreen';
import { ScreenKey } from '../types';

export default function InterestSelectRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'social_level') {
      router.push('/social_level');
    } else if (screen === 'goal_select') {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return <InterestSelectScreen onNavigate={handleNavigate} />;
}
