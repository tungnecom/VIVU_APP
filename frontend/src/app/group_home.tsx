import React from 'react';
import { GroupHomeScreen } from '../screens/groups/GroupHomeScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function GroupHomeRoute() {
  const { navigateTo } = useAppNavigation();
  return <GroupHomeScreen onNavigate={navigateTo as any} />;
}
