# VeriSenior App

AI-powered fact-checking app for elderly users. Built with Expo (React Native) and TypeScript.

## Stack

- **Framework**: Expo (React Native) - cross-platform iOS/Android/Web
- **Language**: TypeScript
- **UI**: StyleSheet with VeriSenior design tokens (Tailwind config included for NativeWind when desired)

## Setup

```bash
cd VeriSeniorApp
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your physical device.

For web: `npx expo install react-native-web react-dom` then `npx expo start --web`

## Project Structure

```
VeriSeniorApp/
├── App.tsx           # Main app with verification feed, FAB, bottom nav
├── src/
│   ├── types.ts      # VerificationItem, VerificationStatus
│   └── theme.ts      # Design tokens (colors)
├── tailwind.config.js # For NativeWind (optional)
└── package.json
```

## Features

- **Verification Feed**: Cards with headline, status badge (真實/不實/注意), and meta (source • time)
- **Floating CTA**: "幫我查核這個" - placeholder for screenshot/voice submission
- **Bottom Navigation**: 主頁, 查核庫, 使用教程 (tab switching)
- **Mock Data**: Hardcoded verifications for immediate preview

## Connecting a Real Backend

Replace the `useEffect` in `App.tsx` with an API call:

```typescript
useEffect(() => {
  async function fetchVerifications() {
    try {
      const response = await fetch('https://your-api.com/api/v1/verifications');
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to fetch', error);
      setVerifications(MOCK_VERIFICATIONS); // fallback
    }
  }
  fetchVerifications();
}, []);
```

## Adding NativeWind (Tailwind for RN)

To use Tailwind classes via NativeWind:

```bash
npm install nativewind tailwindcss
```

Then add `nativewind/babel` to `babel.config.js` and configure Metro. See [NativeWind docs](https://www.nativewind.dev/) for the latest setup.
