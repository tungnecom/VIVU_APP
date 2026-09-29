import React from 'react';
import { GroupChatScreen } from '../screens/groups/GroupChatScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function GroupChatRoute() {
  const { navigateTo } = useAppNavigation();
  return <GroupChatScreen onNavigate={navigateTo as any} />;
}
