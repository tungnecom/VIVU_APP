import { useRouter } from 'expo-router';
import { OtpVerificationScreen } from '../screens/onboarding/OtpVerificationScreen';
import { ScreenKey } from '../types';

export default function OtpRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'login') {
      router.push('/login');
    } else if (screen === 'welcome') {
      router.push('/');
    } else {
      router.replace('/(tabs)');
    }
  };

  return <OtpVerificationScreen onNavigate={handleNavigate} />;
}
