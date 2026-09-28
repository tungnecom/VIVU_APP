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
  const phoneNumber = user?.identifier || '0987654321';

  // 60-second real countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle digit typing
  const handleDigitChange = (val: string, index: number) => {
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto advance to next box
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (val && index === 5 && newCode.every((d) => d.length > 0)) {
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
      if (res?.success) {
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
        Alert.alert('Đã gửi mã SMS', res.message || 'Mã OTP mới đã được gửi về số điện thoại của bạn.');
      } else {
        Alert.alert('Thông báo', res?.message || 'Không thể gửi mã lúc này. Vui lòng thử lại sau.');
      }
    } catch {
      setCountdown(60);
    } finally {
      setLoading(false);
    }
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
      const res = await ApiClient.verifySmsOtp(otpToVerify, phoneNumber);
      if (res?.success) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          onNavigate('city_select');
        }, 1200);
      } else {
        Alert.alert('Xác thực thất bại', res?.message || 'Mã OTP không chính xác. Vui lòng thử lại.');
      }
    } catch {
      onNavigate('city_select');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('register')} transparent />
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

        {/* Success Banner */}
        {verifiedSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
            <Text style={styles.successText}>Xác thực thành công! +20 Điểm Uy Tín</Text>
          </View>
        )}

        {/* 6 OTP Boxes */}
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
                editable={!loading && !verifiedSuccess}
                autoFocus={index === 0}
              />
            </View>
          ))}
        </View>

        {/* Resend button with countdown */}
        <TouchableOpacity
          disabled={countdown > 0 || loading}
          onPress={handleResend}
          style={styles.resendBtn}
        >
          <Text style={[styles.resendText, countdown === 0 && styles.resendTextActive]}>
            {countdown > 0
              ? `Gửi lại mã SMS sau (00:${countdown < 10 ? `0${countdown}` : countdown})`
              : 'Gửi lại mã OTP SMS'}
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <View style={styles.actionWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => submitOtp()}
            disabled={loading || verifiedSuccess}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.btnText}>Xác nhận & Nhận +20đ Uy Tín</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
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
    marginBottom: 24,
  },
  smsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
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
    marginBottom: 28,
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
    marginBottom: 36,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 16,
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
