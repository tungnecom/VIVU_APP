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
import { BottomTabBar } from '../../components/BottomTabBar';
import { MOCK_GROUPS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface GroupHomeProps {
  onNavigate: (screen: ScreenKey) => void;
  showBottomBar?: boolean;
}

export const GroupHomeScreen: React.FC<GroupHomeProps> = ({
  onNavigate,
  showBottomBar = false,
}) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'active' | 'mine'>('for_you');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Nhóm</Text>
          <TouchableOpacity
            style={styles.createGroupBtn}
            onPress={() => Alert.alert('Tạo nhóm', 'Mở biểu mẫu tạo nhóm mới!')}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={styles.createGroupText}>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhóm, cộng đồng..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'for_you' && styles.tabBtnActive]}
            onPress={() => setActiveTab('for_you')}
          >
            <Text style={[styles.tabText, activeTab === 'for_you' && styles.tabTextActive]}>
              Dành cho bạn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Đang hoạt động
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'mine' && styles.tabBtnActive]}
            onPress={() => setActiveTab('mine')}
          >
            <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>
              Của bạn (2)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.listContent}>
          {MOCK_GROUPS.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              activeOpacity={0.85}
              onPress={() => onNavigate('group_detail')}
            >
              <Image source={{ uri: group.coverImage }} style={styles.coverImg} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.coverOverlay}
              />

              <View style={styles.groupCardBody}>
                <View style={styles.groupHeaderRow}>
                  <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
                  <View style={styles.groupMeta}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.membersCount}>
                      {group.membersCount} thành viên • {group.activeUsers} đang online
                    </Text>
                  </View>
                </View>

                <Text style={styles.groupDesc} numberOfLines={2}>
                  {group.description}
                </Text>

                <View style={styles.cardBottomRow}>
                  <View style={styles.tagsRow}>
                    {group.tags.map((t, idx) => (
                      <View key={idx} style={styles.tagPill}>
                        <Text style={styles.tagPillText}>#{t}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.viewGroupBtn}
                    onPress={() => onNavigate('group_chat')}
                  >
                    <Text style={styles.viewGroupText}>Chat nhóm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar (Chỉ hiển thị khi chạy ngoài Expo Router) */}
      {showBottomBar && <BottomTabBar currentScreen="group_home" onNavigate={onNavigate} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  createGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  createGroupText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 42,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabBtn: {
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  coverImg: {
    width: '100%',
    height: 110,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  groupCardBody: {
    padding: 16,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -32,
    marginBottom: 10,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  groupMeta: {
    flex: 1,
    paddingTop: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  membersCount: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  groupDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  viewGroupBtn: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewGroupText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
