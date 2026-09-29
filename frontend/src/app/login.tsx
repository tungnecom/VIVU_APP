import { useRouter } from 'expo-router';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { ScreenKey } from '../types';

export default function LoginRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'register') {
      router.push('/register');
    } else if (screen === 'welcome') {
      router.back();
    } else if (screen === 'otp') {
      router.push('/otp');
    } else if (screen === 'home_feed') {
      // Navigate to tabs
      router.replace('/(tabs)');
    }
  };

  return <LoginScreen onNavigate={handleNavigate} />;
}
