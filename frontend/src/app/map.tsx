import { useRouter } from 'expo-router';
import React from 'react';
import { MapScreen } from '../screens/discovery/MapScreen';
import { ScreenKey } from '../types';

export default function MapRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey, params?: any) => {
    if (screen === 'activity_detail' && params?.id) {
      router.push(`/activity/${params.id}`);
    } else if (screen === 'personal_chat') {
      router.push('/messages/personal_chat');
    } else if (screen === 'home_feed') {
      router.push('/(tabs)');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <MapScreen onNavigate={handleNavigate} />;
}
