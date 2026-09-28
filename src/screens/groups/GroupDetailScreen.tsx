import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { MOCK_GROUPS, MOCK_POSTS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface GroupDetailProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const GroupDetailScreen: React.FC<GroupDetailProps> = ({ onNavigate }) => {
  const group = MOCK_GROUPS[0];
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'activities'>('posts');
  const [isJoined, setIsJoined] = useState(true);

  return (
    <View style={styles.container}>
      <Header
        title="Chi tiết nhóm"
        onBack={() => onNavigate('group_home')}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => Alert.alert('Tùy chọn nhóm', 'Cài đặt thông báo & Rời nhóm')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverWrap}>
          <Image source={{ uri: group.coverImage }} style={styles.coverImg} />
        </View>

        {/* Header Profile */}
        <View style={styles.groupInfoBlock}>
          <Image source={{ uri: group.avatar }} style={styles.avatar} />
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.metaText}>
            👥 {group.membersCount} thành viên • 🟢 {group.activeUsers} đang online
          </Text>

          <Text style={styles.descText}>{group.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {group.tags.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.joinedBtn]}
              onPress={() => setIsJoined(!isJoined)}
            >
              <Ionicons
                name={isJoined ? 'checkmark-circle' : 'person-add'}
                size={18}
                color={isJoined ? COLORS.primary : '#FFFFFF'}
              />
              <Text style={[styles.joinBtnText, isJoined && styles.joinedBtnText]}>
                {isJoined ? 'Đã tham gia' : 'Tham gia nhóm'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => onNavigate('group_chat')}
            >
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              <Text style={styles.chatBtnText}>Chat nhóm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Bài viết (45)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'activities' && styles.tabBtnActive]}
            onPress={() => setActiveTab('activities')}
          >
            <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
              Kế hoạch rủ đi (3)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Thành viên
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <View style={styles.postsList}>
            {MOCK_POSTS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.postCard}
                onPress={() => onNavigate('post_detail')}
              >
                <View style={styles.postUserRow}>
                  <Image source={{ uri: p.author.avatar }} style={styles.postAvatar} />
                  <View>
                    <Text style={styles.postAuthor}>{p.author.name}</Text>
                    <Text style={styles.postTime}>{p.timeAgo}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{p.content}</Text>
                {p.images[0] && (
                  <Image source={{ uri: p.images[0] }} style={styles.postImg} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.placeholderBlock}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.primaryLight} />
            <Text style={styles.placeholderText}>
              Đang có 3 chuyến food tour chuẩn bị xuất phát trong tuần này!
            </Text>
            <TouchableOpacity
              style={styles.createActBtn}
              onPress={() => onNavigate('activity_detail')}
            >
              <Text style={styles.createActText}>Xem hoạt động mới nhất</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  coverWrap: {
    height: 140,
    width: '100%',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  groupInfoBlock: {
    paddingHorizontal: 20,
    marginTop: -40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginTop: 4,
  },
  descText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  joinedBtn: {
    backgroundColor: COLORS.primarySoft,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  joinedBtnText: {
    color: COLORS.primary,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  chatBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
    paddingHorizontal: 20,
  },
  tabBtn: {
    paddingVertical: 14,
    marginRight: 20,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  postsList: {
    padding: 16,
    gap: 14,
  },
  postCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  postTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  postContent: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  postImg: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  placeholderBlock: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textMedium,
  },
  createActBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createActText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
