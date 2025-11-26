import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
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
            {/* 픽셀 스타일 외곽 테두리 */}
            <View style={[
                styles.outerBorder,
                { padding: s(4), borderRadius: s(2) },
                isPrimary ? styles.outerPrimary : styles.outerSecondary,
                disabled && styles.outerDisabled
            ]}>
                {/* 내부 버튼 영역 */}
                <View style={[
                    styles.innerButton,
                    {
                        paddingVertical: s(14),
                        paddingHorizontal: s(32),
                        borderWidth: s(3),
                    },
                    isPrimary ? styles.innerPrimary : styles.innerSecondary,
                    disabled && styles.innerDisabled
                ]}>
                    {/* 하이라이트 효과 */}
                    <View style={styles.highlight} />
                    <Text style={[
                        styles.buttonText,
                        { fontSize: fs(18), letterSpacing: s(1) },
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
    },
    outerBorder: {
    },
    outerPrimary: {
        backgroundColor: colors.pixel.darkBrown,
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
    },
    innerPrimary: {
        backgroundColor: colors.pixel.gold,
        borderColor: colors.pixel.orange,
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
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textPrimary: {
        color: colors.pixel.darkBrown,
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    textSecondary: {
        color: colors.pixel.brown,
    },
    textDisabled: {
        color: '#6B5B4F',
    },
});
