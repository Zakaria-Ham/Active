<div align="center">

<img src="./assets/images/ActvTransparent.png" width="120" alt="Actv logo" />

# Actv

**Plan your day. Track your activities. See them on the map.**

A local-first React Native (Expo) app that combines a task manager, a day/week/month schedule, and a live map — all built around sport, study, and daily activities.

Built by **RedLabs**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [🏠 Home](#-home)
  - [🗓️ Schedule](#️-schedule)
  - [✅ Tasks](#-tasks)
  - [🗺️ Map](#️-map)
  - [⚙️ Settings](#️-settings)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the app](#running-the-app)
  - [Linting](#linting)
  - [Building with EAS](#building-with-eas)
- [How to Use the App](#how-to-use-the-app)
- [Privacy & Data Storage](#privacy--data-storage)
- [Permissions](#permissions)
- [License](#license)

---

## Overview

**Actv** is a mobile-first activity planner for people who juggle sport, study, and personal tasks in one day. Instead of splitting your life across a to-do app, a calendar, and a maps app, Actv puts them in one place:

- Add a task once — give it a name, time, place, and category.
- See it appear instantly on your **Home** feed, in your **Schedule**, in your **Tasks** list, and pinned on the **Map**.
- Everything is stored **locally on your device** — no account, no sign-up, no server sync.

The app is built with **Expo Router**, **TypeScript**, and **NativeWind (Tailwind for React Native)**, and ships as a single codebase for iOS, Android, and Web.

## Features

### 🏠 Home

The landing tab is a live "what's happening" dashboard:

- A **featured card** shows either your **current** activity (with a live countdown, e.g. `1h 20m left`) or your **next upcoming** one — you choose which via the *Show Current / Show Next* toggle.
- A swipeable pager lets you flick between the current and the next task when both exist.
- A **category filter** (`All / Sport / Study / Activity`) narrows down the rest of today's agenda.
- **Today** and **Tomorrow** sections list the rest of your tasks with time, place, priority indicator, and completion checkbox.
- Tasks refresh automatically every 30 seconds so countdowns and "current task" detection stay accurate.

### 🗓️ Schedule

A full calendar view of your activities with three modes:

- **Day view** — an hour-by-hour timeline (configurable start hour) showing tasks as colored blocks positioned by time.
- **Week view** — a 7-day grid with week-number display and day navigation.
- **Month view** — a classic month grid with task indicators per day.
- Tap any task to open its details; tap an empty slot to create a new one.
- Navigate between periods with the previous/next arrows.

### ✅ Tasks

A dedicated task manager for anyone who wants a flat, filterable list instead of a calendar:

- **Filter** by category (Sport / Study / Activity).
- **Sort** by time, priority, or name.
- Tasks are grouped by date, with a friendly label (`Today`, `Tomorrow`, or the full date).
- Each task card shows priority (color dot), category (color bar), place, and time range.
- Tap to **edit**, **delete**, or **mark as done**.
- The floating **+** button (available on every tab except Settings) opens the same "Add Task" form used throughout the app.

### 🗺️ Map

An interactive, live map for spatial awareness of your day:

- Built on **Leaflet + OpenStreetMap** rendered inside a WebView (fast, no API key required).
- Shows your **live location** with continuous GPS tracking (`expo-location`).
- **Search for a place** by name and jump the map to it.
- **Pin tasks** that have a location directly on the map; tap a marker to see task details.
- Toggle visibility of **completed** and **future** tasks on the map (configurable in Settings).
- Tap anywhere on the map to drop a location and create a new task there — perfect for logging a running route, a gym, or a study spot.
- Supports **hiking/trail-style** tasks with a "from → to" trail range (`trailFrom` / `trailTo`).

### ⚙️ Settings

Full control over how the app looks and behaves:

- **Appearance** — light/dark mode toggle (also follows the system theme by default) and a custom **accent color** picker.
- **Home** — choose whether the Home tab defaults to showing your *current* or *next* task.
- **Map** — toggle whether completed and future tasks appear as map pins.
- **Location** — save three quick-access places: **Home**, **Work**, and **Pitch** (your usual sport spot), each settable via GPS or by picking a point on the map.
- **Schedule** — set the hour your day starts in the Day/Week schedule view.
- **Language** — language picker (in progress).
- **Feedback** — a direct link to send bug reports and suggestions.
- **Legal** — in-app Privacy Policy and Terms of Use.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 57 + [React Native](https://reactnative.dev) 0.86 |
| Language | TypeScript |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Styling | [NativeWind](https://www.nativewind.dev) (Tailwind CSS) + StyleSheet |
| Local storage | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (tasks & settings) + `AsyncStorage` (theme) |
| Maps | [Leaflet.js](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org) tiles inside `react-native-webview` |
| Location | [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) |
| Icons | [FontAwesome](https://fontawesome.com) (via `@fortawesome/react-native-fontawesome`) + `@expo/vector-icons` |
| Navigation UI | `@react-navigation/drawer`, custom bottom tab bar |
| Fonts | Google Fonts — Bungee & Inter (`@expo-google-fonts`) |
| Calendars | `react-native-calendars` |
| Animations | `react-native-reanimated` + `react-native-worklets` |
| Build & Deploy | [EAS](https://docs.expo.dev/eas/) (`eas.json`) |

## Project Structure

```
Active/
├── app.json                  # Expo app config (name, icons, permissions, plugins)
├── eas.json                  # EAS Build profiles
├── package.json
├── assets/
│   └── images/                # App icons & logos (Actv branding)
└── src/
    ├── app/                    # Expo Router screens (file-based routing)
    │   ├── _layout.tsx           # Root layout — tab bar, providers, floating "+" button
    │   ├── index.tsx              # Home tab
    │   ├── Schedule/Schedule.tsx  # Day / Week / Month calendar
    │   ├── Tasks/Tasks.tsx        # Filterable, sortable task list
    │   ├── Map/Map.tsx            # Leaflet map + geolocation + task pins
    │   └── Settings/
    │       ├── index.tsx           # Main settings screen
    │       └── nestedLegals.tsx    # Privacy Policy & Terms of Use
    ├── components/
    │   ├── addTaskModel.tsx      # Add/Edit Task modal (shared across tabs)
    │   ├── mapTaskDetails.tsx    # Task detail popup on the map
    │   └── taskWidget.tsx        # Reusable task card widget
    ├── context/
    │   └── appContext.tsx        # Global app state: tasks, settings, CRUD actions
    ├── data/
    │   └── localDatabase.ts      # SQLite read/write layer
    ├── themeContext.js           # Light/dark theme provider
    └── types.ts                  # Shared TypeScript types (Task, AppSettings, ...)
```

## Data Model

Everything in Actv revolves around a single `Task` type, stored as JSON inside SQLite:

```ts
interface Task {
  id: string;
  name: string;
  description: string;
  date: string;            // YYYY-MM-DD
  place: string;
  timeStart: string;       // HH:mm
  timeEnd: string;         // HH:mm
  category: "sport" | "study" | "activity";
  sportType?: "swim" | "run" | "football" | "gym" | "hike" | "custom";
  sportCustomName?: string;
  trailFrom?: string;       // for hikes/routes
  trailTo?: string;
  studyType?: "elementary" | "middle" | "high" | "uni" | "personal";
  priority: "high" | "medium" | "low";
  color: string;
  done: boolean;
  lat: number;
  lng: number;
}
```

App-wide preferences live in a matching `AppSettings` object (theme accent color, home mode, map toggles, saved Home/Work/Pitch locations, schedule start hour, language).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- npm (bundled with Node)
- The [Expo Go](https://expo.dev/go) app on your phone, **or** Android Studio / Xcode for a native simulator
- A physical device or emulator with location services enabled (for the Map tab)

### Installation

```bash
git clone https://github.com/Zakaria-Ham/Active.git
cd Active
npm install
```

### Running the app

```bash
# Start the Metro bundler / dev server
npx expo start

# Or target a platform directly
npm run android   # Android emulator / device
npm run ios       # iOS simulator (macOS only)
npm run web       # Web browser
```

From the Expo CLI output you can:

- Scan the QR code with **Expo Go** on your phone
- Press `a` to open an Android emulator
- Press `i` to open an iOS simulator
- Press `w` to open in a web browser

> **Note:** Since the app uses native modules (`expo-sqlite`, `expo-location`, `react-native-webview`, maps), a **development build** (`expo-dev-client`) is recommended over the plain Expo Go sandbox for full functionality.

### Linting

```bash
npm run lint
```

### Building with EAS

The project is preconfigured for [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas login
npx eas build --platform android   # or ios / all
```

Build profiles (development, preview, production) are defined in `eas.json`.

## How to Use the App

1. **Add your first activity** — tap the floating **+** button on any tab (Home, Schedule, Tasks, or Map).
2. Fill in the task **name**, **category** (Sport / Study / Activity), **date & time**, **place**, and **priority**. For sports, pick a type (swim, run, football, gym, hike, or custom); for hikes, set a trail start/end; for study, pick the level.
3. Check the **Home** tab to see it appear as "Up Next" or "Now", depending on the time.
4. Open **Schedule** to see it positioned on the day timeline, or switch to Week/Month for a broader view.
5. Open **Map** to see the task pinned at its location, alongside your live position.
6. Head to **Settings** to set your **Home**, **Work**, and **Pitch** locations once, so future tasks can reuse them, and to pick your favorite **accent color** and **theme**.
7. Mark tasks as done with the checkbox — completed tasks stay visible (optionally) on the map and in Tomorrow/Today lists with a strikethrough.

## Privacy & Data Storage

Actv is designed to be **local-first and account-free**:

- No sign-up, no login, no user accounts.
- All tasks and settings are stored **on your device only**, in a local SQLite database — nothing is sent to a remote server.
- Location access is used **only** to show your position and record activity locations on the map; it is never transmitted anywhere.
- Uninstalling the app deletes all local data.

The full Privacy Policy and Terms of Use are available in-app under **Settings → Legal**.

## Permissions

| Permission | Why it's needed |
|---|---|
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` (Android)<br>Location When In Use / Always (iOS) | To show your live position on the Map and let you tag tasks with a location |

## License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Made for the love of the game by **RedLabs** · [redled.fx](https://github.com/Zakaria-Ham)

</div>
