import React from 'react';
import { CommentSheetScreen } from '../screens/feed/CommentSheetScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function CommentRoute() {
  const { navigateTo } = useAppNavigation();
  return <CommentSheetScreen onNavigate={navigateTo as any} />;
}
