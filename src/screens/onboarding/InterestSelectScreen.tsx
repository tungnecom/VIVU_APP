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
import { INTERESTS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface InterestSelectProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const InterestSelectScreen: React.FC<InterestSelectProps> = ({ onNavigate }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'food',
    'cafe',
    'travel',
    'camping',
  ]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('goal_select')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Bạn thích những gì?</Text>
          <Text style={styles.subtitle}>
            Chọn ít nhất 3 sở thích để khám phá gợi ý phù hợp
          </Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {INTERESTS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.interestCard,
                    isSelected && styles.interestCardSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => toggleInterest(item.id)}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: isSelected ? COLORS.primary : item.bg },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isSelected ? '#FFFFFF' : item.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.interestLabel,
                      isSelected && styles.interestLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomWrap}>
          <Text style={styles.selectedCountText}>
            Đã chọn: <Text style={styles.bold}>{selectedInterests.length}</Text> sở thích
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('social_level')}
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
    marginBottom: 20,
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
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  interestCard: {
    width: '30%',
    aspectRatio: 0.95,
    borderRadius: 18,
    backgroundColor: '#FAFAFC',
    borderWidth: 1.5,
    borderColor: '#EEEEF2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  interestCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F3FF',
    ...SHADOWS.sm,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWrap: {
    paddingTop: 12,
    gap: 10,
  },
  selectedCountText: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textMedium,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.primary,
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
