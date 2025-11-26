import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Animated, Easing } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { GameButton } from '../GameButton';
import { PixelBagel } from '../PixelBagel';
import { colors } from '../../constants/colors';
import { useGameStore } from '../../store/gameStore';
import { useResponsive } from '../../hooks/useResponsive';

// 픽셀 박스 컴포넌트 (도트 스타일 테두리) - 이미지 참고
// 픽셀 박스 컴포넌트 (도트 스타일 테두리 + 그림자)
const PixelBox: React.FC<{
    children: React.ReactNode;
    style?: any;
    variant?: 'default' | 'dark' | 'transparent' | 'gold';
    scale?: number;
}> = ({ children, style, variant = 'default', scale = 1 }) => {
    const outerStyle = variant === 'dark' ? styles.boxOuterDark :
        variant === 'transparent' ? styles.boxOuterTransparent :
            variant === 'gold' ? styles.boxOuterGold :
                styles.boxOuter;

    const innerStyle = variant === 'dark' ? styles.boxInnerDark :
        variant === 'transparent' ? styles.boxInnerTransparent :
            variant === 'gold' ? styles.boxInnerGold :
                styles.boxInner;

    const borderWidth = Math.round(4 * scale);

    return (
        <View style={[styles.pixelShadow, { top: borderWidth, left: borderWidth }, style]}>
            <View style={[outerStyle, { padding: borderWidth }, style, { top: 0, left: 0, marginBottom: borderWidth, marginRight: borderWidth }]}>
                <View style={[innerStyle, { padding: Math.round(16 * scale), borderWidth: borderWidth }]}>
                    {children}
                </View>
            </View>
        </View>
    );
};

export function HomeScreen() {
    const { isWeekendMode, getTodayParticipants, navigate } = useGameStore();
    const { s, fs, scale, isTablet } = useResponsive();

    // 타이틀 부유 애니메이션
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -6,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleStart = () => {
        navigate('game');
    };

    return (
        <ScreenLayout>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingVertical: s(20), paddingHorizontal: s(20) }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* 타이틀 - 픽셀 스타일 텍스트 */}
                <Animated.View style={[
                    styles.titleContainer,
                    { marginBottom: s(24), transform: [{ translateY: floatAnim }] }
                ]}>
                    <Text style={[
                        styles.titleMain,
                        {
                            fontSize: fs(48),
                            letterSpacing: s(4),
                        }
                    ]}>베이글</Text>
                    <Text style={[
                        styles.titleSub,
                        {
                            fontSize: fs(42),
                            letterSpacing: s(3),
                            marginTop: s(-4),
                        }
                    ]}>럭키 뽑기</Text>
                </Animated.View>

                {/* 픽셀 아트 베이글 */}
                <PixelBox style={[styles.characterBox, { marginBottom: s(20) }]} variant="default" scale={scale}>
                    <View style={[styles.characterInner, { padding: s(16) }]}>
                        <PixelBagel size={100} animated={true} />
                    </View>
                </PixelBox>

                {/* 안내 문구 박스 */}
                <PixelBox style={[styles.infoBox, { marginBottom: s(24), minWidth: s(240) }]} variant="gold" scale={scale}>
                    <Text style={[styles.infoText, { fontSize: fs(18), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>만원 이상 구매 시</Text>
                    <Text style={[styles.infoHighlight, { fontSize: fs(24), marginTop: s(8), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>1회 참여 가능!</Text>
                </PixelBox>

                {/* 시작 버튼 */}
                <GameButton
                    title="뽑기 START"
                    onPress={handleStart}
                    style={[styles.startButton, { maxWidth: s(260), marginBottom: s(20) }]}
                />

                {/* 하단 통계 박스 - 이미지처럼 깔끔한 레이아웃 */}
                <PixelBox style={[styles.statsBox, { maxWidth: s(320) }]} variant="default" scale={scale}>
                    {/* 헤더 */}
                    <View style={styles.statsHeader}>
                        <Text style={[styles.statsTitle, { fontSize: fs(15) }]}>오늘의 당첨 확률</Text>
                        <View style={[styles.modeBadge, { paddingHorizontal: s(10), paddingVertical: s(4), borderWidth: s(2) }]}>
                            <Text style={[styles.modeBadgeText, { fontSize: fs(12) }]}>{isWeekendMode ? '주말' : '평일'}</Text>
                        </View>
                    </View>

                    <View style={[styles.statsDivider, { marginVertical: s(12) }]} />

                    {/* 등수별 확률 */}
                    <View style={[styles.statRow, { marginVertical: s(6) }]}>
                        <View style={styles.statLeft}>
                            <Text style={[styles.medalIcon, { fontSize: fs(18), marginRight: s(8) }]}>🥇</Text>
                            <Text style={[styles.gradeText, { fontSize: fs(14) }]}>1등 (8개)</Text>
                        </View>
                        <View style={[styles.statValueBox, { paddingHorizontal: s(10), paddingVertical: s(4) }]}>
                            <Text style={[styles.statValue, { fontSize: fs(14) }]}>{isWeekendMode ? '0.27%' : '0.33%'}</Text>
                        </View>
                    </View>

                    <View style={[styles.statRow, { marginVertical: s(6) }]}>
                        <View style={styles.statLeft}>
                            <Text style={[styles.medalIcon, { fontSize: fs(18), marginRight: s(8) }]}>🥈</Text>
                            <Text style={[styles.gradeText, { fontSize: fs(14) }]}>2등 (4개)</Text>
                        </View>
                        <View style={[styles.statValueBox, { paddingHorizontal: s(10), paddingVertical: s(4) }]}>
                            <Text style={[styles.statValue, { fontSize: fs(14) }]}>{isWeekendMode ? '0.27%' : '1.00%'}</Text>
                        </View>
                    </View>

                    <View style={[styles.statRow, { marginVertical: s(6) }]}>
                        <View style={styles.statLeft}>
                            <Text style={[styles.medalIcon, { fontSize: fs(18), marginRight: s(8) }]}>🥉</Text>
                            <Text style={[styles.gradeText, { fontSize: fs(14) }]}>3등 (1개)</Text>
                        </View>
                        <View style={[styles.statValueBox, { paddingHorizontal: s(10), paddingVertical: s(4) }]}>
                            <Text style={[styles.statValue, { fontSize: fs(14) }]}>{isWeekendMode ? '1.33%' : '1.67%'}</Text>
                        </View>
                    </View>

                    <View style={[styles.statsDivider, { marginVertical: s(12) }]} />

                    {/* 오늘 참여자 */}
                    <View style={styles.participantsRow}>
                        <Text style={[styles.participantsLabel, { fontSize: fs(14) }]}>오늘 참여자</Text>
                        <Text style={[styles.participantsValue, { fontSize: fs(18) }]}>{getTodayParticipants()}명</Text>
                    </View>
                </PixelBox>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    // 픽셀 박스 스타일
    pixelShadow: {
        backgroundColor: colors.pixel.shadow,
    },
    boxOuter: {
        backgroundColor: colors.pixel.rust,
        borderRadius: 0,
    },
    boxOuterDark: {
        backgroundColor: colors.pixel.darkBrown,
        borderRadius: 0,
    },
    boxOuterTransparent: {
        backgroundColor: 'transparent',
        borderRadius: 0,
    },
    boxOuterGold: {
        backgroundColor: colors.pixel.rust,
        borderRadius: 0,
    },
    boxInner: {
        backgroundColor: colors.pixel.peach,
        borderColor: colors.pixel.rust,
    },
    boxInnerDark: {
        backgroundColor: colors.pixel.brown,
        borderColor: colors.pixel.darkBrown,
    },
    boxInnerTransparent: {
        backgroundColor: 'rgba(255, 203, 164, 0.85)',
        borderColor: colors.pixel.rust,
    },
    boxInnerGold: {
        backgroundColor: colors.pixel.softGold,
        borderColor: colors.pixel.warmOrange,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    // 타이틀 - 픽셀 스타일 텍스트
    titleContainer: {
        alignItems: 'center',
    },
    titleMain: {
        fontWeight: '900',
        color: colors.pixel.softGold,
        textShadowColor: colors.pixel.rust,
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 0,
    },
    titleSub: {
        fontWeight: '900',
        color: colors.pixel.titleGlow,
        textShadowColor: colors.pixel.rust,
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 0,
    },
    // 캐릭터 박스
    characterBox: {
    },
    characterInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 안내 박스
    infoBox: {
    },
    infoText: {
        color: colors.pixel.rust,
        textAlign: 'center',
        fontWeight: '600',
    },
    infoHighlight: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
        textAlign: 'center',
    },
    // 시작 버튼
    startButton: {
        width: '100%',
    },
    // 통계 박스 - 반투명 배경
    statsBox: {
        width: '100%',
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsTitle: {
        fontWeight: 'bold',
        color: colors.pixel.rust,
    },
    modeBadge: {
        backgroundColor: colors.pixel.warmOrange,
        borderColor: colors.pixel.rust,
    },
    modeBadgeText: {
        fontWeight: 'bold',
        color: colors.pixel.cream,
    },
    statsDivider: {
        height: 2,
        backgroundColor: colors.pixel.rust,
        opacity: 0.4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medalIcon: {
    },
    gradeText: {
        color: colors.pixel.rust,
        fontWeight: '600',
    },
    statValueBox: {
        backgroundColor: colors.pixel.rust,
        borderRadius: 2,
    },
    statValue: {
        fontWeight: 'bold',
        color: colors.pixel.softGold,
    },
    participantsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    participantsLabel: {
        color: colors.pixel.rust,
    },
    participantsValue: {
        fontWeight: 'bold',
        color: colors.pixel.warmOrange,
    },
});
