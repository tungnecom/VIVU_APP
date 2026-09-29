import { Tabs } from 'expo-router';
import React from 'react';
import { BottomTabBar } from '../../components/BottomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Đi cùng',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Tin nhắn',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
        }}
      />
    </Tabs>
  );
}
