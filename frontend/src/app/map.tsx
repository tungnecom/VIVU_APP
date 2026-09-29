import React from 'react';
import { MapScreen } from '../screens/discovery/MapScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function MapRoute() {
  const { navigateTo } = useAppNavigation();

  return <MapScreen onNavigate={navigateTo as any} />;
}
