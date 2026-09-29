import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { EmptyState } from '../../components/common/StateView';

interface MessageHomeProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  showBottomBar?: boolean;
}

export const MessageHomeScreen: React.FC<MessageHomeProps> = ({
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'direct'>('groups');
  const [search, setSearch] = useState('');

  // Dữ liệu Nhóm Kèo (được duyệt tham gia)
  const groupChats = [
    {
      id: 'grp_01',
      activityId: 'act_01',
      title: 'Cafe sáng ngắm sông Hàn & chia sẻ về nhiếp ảnh',
      lastMessage: 'Quân (Chủ kèo): Hẹn gặp mọi người lúc 8h30 ở Wonderlust nhé!',
      time: '10 phút trước',
      unreadCount: 2,
      memberCount: 3,
      schedule: 'Chủ Nhật, 08:30',
      avatar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150',
    },
    {
      id: 'grp_02',
      activityId: 'act_02',
      title: 'Chèo SUP đón bình minh Bán đảo Sơn Trà',
      lastMessage: 'Thu Hà: Mọi người nhớ mang kem chống nắng và mũ nha.',
      time: 'Hôm qua',
      unreadCount: 0,
      memberCount: 4,
      schedule: 'Thứ 7, 05:00',
      avatar: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150',
    },
  ];

  // Dữ liệu Chat riêng 1-1
  const directChats = [
    {
      id: 'dm_01',
      user: {
        id: 'u_01',
        name: 'Nguyễn Minh Quân',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        trustScore: 92,
        isVerified: true,
      },
      lastMessage: 'Ok bạn, chủ nhật này gặp nhau ở quán nhé!',
      time: '15 phút trước',
      unreadCount: 1,
    },
    {
      id: 'dm_02',
      user: {
        id: 'u_02',
        name: 'Trần Thu Hà',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        trustScore: 88,
        isVerified: true,
      },
      lastMessage: 'Cảm ơn bạn đã duyệt yêu cầu tham gia nha ✨',
      time: '2 giờ trước',
      unreadCount: 0,
    },
    {
      id: 'dm_03',
      user: {
        id: 'u_03',
        name: 'Lê Hoàng Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        trustScore: 89,
        isVerified: false,
      },
      lastMessage: 'Kèo chèo SUP tuần sau còn chỗ không bạn?',
      time: 'Hôm qua',
      unreadCount: 0,
    },
  ];

  const filteredGroups = groupChats.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDirect = directChats.filter((d) =>
    d.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Tin nhắn</Text>
          <TouchableOpacity
            style={styles.findMatchBtn}
            onPress={() => onNavigate('match_home')}
            accessibilityLabel="Tìm kèo mới"
          >
            <Ionicons name="compass" size={16} color={COLORS.secondaryPurple} />
            <Text style={styles.findMatchText}>Khám phá kèo</Text>
          </TouchableOpacity>
        </View>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhóm kèo hoặc bạn bè..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs: Nhóm Kèo (Ưu tiên) vs Chat Riêng */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'groups' && styles.tabBtnActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === 'groups' ? COLORS.secondaryPurple : COLORS.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            Nhóm kèo ({groupChats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'direct' && styles.tabBtnActive]}
          onPress={() => setActiveTab('direct')}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={15}
            color={activeTab === 'direct' ? COLORS.secondaryPurple : COLORS.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'direct' && styles.tabTextActive]}>
            Trò chuyện riêng ({directChats.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách hội thoại */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'groups' ? (
          filteredGroups.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="Chưa có nhóm chat kèo"
              message="Khi yêu cầu tham gia kèo của bạn được chủ kèo chấp nhận, nhóm chat sẽ xuất hiện tại đây!"
              actionLabel="Khám phá kèo ngay"
              onAction={() => onNavigate('match_home')}
            />
          ) : (
            filteredGroups.map((grp) => (
              <TouchableOpacity
                key={grp.id}
                style={styles.chatCard}
                activeOpacity={0.8}
                onPress={() => onNavigate('group_chat', { id: grp.activityId })}
              >
                <UserAvatar
                  uri={grp.avatar}
                  name={grp.title}
                  size={50}
                  trustScore={90}
                />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatTitle} numberOfLines={1}>
                      {grp.title}
                    </Text>
                    <Text style={styles.chatTime}>{grp.time}</Text>
                  </View>

                  <View style={styles.scheduleBadge}>
                    <Ionicons name="time" size={11} color={COLORS.primaryCoral} />
                    <Text style={styles.scheduleText}>{grp.schedule}</Text>
                    <Text style={styles.memberDot}>•</Text>
                    <Text style={styles.scheduleText}>👥 {grp.memberCount} bạn</Text>
                  </View>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {grp.lastMessage}
                  </Text>
                </View>

                {grp.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{grp.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )
        ) : (
          filteredDirect.length === 0 ? (
            <EmptyState
              icon="person-outline"
              title="Chưa có tin nhắn riêng"
              message="Bạn có thể nhắn tin trực tiếp với chủ kèo hoặc bạn đồng hành."
            />
          ) : (
            filteredDirect.map((dm) => (
              <TouchableOpacity
                key={dm.id}
                style={styles.chatCard}
                activeOpacity={0.8}
                onPress={() => onNavigate('personal_chat', { id: dm.user.id })}
              >
                <UserAvatar
                  uri={dm.user.avatar}
                  name={dm.user.name}
                  size={50}
                  trustScore={dm.user.trustScore}
                  isVerified={dm.user.isVerified}
                />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatTitle} numberOfLines={1}>
                      {dm.user.name}
                    </Text>
                    <Text style={styles.chatTime}>{dm.time}</Text>
                  </View>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {dm.lastMessage}
                  </Text>
                </View>

                {dm.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{dm.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  findMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3EEFD',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  findMatchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.secondaryPurple,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.secondaryPurple,
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryCoral,
  },
  memberDot: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  lastMsgText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  unreadBadge: {
    backgroundColor: COLORS.primaryCoral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
