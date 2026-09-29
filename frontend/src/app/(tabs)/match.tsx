import React from 'react';
import { MatchHomeScreen } from '../../screens/match/MatchHomeScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function MatchTab() {
  const { navigateTo } = useAppNavigation();

  return <MatchHomeScreen onNavigate={navigateTo as any} />;
}
