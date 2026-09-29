import React from 'react';
import { HomeFeedScreen } from '../../screens/feed/HomeFeedScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function TabsIndexRoute() {
  const { navigateTo } = useAppNavigation();

  return <HomeFeedScreen onNavigate={navigateTo as any} onOpenQuickSwitcher={() => {}} />;
}
