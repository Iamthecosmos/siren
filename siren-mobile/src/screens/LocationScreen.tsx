import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function LocationScreen() {
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSharing && sessionDuration === 0) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSharing, sessionDuration]);

  const checkLocationPermission = async () => {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      setLocationPermission(permission.status);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(permission.status);
      
      if (permission.status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const startLocationSharing = async () => {
    if (locationPermission !== 'granted') {
      await requestLocationPermission();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);
    setIsTracking(true);
    setSessionDuration(0);
    
    // Get initial location
    await getCurrentLocation();
    
    Alert.alert('Location Sharing Started', 'Your location is now being shared with emergency contacts.');
  };

  const stopLocationSharing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(false);
    setIsTracking(false);
    setSessionDuration(0);
    Alert.alert('Location Sharing Stopped', 'Your location is no longer being shared.');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return '#10b981';
    if (accuracy <= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Location</Text>
        <Text style={styles.subtitle}>Share your location with emergency contacts</Text>
      </View>

      {/* Location Permission Status */}
      <View style={styles.section}>
        <View style={styles.permissionCard}>
          <Ionicons 
            name={locationPermission === 'granted' ? 'checkmark-circle' : 'close-circle'} 
            size={32} 
            color={locationPermission === 'granted' ? '#10b981' : '#ef4444'} 
          />
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Location Access</Text>
            <Text style={styles.permissionStatus}>
              {locationPermission === 'granted' ? 'Granted' : 'Not granted'}
            </Text>
          </View>
          {locationPermission !== 'granted' && (
            <TouchableOpacity 
              style={styles.grantButton}
              onPress={requestLocationPermission}
            >
              <Text style={styles.grantButtonText}>Grant Access</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Location */}
      {currentLocation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Latitude:</Text>
              <Text style={styles.coordinateValue}>
                {currentLocation.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Longitude:</Text>
              <Text style={styles.coordinateValue}>
                {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Accuracy:</Text>
              <Text style={[styles.coordinateValue, { color: getAccuracyColor(currentLocation.accuracy) }]}>
                ±{Math.round(currentLocation.accuracy)}m
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Location Sharing Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Sharing</Text>
        
        <View style={styles.controlCard}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Auto-track Location</Text>
            <Switch
              value={isTracking}
              onValueChange={setIsTracking}
              trackColor={{ false: '#333', true: '#10b981' }}
              thumbColor={isTracking ? '#ffffff' : '#666'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.shareButton,
            isSharing && styles.stopShareButton
          ]}
          onPress={isSharing ? stopLocationSharing : startLocationSharing}
        >
          <Ionicons 
            name={isSharing ? 'stop' : 'location'} 
            size={32} 
            color="#ffffff" 
          />
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Stop Sharing' : 'Start Sharing Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Sharing Session */}
      {isSharing && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sharing Session</Text>
          <View style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>Session Duration</Text>
              <Text style={styles.sessionDuration}>{formatDuration(sessionDuration)}</Text>
            </View>
            <View style={styles.sessionStatus}>
              <Ionicons 
                name={isTracking ? 'wifi' : 'wifi-outline'} 
                size={24} 
                color={isTracking ? '#10b981' : '#666'} 
              />
              <Text style={styles.sessionStatusText}>
                {isTracking ? 'Live tracking' : 'Manual updates'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.contactCard}>
          <Ionicons name="people" size={24} color="#3b82f6" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>3 contacts receiving updates</Text>
            <Text style={styles.contactSubtitle}>Mom, Dad, Sarah</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="timer" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Set Auto-Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="shield" size={24} color="#10b981" />
            <Text style={styles.actionText}>Safe Zone</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={24} color="#f59e0b" />
            <Text style={styles.actionText}>Share Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  permissionCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  permissionStatus: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  grantButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  grantButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#666666',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  controlCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  shareButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopShareButton: {
    backgroundColor: '#ef4444',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  sessionCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
  },
  sessionInfo: {
    marginBottom: 12,
  },
  sessionLabel: {
    fontSize: 14,
    color: '#666666',
  },
  sessionDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    fontFamily: 'monospace',
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionStatusText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  actionText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
}); 