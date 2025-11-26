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

    // Navigation
    navigate: (screen: ScreenName) => void;

    // Actions
    setWeekendMode: (isWeekend: boolean) => void;
    resetDailyQuota: () => void;
    performDraw: () => DrawResult;
    claimPrize: (id: string) => void;
    updateSettings: (settings: Partial<Settings>) => void;

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
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            currentScreen: 'home' as ScreenName,

            isWeekendMode: isWeekend(),

            quota: isWeekend() ? INITIAL_QUOTA_WEEKEND : INITIAL_QUOTA_WEEKDAY,

            history: [],

            settings: DEFAULT_SETTINGS,

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
