import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity, Text } from 'react-native';
import { colors } from '../constants/colors';
import { SettingsModal } from './SettingsModal';

interface ScreenLayoutProps {
    children: React.ReactNode;
    showSettings?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, showSettings = true }) => {
    const [settingsVisible, setSettingsVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* 픽셀 스타일 Settings Button */}
            {showSettings && (
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setSettingsVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.settingsOuter}>
                        <View style={styles.settingsInner}>
                            <Text style={styles.settingsIcon}>⚙</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            <View style={styles.content}>
                {children}
            </View>

            {/* Settings Modal */}
            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    settingsButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
        right: 16,
        zIndex: 100,
    },
    settingsOuter: {
        backgroundColor: colors.pixel.darkBrown,
        padding: 3,
        borderRadius: 2,
    },
    settingsInner: {
        width: 40,
        height: 40,
        backgroundColor: colors.pixel.cream,
        borderWidth: 2,
        borderColor: colors.pixel.brown,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsIcon: {
        fontSize: 22,
        color: colors.pixel.darkBrown,
    },
    content: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
});
