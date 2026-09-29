import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string;
  onPress?: () => void;
}

export interface MapViewComponentProps {
  markers: MapMarker[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  centerCoordinate?: {
    latitude: number;
    longitude: number;
    zoom?: number;
  } | null;
  style?: any;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({ markers, initialRegion, centerCoordinate, style }) => {
  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    if (centerCoordinate && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: centerCoordinate.latitude,
        longitude: centerCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  }, [centerCoordinate]);

  return (
    <View style={style}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color}
            onPress={marker.onPress}
          />
        ))}
      </MapView>
    </View>
  );
};
