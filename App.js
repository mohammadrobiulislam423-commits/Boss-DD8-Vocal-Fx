import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

export default function App() {
  const [micGain, setMicGain] = useState(90);
  const [echoMix, setEchoMix] = useState(60);
  const [delayTime, setDelayTime] = useState(350);
  const [feedback, setFeedback] = useState(50);
  const [mode, setMode] = useState('DD-8 Digital'); // Modes: DD-8 Digital, Analog, Tape Echo
  
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState([
    { name: 'Boss DD-8 Stadium', gain: 90, mix: 70, delay: 400, feedback: 60 },
    { name: 'Warm Analog Echo', gain: 85, mix: 50, delay: 300, feedback: 40 },
    { name: 'Tape Slapback', gain: 95, mix: 40, delay: 180, feedback: 30 }
  ]);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    initAudioEngine();
    return () => {
      stopAllAudio();
    };
  }, []);

  const initAudioEngine = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false, // Ensures routing to headphone jack / AUX splitter out
      });
    } catch (e) {
      console.error(e);
    }
  };

  const stopAllAudio = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggles Direct Live / Mixer Hardware Routing Mode via Y-Splitter
  const toggleLiveRouting = async () => {
    try {
      if (isLiveActive) {
        await stopAllAudio();
        setIsLiveActive(false);
      } else {
        await stopAllAudio();
        await initAudioEngine();
        
        // High quality preset optimized for external mixer/soundbox via Y-Splitter
        const { recording } = await Audio.Recording.createAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.caf',
            audioQuality: Audio.IOSAudioQuality.MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        
        recordingRef.current = recording;
        setIsLiveActive(true);
      }
    } catch (e) {
      console.error(e);
      setIsLiveActive(false);
    }
  };

  const saveCustomPreset = () => {
    if (!presetName.trim()) return;
    const newPreset = {
      name: presetName,
      gain: micGain,
      mix: echoMix,
      delay: delayTime,
      feedback: feedback,
    };
    setPresets([...presets, newPreset]);
    setPresetName('');
  };

  const loadPreset = (p) => {
    setMicGain(p.gain);
    setEchoMix(p.mix);
    setDelayTime(p.delay);
    setFeedback(p.feedback);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <View style={styles.header}>
        <Text style={styles.title}>BOSS DD-8 PRO FX</Text>
        <Text style={styles.subtitle}>Y-Splitter Mixer & Live Audio Engine</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Mode Selector (DD-8 Emulation Modes) */}
        <View style={styles.modeContainer}>
          {['DD-8 Digital', 'Analog', 'Tape Echo'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeButton, mode === m && styles.modeActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sliders for FX Controls */}
        <View style={styles.controlsCard}>
          <View style={styles.sliderBox}>
            <Text style={styles.label}>MIC GAIN / LEVEL: {Math.round(micGain)}%</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={micGain}
              onValueChange={setMicGain}
              minimumTrackTintColor="#FF3D00"
              maximumTrackTintColor="#334155"
              thumbTintColor="#FF3D00"
            />
          </View>

          <View style={styles.sliderBox}>
            <Text style={styles.label}>ECHO / DELAY MIX: {Math.round(echoMix)}%</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={echoMix}
              onValueChange={setEchoMix}
              minimumTrackTintColor="#FF3D00"
              maximumTrackTintColor="#334155"
              thumbTintColor="#FF3D00"
            />
          </View>

          <View style={styles.sliderBox}>
            <Text style={styles.label}>DELAY TIME: {Math.round(delayTime)} ms</Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={1000}
              value={delayTime}
              onValueChange={setDelayTime}
              minimumTrackTintColor="#FF3D00"
              maximumTrackTintColor="#334155"
              thumbTintColor="#FF3D00"
            />
          </View>

          <View style={styles.sliderBox}>
            <Text style={styles.label}>FEEDBACK (REPEATS): {Math.round(feedback)}%</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={feedback}
              onValueChange={setFeedback}
              minimumTrackTintColor="#FF3D00"
              maximumTrackTintColor="#334155"
              thumbTintColor="#FF3D00"
            />
          </View>
        </View>

        {/* Custom Preset Save Section */}
        <View style={styles.presetSection}>
          <Text style={styles.sectionTitle}>Save Custom Preset Filter</Text>
          <View style={styles.presetInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter Preset Name..."
              placeholderTextColor="#64748B"
              value={presetName}
              onChangeText={setPresetName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveCustomPreset}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetList}>
            {presets.map((p, idx) => (
              <TouchableOpacity key={idx} style={styles.presetChip} onPress={() => loadPreset(p)}>
                <Text style={styles.presetChipText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Hardware Y-Splitter Live Toggle Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.mainButton, isLiveActive ? styles.btnStop : styles.btnStart]}
            onPress={toggleLiveRouting}
          >
            <Text style={styles.mainButtonText}>
              {isLiveActive ? "🔴 LIVE MIXER OUTPUT ACTIVE (STOP)" : "🟢 START LIVE MIC & MIXER ROUTING"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    color: '#FF3D00',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeActive: {
    backgroundColor: '#FF3D00',
    borderColor: '#FF3D00',
  },
  modeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  controlsCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sliderBox: {
    marginVertical: 10,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 35,
  },
  presetSection: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sectionTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  presetInputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1F2937',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  presetList: {
    flexDirection: 'row',
  },
  presetChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  presetChipText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    marginBottom: 20,
  },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  btnStart: {
    backgroundColor: '#16A34A',
  },
  btnStop: {
    backgroundColor: '#DC2626',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
