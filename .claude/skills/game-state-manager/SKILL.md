---
name: game-state-manager
description: 게임 상태 관리, 저장/로드, 자동 저장, 데이터 마이그레이션을 구현합니다. 세이브 시스템, 오프라인 저장, 상태 머신이 필요할 때 사용합니다. 트리거 키워드: 세이브, 로드, 저장, 상태 관리, 오프라인, 마이그레이션, persist
allowed-tools: [Read, Grep, Glob, Write, Edit]
---

# 게임 상태 관리자

## 사용 시기
- "세이브 기능 구현해줘"
- "게임 상태 저장"
- "오프라인 저장 추가"
- "상태 초기화 기능"
- "데이터 마이그레이션"

## 핵심 원칙

### 1. 단일 진실 원천 (Single Source of Truth)
- 모든 게임 상태는 하나의 store에서 관리
- 파생 상태는 computed/selector로 계산

### 2. 불변성 (Immutability)
- 상태 직접 수정 금지
- 항상 새 객체 반환

### 3. 영속성 (Persistence)
- 중요 상태는 자동 저장
- 버전 관리로 마이그레이션 지원

## 구현 가이드

### Step 1: 상태 인터페이스 정의
```typescript
interface GameState {
    version: number;  // 데이터 버전 (마이그레이션용)
    player: {
        id: string;
        name: string;
        level: number;
        exp: number;
        currency: number;
    };
    inventory: InventoryItem[];
    settings: {
        soundEnabled: boolean;
        musicVolume: number;
        language: string;
    };
    progress: {
        currentStage: number;
        unlockedStages: number[];
        achievements: string[];
    };
    meta: {
        createdAt: number;
        lastSavedAt: number;
        playTime: number;  // seconds
    };
}
```

### Step 2: Zustand Store 구현 (권장)
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GameStore extends GameState {
    // Actions
    setPlayerName: (name: string) => void;
    addExp: (amount: number) => void;
    addCurrency: (amount: number) => void;
    updateSettings: (settings: Partial<GameState['settings']>) => void;
    resetProgress: () => void;

    // Save/Load
    saveGame: () => void;
    loadGame: () => void;
    exportSave: () => string;
    importSave: (data: string) => boolean;
}

const INITIAL_STATE: GameState = {
    version: 1,
    player: { id: '', name: '', level: 1, exp: 0, currency: 0 },
    inventory: [],
    settings: { soundEnabled: true, musicVolume: 0.7, language: 'ko' },
    progress: { currentStage: 1, unlockedStages: [1], achievements: [] },
    meta: { createdAt: Date.now(), lastSavedAt: 0, playTime: 0 },
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            setPlayerName: (name) => set((state) => ({
                player: { ...state.player, name }
            })),

            addExp: (amount) => set((state) => {
                const newExp = state.player.exp + amount;
                const { level, remainingExp } = calculateLevel(newExp);
                return {
                    player: { ...state.player, exp: remainingExp, level }
                };
            }),

            addCurrency: (amount) => set((state) => ({
                player: { ...state.player, currency: state.player.currency + amount }
            })),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            resetProgress: () => set({
                progress: INITIAL_STATE.progress,
                player: { ...get().player, level: 1, exp: 0 }
            }),

            saveGame: () => set({ meta: { ...get().meta, lastSavedAt: Date.now() } }),

            loadGame: () => {
                // persist 미들웨어가 자동 처리
            },

            exportSave: () => {
                const state = get();
                return btoa(JSON.stringify(state));
            },

            importSave: (data) => {
                try {
                    const parsed = JSON.parse(atob(data));
                    const migrated = migrateData(parsed);
                    set(migrated);
                    return true;
                } catch {
                    return false;
                }
            },
        }),
        {
            name: 'game-save',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            migrate: migrateData,
        }
    )
);
```

### Step 3: 데이터 마이그레이션
```typescript
function migrateData(persistedState: any, version: number = 0): GameState {
    let state = persistedState;

    // v0 -> v1: currency 필드 추가
    if (version < 1) {
        state = {
            ...state,
            player: {
                ...state.player,
                currency: state.player?.gold || 0,  // gold -> currency 변환
            },
            version: 1,
        };
        delete state.player.gold;
    }

    // v1 -> v2: settings 구조 변경
    if (version < 2) {
        state = {
            ...state,
            settings: {
                ...state.settings,
                musicVolume: state.settings?.volume || 0.7,
            },
            version: 2,
        };
    }

    return state;
}
```

### Step 4: 자동 저장 구현
```typescript
// 자동 저장 훅
function useAutoSave(intervalMs: number = 30000) {
    const saveGame = useGameStore((state) => state.saveGame);

    useEffect(() => {
        const timer = setInterval(() => {
            saveGame();
            console.log('Auto-saved at', new Date().toLocaleTimeString());
        }, intervalMs);

        // 페이지 떠날 때 저장
        const handleBeforeUnload = () => saveGame();
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(timer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveGame, intervalMs]);
}
```

### Step 5: IndexedDB 대용량 저장 (선택)
```typescript
// 대용량 데이터용 IndexedDB 저장소
const DB_NAME = 'GameDB';
const STORE_NAME = 'saves';

async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

async function saveToDB(key: string, data: any): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id: key, data, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadFromDB(key: string): Promise<any | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
    });
}
```

## 상태 머신 패턴 (게임 플로우)

```typescript
type GamePhase = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

interface PhaseState {
    phase: GamePhase;
    setPhase: (phase: GamePhase) => void;
    canTransitionTo: (phase: GamePhase) => boolean;
}

const VALID_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
    loading: ['menu'],
    menu: ['playing', 'loading'],
    playing: ['paused', 'gameover', 'victory'],
    paused: ['playing', 'menu'],
    gameover: ['menu', 'playing'],
    victory: ['menu', 'playing'],
};

const usePhaseStore = create<PhaseState>((set, get) => ({
    phase: 'loading',

    setPhase: (newPhase) => {
        if (get().canTransitionTo(newPhase)) {
            set({ phase: newPhase });
        } else {
            console.warn(`Invalid transition: ${get().phase} -> ${newPhase}`);
        }
    },

    canTransitionTo: (newPhase) => {
        const current = get().phase;
        return VALID_TRANSITIONS[current]?.includes(newPhase) || false;
    },
}));
```

## 체크리스트

- [ ] 초기 상태 정의 완료
- [ ] persist 미들웨어 설정
- [ ] 데이터 버전 관리 (version 필드)
- [ ] 마이그레이션 함수 구현
- [ ] 자동 저장 주기 설정
- [ ] beforeunload 저장 처리
- [ ] 내보내기/가져오기 기능
- [ ] 상태 초기화 기능
- [ ] 대용량 데이터 IndexedDB 분리 (필요시)

## 주의사항

1. **민감 정보**: 결제/인증 정보는 localStorage에 저장 금지
2. **용량 제한**: localStorage는 5MB 제한, 대용량은 IndexedDB 사용
3. **동기화**: 여러 탭에서 동시 접근 시 충돌 주의
4. **검증**: 불러온 데이터는 항상 유효성 검사 필요
