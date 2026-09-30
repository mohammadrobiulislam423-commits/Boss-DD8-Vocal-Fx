import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, FlatList, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { audioEngine } from './audioEngine';

export default function App() {
  const [micGain, setMicGain] = useState(80);
  const [echoMix, setEchoMix] = useState(50);
  const [delayTime, setDelayTime] = useState(350);
  const [feedback, setFeedback] = useState(40);

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [presets, setPresets] = useState([
    { id: '1', name: 'Soft Echo', micGain: 75, echoMix: 40, delayTime: 300, feedback: 35 },
    { id: '2', name: 'Heavy Naat FX', micGain: 90, echoMix: 65, delayTime: 420, feedback: 55 },
  ]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    audioEngine.initAudioSession();
  }, []);

  const saveCustomPreset = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      micGain,
      echoMix,
      delayTime,
      feedback,
    };
    setPresets([...presets, newPreset]);
    setPresetName('');
    Alert.alert('Success', `Preset "${presetName}" saved!`);
  };

  const loadPreset = (p) => {
    setMicGain(p.micGain);
    setEchoMix(p.echoMix);
    setDelayTime(p.delayTime);
    setFeedback(p.feedback);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Recording Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    setRecording(null);
    Alert.alert('Recording Complete', 'Audio recorded successfully!');
  };

  const downloadRecording = async () => {
    if (!recordedUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(recordedUri);
    } else {
      Alert.alert('File Saved', `Location: ${recordedUri}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.headerTitle}>BOSS DD-8 VOCAL FX</Text>
      <Text style={styles.subTitle}>Live Performance & Studio Recording</Text>

      <View style={styles.card}>
        <Text style={styles.label}>MIC GAIN: {Math.round(micGain)}%</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={100} value={micGain} onValueChange={setMicGain} minimumTrackTintColor="#10b981" />

        <Text style={styles.label}>ECHO MIX: {Math.round(echoMix)}%</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={100} value={echoMix} onValueChange={setEchoMix} minimumTrackTintColor="#3b82f6" />

        <Text style={styles.label}>DELAY TIME: {Math.round(delayTime)} ms</Text>
        <Slider style={styles.slider} minimumValue={50} maximumValue={1000} value={delayTime} onValueChange={setDelayTime} minimumTrackTintColor="#f59e0b" />

        <Text style={styles.label}>FEEDBACK: {Math.round(feedback)}%</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={90} value={feedback} onValueChange={setFeedback} minimumTrackTintColor="#ec4899" />
      </View>

      <View style={styles.presetSection}>
        <Text style={styles.sectionTitle}>Save Custom Preset</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Preset Name..."
            placeholderTextColor="#64748b"
            value={presetName}
            onChangeText={setPresetName}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveCustomPreset}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={presets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.presetChip} onPress={() => loadPreset(item)}>
              <Text style={styles.chipText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.recordSection}>
        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordingActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.btnText}>{isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}</Text>
        </TouchableOpacity>

        {recordedUri && (
          <TouchableOpacity style={styles.downloadBtn} onPress={downloadRecording}>
            <Text style={styles.btnText}>📥 Download / Share Recording</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 16, paddingTop: 30 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center' },
  subTitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 15 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15 },
  label: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginTop: 5 },
  slider: { width: '100%', height: 35 },
  presetSection: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15 },
  sectionTitle: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#0f172a', color: '#fff', paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  saveBtn: { backgroundColor: '#0284c7', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  presetChip: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 12 },
  recordSection: { gap: 10 },
  recordBtn: { backgroundColor: '#ef4444', padding: 14, borderRadius: 10, alignItems: 'center' },
  recordingActive: { backgroundColor: '#dc2626' },
  downloadBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});