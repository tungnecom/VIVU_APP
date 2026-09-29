import React from 'react';
import { MessageHomeScreen } from '../../screens/messages/MessageHomeScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function MessagesRoute() {
  const { navigateTo } = useAppNavigation();

  return <MessageHomeScreen onNavigate={navigateTo as any} />;
}
