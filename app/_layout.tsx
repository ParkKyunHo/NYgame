import { useRef, useEffect } from 'react';
import { Slot } from 'expo-router';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useGameStore } from '../store/gameStore';

// Background video for native only
const bgVideoNative = require('../assets/images/도트_뽑기_배경_영상_생성.mp4');

// Store video element reference globally (outside React)
let globalVideoElement: HTMLVideoElement | null = null;
let globalNativeVideoRef: Video | null = null;

export default function Layout() {
    const nativeVideoRef = useRef<Video>(null);

    // Only subscribe to soundEnabled changes
    const soundEnabled = useGameStore((state) => state.settings.soundEnabled);

    // Web: Create or reference the HTML video element
    useEffect(() => {
        if (Platform.OS === 'web') {
            let video = document.getElementById('global-bg-video') as HTMLVideoElement;

            // 비디오가 없으면 동적으로 생성 (한 번만)
            if (!video) {
                video = document.createElement('video');
                video.id = 'global-bg-video';
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.autoplay = true;
                video.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;pointer-events:none;';

                const source = document.createElement('source');
                source.src = '/background.mp4';
                source.type = 'video/mp4';
                video.appendChild(source);

                // body의 첫 번째 자식으로 삽입
                document.body.insertBefore(video, document.body.firstChild);

                // 비디오 로드
                video.load();
            }

            globalVideoElement = video;

            // 재생 시도 함수
            const tryPlay = () => {
                if (globalVideoElement) {
                    globalVideoElement.muted = true; // muted 상태에서만 자동재생 가능
                    globalVideoElement.play().catch(() => {});
                }
            };

            // 즉시 재생 시도
            tryPlay();

            // 실패 시 클릭/터치로 재생
            const playOnInteraction = () => tryPlay();
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
        }
    }, []);

    // Native: Set up video ref
    useEffect(() => {
        if (Platform.OS !== 'web' && nativeVideoRef.current) {
            globalNativeVideoRef = nativeVideoRef.current;
        }
    }, []);

    // Handle sound changes
    useEffect(() => {
        if (Platform.OS === 'web' && globalVideoElement) {
            globalVideoElement.muted = !soundEnabled;
        } else if (Platform.OS !== 'web' && globalNativeVideoRef) {
            globalNativeVideoRef.setIsMutedAsync(!soundEnabled);
        }
    }, [soundEnabled]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Native video background only - web uses HTML video in public/index.html */}
            {Platform.OS !== 'web' && (
                <Video
                    ref={nativeVideoRef}
                    source={bgVideoNative}
                    style={styles.backgroundVideo}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    isMuted
                    shouldPlay
                />
            )}

            {/* Content - 상태 기반 화면 전환으로 URL 변경 없이 화면 전환 */}
            <View style={styles.contentContainer}>
                <Slot />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    contentContainer: {
        flex: 1,
        zIndex: 1,
    },
});
