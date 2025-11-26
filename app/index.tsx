import React from 'react';
import { useGameStore } from '../store/gameStore';
import { HomeScreen } from '../components/screens/HomeScreen';
import { GameScreen } from '../components/screens/GameScreen';
import { ResultScreen } from '../components/screens/ResultScreen';

// 단일 페이지 앱 - 상태 기반 화면 전환
// 비디오 배경이 재시작되지 않도록 expo-router 네비게이션 대신 상태로 화면 전환
export default function App() {
    const currentScreen = useGameStore((state) => state.currentScreen);

    switch (currentScreen) {
        case 'game':
            return <GameScreen />;
        case 'result':
            return <ResultScreen />;
        case 'home':
        default:
            return <HomeScreen />;
    }
}
