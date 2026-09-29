import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Map, { Marker } from 'react-map-gl/mapbox';
// @ts-ignore
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapViewComponentProps } from './MapViewComponent';

import { MapRef } from 'react-map-gl/mapbox';

export const MapViewComponent: React.FC<MapViewComponentProps> = ({ markers, initialRegion, centerCoordinate, style }) => {
  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
  const mapRef = React.useRef<MapRef>(null);

  const initialViewState = useMemo(() => ({
    longitude: initialRegion?.longitude || 108.2022,
    latitude: initialRegion?.latitude || 16.0544,
    zoom: 12
  }), [initialRegion]);

  React.useEffect(() => {
    if (centerCoordinate && mapRef.current) {
      mapRef.current.flyTo({
        center: [centerCoordinate.longitude, centerCoordinate.latitude],
        zoom: centerCoordinate.zoom || 14,
        duration: 2000
      });
    }
  }, [centerCoordinate]);

  if (!mapboxToken) {
    return (
      <View style={[style, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        <Text style={{ textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
          Vui lòng cấu hình EXPO_PUBLIC_MAPBOX_TOKEN trong file .env để hiển thị bản đồ Web.
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            onClick={marker.onPress}
            color={marker.color || '#EF4444'}
          />
        ))}
      </Map>
    </View>
  );
};
