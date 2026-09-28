import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export const ResizeMode = {
  COVER: 'cover',
  CONTAIN: 'contain',
  STRETCH: 'stretch',
};

// Safe Audio Mock
class SafeRecording {
  private durationTimer: any = null;
  private durationMs = 0;

  async prepareToRecordAsync() {}
  async startAsync() {
    this.durationMs = 0;
    this.durationTimer = setInterval(() => {
      this.durationMs += 1000;
    }, 1000);
  }
  async stopAndUnloadAsync() {
    if (this.durationTimer) clearInterval(this.durationTimer);
  }
  getURI() {
    return 'https://example.com/audio_record_' + Date.now() + '.m4a';
  }
  async getStatusAsync() {
    return { canRecord: true, isRecording: true, durationMillis: this.durationMs };
  }

  static async createAsync(_options?: any) {
    const rec = new SafeRecording();
    await rec.startAsync();
    return { recording: rec };
  }
}

export const Audio = {
  requestPermissionsAsync: async () => ({ status: 'granted', granted: true }),
  setAudioModeAsync: async (_opts?: any) => {},
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
  },
  Recording: SafeRecording,
  Sound: {
    createAsync: async (source: any, _initialStatus?: any) => {
      let isPlaying = false;
      return {
        sound: {
          playAsync: async () => {
            isPlaying = true;
          },
          pauseAsync: async () => {
            isPlaying = false;
          },
          stopAsync: async () => {
            isPlaying = false;
          },
          unloadAsync: async () => {},
          setOnPlaybackStatusUpdate: (callback: any) => {
            setTimeout(() => {
              callback?.({ isLoaded: true, didJustFinish: true, isPlaying: false });
            }, 3000);
          },
        },
      };
    },
  },
};

interface SafeVideoProps {
  source: { uri: string };
  style?: any;
  resizeMode?: any;
  isLooping?: boolean;
  shouldPlay?: boolean;
  isMuted?: boolean;
  useNativeControls?: boolean;
}

export const Video: React.FC<SafeVideoProps> = ({
  source,
  style,
  isLooping = true,
  shouldPlay = true,
  isMuted = false,
}) => {
  const [muted, setMuted] = useState(isMuted);
  const uri = source?.uri || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <video
          src={uri}
          controls
          playsInline
          autoPlay={shouldPlay}
          loop={isLooping}
          muted={muted}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000',
          }}
        />
      </View>
    );
  }

  // Native (Android / iOS): Use embedded HTML5 Video inside WebView for 100% reliable video & audio playback in Expo Go!
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #000000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <video
          id="mainVideo"
          src="${uri}"
          ${muted ? 'muted' : ''}
          ${shouldPlay ? 'autoplay' : ''}
          ${isLooping ? 'loop' : ''}
          playsinline
          controls
          webkit-playsinline
        ></video>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 14,
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
});
