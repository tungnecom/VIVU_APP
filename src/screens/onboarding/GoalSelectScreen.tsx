import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { GOALS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface GoalSelectProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const GoalSelectScreen: React.FC<GoalSelectProps> = ({ onNavigate }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['1', '2']);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== id));
      }
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('city_select')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Bạn đến VIVU để làm gì?</Text>
          <Text style={styles.subtitle}>
            Chọn ít nhất 1 mục tiêu để cá nhân hóa trải nghiệm
          </Text>
        </View>

        <ScrollView style={styles.goalList} showsVerticalScrollIndicator={false}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => toggleGoal(goal.id)}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected ? styles.iconBoxSelected : styles.iconBoxUnselected,
                  ]}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={22}
                    color={isSelected ? '#FFFFFF' : COLORS.primary}
                  />
                </View>

                <View style={styles.goalInfo}>
                  <Text
                    style={[
                      styles.goalTitle,
                      isSelected && styles.goalTitleSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text style={styles.goalDesc}>{goal.desc}</Text>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottomWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('interest_select')}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>Tiếp tục</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 6,
  },
  goalList: {
    flex: 1,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEF2',
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7F6FF',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxSelected: {
    backgroundColor: COLORS.primary,
  },
  iconBoxUnselected: {
    backgroundColor: '#F0EEFF',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  goalTitleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  goalDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bottomWrap: {
    paddingTop: 12,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
