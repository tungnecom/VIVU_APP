import { useRouter } from 'expo-router';
import { RegisterScreen } from '../screens/onboarding/RegisterScreen';
import { ScreenKey } from '../types';

export default function RegisterRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'login') {
      router.push('/login');
    } else if (screen === 'welcome') {
      router.back();
    } else if (screen === 'otp') {
      router.push('/otp');
    } else if (screen === 'city_select') {
      router.push('/city_select');
    } else {
      router.replace('/(tabs)');
    }
  };

  return <RegisterScreen onNavigate={handleNavigate} />;
}
