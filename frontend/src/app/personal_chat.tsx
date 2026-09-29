import React from 'react';
import { PersonalChatScreen } from '../screens/messages/PersonalChatScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function PersonalChatRoute() {
  const { navigateTo } = useAppNavigation();
  return <PersonalChatScreen onNavigate={navigateTo as any} />;
}
