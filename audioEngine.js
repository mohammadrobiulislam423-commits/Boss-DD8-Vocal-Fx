import { Audio } from 'expo-av';

class BossDD8Engine {
  constructor() {
    this.sound = null;
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
      console.log("Audio Session Error:", error);
    }
  }

  async updateParams(micGain) {
    try {
      if (this.sound) {
        const masterVolume = Math.min(1.0, Math.max(0.0, micGain / 100));
        await this.sound.setVolumeAsync(masterVolume);
      }
    } catch (error) {
      console.log("Update Params Error:", error);
    }
  }
}

export const audioEngine = new BossDD8Engine();​
