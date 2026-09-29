import React from 'react';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function PostDetailRoute() {
  const { navigateTo } = useAppNavigation();
  return <PostDetailScreen onNavigate={navigateTo as any} />;
}
