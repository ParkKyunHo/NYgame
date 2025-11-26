import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { useGameStore } from '../../store/gameStore';
import { getPrizeDetails } from '../../lib/engine';

const THEME = {
    brown: '#4A3728',
    darkBrown: '#3D2E22',
    cream: '#FFF8DC',
    gold: '#D4A84B',
    orange: '#E8A849',
};

export function ResultScreen() {
    const { history, navigate } = useGameStore();
    const [selectedBagel, setSelectedBagel] = useState<string | null>(null);

    const result = history[0];

    if (!result) {
        navigate('home');
        return null;
    }

    const prize = getPrizeDetails(result.grade);
    const isWin = result.grade !== 'lose';
    const isThirdPlace = result.grade === '3rd';

    const handleConfirm = () => {
        if (isThirdPlace && !selectedBagel) return;
        navigate('home');
    };

    const getGradeText = () => {
        if (result.grade === '1st') return '1등 당첨!';
        if (result.grade === '2nd') return '2등 당첨!';
        if (result.grade === '3rd') return '3등 당첨!';
        return '다음 기회에...';
    };

    const getGradeColor = () => {
        if (result.grade === '1st') return '#FFD700';
        if (result.grade === '2nd') return '#C0C0C0';
        if (result.grade === '3rd') return '#CD7F32';
        return THEME.brown;
    };

    return (
        <ScreenLayout showSettings={false}>
            <View style={styles.container}>
                {/* 타이틀 */}
                <View style={styles.signBoard}>
                    <View style={styles.signInner}>
                        <Text style={styles.title}>
                            {isWin ? '🎉 축하합니다!' : '아쉽지만...'}
                        </Text>
                    </View>
                </View>

                {/* 결과 카드 */}
                <View style={styles.resultCard}>
                    <View style={styles.resultInner}>
                        <Text style={styles.emoji}>
                            {isWin ? '🥯' : '📦'}
                        </Text>

                        <Text style={[styles.gradeText, { color: getGradeColor() }]}>
                            {getGradeText()}
                        </Text>

                        <Text style={styles.prizeText}>{prize.label}</Text>

                        {isWin && (
                            <View style={styles.ticketBox}>
                                <Text style={styles.ticketNumber}>당첨번호: {result.drawNumber}</Text>
                                <Text style={styles.ticketHint}>직원에게 이 화면을 보여주세요</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 3등: 베이글 선택 */}
                {isThirdPlace && (
                    <View style={styles.selectionBox}>
                        <Text style={styles.selectionTitle}>원하는 베이글을 선택하세요</Text>
                        <View style={styles.bagelGrid}>
                            {['플레인', '크림치즈', '블루베리', '어니언'].map((bagel) => (
                                <TouchableOpacity
                                    key={bagel}
                                    style={[
                                        styles.bagelOption,
                                        selectedBagel === bagel && styles.bagelSelected
                                    ]}
                                    onPress={() => setSelectedBagel(bagel)}
                                >
                                    <Text style={styles.bagelEmoji}>🥯</Text>
                                    <Text style={styles.bagelName}>{bagel}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 하단 */}
                <View style={styles.footer}>
                    {!isWin && (
                        <Text style={styles.footerText}>
                            만원 이상 구매 시 매번 참여 가능합니다!{'\n'}내일 다시 도전해주세요.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            (isThirdPlace && !selectedBagel) && styles.buttonDisabled
                        ]}
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                        disabled={isThirdPlace && !selectedBagel}
                    >
                        <View style={styles.buttonInner}>
                            <Text style={styles.buttonText}>
                                {isWin
                                    ? (isThirdPlace && !selectedBagel ? "베이글을 선택해주세요" : "직원 확인 요청")
                                    : "확인"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    signBoard: {
        backgroundColor: THEME.brown,
        borderWidth: 4,
        borderColor: THEME.darkBrown,
        borderRadius: 4,
        padding: 4,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    signInner: {
        backgroundColor: THEME.gold,
        borderWidth: 3,
        borderColor: THEME.darkBrown,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: THEME.darkBrown,
        letterSpacing: 1,
    },
    resultCard: {
        backgroundColor: THEME.brown,
        borderWidth: 4,
        borderColor: THEME.darkBrown,
        borderRadius: 4,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    resultInner: {
        backgroundColor: THEME.cream,
        borderWidth: 3,
        borderColor: THEME.brown,
        paddingHorizontal: 32,
        paddingVertical: 24,
        alignItems: 'center',
        minWidth: 260,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 12,
    },
    gradeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    prizeText: {
        fontSize: 16,
        color: THEME.brown,
    },
    ticketBox: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#F5F0E6',
        borderWidth: 2,
        borderColor: THEME.brown,
        borderStyle: 'dashed',
        borderRadius: 4,
        alignItems: 'center',
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: THEME.darkBrown,
        fontFamily: 'monospace',
    },
    ticketHint: {
        fontSize: 11,
        color: THEME.brown,
        marginTop: 4,
    },
    selectionBox: {
        marginBottom: 20,
        alignItems: 'center',
    },
    selectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: THEME.darkBrown,
        marginBottom: 12,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    bagelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        maxWidth: 280,
    },
    bagelOption: {
        width: 80,
        height: 80,
        backgroundColor: THEME.cream,
        borderWidth: 3,
        borderColor: THEME.brown,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 4,
    },
    bagelSelected: {
        backgroundColor: THEME.gold,
        borderColor: THEME.darkBrown,
    },
    bagelEmoji: {
        fontSize: 28,
    },
    bagelName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: THEME.darkBrown,
        marginTop: 4,
    },
    footer: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 300,
    },
    footerText: {
        fontSize: 13,
        color: THEME.darkBrown,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
    confirmButton: {
        backgroundColor: THEME.darkBrown,
        borderRadius: 4,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonInner: {
        backgroundColor: THEME.brown,
        borderWidth: 3,
        borderTopColor: '#6B4D3A',
        borderLeftColor: '#6B4D3A',
        borderBottomColor: '#2D1F16',
        borderRightColor: '#2D1F16',
        paddingHorizontal: 36,
        paddingVertical: 14,
    },
    buttonText: {
        color: THEME.cream,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
