---
name: game-ui-components
description: 게임 UI 컴포넌트와 레이아웃 패턴을 설계하고 구현합니다. HUD, 인벤토리, 모달, 반응형 게임 UI가 필요할 때 사용합니다. 트리거 키워드: 게임 UI, HUD, 인벤토리, 장비창, 팝업, 모달, 메뉴, 반응형
allowed-tools: [Read, Grep, Glob, Write, Edit]
---

# 게임 UI 컴포넌트

## 사용 시기
- "HUD 만들어줘"
- "인벤토리 UI 구현"
- "게임 메뉴 디자인"
- "모달/팝업 시스템"
- "반응형 게임 UI"

## 핵심 원칙

### 1. 계층 구조 (Z-Index)
```
z-index 계층:
- 1000+ : 시스템 오버레이 (로딩, 에러)
- 500-999 : 모달/다이얼로그
- 100-499 : 드롭다운/툴팁
- 10-99  : HUD 요소
- 1-9    : 게임 UI
- 0      : 게임 월드
```

### 2. 반응형 우선
- 모바일 먼저 설계
- 터치/마우스 모두 지원
- 최소 터치 영역 44x44px

### 3. 접근성
- 명확한 시각적 피드백
- 키보드 내비게이션 지원
- 충분한 색상 대비

## 구현 가이드

### 1. HUD (Heads-Up Display)
```tsx
interface HUDProps {
    player: {
        hp: number;
        maxHp: number;
        mp: number;
        maxMp: number;
        level: number;
        exp: number;
        maxExp: number;
    };
    currency: number;
}

const HUD: React.FC<HUDProps> = ({ player, currency }) => {
    return (
        <View style={styles.hudContainer}>
            {/* 왼쪽 상단: 플레이어 정보 */}
            <View style={styles.playerInfo}>
                <ProgressBar
                    value={player.hp}
                    max={player.maxHp}
                    color="#FF4444"
                    label={`HP ${player.hp}/${player.maxHp}`}
                />
                <ProgressBar
                    value={player.mp}
                    max={player.maxMp}
                    color="#4444FF"
                    label={`MP ${player.mp}/${player.maxMp}`}
                />
                <Text style={styles.levelText}>Lv.{player.level}</Text>
            </View>

            {/* 오른쪽 상단: 재화 */}
            <View style={styles.currencyInfo}>
                <CurrencyDisplay amount={currency} icon="coin" />
            </View>

            {/* 하단: 스킬바/액션바 */}
            <View style={styles.actionBar}>
                <ActionButton slot={1} />
                <ActionButton slot={2} />
                <ActionButton slot={3} />
                <ActionButton slot={4} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    hudContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none', // 터치 통과
    },
    playerInfo: {
        position: 'absolute',
        top: 16,
        left: 16,
        gap: 8,
    },
    currencyInfo: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    actionBar: {
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        flexDirection: 'row',
        gap: 8,
    },
});
```

### 2. 프로그레스 바
```tsx
interface ProgressBarProps {
    value: number;
    max: number;
    color: string;
    label?: string;
    showText?: boolean;
    height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max,
    color,
    label,
    showText = true,
    height = 20,
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <View style={[styles.barContainer, { height }]}>
            <View style={styles.barBackground}>
                <Animated.View
                    style={[
                        styles.barFill,
                        {
                            backgroundColor: color,
                            width: `${percentage}%`,
                        },
                    ]}
                />
            </View>
            {showText && (
                <Text style={styles.barText}>
                    {label || `${value}/${max}`}
                </Text>
            )}
        </View>
    );
};
```

### 3. 인벤토리 그리드
```tsx
interface InventoryItem {
    id: string;
    name: string;
    icon: string;
    quantity: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface InventoryGridProps {
    items: (InventoryItem | null)[];
    columns: number;
    onItemPress: (item: InventoryItem, index: number) => void;
    onItemLongPress?: (item: InventoryItem, index: number) => void;
    selectedIndex?: number;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
    items,
    columns,
    onItemPress,
    onItemLongPress,
    selectedIndex,
}) => {
    const SLOT_SIZE = 64;
    const GAP = 4;

    return (
        <View style={[styles.grid, { gap: GAP }]}>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.slot,
                        { width: SLOT_SIZE, height: SLOT_SIZE },
                        selectedIndex === index && styles.selectedSlot,
                        item && styles[`rarity_${item.rarity}`],
                    ]}
                    onPress={() => item && onItemPress(item, index)}
                    onLongPress={() => item && onItemLongPress?.(item, index)}
                    activeOpacity={0.7}
                >
                    {item ? (
                        <>
                            <Image source={{ uri: item.icon }} style={styles.itemIcon} />
                            {item.quantity > 1 && (
                                <Text style={styles.quantity}>{item.quantity}</Text>
                            )}
                        </>
                    ) : null}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    slot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 2,
        borderColor: '#555',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedSlot: {
        borderColor: '#FFD700',
        borderWidth: 3,
    },
    rarity_common: { borderColor: '#9d9d9d' },
    rarity_rare: { borderColor: '#0070dd' },
    rarity_epic: { borderColor: '#a335ee' },
    rarity_legendary: { borderColor: '#ff8000' },
    itemIcon: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    quantity: {
        position: 'absolute',
        bottom: 2,
        right: 4,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
```

### 4. 모달/다이얼로그 시스템
```tsx
interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    if (!visible) return null;

    const sizeStyles = {
        small: { width: 280 },
        medium: { width: 360 },
        large: { width: '90%', maxWidth: 500 },
    };

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableOpacity
                style={styles.backdrop}
                onPress={handleClose}
                activeOpacity={1}
            />
            <Animated.View
                style={[
                    styles.modalContent,
                    sizeStyles[size],
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {title && (
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        {showCloseButton && (
                            <TouchableOpacity onPress={handleClose}>
                                <Text style={styles.closeButton}>X</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View style={styles.modalBody}>{children}</View>
            </Animated.View>
        </Animated.View>
    );
};
```

### 5. 반응형 레이아웃 훅
```typescript
import { useWindowDimensions } from 'react-native';

interface ResponsiveValues {
    width: number;
    height: number;
    isPortrait: boolean;
    isLandscape: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    scale: (size: number) => number;
    fontSize: (size: number) => number;
}

export function useResponsive(): ResponsiveValues {
    const { width, height } = useWindowDimensions();

    const isPortrait = height > width;
    const isLandscape = width > height;

    // 기기 타입 판별
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    // 기준 너비 (디자인 기준)
    const baseWidth = 375;
    const scaleRatio = Math.min(width / baseWidth, 1.5);

    return {
        width,
        height,
        isPortrait,
        isLandscape,
        isMobile,
        isTablet,
        isDesktop,
        scale: (size) => Math.round(size * scaleRatio),
        fontSize: (size) => Math.round(size * Math.min(scaleRatio, 1.3)),
    };
}
```

### 6. 툴팁 컴포넌트
```tsx
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <View>
            <TouchableOpacity
                onPressIn={() => setVisible(true)}
                onPressOut={() => setVisible(false)}
            >
                {children}
            </TouchableOpacity>
            {visible && (
                <View style={[styles.tooltip, styles[`tooltip_${position}`]]}>
                    {content}
                </View>
            )}
        </View>
    );
};
```

## 체크리스트

- [ ] Z-index 계층 일관성 유지
- [ ] 최소 터치 영역 44x44px 확보
- [ ] 반응형 레이아웃 적용
- [ ] 키보드/게임패드 내비게이션 지원
- [ ] 로딩/에러 상태 UI 구현
- [ ] 애니메이션 적용 (등장/퇴장)
- [ ] 접근성 고려 (색상 대비, 폰트 크기)

## 주의사항

1. **성능**: 많은 아이템 렌더링 시 FlatList/VirtualizedList 사용
2. **터치 영역**: 작은 버튼은 hitSlop으로 터치 영역 확장
3. **Safe Area**: 노치/홈 인디케이터 영역 고려
4. **방향 전환**: 가로/세로 모드 전환 시 레이아웃 대응
