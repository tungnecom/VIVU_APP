import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800',
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.85)', '#FFFFFF']}
          style={styles.imageFade}
        />
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.titleWrap}>
          <Text style={styles.brandTitle}>VIVU</Text>
          <Text style={styles.brandSubtitle}>Đi đâu cũng có bạn.</Text>
        </View>

        <Text style={styles.desc}>
          Khám phá thành phố, tìm người cùng sở thích, trải nghiệm những điều tuyệt vời cùng những người bạn mới.
        </Text>

        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('register')}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Bắt đầu</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => onNavigate('login')}
          >
            <Text style={styles.loginLinkText}>
              Đã có tài khoản? <Text style={styles.boldPurple}>Đăng nhập</Text>
            </Text>
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
  imageContainer: {
    width: '100%',
    height: '52%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  bottomCard: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  desc: {
    textAlign: 'center',
    fontSize: 15,
    color: COLORS.textMedium,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  actionsWrap: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    paddingVertical: 6,
  },
  loginLinkText: {
    fontSize: 14,
    color: COLORS.textMedium,
  },
  boldPurple: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
