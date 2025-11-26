# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

베이글 럭키 뽑기 (Bagel Lucky Draw) - A gacha/lottery game built with React Native (Expo). Supports Web, iOS, and Android platforms.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start --web

# Clear cache and start
npx expo start --web --clear

# Build for web (PWA)
npm run build:web

# Serve built web app
npm run serve
```

## Architecture

### State-Based Navigation (No URL Changes)

The app uses **Zustand state** for screen navigation instead of expo-router's URL-based navigation. This prevents the background video from restarting on screen changes.

- `app/index.tsx` - Single entry point that renders screens based on `currentScreen` state
- `store/gameStore.ts` - `navigate(screen)` function changes `currentScreen` state
- Screens: `home` → `game` → `result` → `home`

### Video Background System

**Web**: Video element is created via JavaScript in `app/_layout.tsx` (outside React lifecycle) and inserted into `document.body`. This persists across React re-renders.

**Native**: Uses expo-av `<Video>` component in `_layout.tsx`.

Sound is controlled via `settings.soundEnabled` in the game store.

### Game Engine (`lib/engine.ts`)

- `drawItem(isWeekendMode)` - Returns prize grade based on probability
- Weekday vs Weekend have different probability configs
- Prize grades: `1st`, `2nd`, `3rd`, `lose`

### State Management (`store/gameStore.ts`)

Zustand store with AsyncStorage persistence. Key state:
- `currentScreen` - Navigation state
- `quota` - Daily prize limits (resets with `resetDailyQuota()`)
- `history` - Draw history with timestamps
- `settings` - autoStopOnEnd, soundEnabled
- `isWeekendMode` - Different probabilities for weekdays/weekends

### Responsive Design (`hooks/useResponsive.ts`)

- `s(size)` - Scale size based on viewport (max 1.5x)
- `fs(size)` - Font scale (more conservative, max 1.3x)
- `isTablet`, `isLargeScreen` - Breakpoint flags

## Project Structure

```
app/
├── _layout.tsx     # Root layout, video background management
├── +html.tsx       # HTML shell for web
└── index.tsx       # State-based screen router

components/
├── ScreenLayout.tsx    # Common layout with settings button
├── SettingsModal.tsx   # Settings modal
├── GameButton.tsx      # Pixel-style button
└── screens/
    ├── HomeScreen.tsx  # Start screen with probability display
    ├── GameScreen.tsx  # Draw animation (3 second timer)
    └── ResultScreen.tsx # Prize result display

store/gameStore.ts  # Zustand state management
lib/engine.ts       # Draw probability logic
constants/colors.ts # Pixel art color palette
hooks/useResponsive.ts # Responsive sizing utilities

public/background.mp4   # Web background video
assets/images/          # Native assets
```

## Key Implementation Notes

- All screens use pixel art visual style with custom `PixelBox` components
- Colors defined in `constants/colors.ts` (brown/cream/gold palette)
- GameScreen auto-navigates to ResultScreen after 3 seconds
- 3rd place winners must select a bagel flavor before confirming
- Settings button hidden on GameScreen and ResultScreen via `showSettings={false}`
