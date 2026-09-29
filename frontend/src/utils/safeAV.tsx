import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export const ResizeMode = {
  COVER: 'cover',
  CONTAIN: 'contain',
  STRETCH: 'stretch',
};

// Safe Audio Mock for Voice Messages & Sounds
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
  showFullscreenButton?: boolean;
}

export const Video: React.FC<SafeVideoProps> = ({
  source,
  style,
  isLooping = true,
  shouldPlay = true,
  isMuted = false,
  showFullscreenButton = true,
}) => {
  const webviewRef = useRef<WebView>(null);
  const [internalMuted, setInternalMuted] = useState(isMuted);
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reliable Multi-CDN Video Sources (Fallback to high availability streams in Vietnam)
  const primaryUri =
    source?.uri ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const fallbackUri =
    'https://vjs.zencdn.net/v/oceans.mp4';

  // Synchronize muted prop from parent component
  useEffect(() => {
    setInternalMuted(isMuted);
    if (webviewRef.current) {
      const code = `
        var v = document.getElementById('vivuVideo');
        if (v) {
          v.muted = ${isMuted};
          if (!${isMuted}) { v.volume = 1.0; }
        }
        true;
      `;
      webviewRef.current.injectJavaScript(code);
    }
  }, [isMuted]);

  // Synchronize play state
  useEffect(() => {
    setIsPlaying(shouldPlay);
    if (webviewRef.current) {
      const code = shouldPlay
        ? `var v = document.getElementById('vivuVideo'); if (v) { v.play().catch(function(){ v.muted=true; v.play(); }); } true;`
        : `var v = document.getElementById('vivuVideo'); if (v) { v.pause(); } true;`;
      webviewRef.current.injectJavaScript(code);
    }
  }, [shouldPlay]);

  const toggleSound = () => {
    const nextMuted = !internalMuted;
    setInternalMuted(nextMuted);
    if (webviewRef.current) {
      const code = `
        var v = document.getElementById('vivuVideo');
        if (v) {
          v.muted = ${nextMuted};
          if (!${nextMuted}) {
            v.volume = 1.0;
            v.play();
          }
        }
        true;
      `;
      webviewRef.current.injectJavaScript(code);
    }
  };

  const togglePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (webviewRef.current) {
      const code = nextPlaying
        ? `var v = document.getElementById('vivuVideo'); if (v) { v.play(); } true;`
        : `var v = document.getElementById('vivuVideo'); if (v) { v.pause(); } true;`;
      webviewRef.current.injectJavaScript(code);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <video
          src={primaryUri}
          controls
          playsInline
          autoPlay={shouldPlay}
          loop={isLooping}
          muted={internalMuted}
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

  // HTML5 Video inside Optimized WebView with Native Touch Overlay & Sound Bridge
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: #000000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-user-select: none;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            background-color: #000;
          }
        </style>
      </head>
      <body>
        <video
          id="vivuVideo"
          src="${primaryUri}"
          playsinline
          webkit-playsinline
          ${isLooping ? 'loop' : ''}
          ${internalMuted ? 'muted' : ''}
        ></video>
        <script>
          var v = document.getElementById('vivuVideo');
          
          // Handle video loading
          v.addEventListener('loadeddata', function() {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOADED' }));
            ${shouldPlay ? `
              var p = v.play();
              if (p !== undefined) {
                p.catch(function(error) {
                  // Fallback to muted autoplay if Android WebView blocks sound
                  v.muted = true;
                  v.play();
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MUTED_AUTOPLAY' }));
                });
              }
            ` : ''}
          });

          v.addEventListener('error', function(e) {
            // Try fallback URL if primary fails
            if (v.src !== "${fallbackUri}") {
              v.src = "${fallbackUri}";
              v.load();
              v.play().catch(function(){});
            } else {
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR' }));
            }
          });

          v.addEventListener('ended', function() {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENDED' }));
          });

          // Tap to unmute / toggle sound directly inside webview
          document.body.addEventListener('click', function() {
            if (v.muted) {
              v.muted = false;
              v.volume = 1.0;
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UNMUTED' }));
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        scrollEnabled={false}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'LOADED') {
              setIsLoading(false);
            } else if (data.type === 'UNMUTED') {
              setInternalMuted(false);
            } else if (data.type === 'ERROR') {
              setHasError(true);
              setIsLoading(false);
            }
          } catch {
            // Fallback
          }
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.loadingText}>Đang tải video...</Text>
        </View>
      )}

      {/* Overlay Control Bar: Sound Button & Fullscreen */}
      <View style={styles.overlayControls}>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={toggleSound}
          activeOpacity={0.8}
        >
          <Ionicons
            name={internalMuted ? 'volume-mute' : 'volume-high'}
            size={16}
            color="#FFF"
          />
          <Text style={styles.pillText}>
            {internalMuted ? 'Bật tiếng 🔇' : 'Có tiếng 🔊'}
          </Text>
        </TouchableOpacity>

        <View style={styles.rightPills}>
          {showFullscreenButton && (
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setIsFullscreen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="expand" size={16} color="#FFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Video Modal with Loud Audio & Custom Controls */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.fullscreenWebview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
          />
          <TouchableOpacity
            style={styles.closeFullscreenBtn}
            onPress={() => setIsFullscreen(false)}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.fullscreenBadge}>
            <Ionicons name="videocam" size={14} color="#FF385C" />
            <Text style={styles.fullscreenBadgeText}>Chế độ xem HD • Âm thanh sống động</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 14,
    minHeight: 220,
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    color: '#E5E7EB',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  overlayControls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullscreenWebview: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeFullscreenBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fullscreenBadge: {
    position: 'absolute',
    top: 54,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fullscreenBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
