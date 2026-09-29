import { useRouter } from 'expo-router';
import { CitySelectScreen } from '../screens/onboarding/CitySelectScreen';
import { ScreenKey } from '../types';

export default function CitySelectRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    // Navigate to next onboarding step or home
    if (screen === 'goal_select') {
      router.push('/goal_select');
    } else {
      router.replace('/(tabs)');
    }
  };

  return <CitySelectScreen onNavigate={handleNavigate} />;
}
