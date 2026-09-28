import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CURRENT_USER } from '../constants/mockData';
import { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  hasCompletedOnboarding: boolean;
  selectedCity: string;
  selectedGoals: string[];
  selectedInterests: string[];
  communicationStyle: string;
  privacySettings: {
    location: boolean;
    profile: boolean;
    messages: boolean;
    notifications: boolean;
  };

  // Actions
  setCity: (city: string) => void;
  setGoals: (goals: string[]) => void;
  setInterests: (interests: string[]) => void;
  setSocialLevel: (level: string) => void;
  setPrivacySettings: (settings: AuthState['privacySettings']) => void;
  completeOnboarding: () => Promise<void>;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: CURRENT_USER,
  hasCompletedOnboarding: false,
  selectedCity: 'Đà Nẵng',
  selectedGoals: ['1', '2'],
  selectedInterests: ['food', 'cafe', 'travel', 'camping'],
  communicationStyle: 'normal',
  privacySettings: {
    location: true,
    profile: true,
    messages: true,
    notifications: false,
  },

  setCity: (city) => set({ selectedCity: city }),
  setGoals: (goals) => set({ selectedGoals: goals }),
  setInterests: (interests) => set({ selectedInterests: interests }),
  setSocialLevel: (level) => set({ communicationStyle: level }),
  setPrivacySettings: (settings) => set({ privacySettings: settings }),

  completeOnboarding: async () => {
    set({ hasCompletedOnboarding: true });
    try {
      await AsyncStorage.setItem('vivu_onboarding_completed', 'true');
    } catch {
      // ignore
    }
  },

  login: async (token, user) => {
    set({ token, user, hasCompletedOnboarding: true });
    try {
      await AsyncStorage.setItem('vivu_token', token);
      await AsyncStorage.setItem('vivu_user', JSON.stringify(user));
      await AsyncStorage.setItem('vivu_onboarding_completed', 'true');
    } catch {
      // ignore
    }
  },

  logout: async () => {
    set({ token: null, hasCompletedOnboarding: false });
    try {
      await AsyncStorage.removeItem('vivu_token');
      await AsyncStorage.removeItem('vivu_user');
      await AsyncStorage.removeItem('vivu_onboarding_completed');
    } catch {
      // ignore
    }
  },

  loadSession: async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('vivu_onboarding_completed');
      const token = await AsyncStorage.getItem('vivu_token');
      const userStr = await AsyncStorage.getItem('vivu_user');

      if (token && userStr) {
        set({
          token,
          user: JSON.parse(userStr),
          hasCompletedOnboarding: true,
        });
      } else if (onboardingCompleted === 'true') {
        set({ hasCompletedOnboarding: true });
      }
    } catch {
      // ignore
    }
  },
}));
