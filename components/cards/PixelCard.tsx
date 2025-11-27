import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, Pressable } from 'react-native';
import { colors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

interface PixelCardProps {
    isRevealed: boolean;
    isSelected: boolean;
    isWinning: boolean;
    bagelCount: number;
    onPress: () => void;
    disabled: boolean;
    index: number;
}

export const PixelCard: React.FC<PixelCardProps> = ({
    isRevealed,
    isSelected,
    isWinning,
    bagelCount,
    onPress,
    disabled,
}) => {
    const { s, fs } = useResponsive();
    const flipAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const hoverAnim = useRef(new Animated.Value(0)).current;
    const [isHovered, setIsHovered] = useState(false);

    // 카드 뒤집기 애니메이션
    useEffect(() => {
        if (isRevealed) {
            Animated.timing(flipAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        }
    }, [isRevealed, flipAnim]);

    // 선택 시 펄스 애니메이션
    useEffect(() => {
        if (isSelected && !isRevealed) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.08,
                        duration: 400,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        } else {
            scaleAnim.setValue(1);
        }
    }, [isSelected, isRevealed, scaleAnim]);

    // 당첨 카드 글로우 애니메이션
    useEffect(() => {
        if (isRevealed && isWinning) {
            const glowAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            );
            glowAnimation.start();
            return () => glowAnimation.stop();
        }
    }, [isRevealed, isWinning, glowAnim]);

    // 마우스 호버 애니메이션
    useEffect(() => {
        if (!disabled && !isRevealed) {
            Animated.timing(hoverAnim, {
                toValue: isHovered ? 1 : 0,
                duration: 150,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        }
    }, [isHovered, disabled, isRevealed, hoverAnim]);

    const hoverTranslateY = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8],
    });

    const hoverScale = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });

    const getCardColor = () => {
        return isWinning ? colors.grade.first : colors.grade.lose;
    };

    const getCardEmoji = () => {
        return isWinning ? '🥯' : 'X';
    };

    const getCardLabel = () => {
        return isWinning ? `${bagelCount}개 당첨!` : '꽝';
    };

    const cardWidth = s(80);
    const cardHeight = s(110);

    // Web에서는 CSS transform으로 대체
    const frontRotateY = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '90deg', '90deg'],
    });

    const backRotateY = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['-90deg', '-90deg', '0deg'],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <Animated.View style={[
            styles.cardContainer,
            {
                width: cardWidth,
                height: cardHeight,
                transform: [
                    { scale: Animated.multiply(scaleAnim, hoverScale) },
                    { translateY: hoverTranslateY },
                ],
            }
        ]}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={styles.touchable}
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
            >
                {/* 카드 뒷면 */}
                <Animated.View
                    style={[
                        styles.card,
                        styles.cardBack,
                        {
                            width: cardWidth,
                            height: cardHeight,
                            borderWidth: s(4),
                            transform: [{ rotateY: frontRotateY }],
                        },
                        isSelected && !isRevealed && styles.cardSelected,
                        isHovered && !disabled && !isRevealed && styles.cardHovered,
                    ]}
                >
                    <View style={[styles.cardBackInner, { borderRadius: s(4) }]}>
                        <Text style={[styles.cardBackQuestion, { fontSize: fs(36) }]}>?</Text>
                        <Text style={[styles.cardBackEmoji, { fontSize: fs(24) }]}>🥯</Text>
                    </View>
                </Animated.View>

                {/* 카드 앞면 */}
                <Animated.View
                    style={[
                        styles.card,
                        styles.cardFront,
                        {
                            width: cardWidth,
                            height: cardHeight,
                            borderWidth: s(4),
                            borderColor: getCardColor(),
                            transform: [{ rotateY: backRotateY }],
                        },
                    ]}
                >
                    {/* 당첨 카드 글로우 효과 */}
                    {isWinning && (
                        <Animated.View
                            style={[
                                styles.glowEffect,
                                {
                                    backgroundColor: getCardColor(),
                                    opacity: glowOpacity,
                                }
                            ]}
                        />
                    )}

                    <View style={[
                        styles.cardFrontInner,
                        {
                            backgroundColor: isWinning ? getCardColor() : colors.pixel.cream,
                            borderRadius: s(4),
                        }
                    ]}>
                        <View style={[
                            styles.gradeCircle,
                            {
                                width: s(50),
                                height: s(50),
                                borderRadius: s(25),
                                backgroundColor: isWinning ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                            }
                        ]}>
                            <Text style={[
                                styles.gradeEmoji,
                                {
                                    fontSize: fs(28),
                                    color: isWinning ? colors.pixel.darkBrown : colors.grade.lose,
                                }
                            ]}>
                                {getCardEmoji()}
                            </Text>
                        </View>
                        <Text style={[
                            styles.gradeText,
                            {
                                fontSize: fs(12),
                                color: isWinning ? colors.pixel.darkBrown : colors.grade.lose,
                            }
                        ]}>
                            {getCardLabel()}
                        </Text>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        // perspective는 web에서만 지원됨
    },
    touchable: {
        flex: 1,
    },
    card: {
        position: 'absolute',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
        shadowColor: colors.pixel.shadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 6,
    },
    cardBack: {
        backgroundColor: colors.pixel.rust,
        borderColor: colors.pixel.darkBrown,
    },
    cardBackInner: {
        flex: 1,
        width: '90%',
        margin: 4,
        backgroundColor: colors.pixel.brown,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBackQuestion: {
        color: colors.pixel.softGold,
        fontWeight: 'bold',
        textShadowColor: colors.pixel.darkBrown,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
    },
    cardBackEmoji: {
        marginTop: 4,
        color: colors.pixel.peach,
    },
    cardFront: {
        backgroundColor: colors.pixel.cream,
    },
    cardFrontInner: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    cardSelected: {
        borderColor: colors.pixel.warmOrange,
        shadowColor: colors.pixel.warmOrange,
        shadowOpacity: 0.8,
    },
    cardHovered: {
        borderColor: colors.pixel.softGold,
        shadowColor: colors.pixel.softGold,
        shadowOpacity: 0.6,
    },
    gradeCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    gradeEmoji: {
        fontWeight: 'bold',
    },
    gradeText: {
        fontWeight: 'bold',
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    glowEffect: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 12,
    },
});
