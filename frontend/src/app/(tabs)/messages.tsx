import { useRouter } from 'expo-router';
import React from 'react';
import { MessageHomeScreen } from '../../screens/messages/MessageHomeScreen';
import { ScreenKey } from '../../types';

export default function MessagesRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey, params?: any) => {
    if (screen === 'personal_chat') {
      router.push('/messages/personal_chat');
    } else if (screen === 'group_chat') {
      router.push('/messages/group_chat');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <MessageHomeScreen onNavigate={handleNavigate} />;
}
