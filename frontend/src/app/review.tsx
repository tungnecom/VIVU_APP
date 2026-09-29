import React from 'react';
import { PlaceReviewScreen } from '../screens/discovery/PlaceReviewScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function ReviewRoute() {
  const { navigateTo } = useAppNavigation();
  return <PlaceReviewScreen onNavigate={navigateTo as any} />;
}
