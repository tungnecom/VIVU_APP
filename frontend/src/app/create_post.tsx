import { useRouter } from 'expo-router';
import React from 'react';
import { CreatePostScreen } from '../screens/feed/CreatePostScreen';
import { ScreenKey } from '../types';

export default function CreatePostRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey, params?: any) => {
    if (screen === 'home_feed') {
      router.back();
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <CreatePostScreen onNavigate={handleNavigate} />;
}
