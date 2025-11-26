import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { GameButton } from '../GameButton';
import { colors } from '../../constants/colors';
import { useGameStore } from '../../store/gameStore';

// 픽셀 박스 컴포넌트 (도트 스타일 테두리) - 이미지 참고
const PixelBox: React.FC<{
    children: React.ReactNode;
    style?: any;
    variant?: 'default' | 'dark' | 'transparent';
}> = ({ children, style, variant = 'default' }) => {
    const outerStyle = variant === 'dark' ? pixelStyles.boxOuterDark :
                       variant === 'transparent' ? pixelStyles.boxOuterTransparent :
                       pixelStyles.boxOuter;
    const innerStyle = variant === 'dark' ? pixelStyles.boxInnerDark :
                       variant === 'transparent' ? pixelStyles.boxInnerTransparent :
                       pixelStyles.boxInner;

    return (
        <View style={[outerStyle, style]}>
            <View style={innerStyle}>
                {children}
            </View>
        </View>
    );
};

export function HomeScreen() {
    const { isWeekendMode, getTodayParticipants, navigate } = useGameStore();

    const handleStart = () => {
        navigate('game');
    };

    return (
        <ScreenLayout>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 타이틀 - 이미지처럼 크고 굵은 텍스트 */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleMain}>베이글</Text>
                    <Text style={styles.titleSub}>럭키 뽑기</Text>
                </View>

                {/* 캐릭터 이미지 영역 - 흰색 배경 + 도넛 이미지 */}
                <PixelBox style={styles.characterBox} variant="default">
                    <View style={styles.characterInner}>
                        <Text style={styles.characterEmoji}>🍩</Text>
                    </View>
                </PixelBox>

                {/* 안내 문구 박스 */}
                <PixelBox style={styles.infoBox} variant="default">
                    <Text style={styles.infoText}>만원 이상 구매 시</Text>
                    <Text style={styles.infoHighlight}>1회 참여 가능!</Text>
                </PixelBox>

                {/* 시작 버튼 */}
                <GameButton
                    title="뽑기 START"
                    onPress={handleStart}
                    style={styles.startButton}
                />

                {/* 하단 통계 박스 - 이미지처럼 깔끔한 레이아웃 */}
                <PixelBox style={styles.statsBox} variant="default">
                    {/* 헤더 */}
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>오늘의 당첨 확률</Text>
                        <View style={styles.modeBadge}>
                            <Text style={styles.modeBadgeText}>{isWeekendMode ? '주말' : '평일'}</Text>
                        </View>
                    </View>

                    <View style={styles.statsDivider} />

                    {/* 등수별 확률 */}
                    <View style={styles.statRow}>
                        <View style={styles.statLeft}>
                            <Text style={styles.medalIcon}>🥇</Text>
                            <Text style={styles.gradeText}>1등 (8개)</Text>
                        </View>
                        <View style={styles.statValueBox}>
                            <Text style={styles.statValue}>{isWeekendMode ? '0.27%' : '0.33%'}</Text>
                        </View>
                    </View>

                    <View style={styles.statRow}>
                        <View style={styles.statLeft}>
                            <Text style={styles.medalIcon}>🥈</Text>
                            <Text style={styles.gradeText}>2등 (4개)</Text>
                        </View>
                        <View style={styles.statValueBox}>
                            <Text style={styles.statValue}>{isWeekendMode ? '0.27%' : '1.00%'}</Text>
                        </View>
                    </View>

                    <View style={styles.statRow}>
                        <View style={styles.statLeft}>
                            <Text style={styles.medalIcon}>🥉</Text>
                            <Text style={styles.gradeText}>3등 (1개)</Text>
                        </View>
                        <View style={styles.statValueBox}>
                            <Text style={styles.statValue}>{isWeekendMode ? '1.33%' : '1.67%'}</Text>
                        </View>
                    </View>

                    <View style={styles.statsDivider} />

                    {/* 오늘 참여자 */}
                    <View style={styles.participantsRow}>
                        <Text style={styles.participantsLabel}>오늘 참여자</Text>
                        <Text style={styles.participantsValue}>{getTodayParticipants()}명</Text>
                    </View>
                </PixelBox>
            </ScrollView>
        </ScreenLayout>
    );
}

// 픽셀 박스 스타일
const pixelStyles = StyleSheet.create({
    boxOuter: {
        backgroundColor: colors.pixel.darkBrown,
        padding: 4,
        borderRadius: 0,
    },
    boxOuterDark: {
        backgroundColor: colors.pixel.shadow,
        padding: 4,
        borderRadius: 0,
    },
    boxOuterTransparent: {
        backgroundColor: 'transparent',
        padding: 0,
        borderRadius: 0,
    },
    boxInner: {
        backgroundColor: colors.pixel.cream,
        padding: 16,
        borderWidth: 3,
        borderColor: colors.pixel.brown,
    },
    boxInnerDark: {
        backgroundColor: colors.pixel.brown,
        padding: 16,
        borderWidth: 3,
        borderColor: colors.pixel.darkBrown,
    },
    boxInnerTransparent: {
        backgroundColor: 'rgba(255, 248, 220, 0.9)',
        padding: 16,
        borderWidth: 3,
        borderColor: colors.pixel.brown,
    },
});

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    // 타이틀 - 이미지처럼 굵고 큰 텍스트, 그림자 효과
    titleContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    titleMain: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.pixel.cream,
        textShadowColor: colors.pixel.darkBrown,
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 0,
        letterSpacing: 4,
    },
    titleSub: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.pixel.cream,
        textShadowColor: colors.pixel.darkBrown,
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 0,
        letterSpacing: 4,
    },
    // 캐릭터 박스 - 이미지처럼 사각형
    characterBox: {
        marginBottom: 16,
        width: 160,
    },
    characterInner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    characterEmoji: {
        fontSize: 80,
    },
    // 안내 박스
    infoBox: {
        marginBottom: 20,
        minWidth: 200,
    },
    infoText: {
        fontSize: 16,
        color: colors.pixel.brown,
        textAlign: 'center',
    },
    infoHighlight: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
        textAlign: 'center',
        marginTop: 4,
    },
    // 시작 버튼
    startButton: {
        width: '100%',
        maxWidth: 260,
        marginBottom: 20,
    },
    // 통계 박스 - 이미지 참고
    statsBox: {
        width: '100%',
        maxWidth: 300,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    modeBadge: {
        backgroundColor: colors.pixel.cream,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 2,
        borderColor: colors.pixel.darkBrown,
    },
    modeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    statsDivider: {
        height: 2,
        backgroundColor: colors.pixel.brown,
        marginVertical: 12,
        opacity: 0.5,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },
    statLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medalIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    gradeText: {
        fontSize: 14,
        color: colors.pixel.brown,
        fontWeight: '500',
    },
    statValueBox: {
        backgroundColor: colors.pixel.darkBrown,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.pixel.gold,
    },
    participantsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    participantsLabel: {
        fontSize: 14,
        color: colors.pixel.brown,
    },
    participantsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
});
