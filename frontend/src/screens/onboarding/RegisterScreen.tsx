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

interface RegisterScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const activePhone = useAuthStore((s) => s.activePhone);
  const setActivePhone = useAuthStore((s) => s.setActivePhone);
  const setCurrentOtpCode = useAuthStore((s) => s.setCurrentOtpCode);
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState(activePhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle register and send real SMS OTP
  const handleRegister = async () => {
    const rawId = identifier.trim();
    if (!rawId) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hoặc email của bạn.');
      return;
    }
    setActivePhone(rawId);
    setLoading(true);
    // Register via API
    try {
      const res = await ApiClient.register(rawId, password);
      if (res?.success && res?.data?.token) {
        // Successfully created user
        const fakeUser = {
          id: 'temp',
          name: rawId.split('@')[0],
          identifier: rawId,
          phone: rawId,
          city: 'Đà Nẵng',
          trustScore: 100,
        };
        await login(res.data.token, fakeUser as any);
        
        // Cần OTP nếu là SĐT (giả định)
        if (/^(0|\+84)[0-9]{8,10}$/.test(rawId)) {
          const otpRes = await ApiClient.sendSmsOtp(rawId, res.data.token);
          if (otpRes?.code) setCurrentOtpCode(otpRes.code);
          onNavigate('otp');
        } else {
          onNavigate('city_select');
        }
      } else {
        Alert.alert('Lỗi đăng ký', res?.message || 'Có lỗi xảy ra.');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Lỗi kết nối.');
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
        email: 'user.new@vivu.vn',
        name: 'VIVU Traveler',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      });
      if (res?.token && res?.user) {
        await login(res.token, res.user);
        Alert.alert('Đăng ký thành công', `Chào mừng ${res.user.name || 'bạn'} gia nhập VIVU!`);
        onNavigate('city_select');
      } else {
        onNavigate('city_select');
      }
    } catch {
      onNavigate('city_select');
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
        email: 'user.new@privaterelay.appleid.com',
        fullName: 'VIVU Member',
      });
      if (res?.token && res?.user) {
        await login(res.token, res.user);
        Alert.alert('Đăng ký thành công', `Chào mừng ${res.user.name || 'bạn'} gia nhập VIVU!`);
        onNavigate('city_select');
      } else {
        onNavigate('city_select');
      }
    } catch {
      onNavigate('city_select');
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
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình kết nối cùng VIVU</Text>
        </View>

        <View style={styles.formBlock}>
          {/* Identifier input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại hoặc email"
                placeholderTextColor={COLORS.textLight}
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password input */}
          <View style={styles.inputGroup}>
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
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleRegister}
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
                <Text style={styles.btnText}>Đăng ký (+20 Điểm Uy Tín)</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login buttons */}
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
          onPress={() => onNavigate('login')}
        >
          <Text style={styles.footerText}>
            Đã có tài khoản? <Text style={styles.boldPurple}>Đăng nhập</Text>
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
    gap: 18,
  },
  inputGroup: {
    gap: 6,
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
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
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
    marginVertical: 16,
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
