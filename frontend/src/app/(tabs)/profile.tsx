import React from 'react';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function ProfileRoute() {
  const { navigateTo } = useAppNavigation();

  return <ProfileScreen onNavigate={navigateTo as any} />;
}
