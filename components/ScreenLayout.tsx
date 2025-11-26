import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity, Text } from 'react-native';
import { colors } from '../constants/colors';
import { SettingsModal } from './SettingsModal';
import { useResponsive } from '../hooks/useResponsive';

interface ScreenLayoutProps {
    children: React.ReactNode;
    showSettings?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, showSettings = true }) => {
    const [settingsVisible, setSettingsVisible] = useState(false);
    const { s, fs, isTablet, width } = useResponsive();

    // 태블릿/데스크탑에서는 더 넓은 maxWidth 사용
    const contentMaxWidth = isTablet ? Math.min(width * 0.8, 600) : 800;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* 픽셀 스타일 Settings Button */}
            {showSettings && (
                <TouchableOpacity
                    style={[
                        styles.settingsButton,
                        {
                            top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + s(12) : s(12),
                            right: s(16),
                        }
                    ]}
                    onPress={() => setSettingsVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.settingsOuter, { padding: s(3), borderRadius: s(2) }]}>
                        <View style={[
                            styles.settingsInner,
                            {
                                width: s(40),
                                height: s(40),
                                borderWidth: s(2),
                            }
                        ]}>
                            <Text style={[styles.settingsIcon, { fontSize: fs(22) }]}>⚙</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            <View style={[
                styles.content,
                {
                    padding: s(16),
                    maxWidth: contentMaxWidth,
                }
            ]}>
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
        zIndex: 100,
    },
    settingsOuter: {
        backgroundColor: colors.pixel.darkBrown,
    },
    settingsInner: {
        backgroundColor: colors.pixel.cream,
        borderColor: colors.pixel.brown,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsIcon: {
        color: colors.pixel.darkBrown,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        alignSelf: 'center',
    },
});
