import { useRouter } from 'expo-router';
import { HomeFeedScreen } from '../../screens/feed/HomeFeedScreen';

export default function TabsIndexRoute() {
  const router = useRouter();

  const handleNavigate = (screen: string, params?: any) => {
    switch (screen) {
      case 'match_home':
        router.push('/(tabs)/match');
        break;
      case 'map':
        router.push('/map');
        break;
      case 'activity_detail':
        if (params?.id) router.push(`/activity/${params.id}`);
        break;
      case 'create_post':
        router.push('/create_post');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      case 'city_select':
        router.push('/city_select');
        break;
      case 'message_home':
        router.push('/(tabs)/messages');
        break;
      default:
        console.log('Navigate to:', screen);
    }
  };

  return <HomeFeedScreen onNavigate={handleNavigate as any} onOpenQuickSwitcher={() => {}} />;
}
