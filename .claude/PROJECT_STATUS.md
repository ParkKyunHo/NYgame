# NYgame 프로젝트 현황 문서

## 프로젝트 개요
베이글 럭키 뽑기 - React Native (Expo) 기반 가챠/뽑기 게임

## 기술 스택
- **프레임워크**: React Native + Expo
- **라우팅**: expo-router
- **상태관리**: Zustand
- **플랫폼**: Web / iOS / Android

---

## 완료된 작업

### 1. 비디오 배경 문제 해결
**문제**: 화면 전환 시 배경 비디오가 재시작되는 현상
- 홈 → 게임 → 결과 화면 이동 시 비디오가 매번 처음부터 재생됨
- 소리가 겹치는 현상 발생

**해결책**: JavaScript로 비디오 요소 동적 생성 (React 라이프사이클과 분리)

**수정된 파일**:
- `app/_layout.tsx` - 비디오를 DOM에 직접 삽입하는 useEffect 추가
- `app/+html.tsx` - 기본 HTML 셸 (비디오 없이 단순화)
- `components/ScreenLayout.tsx` - 웹에서 배경을 transparent로 설정

**핵심 코드** (`app/_layout.tsx`):
```tsx
useEffect(() => {
    if (Platform.OS === 'web') {
        let video = document.getElementById('global-bg-video') as HTMLVideoElement;
        if (!video) {
            video = document.createElement('video');
            video.id = 'global-bg-video';
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;pointer-events:none;';
            const source = document.createElement('source');
            source.src = '/background.mp4';
            source.type = 'video/mp4';
            video.appendChild(source);
            document.body.insertBefore(video, document.body.firstChild);
            video.load();
        }
        globalVideoElement = video;
        // 자동 재생 시도 + 클릭 시 재생
    }
}, []);
```

### 2. 설정 버튼 복구
**문제**: ScreenLayout에서 설정 버튼이 사라짐

**해결**: `ScreenLayout.tsx`에 설정 버튼과 모달 추가
- 오른쪽 상단 ⚙️ 버튼
- `SettingsModal` 컴포넌트 연동
- `showSettings` prop으로 표시 여부 제어 (기본값: true)

### 3. 누락된 컴포넌트 생성
- `components/GameButton.tsx` - 게임용 버튼 컴포넌트 생성
- `components/screens/HomeScreen.tsx` - 이미지 대신 🥯 이모지 사용 (bagel_character.jpg 누락 문제 해결)

---

## 프로젝트 구조

```
NYgame/
├── app/
│   ├── _layout.tsx      # 루트 레이아웃 (비디오 배경 관리)
│   ├── +html.tsx        # HTML 셸 (웹 전용)
│   ├── index.tsx        # 메인 엔트리
│   ├── game.tsx         # 게임 화면
│   └── result.tsx       # 결과 화면
├── components/
│   ├── ScreenLayout.tsx # 공통 레이아웃 (설정 버튼 포함)
│   ├── SettingsModal.tsx # 설정 모달
│   ├── GameButton.tsx   # 게임 버튼
│   ├── GachaScene.tsx   # 가챠 애니메이션
│   ├── PixelBackground.tsx
│   ├── PixelBox.tsx
│   ├── PixelCharacter.tsx
│   ├── ResultEffect.tsx
│   └── screens/
│       └── HomeScreen.tsx # 홈 화면
├── constants/
│   ├── colors.ts        # 색상 상수
│   ├── typography.ts    # 타이포그래피
│   └── assets.ts        # 에셋 경로
├── store/
│   └── gameStore.ts     # Zustand 상태 관리
├── lib/
│   └── engine.ts        # 게임 엔진/로직
├── assets/
│   └── images/
│       ├── 도트_뽑기_배경_영상_생성.mp4  # 네이티브용 배경 비디오
│       └── ... (기타 이미지)
└── public/
    └── background.mp4   # 웹용 배경 비디오
```

---

## 주요 기능

### 게임 플로우
1. **홈 화면** - 게임 시작 버튼, 당첨 확률 표시
2. **게임 화면** - 뽑기 애니메이션 (GachaScene)
3. **결과 화면** - 당첨 결과 표시

### 설정 기능 (SettingsModal)
- **Auto Stop**: 상품 소진 시 자동 중지
- **Sound**: 사운드 ON/OFF
- **Remaining Prizes**: 남은 상품 수량 표시
- **Reset Daily Quota**: 일일 상품 초기화

### 상태 관리 (gameStore.ts)
- `navigate(screen)` - 화면 전환
- `settings` - 설정값 (autoStopOnEnd, soundEnabled)
- `quota` - 상품 수량 (first, second, third)
- `isWeekendMode` - 주말/평일 모드
- `getTodayParticipants()` - 오늘 참여자 수

---

## 알려진 이슈

### 브라우저 자동재생 정책
- 대부분의 브라우저는 음소거된 비디오만 자동재생 허용
- 사용자 인터랙션(클릭/터치) 후 소리 재생 가능
- 현재 구현: muted 상태로 자동재생, 설정에서 사운드 ON 시 unmute

### 확인 필요 사항
- [ ] 사이트 첫 접속 시 비디오 자동재생 여부
- [ ] 화면 전환 시 비디오 연속 재생 여부
- [ ] 설정에서 사운드 ON/OFF 동작 확인

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 웹 개발 서버 실행
npx expo start --web

# 캐시 삭제 후 실행
npx expo start --web --clear
```

---

## 다음 작업 시 참고사항

1. **비디오 파일 위치**
   - 웹: `public/background.mp4`
   - 네이티브: `assets/images/도트_뽑기_배경_영상_생성.mp4`

2. **설정 버튼 숨기기**
   - `<ScreenLayout showSettings={false}>` 사용

3. **색상 변경**
   - `constants/colors.ts` 수정

4. **상태 추가/변경**
   - `store/gameStore.ts` 수정
