import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { useGameStore } from '../../store/gameStore';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../constants/colors';
import { CardGrid } from '../cards/CardGrid';

// 타이머 모드 게임 화면
function TimerGameView() {
    const { performDraw, navigate } = useGameStore();
    const { s, fs } = useResponsive();
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

    const boxSize = s(160);

    return (
        <View style={styles.container}>
            {/* 상자 */}
            <Animated.View
                style={[
                    styles.boxOuter,
                    {
                        borderWidth: s(4),
                        padding: s(4),
                        marginBottom: s(30),
                        shadowOffset: { width: s(6), height: s(6) },
                        transform: [
                            { translateX: shakeAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <View style={[
                    styles.boxInner,
                    {
                        width: boxSize,
                        height: boxSize,
                        borderWidth: s(3),
                    }
                ]}>
                    <Text style={[styles.boxEmoji, { fontSize: fs(80) }]}>🎁</Text>
                </View>
            </Animated.View>

            {/* 텍스트 */}
            <View style={styles.textBox}>
                <Text style={[
                    styles.mainText,
                    {
                        fontSize: fs(26),
                        marginBottom: s(8),
                        textShadowOffset: { width: 1, height: 1 },
                    }
                ]}>두근두근...</Text>
                <Text style={[
                    styles.subText,
                    {
                        fontSize: fs(16),
                        textShadowOffset: { width: 1, height: 1 },
                    }
                ]}>행운을 빌어요!</Text>
            </View>
        </View>
    );
}

// 카드 선택 모드 게임 화면
function CardGameView() {
    const {
        cardGame,
        initializeCardGame,
        selectCard,
        revealNextCard,
        completeCardGame,
        navigate,
    } = useGameStore();
    const { s } = useResponsive();

    // 게임 초기화
    useEffect(() => {
        initializeCardGame();
    }, []);

    // 카드 선택 처리
    const handleCardSelect = useCallback((index: number) => {
        selectCard(index);
    }, [selectCard]);

    // 다음 카드 공개
    const handleRevealNext = useCallback(() => {
        revealNextCard();
    }, [revealNextCard]);

    // 게임 완료 및 결과 화면으로 이동
    const handleComplete = useCallback(() => {
        completeCardGame();
        navigate('result');
    }, [completeCardGame, navigate]);

    if (!cardGame) {
        return null; // 초기화 중
    }

    return (
        <View style={[styles.cardContainer, { paddingVertical: s(20) }]}>
            <CardGrid
                cards={cardGame.cards}
                selectedIndex={cardGame.selectedCardIndex}
                revealedIndices={cardGame.revealedCards}
                onCardSelect={handleCardSelect}
                gamePhase={cardGame.gamePhase}
                onRevealNext={handleRevealNext}
                onComplete={handleComplete}
            />
        </View>
    );
}

export function GameScreen() {
    const { settings } = useGameStore();

    return (
        <ScreenLayout showSettings={false}>
            {settings.drawMode === 'card' ? <CardGameView /> : <TimerGameView />}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxOuter: {
        backgroundColor: colors.pixel.rust,
        borderColor: colors.pixel.darkBrown,
        borderRadius: 0,
        shadowColor: colors.pixel.shadow,
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 12,
    },
    boxInner: {
        backgroundColor: colors.pixel.softGold,
        borderColor: colors.pixel.rust,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxEmoji: {
    },
    textBox: {
        alignItems: 'center',
    },
    mainText: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowRadius: 0,
    },
    subText: {
        color: colors.pixel.rust,
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowRadius: 0,
    },
});
