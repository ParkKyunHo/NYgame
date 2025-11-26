import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View, Platform, Animated, Easing } from 'react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface GameButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    animated?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
    title,
    onPress,
    style,
    disabled,
    variant = 'primary',
    animated = true
}) => {
    const { s, fs } = useResponsive();
    const isPrimary = variant === 'primary';

    // 펄스 글로우 애니메이션
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated && isPrimary && !disabled) {
            // 스케일 펄스
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.03,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // 글로우 효과
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animated, isPrimary, disabled]);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={[
            styles.wrapper,
            style,
            { transform: [{ scale: pulseAnim }] }
        ]}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                disabled={disabled}
                style={styles.touchable}
            >
                {/* 글로우 효과 (배경) */}
                {isPrimary && !disabled && (
                    <Animated.View style={[
                        styles.glowEffect,
                        { opacity: glowOpacity, top: s(-4), left: s(-4), right: s(-4), bottom: s(-4) }
                    ]} />
                )}

                {/* 그림자 */}
                <View style={[styles.shadow, { top: s(5), left: s(5), borderRadius: 0 }]} />

                {/* 픽셀 스타일 외곽 테두리 */}
                <View style={[
                    styles.outerBorder,
                    { padding: s(4), borderRadius: 0 },
                    isPrimary ? styles.outerPrimary : styles.outerSecondary,
                    disabled && styles.outerDisabled
                ]}>
                    {/* 내부 버튼 영역 */}
                    <View style={[
                        styles.innerButton,
                        {
                            paddingVertical: s(16),
                            paddingHorizontal: s(32),
                            borderWidth: s(4),
                        },
                        isPrimary ? styles.innerPrimary : styles.innerSecondary,
                        disabled && styles.innerDisabled
                    ]}>
                        {/* 하이라이트 효과 */}
                        <View style={styles.highlight} />
                        <Text style={[
                            styles.buttonText,
                            { fontSize: fs(22), letterSpacing: s(3) },
                            isPrimary ? styles.textPrimary : styles.textSecondary,
                            disabled && styles.textDisabled
                        ]}>
                            {title}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        position: 'relative',
    },
    touchable: {
        width: '100%',
        position: 'relative',
    },
    glowEffect: {
        position: 'absolute',
        backgroundColor: colors.pixel.warmOrange,
        borderRadius: 4,
    },
    shadow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: colors.pixel.shadow,
    },
    outerBorder: {
        width: '100%',
    },
    outerPrimary: {
        backgroundColor: colors.pixel.rust,
    },
    outerSecondary: {
        backgroundColor: colors.pixel.brown,
    },
    outerDisabled: {
        backgroundColor: colors.text.disabled,
    },
    innerButton: {
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
    },
    innerPrimary: {
        backgroundColor: colors.pixel.warmOrange,
        borderColor: colors.pixel.coral,
    },
    innerSecondary: {
        backgroundColor: colors.pixel.cream,
        borderColor: colors.pixel.brown,
    },
    innerDisabled: {
        backgroundColor: '#A99B8D',
        borderColor: '#8A7B6D',
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
    },
    buttonText: {
        fontWeight: '900',
        textAlign: 'center',
    },
    textPrimary: {
        color: colors.pixel.cream,
        textShadowColor: colors.pixel.rust,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
    },
    textSecondary: {
        color: colors.pixel.brown,
    },
    textDisabled: {
        color: '#6B5B4F',
    },
});
