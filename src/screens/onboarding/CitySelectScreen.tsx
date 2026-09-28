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
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { CITIES } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface CitySelectProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const CitySelectScreen: React.FC<CitySelectProps> = ({ onNavigate }) => {
  const [selectedCity, setSelectedCity] = useState('Đà Nẵng');
  const [query, setQuery] = useState('');

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('otp')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Bạn đang sống ở đâu?</Text>
          <Text style={styles.subtitle}>
            Chọn thành phố để nhận những gợi ý phù hợp nhất.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thành phố..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Cities List */}
        <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
          {filteredCities.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityItem,
                  isSelected && styles.cityItemSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCity(city)}
              >
                <View style={styles.cityLeft}>
                  <Ionicons
                    name="location-sharp"
                    size={20}
                    color={isSelected ? COLORS.primary : COLORS.textLight}
                    style={styles.cityIcon}
                  />
                  <Text
                    style={[
                      styles.cityName,
                      isSelected && styles.cityNameSelected,
                    ]}
                  >
                    {city}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('goal_select')}
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
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textDark,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  cityItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7F6FF',
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityIcon: {
    marginRight: 12,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  cityNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWrap: {
    paddingTop: 12,
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
