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
import { SOCIAL_LEVELS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface SocialLevelProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const SocialLevelScreen: React.FC<SocialLevelProps> = ({ onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState('normal');

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('interest_select')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>
            Bạn cảm thấy thế nào khi làm quen người mới?
          </Text>
          <Text style={styles.subtitle}>
            VIVU sẽ điều chỉnh cách thức kết nối và gợi ý câu chuyện phù hợp với tính cách của bạn.
          </Text>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {SOCIAL_LEVELS.map((item) => {
            const isSelected = selectedLevel === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => setSelectedLevel(item.id)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.info}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isSelected && styles.itemTitleSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>

                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.bottomWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('privacy_setting')}
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
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 8,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEF2',
    marginBottom: 14,
    ...SHADOWS.sm,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7F6FF',
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  itemTitleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 3,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
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
