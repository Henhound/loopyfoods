# Hot Lunch Autobattler - Prototype Specification

_(Single source of truth for ChatGPT & dev notes)_

---

## 0. TL;DR

- Game type: Turn-based autobattler inspired by Super Auto Pets, The Bazaar, and Balatro. Theme: chaotic school cafeteria lunch rush with a Hot Lunch Tray and a Lunch Line of kids.
- Core loop: Shop (draft kid first) -> Lunch Time saves a local snapshot and selects an opponent -> Battle (step or fast forward) -> Back to Shop with next-round stats and gold reset.
- Goal: Ship a playable frontend-only prototype to validate fun before backend work.
- Tech stack: React + TypeScript + Vite. Drag-and-drop via @dnd-kit; in-memory navigation (`NavigationProvider`) with no URL routing.
- Lunch Line: Unlimited slots, kids persist for the run, can be reordered, and cannot be sold/removed.
- Opponents: Pulled from locally saved team snapshots; Team Manager lets you browse/delete/clear these.
- Battle engine: Simplified star-point eater. Kids eat foods that match their single preferred type on a fresh tray; abilities are stubbed and not yet implemented.

---

## 1. Game Flow

1. **Main Menu** - CTA to Play (Shop flow) plus access to the Team Manager.
2. **Shop** - Start each shop with 10 gold and a fixed 5-slot tray. Draft exactly one kid from 3 options (tap Add or drag into the Lunch Line) before any shopping; this locks kid picks for the round and unlocks the Food Shop/rerolls/Lunch Time. Buy foods for $3 by dragging from the shop into empty tray slots; sell tray foods for $1. Reorder tray foods and kids via drag-and-drop. Reroll costs $1 flat and refreshes the Food Shop (and the kid options only if you haven't drafted yet). Storage button remains disabled.
3. **Lunch Time / Battle entry** - Pressing Lunch Time saves a local snapshot (tray, kids, round, HP, trophies), selects a random stored opponent (preferring the same round, excluding your new snapshot), and navigates to Battle. If no snapshot exists, the opponent panel is empty.
4. **Battle** - Step through turns with the "1 step" button or auto-advance with Fast forward (1s cadence); Reset battle rebuilds state from the initial payload. Kids eat fresh trays of matching foods; Star Points display for both sides with a running log.
5. **Results / Return** - After the battle ends, Back to the shop returns to Shop with round +1, trophies +1 on win (capped at 10), health -1 on loss (floored at 0), and no change on ties. Gold resets to 10 each shop visit.
6. **Game End** - Player starts with 5 health. Reach 10 trophies to win; hit 0 health to lose. All opponents are local placeholders via snapshots.

---

## 2. Game Overview

- **Food Cards** - Single-type placeholders with a base Star Point value and a display color. No categories or multi-type foods in this prototype.
- **Food Types** - Meat, Starch, Sweet, Veggie, Gross.
- **Hot Lunch Tray** - Fixed 5 slots (4 squares + 1 rectangle). Every kid receives a fresh tray copy; consumption is per-kid.
- **Lunch Line & Kids** - Kids have one preferred food type. The Lunch Line has no cap, kids persist across rounds, can be reordered freely, and cannot be sold/removed.
- **Star Points** - Sole scoring currency; eating a food grants its `baseStarValue`. No other effects are implemented yet.
- **Abilities** - Popovers show placeholder details; on-eat/reaction systems are conceptual only.

---

## 3. User Interface

- **Navigation** - Mobile-first, single-screen stack using `NavigationProvider` helpers (`navigate`, `replace`, `back`, `reset`); no URL routing.
- **Cards/Kids** - Small sprites with selection-driven popovers (`CardPopover`); dismiss via outside click/close.

### Shop Screen

- **Layout**
  - Top bar with Back and stats (Gold, HP, Trophies, Round).
  - **Lunch Line** row of reorderable kid tokens plus a persistent empty drop slot.
  - **Hot Lunch Tray** fixed grid beneath (3x2 with final rectangle).
  - **Pick Kid** panel shows 3 random kid options. Draft exactly one per round (tap "Add" or drag into Lunch Line). Once drafted, the panel locks and the Food Shop appears.
  - **Food Shop** shows 5 cards after drafting. Storage button remains present but disabled.
- **Interactions**
  - Drag shop food -> empty tray slot to buy (costs $3).
  - Drag tray food <-> tray food to swap.
  - Drag kid <-> kid to reorder; drag kid option into Lunch Line to draft/insert.
  - Food purchasing, reroll, sell, and Lunch Time are disabled until a kid is drafted that round.
- **Buttons & Indicators**
  - Lunch Time CTA (enters battle), Sell (selected tray food → +$1), Storage (disabled), Reroll ($1 flat; also refreshes kid options only before drafting).

### Battle Screen

- Opponent summary shows their tray, Lunch Line, star points, and consumption highlights; empty state if no snapshot exists.
- Player board mirrors tray + Lunch Line with active slot/kid highlighting.
- Controls: Back, 1 step, Fast forward toggle, Reset battle. Mini stats show Round/HP/TR/Fast forward state. Battle log lists bites with step numbers and teams. Back-to-Shop CTA appears when ended.

### Team Manager Screen

- Accessible from Main Menu. Lists saved team snapshots (ID, timestamp, round/HP/TR, tray, kids). Supports per-entry delete, Clear All, and Refresh. CTA back to Shop.

---

## 4. Battle Logic

- Battles auto-prepare on entry; no mid-battle input beyond stepping/fast-forward/reset.
- **Turn resolution**
  - Both teams share a step counter. Each step finds the next uneaten matching food for the current kid (foodType equality) on that kid's tray. Each team may take a bite per step.
  - Eating marks the food consumed for that kid, adds its `baseStarValue` to that team's Star Points, and logs the event. Foods trigger once per kid. After finishing matches, advance to the next kid with a fresh tray (consumption resets between kids).
  - If a team has no remaining bites, it marks done; the other team may continue solo.
- **Round end**
  - When both teams are done, winner is the higher Star Point total; ties allowed.
  - Battle screen previews post-round stats; returning to Shop applies win +1 trophy (cap 10), loss -1 health (min 0), tie no change.

---

## 5. Economy and Shops

- Gold: Always 10 at the start of a Shop visit; no carryover between rounds.
- Costs: Food $3; Sell returns $1 (tray only); Reroll $1 flat.
- Kid drafting: Mandatory once per round; drafting is free. Draft before any shopping actions. Kids persist and cannot be sold.
- Shops: Food Shop shows 5 cards; Pick Kid shows 3 options. Reroll refreshes Food Shop and, only if not drafted yet, the kid options. Storage flow remains future work and is UI-disabled.

---

## 6. Team Snapshots & Opponents

- On Lunch Time, the current team is saved to localStorage (`loopyfoods:teamSnapshots:v1`) with id, timestamp, round, health, trophies, tray, and kids. Up to 30 snapshots are kept (newest first).
- Opponent selection pulls a random snapshot excluding the current id and preferring the same round; if none exist, the opponent panel is empty and star points remain `--`.
- Team Manager reads/writes the same storage, allowing delete/clear/refresh. Used for both opponent seeding and player debugging.

---

## 7. Project Folder Structure

```
loopyfoods/
  docs/
    hot-lunch-autobattler_spec.md
  src/
    App.css
    index.css
    main.tsx
    app/
      App.tsx
      gameConfig.ts
      navigation.tsx
      screen.ts
      teamStorage.ts
    components/
      CardPopover.tsx
      FoodTypeBadge.tsx
      dnd/
    data/
      placeholder-food-cards.ts
      placeholder-kid-cards.ts
    screens/
      MainMenu.tsx
      Shop.tsx
      Battle.tsx
      TeamManager.tsx
    styles/
      globals.css
      shop.css
```
