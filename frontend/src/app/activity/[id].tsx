import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ActivityDetailScreen } from '../../screens/match/ActivityDetailScreen';
import { useActivityStore } from '../../stores/activityStore';
import { COLORS } from '../../constants/theme';

export default function ActivityDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const fetchActivityDetail = useActivityStore((state) => state.fetchActivityDetail);
  const loading = useActivityStore((state) => state.loading);
  const activity = useActivityStore((state) => state.currentActivity);

  useEffect(() => {
    if (id && id !== 'mock') {
      fetchActivityDetail(id as string);
    }
  }, [id]);

  const handleNavigate = (screen: any) => {
    if (screen === 'match_home') {
      router.back();
    } else if (screen === 'map') {
      router.push('/map');
    } else if (screen === 'participant_list') {
      router.push(`/activity/${id}/participants`);
    } else if (screen === 'personal_chat') {
      router.push('/messages/personal_chat');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  if (loading && (!activity || activity.id !== id)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <ActivityDetailScreen onNavigate={handleNavigate as any} />;
}
