import { useRouter } from 'expo-router';
import { MatchHomeScreen } from '../../screens/match/MatchHomeScreen';

export default function MatchTab() {
  const router = useRouter();

  const handleNavigate = (screen: any, params?: any) => {
    if (screen === 'activity_detail' && params?.id) {
      router.push(`/activity/${params.id}`);
    } else if (screen === 'activity_detail') {
      router.push('/activity/mock');
    } else if (screen === 'personal_chat') {
      router.push('/messages/personal_chat');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <MatchHomeScreen onNavigate={handleNavigate as any} />;
}
