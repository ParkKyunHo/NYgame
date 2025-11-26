import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
    hero: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.text.primary,
        textAlign: 'center',
    },
    h1: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.text.primary,
        textAlign: 'center',
    },
    h2: {
        fontSize: 28,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
    },
    h3: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.text.primary,
        textAlign: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: '400',
        color: colors.text.primary,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.secondary,
    },
    mono: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.text.secondary,
        fontFamily: 'monospace', // Platform specific font family might be needed later
    },
});
