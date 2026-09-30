​import { Audio } from 'expo-av';
​class BossDD8Engine {
constructor() {
this.sound = null;
}
​async initAudioSession() {
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
​async updateParams(micGain) {
if (this.sound) {
const masterVolume = Math.min(1.0, Math.max(0.0, micGain / 100));
await this.sound.setVolumeAsync(masterVolume);
}
}
}
​export const audioEngine = new BossDD8Engine();