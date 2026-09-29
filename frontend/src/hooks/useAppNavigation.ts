import { useRouter } from 'expo-router';
import { ScreenKey } from '../types';

export function useAppNavigation() {
  const router = useRouter();

  const navigateTo = (screen: ScreenKey | string, params?: any) => {
    switch (screen) {
      // Main tabs
      case 'home_feed':
        router.push('/(tabs)');
        break;
      case 'match_home':
        router.push('/(tabs)/match');
        break;
      case 'message_home':
        router.push('/(tabs)/messages');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;

      // Onboarding & Auth
      case 'welcome':
        router.push('/');
        break;
      case 'login':
        router.push('/login');
        break;
      case 'register':
        router.push('/register');
        break;
      case 'otp':
        router.push('/otp');
        break;
      case 'city_select':
        router.push('/city_select');
        break;
      case 'interest_select':
        router.push('/interest_select');
        break;
      case 'goal_select':
        router.push('/goal_select');
        break;
      case 'social_level':
        router.push('/social_level');
        break;
      case 'privacy_setting':
        router.push('/privacy_setting');
        break;

      // Feed & Posts
      case 'create_post':
        router.push('/create_post');
        break;
      case 'post_detail':
        router.push('/post_detail');
        break;
      case 'edit_post':
        router.push('/edit_post');
        break;
      case 'comment':
        router.push('/comment');
        break;

      // Groups
      case 'group_home':
        router.push('/group_home');
        break;
      case 'group_detail':
        router.push('/group_detail');
        break;
      case 'group_chat':
        router.push('/group_chat');
        break;

      // Messages
      case 'personal_chat':
        router.push('/personal_chat');
        break;

      // Match & Activities
      case 'map':
        router.push('/map');
        break;
      case 'review':
        router.push('/review');
        break;
      case 'activity_detail':
        if (params?.id) {
          router.push(`/activity/${params.id}`);
        } else {
          router.push('/(tabs)/match');
        }
        break;
      case 'participant_list':
        if (params?.id) {
          router.push(`/activity/${params.id}/participants`);
        }
        break;

      default:
        console.log('App navigation to:', screen, params);
    }
  };

  return { navigateTo, router };
}
