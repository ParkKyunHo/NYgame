import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';
import { useGameStore } from '../../store/gameStore';
import { getPrizeDetails } from '../../lib/engine';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../constants/colors';

export function ResultScreen() {
    const { history, navigate } = useGameStore();
    const { s, fs } = useResponsive();
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
        if (result.grade === '1st') return colors.grade.first;
        if (result.grade === '2nd') return colors.grade.second;
        if (result.grade === '3rd') return colors.grade.third;
        return colors.pixel.rust;
    };

    return (
        <ScreenLayout showSettings={false}>
            <View style={[styles.container, { paddingVertical: s(20) }]}>
                {/* 타이틀 */}
                <View style={[
                    styles.signBoard,
                    {
                        borderWidth: s(4),
                        padding: s(4),
                        marginBottom: s(24),
                        shadowOffset: { width: s(4), height: s(4) },
                    }
                ]}>
                    <View style={[
                        styles.signInner,
                        {
                            borderWidth: s(3),
                            paddingHorizontal: s(20),
                            paddingVertical: s(12),
                        }
                    ]}>
                        <Text style={[styles.title, { fontSize: fs(22), letterSpacing: s(1) }]}>
                            {isWin ? '🎉 축하합니다!' : '아쉽지만...'}
                        </Text>
                    </View>
                </View>

                {/* 결과 카드 */}
                <View style={[
                    styles.resultCard,
                    {
                        borderWidth: s(4),
                        padding: s(4),
                        marginBottom: s(20),
                        shadowOffset: { width: s(4), height: s(4) },
                    }
                ]}>
                    <View style={[
                        styles.resultInner,
                        {
                            borderWidth: s(3),
                            paddingHorizontal: s(32),
                            paddingVertical: s(24),
                            minWidth: s(260),
                        }
                    ]}>
                        <Text style={[styles.emoji, { fontSize: fs(60), marginBottom: s(12) }]}>
                            {isWin ? '🥯' : '📦'}
                        </Text>

                        <Text style={[
                            styles.gradeText,
                            { color: getGradeColor(), fontSize: fs(24), marginBottom: s(6) }
                        ]}>
                            {getGradeText()}
                        </Text>

                        <Text style={[styles.prizeText, { fontSize: fs(16) }]}>{prize.label}</Text>

                        {isWin && (
                            <View style={[
                                styles.ticketBox,
                                {
                                    marginTop: s(16),
                                    paddingVertical: s(10),
                                    paddingHorizontal: s(16),
                                    borderWidth: s(2),
                                }
                            ]}>
                                <Text style={[styles.ticketNumber, { fontSize: fs(14) }]}>
                                    당첨번호: {result.drawNumber}
                                </Text>
                                <Text style={[styles.ticketHint, { fontSize: fs(11), marginTop: s(4) }]}>
                                    직원에게 이 화면을 보여주세요
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 3등: 베이글 선택 */}
                {isThirdPlace && (
                    <View style={[styles.selectionBox, { marginBottom: s(20) }]}>
                        <Text style={[
                            styles.selectionTitle,
                            {
                                fontSize: fs(15),
                                marginBottom: s(12),
                                textShadowOffset: { width: 1, height: 1 },
                            }
                        ]}>원하는 베이글을 선택하세요</Text>
                        <View style={[styles.bagelGrid, { gap: s(10), maxWidth: s(280) }]}>
                            {['플레인', '크림치즈', '블루베리', '어니언'].map((bagel) => (
                                <TouchableOpacity
                                    key={bagel}
                                    style={[
                                        styles.bagelOption,
                                        {
                                            width: s(80),
                                            height: s(80),
                                            borderWidth: s(3),
                                            shadowOffset: { width: s(2), height: s(2) },
                                        },
                                        selectedBagel === bagel && styles.bagelSelected
                                    ]}
                                    onPress={() => setSelectedBagel(bagel)}
                                >
                                    <Text style={[styles.bagelEmoji, { fontSize: fs(28) }]}>🥯</Text>
                                    <Text style={[styles.bagelName, { fontSize: fs(11), marginTop: s(4) }]}>{bagel}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 하단 */}
                <View style={[styles.footer, { maxWidth: s(300) }]}>
                    {!isWin && (
                        <Text style={[
                            styles.footerText,
                            {
                                fontSize: fs(13),
                                marginBottom: s(16),
                                lineHeight: fs(20),
                                textShadowOffset: { width: 1, height: 1 },
                            }
                        ]}>
                            만원 이상 구매 시 매번 참여 가능합니다!{'\n'}내일 다시 도전해주세요.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            {
                                padding: s(4),
                                shadowOffset: { width: s(4), height: s(4) },
                            },
                            (isThirdPlace && !selectedBagel) && styles.buttonDisabled
                        ]}
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                        disabled={isThirdPlace && !selectedBagel}
                    >
                        <View style={[
                            styles.buttonInner,
                            {
                                borderWidth: s(3),
                                paddingHorizontal: s(36),
                                paddingVertical: s(14),
                            }
                        ]}>
                            <Text style={[styles.buttonText, { fontSize: fs(18), letterSpacing: s(1) }]}>
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
    },
    signBoard: {
        backgroundColor: colors.pixel.rust,
        borderColor: colors.pixel.darkBrown,
        borderRadius: 0,
        shadowColor: colors.pixel.shadow,
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    signInner: {
        backgroundColor: colors.pixel.softGold,
        borderColor: colors.pixel.rust,
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    resultCard: {
        backgroundColor: colors.pixel.rust,
        borderColor: colors.pixel.darkBrown,
        borderRadius: 0,
        shadowColor: colors.pixel.shadow,
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    resultInner: {
        backgroundColor: colors.pixel.peach,
        borderColor: colors.pixel.rust,
        alignItems: 'center',
    },
    emoji: {
    },
    gradeText: {
        fontWeight: 'bold',
    },
    prizeText: {
        color: colors.pixel.rust,
    },
    ticketBox: {
        backgroundColor: colors.pixel.cream,
        borderColor: colors.pixel.rust,
        borderStyle: 'dashed',
        borderRadius: 0,
        alignItems: 'center',
    },
    ticketNumber: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
        fontFamily: 'monospace',
    },
    ticketHint: {
        color: colors.pixel.rust,
    },
    selectionBox: {
        alignItems: 'center',
    },
    selectionTitle: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowRadius: 0,
    },
    bagelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    bagelOption: {
        backgroundColor: colors.pixel.peach,
        borderColor: colors.pixel.rust,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.pixel.shadow,
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 4,
    },
    bagelSelected: {
        backgroundColor: colors.pixel.warmOrange,
        borderColor: colors.pixel.darkBrown,
    },
    bagelEmoji: {
    },
    bagelName: {
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    footer: {
        alignItems: 'center',
        width: '100%',
    },
    footerText: {
        color: colors.pixel.darkBrown,
        textAlign: 'center',
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowRadius: 0,
    },
    confirmButton: {
        backgroundColor: colors.pixel.darkBrown,
        borderRadius: 0,
        shadowColor: colors.pixel.shadow,
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonInner: {
        backgroundColor: colors.pixel.warmOrange,
        borderTopColor: colors.pixel.coral,
        borderLeftColor: colors.pixel.coral,
        borderBottomColor: colors.pixel.rust,
        borderRightColor: colors.pixel.rust,
    },
    buttonText: {
        color: colors.pixel.cream,
        fontWeight: 'bold',
    },
});
