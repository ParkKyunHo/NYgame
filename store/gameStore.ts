import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrizeGrade, drawItem, isWeekend } from '../lib/engine';

interface DrawResult {
    id: string;
    grade: PrizeGrade;
    timestamp: number;
    isClaimed: boolean;
    drawNumber: string; // #YYYYMMDD-XXX
}

interface DailyQuota {
    first: number;
    second: number;
    third: number;
}

interface Settings {
    autoStopOnEnd: boolean;      // 이벤트 종료 시 자동 멈춤
    soundEnabled: boolean;       // 사운드 ON/OFF
    drawMode: 'timer' | 'card';  // 뽑기 모드
    cardCount: 3 | 5;            // 카드 수
}

export interface CardData {
    id: number;
    grade: PrizeGrade;
    isWinning: boolean;
}

interface CardGameState {
    cards: CardData[];
    selectedCardIndex: number | null;
    winningCardIndex: number;
    winningGrade: PrizeGrade;
    revealedCards: number[];
    gamePhase: 'selecting' | 'revealing' | 'complete';
}

export type ScreenName = 'home' | 'game' | 'result';

interface GameState {
    // Current screen (for state-based navigation)
    currentScreen: ScreenName;

    // Config
    isWeekendMode: boolean;

    // Quotas (Remaining)
    quota: DailyQuota;

    // History
    history: DrawResult[];

    // Settings
    settings: Settings;

    // Card Game State
    cardGame: CardGameState | null;

    // Last draw result (for result screen)
    lastDrawResult: DrawResult | null;

    // Navigation
    navigate: (screen: ScreenName) => void;

    // Actions
    setWeekendMode: (isWeekend: boolean) => void;
    resetDailyQuota: () => void;
    performDraw: () => DrawResult;
    claimPrize: (id: string) => void;
    updateSettings: (settings: Partial<Settings>) => void;

    // Card Game Actions
    initializeCardGame: () => void;
    selectCard: (index: number) => void;
    revealNextCard: () => void;
    completeCardGame: () => DrawResult;

    // Stats
    getTodayParticipants: () => number;
    isEventEnded: () => boolean;
    resetTodayParticipants: () => void;
}

const INITIAL_QUOTA_WEEKDAY: DailyQuota = { first: 1, second: 3, third: 5 };
const INITIAL_QUOTA_WEEKEND: DailyQuota = { first: 2, second: 2, third: 10 };

const DEFAULT_SETTINGS: Settings = {
    autoStopOnEnd: true,
    soundEnabled: true,
    drawMode: 'timer',
    cardCount: 5,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            currentScreen: 'home' as ScreenName,

            isWeekendMode: isWeekend(),

            quota: isWeekend() ? INITIAL_QUOTA_WEEKEND : INITIAL_QUOTA_WEEKDAY,

            history: [],

            settings: DEFAULT_SETTINGS,

            cardGame: null,

            lastDrawResult: null,

            navigate: (screen) => set({ currentScreen: screen }),

            setWeekendMode: (mode) => set({
                isWeekendMode: mode,
                quota: mode ? INITIAL_QUOTA_WEEKEND : INITIAL_QUOTA_WEEKDAY // Reset quota on mode change for testing
            }),

            resetDailyQuota: () => {
                const { isWeekendMode } = get();
                set({
                    quota: isWeekendMode ? INITIAL_QUOTA_WEEKEND : INITIAL_QUOTA_WEEKDAY
                });
            },

            performDraw: () => {
                const { isWeekendMode, quota, history } = get();

                // 1. Draw based on probability
                let resultGrade = drawItem(isWeekendMode);

                // 2. Check quota
                if (resultGrade === '1st' && quota.first <= 0) resultGrade = 'lose';
                if (resultGrade === '2nd' && quota.second <= 0) resultGrade = 'lose';
                if (resultGrade === '3rd' && quota.third <= 0) resultGrade = 'lose';

                // 3. Update quota
                if (resultGrade !== 'lose') {
                    set((state) => ({
                        quota: {
                            ...state.quota,
                            first: resultGrade === '1st' ? state.quota.first - 1 : state.quota.first,
                            second: resultGrade === '2nd' ? state.quota.second - 1 : state.quota.second,
                            third: resultGrade === '3rd' ? state.quota.third - 1 : state.quota.third,
                        }
                    }));
                }

                // 4. Create record
                const today = new Date();
                const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                const dailyCount = history.filter(h => {
                    const hDate = new Date(h.timestamp);
                    return hDate.getDate() === today.getDate() && hDate.getMonth() === today.getMonth();
                }).length + 1;

                const drawNumber = `#${dateStr}-${String(dailyCount).padStart(3, '0')}`;

                const newResult: DrawResult = {
                    id: Math.random().toString(36).substr(2, 9),
                    grade: resultGrade,
                    timestamp: Date.now(),
                    isClaimed: false,
                    drawNumber,
                };

                set((state) => ({ history: [newResult, ...state.history] }));

                return newResult;
            },

            claimPrize: (id) => set((state) => ({
                history: state.history.map(item =>
                    item.id === id ? { ...item, isClaimed: true } : item
                )
            })),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Card Game Actions
            initializeCardGame: () => {
                const { isWeekendMode, quota, settings } = get();
                const cardCount = settings.cardCount;

                // 1. 당첨 등급 결정 (기존 확률 시스템 사용)
                let winningGrade = drawItem(isWeekendMode);

                // 2. 쿼터 체크
                if (winningGrade === '1st' && quota.first <= 0) winningGrade = 'lose';
                if (winningGrade === '2nd' && quota.second <= 0) winningGrade = 'lose';
                if (winningGrade === '3rd' && quota.third <= 0) winningGrade = 'lose';

                // 3. 당첨 카드 위치 랜덤 결정
                const winningCardIndex = Math.floor(Math.random() * cardCount);

                // 4. 카드 배열 생성
                const cards: CardData[] = [];
                for (let i = 0; i < cardCount; i++) {
                    cards.push({
                        id: i,
                        grade: i === winningCardIndex ? winningGrade : 'lose',
                        isWinning: i === winningCardIndex,
                    });
                }

                set({
                    cardGame: {
                        cards,
                        selectedCardIndex: null,
                        winningCardIndex,
                        winningGrade,
                        revealedCards: [],
                        gamePhase: 'selecting',
                    }
                });
            },

            selectCard: (index: number) => {
                const { cardGame } = get();
                if (!cardGame || cardGame.selectedCardIndex !== null) return;

                set({
                    cardGame: {
                        ...cardGame,
                        selectedCardIndex: index,
                        gamePhase: 'revealing',
                    }
                });
            },

            revealNextCard: () => {
                const { cardGame, settings } = get();
                if (!cardGame || cardGame.gamePhase !== 'revealing') return;

                const { selectedCardIndex, revealedCards } = cardGame;
                const cardCount = settings.cardCount;

                // 공개 순서 계산: 선택한 카드는 마지막
                const allIndices = Array.from({ length: cardCount }, (_, i) => i);
                const otherIndices = allIndices.filter(i => i !== selectedCardIndex);
                const revealOrder = [...otherIndices, selectedCardIndex!];

                const nextRevealIndex = revealOrder[revealedCards.length];
                if (nextRevealIndex !== undefined) {
                    set({
                        cardGame: {
                            ...cardGame,
                            revealedCards: [...revealedCards, nextRevealIndex],
                        }
                    });
                }
            },

            completeCardGame: () => {
                const { cardGame, quota, history } = get();
                if (!cardGame) {
                    throw new Error('Card game not initialized');
                }

                const { winningGrade } = cardGame;

                // 1. 쿼터 업데이트
                if (winningGrade !== 'lose') {
                    set((state) => ({
                        quota: {
                            ...state.quota,
                            first: winningGrade === '1st' ? state.quota.first - 1 : state.quota.first,
                            second: winningGrade === '2nd' ? state.quota.second - 1 : state.quota.second,
                            third: winningGrade === '3rd' ? state.quota.third - 1 : state.quota.third,
                        }
                    }));
                }

                // 2. 기록 생성
                const today = new Date();
                const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                const dailyCount = history.filter(h => {
                    const hDate = new Date(h.timestamp);
                    return hDate.getDate() === today.getDate() && hDate.getMonth() === today.getMonth();
                }).length + 1;

                const drawNumber = `#${dateStr}-${String(dailyCount).padStart(3, '0')}`;

                const newResult: DrawResult = {
                    id: Math.random().toString(36).substr(2, 9),
                    grade: winningGrade,
                    timestamp: Date.now(),
                    isClaimed: false,
                    drawNumber,
                };

                set((state) => ({
                    history: [newResult, ...state.history],
                    lastDrawResult: newResult,
                    cardGame: {
                        ...state.cardGame!,
                        gamePhase: 'complete',
                    }
                }));

                return newResult;
            },

            getTodayParticipants: () => {
                const { history } = get();
                const today = new Date().toDateString();
                return history.filter(h => new Date(h.timestamp).toDateString() === today).length;
            },

            isEventEnded: () => {
                const { quota } = get();
                return quota.first <= 0 && quota.second <= 0 && quota.third <= 0;
            },

            resetTodayParticipants: () => {
                const { history } = get();
                const today = new Date().toDateString();
                // 오늘 참여자 기록만 삭제
                set({
                    history: history.filter(h => new Date(h.timestamp).toDateString() !== today)
                });
            }
        }),
        {
            name: 'bagel-game-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
