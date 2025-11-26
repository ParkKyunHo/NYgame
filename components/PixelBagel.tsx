import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface PixelBagelProps {
    size?: number;
    animated?: boolean;
}

// 픽셀 아트 스타일 베이글 컴포넌트
export const PixelBagel: React.FC<PixelBagelProps> = ({
    size = 80,
    animated = true,
}) => {
    const { s } = useResponsive();
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const scaledSize = s(size);
    const pixelSize = Math.max(4, Math.floor(scaledSize / 16)); // 픽셀 크기

    useEffect(() => {
        if (animated) {
            // 부드러운 바운스 애니메이션
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: -8,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceAnim, {
                        toValue: 0,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // 미세한 회전 애니메이션
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animated]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-3deg', '3deg'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: scaledSize,
                    height: scaledSize,
                    transform: [
                        { translateY: bounceAnim },
                        { rotate },
                    ],
                },
            ]}
        >
            {/* 베이글 외곽 (가장 바깥 링) */}
            <View
                style={[
                    styles.ring,
                    styles.outerRing,
                    {
                        width: scaledSize,
                        height: scaledSize,
                        borderRadius: scaledSize / 2,
                        borderWidth: pixelSize * 2,
                    },
                ]}
            />

            {/* 베이글 중간 링 */}
            <View
                style={[
                    styles.ring,
                    styles.middleRing,
                    {
                        width: scaledSize * 0.85,
                        height: scaledSize * 0.85,
                        borderRadius: (scaledSize * 0.85) / 2,
                        borderWidth: pixelSize * 3,
                    },
                ]}
            />

            {/* 베이글 안쪽 링 (하이라이트) */}
            <View
                style={[
                    styles.ring,
                    styles.innerRing,
                    {
                        width: scaledSize * 0.65,
                        height: scaledSize * 0.65,
                        borderRadius: (scaledSize * 0.65) / 2,
                        borderWidth: pixelSize * 2,
                    },
                ]}
            />

            {/* 베이글 구멍 */}
            <View
                style={[
                    styles.hole,
                    {
                        width: scaledSize * 0.35,
                        height: scaledSize * 0.35,
                        borderRadius: (scaledSize * 0.35) / 2,
                        borderWidth: pixelSize,
                    },
                ]}
            />

            {/* 픽셀 하이라이트 (빛 반사) */}
            <View
                style={[
                    styles.highlight,
                    {
                        width: pixelSize * 3,
                        height: pixelSize * 3,
                        top: scaledSize * 0.15,
                        left: scaledSize * 0.25,
                    },
                ]}
            />
            <View
                style={[
                    styles.highlight,
                    {
                        width: pixelSize * 2,
                        height: pixelSize * 2,
                        top: scaledSize * 0.22,
                        left: scaledSize * 0.32,
                        opacity: 0.6,
                    },
                ]}
            />

            {/* 픽셀 씨앗 (참깨) */}
            <View style={[styles.seed, { width: pixelSize * 2, height: pixelSize, top: scaledSize * 0.18, left: scaledSize * 0.55 }]} />
            <View style={[styles.seed, { width: pixelSize * 2, height: pixelSize, top: scaledSize * 0.28, left: scaledSize * 0.68 }]} />
            <View style={[styles.seed, { width: pixelSize * 2, height: pixelSize, top: scaledSize * 0.65, left: scaledSize * 0.60 }]} />
            <View style={[styles.seed, { width: pixelSize * 2, height: pixelSize, top: scaledSize * 0.72, left: scaledSize * 0.35 }]} />
            <View style={[styles.seed, { width: pixelSize * 2, height: pixelSize, top: scaledSize * 0.58, left: scaledSize * 0.20 }]} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ring: {
        position: 'absolute',
    },
    outerRing: {
        backgroundColor: colors.pixel.bagelOuter,
        borderColor: colors.pixel.rust,
    },
    middleRing: {
        backgroundColor: colors.pixel.bagelMiddle,
        borderColor: colors.pixel.bagelOuter,
    },
    innerRing: {
        backgroundColor: colors.pixel.bagelInner,
        borderColor: colors.pixel.bagelMiddle,
    },
    hole: {
        backgroundColor: 'transparent',
        borderColor: colors.pixel.rust,
        position: 'absolute',
    },
    highlight: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    seed: {
        position: 'absolute',
        backgroundColor: colors.pixel.cream,
        opacity: 0.9,
    },
});

export default PixelBagel;
