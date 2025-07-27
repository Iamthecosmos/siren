import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyScreen() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('I need help immediately!');

  const emergencyContacts: EmergencyContact[] = [
    { id: '1', name: 'Mom', phone: '+1 (555) 0123', relationship: 'Mother' },
    { id: '2', name: 'Dad', phone: '+1 (555) 0124', relationship: 'Father' },
    { id: '3', name: 'Sarah', phone: '+1 (555) 0125', relationship: 'Best Friend' },
  ];

  const handleEmergencyActivation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Emergency Activation',
      'This will immediately contact all your emergency contacts and share your location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate Emergency', 
          style: 'destructive',
          onPress: async () => {
            setIsEmergencyActive(true);
            
            // Get current location
            try {
              const location = await Location.getCurrentPositionAsync({});
              console.log('Emergency location:', location);
            } catch (error) {
              console.error('Error getting location:', error);
            }

            // In a real app, this would:
            // 1. Send SMS to all emergency contacts
            // 2. Make emergency calls
            // 3. Share location data
            // 4. Trigger emergency services if configured
            
            Alert.alert(
              'Emergency Activated',
              'Emergency contacts have been notified and your location has been shared.',
              [{ text: 'OK', onPress: () => setIsEmergencyActive(false) }]
            );
          }
        },
      ]
    );
  };

  const handleQuickCall = (contact: EmergencyContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Call ${contact.name}`,
      `This would call ${contact.name} at ${contact.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', style: 'default' },
      ]
    );
  };

  const handleQuickMessage = (contact: EmergencyContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Message ${contact.name}`,
      `This would send an emergency message to ${contact.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', style: 'default' },
      ]
    );
  };

  const EmergencyButton = ({ title, icon, onPress, color = '#ef4444', large = false }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
    large?: boolean;
  }) => (
    <TouchableOpacity 
      style={[
        styles.emergencyButton, 
        { backgroundColor: color },
        large && styles.largeButton
      ]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={large ? 48 : 32} color="#ffffff" />
      <Text style={[styles.emergencyButtonText, large && styles.largeButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>Quick access to emergency features</Text>
      </View>

      {/* Main Emergency Button */}
      <TouchableOpacity 
        style={[
          styles.mainEmergencyButton,
          isEmergencyActive && styles.activeEmergencyButton
        ]} 
        onPress={handleEmergencyActivation}
      >
        <Ionicons name="warning" size={64} color="#ffffff" />
        <Text style={styles.mainEmergencyText}>
          {isEmergencyActive ? 'EMERGENCY ACTIVE' : 'EMERGENCY'}
        </Text>
        <Text style={styles.mainEmergencySubtext}>
          {isEmergencyActive ? 'Contacts notified' : 'Tap to activate emergency mode'}
        </Text>
      </TouchableOpacity>

      {/* Emergency Message */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Message</Text>
        <TextInput
          style={styles.messageInput}
          value={emergencyMessage}
          onChangeText={setEmergencyMessage}
          placeholder="Enter your emergency message..."
          placeholderTextColor="#666"
          multiline
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <EmergencyButton
            title="Call 911"
            icon="call"
            onPress={() => Alert.alert('Call 911', 'This would call emergency services.')}
            color="#dc2626"
          />
          <EmergencyButton
            title="Share Location"
            icon="location"
            onPress={() => Alert.alert('Share Location', 'This would share your current location.')}
            color="#059669"
          />
          <EmergencyButton
            title="Fake Call"
            icon="phone-portrait"
            onPress={() => Alert.alert('Fake Call', 'This would simulate an incoming call.')}
            color="#7c3aed"
          />
          <EmergencyButton
            title="Sound Alarm"
            icon="volume-high"
            onPress={() => Alert.alert('Sound Alarm', 'This would play a loud alarm sound.')}
            color="#ea580c"
          />
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {emergencyContacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelationship}>{contact.relationship}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleQuickCall(contact)}
              >
                <Ionicons name="call" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.messageButton]}
                onPress={() => handleQuickMessage(contact)}
              >
                <Ionicons name="chatbubble" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Emergency Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Tips</Text>
        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.tipText}>
            • Stay calm and assess the situation{'\n'}
            • Call emergency services if needed{'\n'}
            • Share your location with trusted contacts{'\n'}
            • Use voice activation if you can't use your hands
          </Text>
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
  mainEmergencyButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  activeEmergencyButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  mainEmergencyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  mainEmergencySubtext: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
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
  messageInput: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyButton: {
    width: '48%',
    backgroundColor: '#ef4444',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  largeButton: {
    width: '100%',
    padding: 30,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  largeButtonText: {
    fontSize: 18,
  },
  contactCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: '#059669',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  tipCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 