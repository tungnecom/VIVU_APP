import React from 'react';
import { GroupDetailScreen } from '../screens/groups/GroupDetailScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function GroupDetailRoute() {
  const { navigateTo } = useAppNavigation();
  return <GroupDetailScreen onNavigate={navigateTo as any} />;
}
