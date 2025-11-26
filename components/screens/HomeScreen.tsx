import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { GameButton } from '../GameButton';
import { colors } from '../../constants/colors';
import { useGameStore } from '../../store/gameStore';
import { useResponsive } from '../../hooks/useResponsive';

// 픽셀 박스 컴포넌트 (도트 스타일 테두리) - 이미지 참고
const PixelBox: React.FC<{
    children: React.ReactNode;
    style?: any;
    variant?: 'default' | 'dark' | 'transparent';
    scale?: number;
}> = ({ children, style, variant = 'default', scale = 1 }) => {
    const outerStyle = variant === 'dark' ? styles.boxOuterDark :
                       variant === 'transparent' ? styles.boxOuterTransparent :
                       styles.boxOuter;
    const innerStyle = variant === 'dark' ? styles.boxInnerDark :
                       variant === 'transparent' ? styles.boxInnerTransparent :
                       styles.boxInner;

    return (
        <View style={[outerStyle, { padding: Math.round(4 * scale) }, style]}>
            <View style={[innerStyle, { padding: Math.round(16 * scale), borderWidth: Math.round(3 * scale) }]}>
                {children}
            </View>
        </View>
    );
};

export function HomeScreen() {
    const { isWeekendMode, getTodayParticipants, navigate } = useGameStore();
    const { s, fs, scale, isTablet } = useResponsive();

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
                {/* 타이틀 - 이미지처럼 크고 굵은 텍스트 */}
                <View style={[styles.titleContainer, { marginBottom: s(20) }]}>
                    <Text style={[
                        styles.titleMain,
                        {
                            fontSize: fs(48),
                            textShadowOffset: { width: s(3), height: s(3) },
                            letterSpacing: s(4),
                        }
                    ]}>베이글</Text>
                    <Text style={[
                        styles.titleSub,
                        {
                            fontSize: fs(48),
                            textShadowOffset: { width: s(3), height: s(3) },
                            letterSpacing: s(4),
                        }
                    ]}>럭키 뽑기</Text>
                </View>

                {/* 캐릭터 이미지 영역 - 흰색 배경 + 도넛 이미지 */}
                <PixelBox style={[styles.characterBox, { width: s(160), marginBottom: s(16) }]} variant="default" scale={scale}>
                    <View style={[styles.characterInner, { paddingVertical: s(20) }]}>
                        <Text style={[styles.characterEmoji, { fontSize: fs(80) }]}>🍩</Text>
                    </View>
                </PixelBox>

                {/* 안내 문구 박스 */}
                <PixelBox style={[styles.infoBox, { marginBottom: s(20), minWidth: s(200) }]} variant="default" scale={scale}>
                    <Text style={[styles.infoText, { fontSize: fs(16) }]}>만원 이상 구매 시</Text>
                    <Text style={[styles.infoHighlight, { fontSize: fs(22), marginTop: s(4) }]}>1회 참여 가능!</Text>
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
    boxOuter: {
        backgroundColor: colors.pixel.darkBrown,
        borderRadius: 0,
    },
    boxOuterDark: {
        backgroundColor: colors.pixel.shadow,
        borderRadius: 0,
    },
    boxOuterTransparent: {
        backgroundColor: 'transparent',
        borderRadius: 0,
    },
    boxInner: {
        backgroundColor: colors.pixel.cream,
        borderColor: colors.pixel.brown,
    },
    boxInnerDark: {
        backgroundColor: colors.pixel.brown,
        borderColor: colors.pixel.darkBrown,
    },
    boxInnerTransparent: {
        backgroundColor: 'rgba(255, 248, 220, 0.9)',
        borderColor: colors.pixel.brown,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    // 타이틀 - 이미지처럼 굵고 큰 텍스트, 그림자 효과
    titleContainer: {
        alignItems: 'center',
    },
    titleMain: {
        fontWeight: '900',
        color: colors.pixel.cream,
        textShadowColor: colors.pixel.darkBrown,
        textShadowRadius: 0,
    },
    titleSub: {
        fontWeight: '900',
        color: colors.pixel.cream,
        textShadowColor: colors.pixel.darkBrown,
        textShadowRadius: 0,
    },
    // 캐릭터 박스 - 이미지처럼 사각형
    characterBox: {
    },
    characterInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterEmoji: {
    },
    // 안내 박스
    infoBox: {
    },
    infoText: {
        color: colors.pixel.brown,
        textAlign: 'center',
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
    // 통계 박스 - 이미지 참고
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
        color: colors.pixel.darkBrown,
    },
    modeBadge: {
        backgroundColor: colors.pixel.cream,
        borderColor: colors.pixel.darkBrown,
    },
    modeBadgeText: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    statsDivider: {
        height: 2,
        backgroundColor: colors.pixel.brown,
        opacity: 0.5,
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
        color: colors.pixel.brown,
        fontWeight: '500',
    },
    statValueBox: {
        backgroundColor: colors.pixel.darkBrown,
    },
    statValue: {
        fontWeight: 'bold',
        color: colors.pixel.gold,
    },
    participantsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    participantsLabel: {
        color: colors.pixel.brown,
    },
    participantsValue: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
});
