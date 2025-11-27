export type PrizeGrade = '1st' | '2nd' | '3rd' | 'lose' | 'card_win';

interface ProbabilityConfig {
    grade: PrizeGrade;
    probability: number; // 0.0 ~ 1.0
}

// PRD Weekday Probabilities (300 participants)
// 1st: 0.33% (1/300)
// 2nd: 1.00% (3/300)
// 3rd: 1.67% (5/300)
// Lose: 97.00%
const WEEKDAY_PROBS: ProbabilityConfig[] = [
    { grade: '1st', probability: 0.0033 },
    { grade: '2nd', probability: 0.0100 },
    { grade: '3rd', probability: 0.0167 },
    { grade: 'lose', probability: 0.9700 },
];

// PRD Weekend Probabilities (750 participants)
// 1st: 0.27% (2/750)
// 2nd: 0.27% (2/750)
// 3rd: 1.33% (10/750)
// Lose: 98.13%
const WEEKEND_PROBS: ProbabilityConfig[] = [
    { grade: '1st', probability: 0.0027 },
    { grade: '2nd', probability: 0.0027 },
    { grade: '3rd', probability: 0.0133 },
    { grade: 'lose', probability: 0.9813 },
];

export const isWeekend = (): boolean => {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday(0) or Saturday(6)
};

export const drawItem = (isWeekendMode: boolean = isWeekend()): PrizeGrade => {
    const probs = isWeekendMode ? WEEKEND_PROBS : WEEKDAY_PROBS;
    const rand = Math.random();

    let cumulativeProb = 0;
    for (const item of probs) {
        cumulativeProb += item.probability;
        if (rand < cumulativeProb) {
            return item.grade;
        }
    }

    return 'lose'; // Fallback
};

export const getPrizeDetails = (grade: PrizeGrade) => {
    switch (grade) {
        case '1st': return { count: 8, label: '베이글 8개' };
        case '2nd': return { count: 4, label: '베이글 4개' };
        case '3rd': return { count: 1, label: '베이글 1개 (선택)' };
        default: return { count: 0, label: '꽝' };
    }
};
