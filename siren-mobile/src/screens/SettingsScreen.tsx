import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoShareLocation, setAutoShareLocation] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const handleEmergencyModeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Emergency Mode',
      emergencyMode 
        ? 'Disable emergency mode? This will stop all emergency features.' 
        : 'Enable emergency mode? This will activate all emergency features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: emergencyMode ? 'Disable' : 'Enable', 
          style: emergencyMode ? 'default' : 'destructive',
          onPress: () => setEmergencyMode(!emergencyMode)
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    color = '#ffffff'
  }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    color?: string;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#333', true: '#10b981' }}
          thumbColor={switchValue ? '#ffffff' : '#666'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your safety preferences</Text>
      </View>

      {/* Emergency Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Mode</Text>
        <View style={[styles.emergencyCard, emergencyMode && styles.activeEmergencyCard]}>
          <Ionicons 
            name="warning" 
            size={32} 
            color={emergencyMode ? '#ffffff' : '#ef4444'} 
          />
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>
              {emergencyMode ? 'Emergency Mode Active' : 'Emergency Mode'}
            </Text>
            <Text style={styles.emergencySubtitle}>
              {emergencyMode 
                ? 'All emergency features are enabled' 
                : 'Enable all emergency features for maximum safety'
              }
            </Text>
          </View>
          <Switch
            value={emergencyMode}
            onValueChange={handleEmergencyModeToggle}
            trackColor={{ false: '#333', true: '#ef4444' }}
            thumbColor={emergencyMode ? '#ffffff' : '#666'}
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          title="Push Notifications"
          subtitle="Receive emergency alerts and updates"
          icon="notifications"
          showSwitch={true}
          switchValue={notificationsEnabled}
          onSwitchChange={setNotificationsEnabled}
        />
        <SettingItem
          title="Emergency Alerts"
          subtitle="High-priority emergency notifications"
          icon="warning"
          color="#ef4444"
        />
        <SettingItem
          title="Location Updates"
          subtitle="Notifications when location is shared"
          icon="location"
          color="#10b981"
        />
      </View>

      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <SettingItem
          title="Location Services"
          subtitle="Enable location tracking and sharing"
          icon="location"
          showSwitch={true}
          switchValue={locationEnabled}
          onSwitchChange={setLocationEnabled}
          color="#10b981"
        />
        <SettingItem
          title="Auto-share Location"
          subtitle="Automatically share location in emergencies"
          icon="share"
          showSwitch={true}
          switchValue={autoShareLocation}
          onSwitchChange={setAutoShareLocation}
          color="#3b82f6"
        />
        <SettingItem
          title="Location Accuracy"
          subtitle="High accuracy (GPS + Network)"
          icon="compass"
          color="#f59e0b"
        />
      </View>

      {/* Voice Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Activation</Text>
        <SettingItem
          title="Voice Recognition"
          subtitle="Enable voice-activated emergency features"
          icon="mic"
          showSwitch={true}
          switchValue={voiceEnabled}
          onSwitchChange={setVoiceEnabled}
          color="#f59e0b"
        />
        <SettingItem
          title="Voice Sensitivity"
          subtitle="Adjust voice recognition sensitivity"
          icon="settings"
          color="#8b5cf6"
        />
        <SettingItem
          title="Emergency Phrase"
          subtitle="Set your custom emergency phrase"
          icon="chatbubble"
          color="#ec4899"
        />
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <SettingItem
          title="Manage Contacts"
          subtitle="Add, edit, or remove emergency contacts"
          icon="people"
          color="#3b82f6"
        />
        <SettingItem
          title="Contact Priority"
          subtitle="Set contact calling order"
          icon="list"
          color="#10b981"
        />
        <SettingItem
          title="Auto-dial Primary"
          subtitle="Automatically call primary contact"
          icon="call"
          color="#ef4444"
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          icon="document-text"
          color="#6b7280"
        />
        <SettingItem
          title="Terms of Service"
          subtitle="Read our terms of service"
          icon="document"
          color="#6b7280"
        />
        <SettingItem
          title="About Siren"
          subtitle="App version and information"
          icon="information-circle"
          color="#6b7280"
        />
        <SettingItem
          title="Support"
          subtitle="Get help and contact support"
          icon="help-circle"
          color="#6b7280"
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton}>
          <Ionicons name="trash" size={24} color="#ef4444" />
          <Text style={styles.dangerButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton}>
          <Ionicons name="log-out" size={24} color="#ef4444" />
          <Text style={styles.dangerButtonText}>Delete All Data</Text>
        </TouchableOpacity>
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
  emergencyCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeEmergencyCard: {
    backgroundColor: '#ef4444',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  settingItem: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  dangerButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 12,
  },
}); 