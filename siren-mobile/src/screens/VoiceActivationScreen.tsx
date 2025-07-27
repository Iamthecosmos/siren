import React, { useState } from 'react';
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
import * as Haptics from 'expo-haptics';

export default function VoiceActivationScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sensitivity, setSensitivity] = useState(70);
  const [testMode, setTestMode] = useState(true);

  const handleStartListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(true);
    Alert.alert('Voice Monitoring', 'Voice activation is now listening for your emergency phrase.');
  };

  const handleStopListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(false);
    Alert.alert('Voice Monitoring', 'Voice activation has been stopped.');
  };

  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    Alert.alert('Recording', 'Recording your emergency phrase...');
  };

  const handleStopRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(false);
    Alert.alert('Recording Complete', 'Your emergency phrase has been recorded.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Activation</Text>
        <Text style={styles.subtitle}>Voice-activated emergency features</Text>
      </View>

      {/* Voice Monitoring Status */}
      <View style={styles.section}>
        <View style={[styles.statusCard, isListening && styles.activeStatusCard]}>
          <Ionicons 
            name={isListening ? 'mic' : 'mic-off'} 
            size={48} 
            color={isListening ? '#10b981' : '#666'} 
          />
          <Text style={styles.statusTitle}>
            {isListening ? 'Listening Active' : 'Voice Monitoring Off'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isListening ? 'Listening for emergency phrase' : 'Tap to start voice monitoring'}
          </Text>
        </View>
      </View>

      {/* Recording Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Emergency Phrase</Text>
        <TouchableOpacity 
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
        >
          <Ionicons 
            name={isRecording ? 'stop' : 'mic'} 
            size={48} 
            color="#ffffff" 
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Record Phrase'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Monitoring Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Monitoring</Text>
        <TouchableOpacity 
          style={[
            styles.monitorButton,
            isListening && styles.stopMonitorButton
          ]}
          onPress={isListening ? handleStopListening : handleStartListening}
        >
          <Ionicons 
            name={isListening ? 'stop' : 'play'} 
            size={32} 
            color="#ffffff" 
          />
          <Text style={styles.monitorButtonText}>
            {isListening ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Test Mode</Text>
            <Switch
              value={testMode}
              onValueChange={setTestMode}
              trackColor={{ false: '#333', true: '#10b981' }}
              thumbColor={testMode ? '#ffffff' : '#666'}
            />
          </View>
          <Text style={styles.settingDescription}>
            Practice voice activation without contacting emergency services
          </Text>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Sensitivity: {sensitivity}%</Text>
          <View style={styles.sensitivityBar}>
            <View style={[styles.sensitivityFill, { width: `${sensitivity}%` }]} />
          </View>
          <Text style={styles.settingDescription}>
            Higher sensitivity = easier to trigger, but may have false positives
          </Text>
        </View>
      </View>

      {/* Emergency Action Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Action Plan</Text>
        <View style={styles.actionCard}>
          <Ionicons name="warning" size={24} color="#ef4444" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>When phrase is detected:</Text>
            <Text style={styles.actionText}>• Call primary emergency contact</Text>
            <Text style={styles.actionText}>• Send SMS to all contacts</Text>
            <Text style={styles.actionText}>• Share current location</Text>
            <Text style={styles.actionText}>• Play emergency alarm sound</Text>
          </View>
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
  statusCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  activeStatusCard: {
    backgroundColor: '#10b981',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#dc2626',
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  monitorButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMonitorButton: {
    backgroundColor: '#ef4444',
  },
  monitorButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  settingCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  sensitivityBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginVertical: 8,
  },
  sensitivityFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  actionCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
}); 