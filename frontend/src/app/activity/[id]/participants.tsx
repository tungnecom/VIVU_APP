import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ParticipantListScreen } from '../../../screens/match/ParticipantListScreen';

export default function ParticipantListRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const handleNavigate = (screen: any) => {
    if (screen === 'activity_detail') {
      router.back();
    } else if (screen === 'personal_chat') {
      router.push('/messages/personal_chat');
    } else {
      console.log('Navigate to:', screen);
    }
  };

  return <ParticipantListScreen onNavigate={handleNavigate as any} activityId={id as string} />;
}
