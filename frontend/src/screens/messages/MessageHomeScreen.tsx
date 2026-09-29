import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '../../components/BottomTabBar';
import { ViViMascotModal } from '../../components/ViViMascotModal';
import { MOCK_CONVERSATIONS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface MessageHomeProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const MessageHomeScreen: React.FC<MessageHomeProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [showViVi, setShowViVi] = useState(false);

  const filtered = MOCK_CONVERSATIONS.filter((item) => {
    if (activeTab === 'unread') return item.unreadCount > 0;
    return true;
  }).filter((item) =>
    item.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Tin nhắn</Text>
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => onNavigate('match_home')}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn, bạn bè..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'all' && styles.filterChipActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.filterText, activeTab === 'all' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'unread' && styles.filterChipActive]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[styles.filterText, activeTab === 'unread' && styles.filterTextActive]}>
              Chưa đọc (1)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.conversationItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.isGroup) {
                  onNavigate('group_chat');
                } else {
                  onNavigate('personal_chat');
                }
              }}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                {item.user.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.convoInfo}>
                <View style={styles.convoHeader}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.convoSub}>
                  <Text
                    style={[
                      styles.lastMsg,
                      item.unreadCount > 0 && styles.lastMsgUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating ViVi Assistant Trigger */}
      <TouchableOpacity
        style={styles.floatingViVi}
        activeOpacity={0.85}
        onPress={() => setShowViVi(true)}
      >
        <Ionicons name="sparkles" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        currentScreen="message_home"
        onNavigate={onNavigate}
        unreadCount={1}
      />

      <ViViMascotModal
        visible={showViVi}
        onClose={() => setShowViVi(false)}
        onSelectAction={() => setShowViVi(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  newChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  list: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convoInfo: {
    flex: 1,
  },
  convoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  convoSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    fontSize: 13,
    color: COLORS.textMedium,
    flex: 1,
    paddingRight: 10,
  },
  lastMsgUnread: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingViVi: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
});
