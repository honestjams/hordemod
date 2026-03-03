# CLAUDE.md — AI Assistant Guide for hordemod

This file provides context, conventions, and workflows for AI assistants (such as Claude) working in this repository.

---

## Project Overview

**Repository:** `honestjams/hordemod`
**Type:** Warhammer 40,000 companion web app — single-page React application

`hordemod` is a digital companion for the **Horde Mode** cooperative game variant for Warhammer 40K (10th Edition). It replaces physical card draws, manual dice rolling, and score tracking during play sessions.

### What it does

Players set up a game (size, faction, player count), then the app tracks:

- **Battle rounds** (5 normal / 6 hard mode)
- **Misery Cards** — random negative events drawn each round that buff the Horde
- **Secondary Missions** — per-round objectives with rewards and punishments
- **Secret Objectives** — hidden personal win conditions dealt to each player
- **Supply Points (SP) and Command Points (CP)** — per-player resource tracking
- **Resupply Shop** — SP-cost purchases like Air Strikes, Fortifications, Tactics cards
- **Spawn Roller** — 2D6 + round modifier dice roller with result bracket display

### Supported factions

21 Warhammer 40K factions, each with a unique Horde Faction Rule applied globally to the enemy Horde army.

---

## Repository Structure

```
hordemod/
├── src/
│   └── App.jsx         # Entire application — all components, data, and logic
├── README.md           # Project title placeholder
└── CLAUDE.md           # This file
```

> The app is currently a single-file React component. As it grows, extract components and data into separate files under `src/`.

**Suggested future structure:**
```
src/
├── data/
│   ├── factions.js         # FACTIONS, HORDE_FACTION_RULES
│   ├── miseryCards.js      # MISERY_CARDS
│   ├── secondaryMissions.js
│   ├── secretObjectives.js
│   └── resupplyOptions.js  # RESUPPLY_OPTIONS
├── components/
│   ├── Card.jsx
│   ├── Button.jsx
│   ├── PlayerCard.jsx
│   ├── MiseryCard.jsx
│   ├── SecondaryCard.jsx
│   └── SpawnRoller.jsx
├── screens/
│   ├── SetupScreen.jsx
│   └── GameScreen.jsx
├── utils/
│   └── dice.js             # shuffle, rollD6, roll2D6
└── App.jsx                 # Root component / phase controller
```

---

## Tech Stack

| Technology | Role |
|------------|------|
| React 18 | UI framework (hooks: `useState`, `useCallback`, `useMemo`) |
| lucide-react | Icon library (`Skull`, `Trophy`, `Dices`, `Plus`, `Minus`, etc.) |
| Tailwind CSS | Utility-first styling (dark theme: `bg-gray-900`, `text-purple-400`, etc.) |
| JSX | Component templating |

> No `package.json` is committed yet. The project likely targets Vite + React. Add `package.json` and tooling setup when scaffolding the project.

**Expected dev dependencies (to be added):**
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## Development Setup

> Update this section once `package.json` and tooling are committed.

```bash
npm install
npm run dev     # Start dev server (Vite)
npm run build   # Production build
npm run preview # Preview production build locally
```

---

## Code Architecture

### State management

All state lives in `HordeModeApp` (root) and is passed down:

```
HordeModeApp
├── gamePhase: 'setup' | 'game'
├── gameState: { round, players[], hardMode, hordeFaction, ... }
│
├── SetupScreen      — local UI state only (form inputs)
└── GameScreen       — receives gameState, calls onUpdateState(newState)
    ├── SpawnRoller  — local dice result state
    ├── PlayerCard   — display only
    ├── MiseryCard   — display only
    └── SecondaryCard — display + complete/fail callbacks
```

**Pattern:** GameScreen receives the full `gameState` object and calls `onUpdateState({ ...gameState, <changed fields> })` to update. Never mutate state in place — always spread and override.

### Game data

All game data is declared as top-level constants:

| Constant | Count | Description |
|----------|-------|-------------|
| `FACTIONS` | 21 | Playable faction names |
| `HORDE_FACTION_RULES` | 21 | Per-faction passive rule objects `{ name, effect }` |
| `MISERY_CARDS` | 32 | Cards with `{ id, name, effect }` |
| `SECONDARY_MISSIONS` | 20 | Objectives with `{ id, name, condition, reward, punishment }` |
| `SECRET_OBJECTIVES` | 30 | Hidden objectives with `{ id, name, condition, tags[] }` |
| `RESUPPLY_OPTIONS` | 20 | Shop items with `{ cost, name, effect, tags[] }` |

### Decks / shuffling

Misery and Secondary decks are shuffled at game start and consumed from the front. When a deck runs out, it is reshuffled from the full set:

```js
// Drawing from misery deck
const drawn = miseryDeck.slice(0, count);
const remaining = miseryDeck.slice(count);
// If remaining is empty, reshuffle full set
miseryDeck: remaining.length > 0 ? remaining : shuffle(MISERY_CARDS)
```

### Spawn Roll logic

`SpawnRoller` computes two separate modifiers:
- **`baseModifier`**: derived from current round + hard mode flag
- **`spawnModifier`**: accumulated adjustments from Misery cards / Secondary outcomes

An unmodified roll of 2 always means "No Spawn" regardless of modifiers.

**Brackets:**

| Result | Bracket |
|--------|---------|
| 2 (unmodified) | No Spawn |
| 3–4 | ~75 pts or less |
| 5–6 | 80–170 pts |
| 7–9 | 175–295 pts |
| 10+ | 300+ pts |

---

## UI Conventions

### Tailwind color semantics

| Color | Meaning |
|-------|---------|
| `purple-*` | Primary brand / active state |
| `red-*` | Misery / danger / Horde buffs |
| `yellow-*` | Supply Points / Secondary missions |
| `blue-*` | Command Points |
| `green-*` | Success / rewards |
| `gray-*` | Backgrounds, inactive, neutral |

### Shared components

`Card` and `Button` are the two base primitives.

**`Card`** — wraps content in a dark rounded panel. Optional `onClick` enables hover effect.

**`Button`** — accepts `variant` (`primary` | `secondary` | `danger` | `success` | `ghost`), `size` (`sm` | `md` | `lg`), and `disabled`.

Both are inline/co-located in `App.jsx`. Extract to `src/components/` when the file grows.

---

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `claude/<session-id>` | AI-generated changes (auto-named) |

### Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(spawn): add hard mode spawn modifier ramp
fix(resupply): prevent SP going below 0 on purchase
refactor(data): extract game constants to separate files
chore: add package.json and Vite config
```

### Push instructions

```bash
git push -u origin <branch-name>
```

AI branches follow the pattern `claude/<session-id>` — incorrect names result in 403 errors.

---

## Testing

> No test suite exists yet. Add when first tests are written.

**Suggested approach:**
- Unit test `shuffle`, `rollD6`, `roll2D6` utilities
- Unit test `getSpawnModifier` / `getBracket` logic in `SpawnRoller`
- Integration test game state transitions (setup → game → round advance → end)
- Consider Vitest + React Testing Library

---

## AI Assistant Guidelines

### General behavior

- Read files before editing — never assume content
- Prefer editing existing files over creating new ones
- Only make changes directly requested or clearly necessary
- Do not refactor, add docstrings, or clean up surrounding code unless asked
- Do not introduce speculative error handling for scenarios that cannot occur

### Working with this codebase

- All game data lives in top-level constants — add new cards/options there directly
- State updates must always spread the full `gameState` object: `{ ...gameState, field: newValue }`
- SP and CP values are bounded to `>= 0` via `Math.max(0, ...)` — preserve this behavior
- The `shuffle` utility returns a new array (non-mutating) — always use it that way
- `roll2D6()` returns an integer 2–12; unmodified 2 is a special "No Spawn" case

### Security

- This is a client-side only app — no backend, no auth, no user data stored
- Do not introduce external API calls or persistent storage unless asked
- Do not commit `.env` files or any credentials

### Git operations (AI-specific)

- Always develop on the designated `claude/` branch
- Use `git push -u origin <branch-name>` for all pushes
- On network failure, retry up to 4 times with exponential backoff: 2s → 4s → 8s → 16s
- Never push to `main` without explicit user permission

### Risky actions — confirm before proceeding

- Deleting files or branches
- Force-pushing or `git reset --hard`
- Adding persistence (localStorage, IndexedDB, API)
- Adding dependencies not already listed in this file

### What NOT to do

- Do not create new files unless strictly necessary
- Do not add unused imports, helpers, or abstractions
- Do not rename things "for clarity" without being asked
- Do not use `--no-verify` to skip hooks unless explicitly instructed
- Do not guess or fabricate URLs

---

## Frequently Used Commands

```bash
# Git
git status
git log --oneline -10
git fetch origin main
git checkout -b feature/<name>
git push -u origin <branch-name>

# Dev (once package.json is added)
npm install
npm run dev
npm run build
```

---

## Updating This File

Update this file whenever:
- The tech stack or tooling changes
- New development conventions are agreed upon
- Build, test, or lint commands are added
- The component/file structure changes significantly
- New game mechanics or data sets are added

Keep it accurate and concise — it is the primary reference for AI assistants working in this codebase.
