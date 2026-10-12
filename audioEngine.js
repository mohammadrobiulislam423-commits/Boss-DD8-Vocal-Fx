import { Audio } from 'expo-av';

class BossDD8Engine {
  constructor() {
    this.sound = null;
    this.recording = null;
    this.isRecording = false;
  }

  async initAudioSession() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Audio Session Error:", error);
    }
  }

  async startRecording() {
    try {
      if (this.recording) {
        await this.stopRecording();
      }
      await this.initAudioSession();
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  async stopRecordingAndPlay() {
    try {
      if (!this.recording) return;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.sound = sound;
    } catch (error) {
      console.error("Failed to stop recording and play:", error);
    }
  }

  async updateParams(micGain, echoMix, delayTime, feedback) {
    try {
      if (this.sound) {
        const masterVolume = Math.min(1.0, Math.max(0.0, micGain / 100));
        await this.sound.setVolumeAsync(masterVolume);
      }
    } catch (error) {
      console.error("Error updating parameters:", error);
    }
  }
}

export const audioEngine = new BossDD8Engine();
