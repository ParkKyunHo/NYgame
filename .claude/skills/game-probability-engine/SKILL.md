---
name: game-probability-engine
description: 가챠, 드롭률, 확률 시스템을 설계하고 구현합니다. 확률 테이블, 천장 시스템(pity), 누적 확률 계산이 필요할 때 사용합니다. 트리거 키워드: 확률, 가챠, 드롭률, 뽑기, 랜덤, pity, 천장
allowed-tools: [Read, Grep, Glob, Write, Edit]
---

# 게임 확률 엔진

## 사용 시기
- "가챠 시스템 만들어줘"
- "드롭률 설계해줘"
- "확률 테이블 구현"
- "천장 시스템 추가"
- "뽑기 확률 검증"

## 핵심 원칙

### 1. 확률의 투명성
- 모든 확률은 명시적으로 정의
- 사용자에게 확률 공개 가능한 구조

### 2. 공정성 보장
- 의사 난수(PRNG)가 아닌 암호학적 난수 권장 (crypto.getRandomValues)
- 시드 기반 재현 가능한 테스트

### 3. 천장(Pity) 시스템
- 연속 실패 시 보장 획득
- 하드 피티 vs 소프트 피티

## 구현 가이드

### Step 1: 확률 테이블 정의
```typescript
interface ProbabilityItem {
    id: string;
    grade: string;
    probability: number; // 0.0 ~ 1.0
    pityCount?: number;  // 천장 카운트
}

const PROBABILITY_TABLE: ProbabilityItem[] = [
    { id: 'legendary', grade: 'SSR', probability: 0.01, pityCount: 90 },
    { id: 'epic', grade: 'SR', probability: 0.05 },
    { id: 'rare', grade: 'R', probability: 0.14 },
    { id: 'common', grade: 'N', probability: 0.80 },
];
```

### Step 2: 뽑기 함수 구현
```typescript
function draw(table: ProbabilityItem[], pityCounter: number = 0): ProbabilityItem {
    // 천장 체크
    const pityItem = table.find(item => item.pityCount && pityCounter >= item.pityCount);
    if (pityItem) return pityItem;

    // 누적 확률 계산
    const rand = Math.random();
    let cumulative = 0;

    for (const item of table) {
        cumulative += item.probability;
        if (rand < cumulative) {
            return item;
        }
    }

    // 폴백 (확률 합이 1 미만인 경우)
    return table[table.length - 1];
}
```

### Step 3: 소프트 피티 구현 (선택)
```typescript
function drawWithSoftPity(
    table: ProbabilityItem[],
    pityCounter: number,
    softPityStart: number = 75,
    hardPity: number = 90
): ProbabilityItem {
    // 소프트 피티: 특정 횟수부터 확률 점진적 증가
    let boostedTable = [...table];

    if (pityCounter >= softPityStart) {
        const boost = (pityCounter - softPityStart) * 0.05; // 횟수당 5% 증가
        const legendaryIdx = boostedTable.findIndex(i => i.grade === 'SSR');
        if (legendaryIdx >= 0) {
            boostedTable[legendaryIdx] = {
                ...boostedTable[legendaryIdx],
                probability: Math.min(boostedTable[legendaryIdx].probability + boost, 1)
            };
        }
    }

    return draw(boostedTable, pityCounter);
}
```

### Step 4: 다중 뽑기 (10연차)
```typescript
function multiDraw(
    table: ProbabilityItem[],
    count: number,
    guaranteedGrade?: string
): ProbabilityItem[] {
    const results: ProbabilityItem[] = [];

    for (let i = 0; i < count; i++) {
        results.push(draw(table));
    }

    // 보장 등급 체크 (예: 10연차 SR 이상 1개 보장)
    if (guaranteedGrade) {
        const hasGuaranteed = results.some(r =>
            getGradeRank(r.grade) >= getGradeRank(guaranteedGrade)
        );
        if (!hasGuaranteed) {
            // 마지막 결과를 보장 등급으로 교체
            const guaranteed = table.find(i => i.grade === guaranteedGrade);
            if (guaranteed) results[count - 1] = guaranteed;
        }
    }

    return results;
}

function getGradeRank(grade: string): number {
    const ranks: Record<string, number> = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
    return ranks[grade] || 0;
}
```

## 시뮬레이션 및 검증

### 확률 검증 함수
```typescript
function simulateDraws(
    table: ProbabilityItem[],
    iterations: number = 100000
): Record<string, { count: number; actual: number; expected: number }> {
    const results: Record<string, number> = {};

    for (let i = 0; i < iterations; i++) {
        const result = draw(table);
        results[result.grade] = (results[result.grade] || 0) + 1;
    }

    const analysis: Record<string, { count: number; actual: number; expected: number }> = {};
    for (const item of table) {
        analysis[item.grade] = {
            count: results[item.grade] || 0,
            actual: ((results[item.grade] || 0) / iterations) * 100,
            expected: item.probability * 100
        };
    }

    return analysis;
}

// 사용 예시
// const stats = simulateDraws(PROBABILITY_TABLE, 100000);
// console.table(stats);
```

## 체크리스트

- [ ] 모든 확률의 합이 1.0 (100%)인지 확인
- [ ] 천장 시스템 동작 검증
- [ ] 10만회 시뮬레이션으로 실제 확률 검증
- [ ] 보장 시스템 (10연차 등) 동작 확인
- [ ] 확률 테이블이 UI에 표시되는지 확인
- [ ] 시드 기반 테스트 가능 여부

## 주의사항

1. **법적 요구사항**: 일부 국가에서는 가챠 확률 공개 의무
2. **난수 품질**: 보안이 중요하면 `crypto.getRandomValues()` 사용
3. **서버 검증**: 클라이언트 확률은 조작 가능, 중요한 뽑기는 서버에서 처리
