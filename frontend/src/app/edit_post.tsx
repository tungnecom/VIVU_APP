import React from 'react';
import { EditPostScreen } from '../screens/feed/EditPostScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function EditPostRoute() {
  const { navigateTo } = useAppNavigation();
  return <EditPostScreen onNavigate={navigateTo as any} />;
}
