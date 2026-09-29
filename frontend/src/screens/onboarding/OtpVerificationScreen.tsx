import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

interface OtpProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const OtpVerificationScreen: React.FC<OtpProps> = ({ onNavigate }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const user = useAuthStore((s) => s.user);
  const activePhone = useAuthStore((s) => s.activePhone);
  const currentOtpCode = useAuthStore((s) => s.currentOtpCode);
  const setCurrentOtpCode = useAuthStore((s) => s.setCurrentOtpCode);
  const login = useAuthStore((s) => s.login);

  const phoneNumber = activePhone || user?.phone || user?.identifier || 'Số điện thoại của bạn';
  const displayOtpCode = currentOtpCode || '868686';

  // 60-second real countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle digit typing
  const handleDigitChange = (val: string, index: number) => {
    // Only accept numeric
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanVal;
    setCode(newCode);

    // Auto advance to next box
    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (cleanVal && index === 5 && newCode.every((d) => d.length > 0)) {
      submitOtp(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Resend SMS OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await ApiClient.sendSmsOtp(phoneNumber);
      if (res?.code) {
        setCurrentOtpCode(res.code);
      }
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
      Alert.alert(
        'Đã gửi lại mã OTP 📲',
        `Mã OTP mới gửi đến ${phoneNumber} là: [ ${res?.code || '868686'} ]\n(Có hiệu lực trong 60 giây)`
      );
    } catch {
      setCountdown(60);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-tap Auto-fill
  const handleAutoFill = () => {
    const digits = displayOtpCode.split('').slice(0, 6);
    while (digits.length < 6) digits.push('0');
    setCode(digits);
    submitOtp(digits.join(''));
  };

  // Submit OTP
  const submitOtp = async (otpValue?: string) => {
    const otpToVerify = otpValue || code.join('');
    if (otpToVerify.length < 6) {
      Alert.alert('Nhập mã OTP', 'Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    setLoading(true);
    try {
      await ApiClient.verifySmsOtp(otpToVerify, phoneNumber);
      setVerifiedSuccess(true);

      // Instantly update user profile with verified phone
      const updatedUser = {
        ...(user || {
          id: 'u_' + Date.now(),
          name: 'VIVU Traveler',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          city: 'Đà Nẵng',
          trustScore: 70,
        }),
        phone: phoneNumber,
        identifier: phoneNumber,
        isPhoneVerified: true,
        trustScore: Math.min(100, (user?.trustScore || 70) + 20),
      };
      await login('vivu_token_' + Date.now(), updatedUser as any);

      setTimeout(() => {
        onNavigate('home_feed');
      }, 500);
    } catch {
      onNavigate('home_feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('login')} transparent />
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <View style={styles.smsIconCircle}>
            <Ionicons name="chatbubble-ellipses" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Xác thực số điện thoại</Text>
          <Text style={styles.subtitle}>
            Mã OTP 6 số đã được gửi trực tiếp đến SIM của bạn ({phoneNumber})
          </Text>
        </View>

        {/* IN-APP SMS NOTIFICATION CARD WITH 1-TAP FILL */}
        <View style={styles.smsNoticeCard}>
          <View style={styles.smsNoticeHeader}>
            <View style={styles.smsTagRow}>
              <Ionicons name="mail" size={14} color="#1D4ED8" />
              <Text style={styles.smsNoticeTitle}>Tin nhắn SMS từ hệ thống VIVU</Text>
            </View>
            <Text style={styles.smsNoticeTime}>Vừa xong</Text>
          </View>
          <Text style={styles.smsNoticeBody}>
            Mã xác thực của bạn là:{' '}
            <Text style={styles.smsNoticeCode}>{displayOtpCode}</Text>. Tuyệt đối không chia sẻ mã này cho ai.
          </Text>
          <TouchableOpacity
            style={styles.autoFillBtn}
            onPress={handleAutoFill}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={14} color="#1D4ED8" />
            <Text style={styles.autoFillText}>1-Chạm điền tự động mã {displayOtpCode}</Text>
          </TouchableOpacity>
        </View>

        {/* Success Banner */}
        {verifiedSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
            <Text style={styles.successText}>Xác thực thành công! +20 Điểm Uy Tín</Text>
          </View>
        )}

        {/* 6 Digit Input Boxes */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                verifiedSuccess && styles.otpBoxSuccess,
              ]}
            >
              <TextInput
                ref={(ref) => {
                  inputsRef.current[index] = ref;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
                editable={!loading && !verifiedSuccess}
                selectTextOnFocus
              />
            </View>
          ))}
        </View>

        {/* Countdown & Resend Button */}
        <TouchableOpacity
          style={styles.resendBtn}
          onPress={handleResend}
          disabled={countdown > 0 || loading}
        >
          {countdown > 0 ? (
            <Text style={styles.resendText}>
              Gửi lại mã sau <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{countdown}s</Text>
            </Text>
          ) : (
            <Text style={[styles.resendText, styles.resendTextActive]}>
              Chưa nhận được mã? Gửi lại SMS
            </Text>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <View style={styles.actionWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => submitOtp()}
            disabled={loading || verifiedSuccess}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Xác nhận & Đăng nhập ngay</Text>
              )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  smsIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  smsNoticeCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  smsNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  smsTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  smsNoticeTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  smsNoticeBody: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 8,
  },
  smsNoticeCode: {
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 2,
    fontSize: 15,
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  autoFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFC',
  },
  otpBoxEmpty: {
    borderColor: '#E5E7EB',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF5FF',
    ...SHADOWS.sm,
  },
  otpBoxSuccess: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  resendTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionWrap: {
    marginTop: 'auto',
    marginBottom: 28,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
