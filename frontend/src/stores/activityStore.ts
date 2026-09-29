import { create } from 'zustand';
import { MOCK_ACTIVITY } from '../constants/mockData';
import { ActivityItem } from '../types';

interface ActivityState {
  currentActivity: ActivityItem;
  isJoined: boolean;

  // Actions
  toggleJoinActivity: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  currentActivity: MOCK_ACTIVITY,
  isJoined: false,

  toggleJoinActivity: () =>
    set((state) => {
      const nextJoined = !state.isJoined;
      return {
        isJoined: nextJoined,
        currentActivity: {
          ...state.currentActivity,
          joinedCount: nextJoined
            ? state.currentActivity.joinedCount + 1
            : Math.max(1, state.currentActivity.joinedCount - 1),
        },
      };
    }),
}));
