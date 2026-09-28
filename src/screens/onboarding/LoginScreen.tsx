import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const activePhone = useAuthStore((s) => s.activePhone);
  const setActivePhone = useAuthStore((s) => s.setActivePhone);
  const setCurrentOtpCode = useAuthStore((s) => s.setCurrentOtpCode);
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState(activePhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if identifier is phone number
  const isPhone = /^(0|\+84)[0-9]{8,10}$/.test(identifier.trim());

  // Handle standard password / phone login
  const handleLogin = async () => {
    const rawId = identifier.trim();
    if (!rawId) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hoặc email của bạn.');
      return;
    }
    setActivePhone(rawId);
    setLoading(true);
    try {
      // If user typed phone number: trigger quick OTP
      if (isPhone) {
        const res = await ApiClient.sendSmsOtp(rawId);
        if (res?.code) {
          setCurrentOtpCode(res.code);
        }
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.setState({ user: { ...currentUser, identifier: rawId, phone: rawId } });
        }
        Alert.alert(
          'Mã Xác Thực OTP 📲',
          `Mã OTP xác thực gửi về ${rawId} là: [ ${res?.code || '868686'} ]\n(Mã có hiệu lực trong 60 giây)`,
          [
            {
              text: 'Nhập mã ngay',
              onPress: () => onNavigate('otp'),
            },
          ]
        );
        return;
      }

      // Email/password regular login
      const dummyUser = {
        id: 'u_' + Date.now(),
        name: rawId.split('@')[0] || 'VIVU Explorer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        identifier: rawId,
        phone: rawId,
        trustScore: 85,
        rating: 4.9,
        reviewCount: 24,
        joinDate: '01/2025',
        badges: ['Cạ cứng du lịch', 'Thổ địa sành ăn'],
      };
      await login('vivu_token_' + Date.now(), dummyUser as any);
      onNavigate('home_feed');
    } catch {
      onNavigate('home_feed');
    } finally {
      setLoading(false);
    }
  };

  // Quick SMS OTP login
  const handleSmsOtpLogin = async () => {
    const phone = identifier.trim();
    if (!phone) {
      Alert.alert('Nhập số điện thoại', 'Vui lòng nhập số điện thoại của bạn để nhận mã OTP.');
      return;
    }
    setActivePhone(phone);
    setLoading(true);
    try {
      const res = await ApiClient.sendSmsOtp(phone);
      if (res?.code) {
        setCurrentOtpCode(res.code);
      }
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, identifier: phone, phone } });
      }
      Alert.alert(
        'Mã Xác Thực OTP 📲',
        `Mã OTP xác thực gửi về ${phone} là: [ ${res?.code || '868686'} ]\n(Mã có hiệu lực trong 60 giây)`,
        [
          {
            text: 'Nhập mã ngay',
            onPress: () => onNavigate('otp'),
          },
        ]
      );
    } catch {
      onNavigate('otp');
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.loginWithGoogle({
        googleId: 'gg_' + Date.now(),
        email: 'user.google@vivu.vn',
        name: 'VIVU Traveler (Google)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      });
      if (res?.token && res?.user) {
        await login(res.token, res.user);
        Alert.alert('Đăng nhập thành công', `Chào mừng ${res.user.name || 'bạn'} qua Google!`);
        onNavigate('home_feed');
      } else {
        onNavigate('home_feed');
      }
    } catch {
      onNavigate('home_feed');
    } finally {
      setLoading(false);
    }
  };

  // Apple Login
  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.loginWithApple({
        appleId: 'apple_' + Date.now(),
        email: 'user.apple@privaterelay.appleid.com',
        fullName: 'VIVU Member (Apple)',
      });
      if (res?.token && res?.user) {
        await login(res.token, res.user);
        Alert.alert('Đăng nhập thành công', `Chào mừng ${res.user.name || 'bạn'} qua Apple!`);
        onNavigate('home_feed');
      } else {
        onNavigate('home_feed');
      }
    } catch {
      onNavigate('home_feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header onBack={() => onNavigate('welcome')} transparent />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn quay trở lại VIVU!</Text>
        </View>

        <View style={styles.formBlock}>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại hoặc email"
              placeholderTextColor={COLORS.textLight}
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rowActions}>
            <TouchableOpacity style={styles.smsOtpLink} onPress={handleSmsOtpLogin}>
              <Ionicons name="phone-portrait-outline" size={15} color={COLORS.primary} />
              <Text style={styles.smsOtpText}>Đăng nhập OTP SMS (+20 Uy tín)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnText}>Đăng nhập</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.7}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.7}
              onPress={handleAppleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => onNavigate('register')}
        >
          <Text style={styles.footerText}>
            Chưa có tài khoản? <Text style={styles.boldPurple}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  headerBlock: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 6,
  },
  formBlock: {
    gap: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  smsOtpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  smsOtpText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: COLORS.textLight,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFC',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMedium,
  },
  boldPurple: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
