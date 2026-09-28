import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface PrivacySettingProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const PrivacySettingScreen: React.FC<PrivacySettingProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState({
    location: true,
    profile: true,
    messages: true,
    notifications: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const PRIVACY_ITEMS = [
    {
      key: 'location' as const,
      icon: 'location-outline',
      title: 'Vị trí',
      desc: 'Cho phép hiển thị khoảng cách và gợi ý hoạt động gần bạn',
    },
    {
      key: 'profile' as const,
      icon: 'person-circle-outline',
      title: 'Hồ sơ',
      desc: 'Hiển thị trang cá nhân và sở thích cho thành viên VIVU',
    },
    {
      key: 'messages' as const,
      icon: 'chatbubble-ellipses-outline',
      title: 'Tin nhắn',
      desc: 'Cho phép bạn mới và thành viên cùng nhóm gửi tin nhắn riêng',
    },
    {
      key: 'notifications' as const,
      icon: 'notifications-outline',
      title: 'Thông báo',
      desc: 'Cập nhật tức thì khi có lời mời, phản hồi hoặc bài đăng mới',
    },
  ];

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('social_level')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Thiết lập quyền riêng tư</Text>
          <Text style={styles.subtitle}>
            Thông tin của bạn luôn được bảo vệ an toàn. Bạn hoàn toàn có thể điều chỉnh lại bất cứ lúc nào trong Cài đặt.
          </Text>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {PRIVACY_ITEMS.map((item) => (
            <View key={item.key} style={styles.itemRow}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: COLORS.primaryLight }}
                thumbColor={settings[item.key] ? COLORS.primary : '#FFFFFF'}
                value={settings[item.key]}
                onValueChange={() => toggle(item.key)}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('home_feed')}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>Hoàn tất</Text>
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
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  itemDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomWrap: {
    paddingTop: 16,
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
