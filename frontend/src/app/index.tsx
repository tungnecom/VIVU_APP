import { useRouter } from 'expo-router';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ScreenKey } from '../types';

export default function Index() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'register') {
      router.push('/register');
    } else if (screen === 'login') {
      router.push('/login');
    }
  };

  return <WelcomeScreen onNavigate={handleNavigate} />;
}
