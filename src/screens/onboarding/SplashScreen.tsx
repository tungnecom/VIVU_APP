import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface SplashScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  return (
    <LinearGradient
      colors={['#8B5CF6', '#6366F1', '#4F46E5']}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <View style={styles.contentWrap}>
        <View style={styles.logoWrap}>
          <Text style={styles.brandTitle}>VIVU</Text>
          <Text style={styles.brandSlogan}>Đi đâu cũng có bạn.</Text>
        </View>

        <View style={styles.imageIllustrationContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlayGradient} />
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => onNavigate('welcome')}
        >
          <Text style={styles.startBtnText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 40,
  },
  brandTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  brandSlogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontWeight: '500',
  },
  imageIllustrationContainer: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  startBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  startBtnText: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
