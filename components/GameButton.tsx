import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface GameButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

export const GameButton: React.FC<GameButtonProps> = ({
    title,
    onPress,
    style,
    disabled,
    variant = 'primary'
}) => {
    const { s, fs } = useResponsive();
    const isPrimary = variant === 'primary';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
            style={[styles.wrapper, style]}
        >
            {/* 그림자 */}
            <View style={[styles.shadow, { top: s(4), left: s(4), borderRadius: 0 }]} />

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
                        { fontSize: fs(24), letterSpacing: s(2), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
                        isPrimary ? styles.textPrimary : styles.textSecondary,
                        disabled && styles.textDisabled
                    ]}>
                        {title}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        position: 'relative',
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
        backgroundColor: colors.pixel.brown,
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
        backgroundColor: '#D4A84B', // 골드
        borderColor: '#C87941', // 오렌지 브라운
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
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    buttonText: {
        fontWeight: '900',
        textAlign: 'center',
    },
    textPrimary: {
        color: colors.pixel.darkBrown,
        textShadowColor: 'rgba(255, 255, 255, 0.4)',
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
