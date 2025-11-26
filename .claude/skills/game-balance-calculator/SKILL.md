---
name: game-balance-calculator
description: 게임 밸런싱 공식과 시스템을 설계합니다. 경험치 곡선, 데미지 공식, 경제 설계, 성장 시스템이 필요할 때 사용합니다. 트리거 키워드: 밸런스, 경험치, 레벨업, 데미지, 공식, 성장, 경제, 인플레이션
allowed-tools: [Read, Grep, Glob, Write, Edit]
---

# 게임 밸런스 계산기

## 사용 시기
- "경험치 곡선 설계해줘"
- "레벨업 공식 만들어줘"
- "데미지 계산식 구현"
- "게임 경제 밸런싱"
- "성장 시스템 설계"

## 핵심 원칙

### 1. 점진적 난이도 (Progressive Difficulty)
- 초반은 빠른 성장으로 재미 제공
- 후반은 느린 성장으로 장기 플레이 유도

### 2. 수치적 일관성
- 모든 공식은 예측 가능해야 함
- 극단적인 값에서도 동작해야 함

### 3. 리소스 흐름 (Sink & Faucet)
- 획득량(Faucet)과 소비량(Sink) 균형
- 인플레이션 방지

## 구현 가이드

### 1. 경험치 곡선 공식

#### 선형 (Linear) - 단순, 예측 가능
```typescript
// 레벨당 고정 증가
function linearExpCurve(level: number, baseExp: number = 100): number {
    return baseExp * level;
}
// Lv1: 100, Lv2: 200, Lv10: 1000
```

#### 다항식 (Polynomial) - 가장 일반적
```typescript
// 레벨의 제곱 비례 증가
function polynomialExpCurve(
    level: number,
    baseExp: number = 100,
    exponent: number = 2
): number {
    return Math.floor(baseExp * Math.pow(level, exponent));
}
// exponent=2: Lv1: 100, Lv2: 400, Lv10: 10000
// exponent=1.5: Lv1: 100, Lv2: 282, Lv10: 3162
```

#### 지수 (Exponential) - 급격한 후반
```typescript
// 기하급수적 증가
function exponentialExpCurve(
    level: number,
    baseExp: number = 100,
    growthRate: number = 1.15
): number {
    return Math.floor(baseExp * Math.pow(growthRate, level - 1));
}
// growthRate=1.15: Lv1: 100, Lv2: 115, Lv10: 352, Lv50: 8819
```

#### 테이블 기반 (Custom) - 세밀한 조정
```typescript
const EXP_TABLE = [
    0,      // Lv0 (미사용)
    100,    // Lv1 -> Lv2
    200,    // Lv2 -> Lv3
    350,    // Lv3 -> Lv4
    550,    // ...
    800,
    1100,
    1500,
    2000,
    2700,
    3500,   // Lv10 -> Lv11
];

function getExpRequired(level: number): number {
    if (level < EXP_TABLE.length) return EXP_TABLE[level];
    // 테이블 초과 시 공식 적용
    const lastTableLevel = EXP_TABLE.length - 1;
    const lastValue = EXP_TABLE[lastTableLevel];
    return Math.floor(lastValue * Math.pow(1.2, level - lastTableLevel));
}
```

#### 레벨 계산 유틸리티
```typescript
interface LevelResult {
    level: number;
    currentExp: number;
    expToNext: number;
    totalExpForLevel: number;
}

function calculateLevel(
    totalExp: number,
    expCurve: (level: number) => number,
    maxLevel: number = 100
): LevelResult {
    let level = 1;
    let accumulatedExp = 0;

    while (level < maxLevel) {
        const required = expCurve(level);
        if (accumulatedExp + required > totalExp) break;
        accumulatedExp += required;
        level++;
    }

    const currentExp = totalExp - accumulatedExp;
    const expToNext = level < maxLevel ? expCurve(level) - currentExp : 0;

    return {
        level,
        currentExp,
        expToNext,
        totalExpForLevel: expCurve(level),
    };
}
```

### 2. 데미지 공식

#### 기본 공식 (Flat Reduction)
```typescript
// 단순 감산
function basicDamage(attack: number, defense: number): number {
    return Math.max(1, attack - defense);
}
```

#### 비율 감소 (Percentage Reduction)
```typescript
// 방어력에 따른 비율 감소
function percentReductionDamage(
    attack: number,
    defense: number,
    defenseScaling: number = 100
): number {
    const reduction = defense / (defense + defenseScaling);
    return Math.max(1, Math.floor(attack * (1 - reduction)));
}
// defense=100, scaling=100: 50% 감소
// defense=200, scaling=100: 66.7% 감소
```

#### 복합 공식 (RPG 스타일)
```typescript
interface DamageParams {
    baseDamage: number;
    attackStat: number;
    defenseStat: number;
    skillMultiplier?: number;
    criticalMultiplier?: number;
    elementalBonus?: number;
    randomVariance?: number; // 0.0 ~ 1.0
}

function calculateDamage(params: DamageParams): {
    damage: number;
    isCritical: boolean;
    breakdown: Record<string, number>;
} {
    const {
        baseDamage,
        attackStat,
        defenseStat,
        skillMultiplier = 1.0,
        criticalMultiplier = 1.5,
        elementalBonus = 1.0,
        randomVariance = 0.1,
    } = params;

    // 1. 기본 데미지 계산
    let damage = baseDamage + (attackStat * 2 - defenseStat);

    // 2. 스킬 배율
    damage *= skillMultiplier;

    // 3. 크리티컬 판정 (예: 10% 확률)
    const isCritical = Math.random() < 0.1;
    if (isCritical) damage *= criticalMultiplier;

    // 4. 속성 보너스
    damage *= elementalBonus;

    // 5. 랜덤 변동
    const variance = 1 + (Math.random() * 2 - 1) * randomVariance;
    damage *= variance;

    // 6. 최소 데미지 보장
    damage = Math.max(1, Math.floor(damage));

    return {
        damage,
        isCritical,
        breakdown: {
            base: baseDamage,
            attackContrib: attackStat * 2,
            defenseReduction: defenseStat,
            skillMult: skillMultiplier,
            critMult: isCritical ? criticalMultiplier : 1,
            elementMult: elementalBonus,
        },
    };
}
```

### 3. 스탯 성장 시스템

```typescript
interface StatGrowth {
    base: number;      // 기본값
    perLevel: number;  // 레벨당 증가
    scaling: number;   // 스케일링 계수
}

interface CharacterStats {
    hp: StatGrowth;
    mp: StatGrowth;
    attack: StatGrowth;
    defense: StatGrowth;
    speed: StatGrowth;
}

// 직업별 성장 프리셋
const CLASS_STATS: Record<string, CharacterStats> = {
    warrior: {
        hp: { base: 100, perLevel: 20, scaling: 1.05 },
        mp: { base: 30, perLevel: 5, scaling: 1.02 },
        attack: { base: 15, perLevel: 4, scaling: 1.04 },
        defense: { base: 10, perLevel: 3, scaling: 1.03 },
        speed: { base: 8, perLevel: 1, scaling: 1.01 },
    },
    mage: {
        hp: { base: 60, perLevel: 10, scaling: 1.03 },
        mp: { base: 80, perLevel: 15, scaling: 1.06 },
        attack: { base: 20, perLevel: 5, scaling: 1.05 },
        defense: { base: 5, perLevel: 2, scaling: 1.02 },
        speed: { base: 10, perLevel: 2, scaling: 1.02 },
    },
};

function calculateStat(growth: StatGrowth, level: number): number {
    return Math.floor(
        growth.base +
        (growth.perLevel * (level - 1)) *
        Math.pow(growth.scaling, level - 1)
    );
}

function getCharacterStats(className: string, level: number): Record<string, number> {
    const classStats = CLASS_STATS[className];
    return {
        hp: calculateStat(classStats.hp, level),
        mp: calculateStat(classStats.mp, level),
        attack: calculateStat(classStats.attack, level),
        defense: calculateStat(classStats.defense, level),
        speed: calculateStat(classStats.speed, level),
    };
}
```

### 4. 경제 밸런싱

```typescript
interface EconomyConfig {
    startingGold: number;
    goldPerMinute: number;          // 시간당 획득량
    averageItemCost: number;        // 평균 아이템 가격
    inflationRate: number;          // 레벨당 인플레이션
    taxRate: number;                // 거래 수수료 (싱크)
}

const ECONOMY: EconomyConfig = {
    startingGold: 100,
    goldPerMinute: 10,
    averageItemCost: 500,
    inflationRate: 1.1,
    taxRate: 0.05,
};

// 적정 플레이 시간 계산
function calculatePlayTimeForItem(
    itemCost: number,
    goldPerMinute: number
): number {
    return Math.ceil(itemCost / goldPerMinute); // 분 단위
}

// 레벨별 골드 드롭량
function goldDropForLevel(
    baseGold: number,
    level: number,
    inflationRate: number = 1.1
): number {
    return Math.floor(baseGold * Math.pow(inflationRate, level - 1));
}

// 일일 골드 획득량 시뮬레이션
function simulateDailyEconomy(
    playHoursPerDay: number,
    playerLevel: number
): { earned: number; spent: number; net: number } {
    const goldPerMinute = ECONOMY.goldPerMinute * Math.pow(ECONOMY.inflationRate, playerLevel - 1);
    const earned = goldPerMinute * playHoursPerDay * 60;

    // 예상 소비 (강화, 수리, 소모품 등)
    const spent = earned * 0.6; // 60% 소비 가정

    return {
        earned: Math.floor(earned),
        spent: Math.floor(spent),
        net: Math.floor(earned - spent),
    };
}
```

### 5. 밸런스 시뮬레이션 도구

```typescript
// 경험치 곡선 시각화 데이터
function generateExpCurveData(
    expCurve: (level: number) => number,
    maxLevel: number = 50
): Array<{ level: number; required: number; total: number }> {
    const data = [];
    let total = 0;

    for (let level = 1; level <= maxLevel; level++) {
        const required = expCurve(level);
        total += required;
        data.push({ level, required, total });
    }

    return data;
}

// 전투 시뮬레이션
function simulateBattle(
    attacker: { attack: number; hp: number },
    defender: { defense: number; hp: number },
    iterations: number = 1000
): { winRate: number; avgTurns: number } {
    let wins = 0;
    let totalTurns = 0;

    for (let i = 0; i < iterations; i++) {
        let attackerHp = attacker.hp;
        let defenderHp = defender.hp;
        let turns = 0;

        while (attackerHp > 0 && defenderHp > 0) {
            // 공격자 턴
            const dmg = percentReductionDamage(attacker.attack, defender.defense);
            defenderHp -= dmg;

            if (defenderHp <= 0) break;

            // 수비자 반격 (예시)
            const counterDmg = percentReductionDamage(defender.defense, attacker.attack * 0.5);
            attackerHp -= counterDmg;

            turns++;
            if (turns > 100) break; // 무한 루프 방지
        }

        if (defenderHp <= 0) wins++;
        totalTurns += turns;
    }

    return {
        winRate: wins / iterations,
        avgTurns: totalTurns / iterations,
    };
}
```

## 밸런싱 가이드라인

### 권장 수치 범위

| 항목 | 권장 범위 | 비고 |
|------|----------|------|
| 레벨업 시간 (초반) | 5-15분 | 빠른 성취감 |
| 레벨업 시간 (후반) | 1-4시간 | 장기 목표 |
| 크리티컬 배율 | 1.5x ~ 2.5x | 너무 높으면 밸런스 붕괴 |
| 방어력 감소율 최대 | 70-80% | 무적 방지 |
| 일일 플레이 보상 | 2-4시간분 | 과금과 균형 |

### 밸런스 체크포인트

1. **레벨 1-10**: 튜토리얼, 모든 콘텐츠 체험
2. **레벨 10-30**: 핵심 게임플레이 학습
3. **레벨 30-50**: 엔드게임 준비
4. **레벨 50+**: 엔드게임 콘텐츠

## 체크리스트

- [ ] 경험치 곡선 설계 및 테스트
- [ ] 데미지 공식 검증 (극단값 테스트)
- [ ] 스탯 성장 밸런스 확인
- [ ] 경제 시뮬레이션 (인플레이션 체크)
- [ ] 전투 시뮬레이션 (승률 밸런스)
- [ ] 신규 유저 vs 베테랑 격차 검토
- [ ] 무과금 vs 과금 밸런스

## 주의사항

1. **숫자 오버플로우**: 큰 수 연산 시 BigInt 또는 라이브러리 사용
2. **부동소수점**: 비교 시 === 대신 오차 범위 허용
3. **테스트**: 극단적인 레벨/스탯에서도 정상 동작 확인
4. **기획 문서화**: 모든 공식과 상수는 문서화 필수
