import { useWindowDimensions } from 'react-native';

export function useResponsive() {
    const { width, height } = useWindowDimensions();

    // 기준 화면: 375px (모바일)
    const baseWidth = 375;
    const scale = Math.min(width / baseWidth, 1.5); // 최대 1.5배까지만

    const isTablet = width >= 768;
    const isLargeScreen = width >= 1024;

    return {
        width,
        height,
        scale,
        isTablet,
        isLargeScreen,
        // 스케일 적용 헬퍼
        s: (size: number) => Math.round(size * scale),
        // 폰트 전용 스케일 (더 보수적)
        fs: (size: number) => Math.round(size * Math.min(scale, 1.3)),
    };
}
