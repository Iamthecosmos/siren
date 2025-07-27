import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SafetyStatus {
  locationEnabled: boolean;
  voiceEnabled: boolean;
  emergencyContacts: number;
  lastLocationUpdate: string | null;
}

export default function HomeScreen() {
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    locationEnabled: false,
    voiceEnabled: false,
    emergencyContacts: 3,
    lastLocationUpdate: null,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const locationPermission = await Location.getForegroundPermissionsAsync();
      setSafetyStatus(prev => ({
        ...prev,
        locationEnabled: locationPermission.status === 'granted',
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleEmergencyCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Emergency Call',
      'This would initiate an emergency call to your primary contact.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', style: 'destructive', onPress: () => {
          // In a real app, this would make an actual emergency call
          Alert.alert('Emergency Call', 'Calling emergency contact...');
        }},
      ]
    );
  };

  const handleQuickDial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Quick Dial', 'This would open your quick dial contacts.');
  };

  const handleLocationShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Location Share', 'This would share your current location with emergency contacts.');
  };

  const SafetyCard = ({ title, icon, status, onPress, color = '#ef4444' }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    status?: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <Ionicons name={icon} size={32} color={color} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          {status && <Text style={styles.cardStatus}>{status}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Dashboard</Text>
        <Text style={styles.subtitle}>Your personal safety companion</Text>
      </View>

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Ionicons name="warning" size={48} color="#ffffff" />
        <Text style={styles.emergencyText}>EMERGENCY</Text>
        <Text style={styles.emergencySubtext}>Tap for immediate help</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <SafetyCard
          title="Quick Dial"
          icon="call"
          status="Call emergency contacts"
          onPress={handleQuickDial}
          color="#3b82f6"
        />
        <SafetyCard
          title="Share Location"
          icon="location"
          status={safetyStatus.locationEnabled ? "Location enabled" : "Location disabled"}
          onPress={handleLocationShare}
          color="#10b981"
        />
        <SafetyCard
          title="Voice Activation"
          icon="mic"
          status={safetyStatus.voiceEnabled ? "Voice enabled" : "Voice disabled"}
          onPress={() => {}}
          color="#f59e0b"
        />
      </View>

      {/* Safety Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={safetyStatus.locationEnabled ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={safetyStatus.locationEnabled ? "#10b981" : "#ef4444"} 
            />
            <Text style={styles.statusText}>Location</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons 
              name={safetyStatus.voiceEnabled ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={safetyStatus.voiceEnabled ? "#10b981" : "#ef4444"} 
            />
            <Text style={styles.statusText}>Voice</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="people" size={24} color="#3b82f6" />
            <Text style={styles.statusText}>{safetyStatus.emergencyContacts} Contacts</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Ionicons name="time" size={20} color="#666" />
          <Text style={styles.activityText}>Location shared 2 minutes ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.activityText}>Voice activation tested successfully</Text>
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
  emergencyButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
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
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardStatus: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
}); 