import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PixelCard } from './PixelCard';
import { CardData } from '../../store/gameStore';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../constants/colors';

interface CardGridProps {
    cards: CardData[];
    selectedIndex: number | null;
    revealedIndices: number[];
    onCardSelect: (index: number) => void;
    gamePhase: 'selecting' | 'revealing' | 'complete';
    onRevealNext: () => void;
    onComplete: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
    cards,
    selectedIndex,
    revealedIndices,
    onCardSelect,
    gamePhase,
    onRevealNext,
    onComplete,
}) => {
    const { s, fs } = useResponsive();
    const isSelecting = gamePhase === 'selecting';
    const cardCount = cards.length;

    // 카드 순차 공개 로직
    useEffect(() => {
        if (gamePhase !== 'revealing') return;

        const totalCards = cardCount;
        const revealedCount = revealedIndices.length;

        if (revealedCount < totalCards) {
            // 다음 카드 공개 (500ms 딜레이)
            const timer = setTimeout(() => {
                onRevealNext();
            }, revealedCount === 0 ? 300 : 500);

            return () => clearTimeout(timer);
        } else {
            // 모든 카드 공개 완료 -> 1초 후 결과 화면으로
            const timer = setTimeout(() => {
                onComplete();
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [gamePhase, revealedIndices.length, cardCount, onRevealNext, onComplete]);

    const handleCardPress = useCallback((index: number) => {
        if (isSelecting && selectedIndex === null) {
            onCardSelect(index);
        }
    }, [isSelecting, selectedIndex, onCardSelect]);

    const getInstructionText = () => {
        if (isSelecting) {
            return `${cardCount}장 중 1장을 선택하세요!`;
        }
        if (gamePhase === 'revealing') {
            return '결과 확인 중...';
        }
        return '결과가 나왔습니다!';
    };

    return (
        <View style={styles.container}>
            {/* 타이틀 */}
            <View style={[styles.titleContainer, { marginBottom: s(16) }]}>
                <Text style={[styles.titleText, { fontSize: fs(20) }]}>
                    LUCKY CARD
                </Text>
            </View>

            {/* 안내 문구 */}
            <View style={[styles.instructionBox, {
                paddingHorizontal: s(20),
                paddingVertical: s(10),
                marginBottom: s(24),
            }]}>
                <Text style={[styles.instruction, { fontSize: fs(16) }]}>
                    {getInstructionText()}
                </Text>
            </View>

            {/* 카드 그리드 */}
            <View style={[styles.grid, { gap: s(16) }]}>
                {cards.map((card, index) => (
                    <PixelCard
                        key={card.id}
                        isRevealed={revealedIndices.includes(index)}
                        isSelected={selectedIndex === index}
                        isWinning={card.isWinning}
                        bagelCount={card.bagelCount}
                        onPress={() => handleCardPress(index)}
                        disabled={!isSelecting || selectedIndex !== null}
                        index={index}
                    />
                ))}
            </View>

            {/* 힌트 텍스트 */}
            {isSelecting && (
                <Text style={[styles.hintText, { fontSize: fs(12), marginTop: s(20) }]}>
                    직감을 믿고 카드를 터치하세요!
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    titleContainer: {
        backgroundColor: colors.pixel.rust,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: colors.pixel.darkBrown,
        shadowColor: colors.pixel.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 4,
    },
    titleText: {
        color: colors.pixel.softGold,
        fontWeight: 'bold',
        textShadowColor: colors.pixel.darkBrown,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
        letterSpacing: 2,
    },
    instructionBox: {
        backgroundColor: 'rgba(255, 248, 225, 0.95)',
        borderRadius: 8,
        borderWidth: 3,
        borderColor: colors.pixel.brown,
    },
    instruction: {
        color: colors.pixel.darkBrown,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hintText: {
        color: colors.pixel.brown,
        fontStyle: 'italic',
        opacity: 0.8,
    },
});
