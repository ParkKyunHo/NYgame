import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { useGameStore } from '../../store/gameStore';

const THEME = {
    brown: '#4A3728',
    darkBrown: '#3D2E22',
    cream: '#FFF8DC',
    gold: '#D4A84B',
    orange: '#E8A849',
};

export function GameScreen() {
    const { performDraw, navigate } = useGameStore();
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 흔들림 애니메이션
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 80, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
                Animated.delay(400)
            ])
        ).start();

        // 크기 펄스 애니메이션
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ])
        ).start();

        // 3초 후 결과로 이동
        const timer = setTimeout(() => {
            performDraw();
            navigate('result');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ScreenLayout showSettings={false}>
            <View style={styles.container}>
                {/* 상자 */}
                <Animated.View
                    style={[
                        styles.boxOuter,
                        {
                            transform: [
                                { translateX: shakeAnim },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}
                >
                    <View style={styles.boxInner}>
                        <Text style={styles.boxEmoji}>🎁</Text>
                    </View>
                </Animated.View>

                {/* 텍스트 */}
                <View style={styles.textBox}>
                    <Text style={styles.mainText}>두근두근...</Text>
                    <Text style={styles.subText}>행운을 빌어요!</Text>
                </View>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    boxOuter: {
        backgroundColor: THEME.brown,
        borderWidth: 4,
        borderColor: THEME.darkBrown,
        borderRadius: 4,
        padding: 4,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 12,
    },
    boxInner: {
        backgroundColor: THEME.gold,
        borderWidth: 3,
        borderColor: THEME.darkBrown,
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxEmoji: {
        fontSize: 80,
    },
    textBox: {
        alignItems: 'center',
    },
    mainText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: THEME.darkBrown,
        marginBottom: 8,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    subText: {
        fontSize: 16,
        color: THEME.brown,
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
});
