import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { MOCK_POSTS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface EditPostProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const EditPostScreen: React.FC<EditPostProps> = ({ onNavigate }) => {
  const post = MOCK_POSTS[0];
  const [content, setContent] = useState(post.content);
  const [location, setLocation] = useState('Hải Châu, Đà Nẵng');
  const [time, setTime] = useState('25/05/2025 - 17:00');
  const [slots, setSlots] = useState('5 người');

  const handleSave = () => {
    Alert.alert('Thành công', 'Đã lưu chỉnh sửa bài viết!', [
      { text: 'OK', onPress: () => onNavigate('post_detail') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Chỉnh sửa bài viết"
        onBack={() => onNavigate('post_detail')}
        rightIcon="close"
        onRightPress={() => onNavigate('post_detail')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Images Preview row */}
        <View style={styles.imageGallery}>
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.thumbImage} />
          ))}
        </View>

        {/* Text Input */}
        <Text style={styles.fieldLabel}>Nội dung bài viết</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={content}
          onChangeText={setContent}
        />

        {/* Detail Fields */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Địa điểm</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Thời gian</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="time" size={18} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Số người tham gia</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              value={slots}
              onChangeText={setSlots}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>Lưu thay đổi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: 10,
  },
  thumbImage: {
    width: 100,
    height: 90,
    borderRadius: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    color: COLORS.textDark,
  },
  fieldGroup: {
    gap: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 14,
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
