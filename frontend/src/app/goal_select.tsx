import { useRouter } from 'expo-router';
import { GoalSelectScreen } from '../screens/onboarding/GoalSelectScreen';
import { ScreenKey } from '../types';

export default function GoalSelectRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'interest_select') {
      router.push('/interest_select');
    } else if (screen === 'city_select') {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return <GoalSelectScreen onNavigate={handleNavigate} />;
}
