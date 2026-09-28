import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface OtpProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const OtpVerificationScreen: React.FC<OtpProps> = ({ onNavigate }) => {
  const [code, setCode] = useState(['1', '2', '3', '4', '5', '6']);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('register')} transparent />
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Xác thực tài khoản</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP 6 số đã được gửi đến số điện thoại của bạn
          </Text>
        </View>

        {/* 6 OTP Boxes */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
              ]}
            >
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => {
                  const newCode = [...code];
                  newCode[index] = val;
                  setCode(newCode);
                }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          disabled={countdown > 0}
          onPress={() => setCountdown(30)}
          style={styles.resendBtn}
        >
          <Text style={styles.resendText}>
            Gửi lại mã {countdown > 0 ? `(00:${countdown < 10 ? `0${countdown}` : countdown})` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('city_select')}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 8,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0EEFF',
  },
  otpBoxEmpty: {
    borderColor: '#E5E7EB',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    width: '100%',
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionWrap: {
    marginTop: 'auto',
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
