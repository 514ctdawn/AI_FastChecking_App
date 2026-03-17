# VeriSenior

**Helping Your Loved Ones See the Truth**

An AI-powered fact-checking app designed for senior citizens to identify misinformation on social media. Built with accessibility as a priority — large typography, high contrast, and simple navigation.

## Features

### Mobile App (Fact-Checking / Community)
- **Home Feed**: Recent verifications with True/False/Caution status badges
- **Check This for Me**: Prominent FAB to submit content for fact-checking (photo or voice)
- **Fact-Check Result Page**: Clear green/red indicators, plain-language explanations, voice playback
- **Knowledge Library**: Browse verified topics by category (Health, Finance, Social)
- **Tutorial Simulation**: Practice tagging @VeriSenior in a fake social media feed

## Design Principles

- **Accessibility First**: 18px+ body text, high-contrast (Deep Navy & White), large touch targets (44px min)
- **Visible Navigation**: Bottom nav with text labels — no hamburger menus
- **Color as Feedback**: Green = Safe, Red = Dangerous, Orange = Caution
- **Plain Language**: Simple explanations, no jargon

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Lucide React (bold, thick-stroked icons)
- React Router

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

- **App**: `/`
- **Fact-Check Result**: `/result/1` (or 2, 3, 4 for sample results)

## Project Structure

```
src/
├── pages/
│   ├── MobileApp.jsx      # Main app with feed, library, tutorial
│   └── FactCheckResult.jsx # Individual fact-check details
├── data/
│   └── mockData.js        # Sample verifications & library
├── App.jsx
├── main.jsx
└── index.css
```
