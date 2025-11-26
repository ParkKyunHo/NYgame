---
name: game-animation-effects
description: 게임 애니메이션과 시각 효과를 구현합니다. 파티클, 화면 전환, 피드백 애니메이션, CSS/JS 이펙트가 필요할 때 사용합니다. 트리거 키워드: 애니메이션, 이펙트, 파티클, 트랜지션, 피드백, 흔들림, 페이드
allowed-tools: [Read, Grep, Glob, Write, Edit]
---

# 게임 애니메이션 및 이펙트

## 사용 시기
- "애니메이션 추가해줘"
- "파티클 효과 구현"
- "화면 전환 이펙트"
- "피격 효과 만들어줘"
- "보상 획득 애니메이션"

## 핵심 원칙

### 1. 60fps 유지
- requestAnimationFrame 사용
- GPU 가속 속성 우선 (transform, opacity)
- layout 트리거 속성 피하기 (width, height, top, left)

### 2. 피드백 우선
- 모든 상호작용에 즉각적인 시각 반응
- 0.1초 이내 응답

### 3. 일관성
- 같은 유형의 애니메이션은 동일한 타이밍
- 브랜드 컬러/스타일 통일

## 구현 가이드

### 1. 기본 애니메이션 훅 (React Native)
```tsx
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// 페이드 인/아웃
export function useFade(visible: boolean, duration: number = 300) {
    const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    return opacity;
}

// 스케일 펄스 (하트비트)
export function usePulse(active: boolean = true) {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (active) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.1,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
        return () => scale.setValue(1);
    }, [active]);

    return scale;
}

// 흔들림 (쉐이크)
export function useShake() {
    const translateX = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(translateX, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 4, duration: 50, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    return { translateX, shake };
}

// 바운스
export function useBounce() {
    const scale = useRef(new Animated.Value(1)).current;

    const bounce = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 3,
                tension: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return { scale, bounce };
}
```

### 2. 화면 전환 효과
```tsx
type TransitionType = 'fade' | 'slide' | 'scale' | 'flip';

interface ScreenTransitionProps {
    children: React.ReactNode;
    type: TransitionType;
    duration?: number;
    visible: boolean;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
    children,
    type,
    duration = 300,
    visible,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(300)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const rotateY = useRef(new Animated.Value(90)).current;

    useEffect(() => {
        const animations: Record<TransitionType, Animated.CompositeAnimation> = {
            fade: Animated.timing(opacity, {
                toValue: visible ? 1 : 0,
                duration,
                useNativeDriver: true,
            }),
            slide: Animated.parallel([
                Animated.timing(opacity, { toValue: visible ? 1 : 0, duration, useNativeDriver: true }),
                Animated.timing(translateX, { toValue: visible ? 0 : 300, duration, useNativeDriver: true }),
            ]),
            scale: Animated.parallel([
                Animated.timing(opacity, { toValue: visible ? 1 : 0, duration, useNativeDriver: true }),
                Animated.spring(scale, { toValue: visible ? 1 : 0.8, useNativeDriver: true }),
            ]),
            flip: Animated.timing(rotateY, {
                toValue: visible ? 0 : 90,
                duration,
                useNativeDriver: true,
            }),
        };

        animations[type].start();
    }, [visible, type]);

    const getStyle = () => {
        switch (type) {
            case 'fade':
                return { opacity };
            case 'slide':
                return { opacity, transform: [{ translateX }] };
            case 'scale':
                return { opacity, transform: [{ scale }] };
            case 'flip':
                return {
                    transform: [{
                        rotateY: rotateY.interpolate({
                            inputRange: [0, 90],
                            outputRange: ['0deg', '90deg'],
                        }),
                    }],
                };
            default:
                return {};
        }
    };

    return (
        <Animated.View style={[styles.container, getStyle()]}>
            {children}
        </Animated.View>
    );
};
```

### 3. 피드백 애니메이션
```tsx
// 데미지 숫자 팝업
interface DamagePopupProps {
    damage: number;
    isCritical?: boolean;
    position: { x: number; y: number };
    onComplete: () => void;
}

const DamagePopup: React.FC<DamagePopupProps> = ({
    damage,
    isCritical,
    position,
    onComplete,
}) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(isCritical ? 1.5 : 1)).current;

    useEffect(() => {
        Animated.parallel([
            // 위로 떠오름
            Animated.timing(translateY, {
                toValue: -60,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // 페이드 아웃
            Animated.timing(opacity, {
                toValue: 0,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            }),
            // 크리티컬 스케일 다운
            isCritical && Animated.timing(scale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ].filter(Boolean) as Animated.CompositeAnimation[]).start(onComplete);
    }, []);

    return (
        <Animated.Text
            style={[
                styles.damageText,
                {
                    left: position.x,
                    top: position.y,
                    opacity,
                    transform: [{ translateY }, { scale }],
                    color: isCritical ? '#FFD700' : '#FF4444',
                    fontSize: isCritical ? 32 : 24,
                },
            ]}
        >
            {isCritical ? 'CRITICAL! ' : ''}{damage}
        </Animated.Text>
    );
};

// 보상 획득 이펙트
const RewardEffect: React.FC<{ reward: string; onComplete: () => void }> = ({
    reward,
    onComplete,
}) => {
    const scale = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            // 등장 (스케일 + 회전)
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: 360,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            // 대기
            Animated.delay(1000),
            // 퇴장
            Animated.parallel([
                Animated.timing(scale, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]),
        ]).start(onComplete);
    }, []);

    return (
        <Animated.View
            style={[
                styles.rewardContainer,
                {
                    opacity,
                    transform: [
                        { scale },
                        {
                            rotate: rotate.interpolate({
                                inputRange: [0, 360],
                                outputRange: ['0deg', '360deg'],
                            }),
                        },
                    ],
                },
            ]}
        >
            <Text style={styles.rewardText}>{reward}</Text>
        </Animated.View>
    );
};
```

### 4. 간단한 파티클 시스템
```tsx
interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface ParticleSystemProps {
    origin: { x: number; y: number };
    count: number;
    colors: string[];
    spread: number;
    gravity?: number;
    duration?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
    origin,
    count,
    colors,
    spread,
    gravity = 0.1,
    duration = 1000,
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // 파티클 생성
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * spread;
            newParticles.push({
                id: i,
                x: origin.x,
                y: origin.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: duration,
                maxLife: duration,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        setParticles(newParticles);

        // 애니메이션 루프
        let animationId: number;
        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            setParticles((prev) =>
                prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        vy: p.vy + gravity,
                        life: p.life - deltaTime,
                    }))
                    .filter((p) => p.life > 0)
            );

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [origin, count]);

    return (
        <View style={styles.particleContainer} pointerEvents="none">
            {particles.map((p) => (
                <View
                    key={p.id}
                    style={[
                        styles.particle,
                        {
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            opacity: p.life / p.maxLife,
                            borderRadius: p.size / 2,
                        },
                    ]}
                />
            ))}
        </View>
    );
};
```

### 5. CSS 애니메이션 (웹)
```css
/* 펄스 */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* 흔들림 */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 바운스 */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* 글로우 */
@keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
}

/* 스핀 */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 사용 예시 */
.pulse { animation: pulse 1s ease-in-out infinite; }
.shake { animation: shake 0.5s ease-in-out; }
.bounce { animation: bounce 0.5s ease infinite; }
.glow { animation: glow 2s ease-in-out infinite; }
.spin { animation: spin 1s linear infinite; }
```

## 이징 함수 참고

```typescript
// 자주 사용하는 이징
const EASINGS = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t: number) => {
        if (t < 1/2.75) return 7.5625 * t * t;
        if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
        if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
    },
    elastic: (t: number) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
};
```

## 체크리스트

- [ ] 60fps 성능 유지 확인
- [ ] GPU 가속 속성 사용 (transform, opacity)
- [ ] 메모리 누수 방지 (cleanup 함수)
- [ ] 접근성: prefers-reduced-motion 대응
- [ ] 터치/클릭 피드백 구현
- [ ] 로딩 스피너/프로그레스 애니메이션
- [ ] 에러/성공 피드백 애니메이션

## 주의사항

1. **성능**: 동시 애니메이션 수 제한 (권장 10개 이하)
2. **배터리**: 무한 루프 애니메이션은 필요 시에만 실행
3. **접근성**: `prefers-reduced-motion` 미디어 쿼리 존중
4. **cleanup**: 컴포넌트 언마운트 시 애니메이션 정리
