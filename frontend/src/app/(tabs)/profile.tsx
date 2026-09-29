import { useRouter } from 'expo-router';
import React from 'react';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { ScreenKey } from '../../types';

export default function ProfileRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey, params?: any) => {
    if (screen === 'privacy_setting') {
      router.push('/privacy_setting');
    } else if (screen === 'welcome') {
      router.replace('/login');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <ProfileScreen onNavigate={handleNavigate} />;
}
