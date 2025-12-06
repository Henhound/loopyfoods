# LoopyFoods - Autobattler Prototype Specification

_(Single source of truth for ChatGPT & dev notes)_

---

## 0. TL;DR

- Game type: Turn-based autobattler inspired by Super Auto Pets, The Bazaar, and Balatro. Theme: school cafeteria lunch time. Judges are school students (still called "Judges").
- Core loop: Shop + Arrange + Battle + Repeat.
- Goal: Playable prototype to validate fun before backend work.
- Tech stack: React + TypeScript + Vite (frontend only). Drag-and-drop in Shop via @dnd-kit; selection/click fallback optional. In-memory navigation (NavigationProvider); no URL routing.y
- Judges in prototype: Placeholder judge cards are wired into the Shop UI (Judge Shop + 3 Judge slots). Drag-and-drop to place/swap is implemented; no judge effects or economy yet.
- Out of scope (for now): Firebase, accounts, leaderboards, persistence. Opposing players are placeholders for the prototype.

---

## 1. Game Flow

1. Main Menu - shows a "Play" button.
2. Shop Screen - player can buy/sell food cards and judge cards, and arrange the Food Loop Tray. Higher-tier cards unlock as rounds progress.
3. Battle Screen - player is paired with an opponent; the battle plays out automatically. First to hit their Star Point Target wins.
4. Results - show win/loss/draw, then return to Shop for the next round.
5. Game End - player starts with 5 lives. Wins grant a trophy; losses cost a life. Reach 10 trophies to win; lose 5 lives to lose the game.

---

## 2. Game Overview

- Food Card: Has a shop cost, charge time, category tags, tier, and abilities.
- Food Loop Tray: Player arranges an ordered sequence of food cards that activate sequentially in a loop during battle. The loop is themed as a cafeteria tray with numbered compartments indicating activation order. Starts with 5 compartments; can be upgraded via an "Upgrade Tray" button in the shop up to a maximum of 9 compartments.
- Card Categories: Used for certain abilities (e.g., Mexican, Asian, Italian, Fast Food, Delicacy).
- Types of Points: Abilities generate various points (e.g., Savory). Certain effects convert points into Star Points.
- Abilities: Two types
  - Basic: activate when the card's turn in the loop reaches its charge time (e.g., "+5 Savory Points").
  - Triggered: activate on a trigger (e.g., "Whenever a Mexican Food Card activates, gain +1 Savory Points").
- Judges: Separate card type placed into Judge slots (fixed at 3 slots). Judges convert other points into Star Points and/or modify targets. Judges can have charge times or triggers and may activate at different times, not only at loop end.

---

## 3. User Interface

- Mobile-first: Playable one-screen experience in vertical orientation. No URL routing required.
- Navigation: In-memory stack via a NavigationProvider with helpers `navigate`, `replace`, `back`, and `reset`. No URLs or browser history; mobile-app style navigation.
- Cards: Small square sprites; tap/click to select. Selected items are highlighted and their details appear in contextual pop-ups (modal overlays); there is no fixed info panel.
- Shop Screen: Top half shows the player's Food Loop Tray (numbered compartments) and 3 Judge slots. Bottom half shows the shops: Food Shop (5 cards visible) and Judge Shop (2 cards visible). The Storage view (6 slots) replaces the shop lists when toggled.
  - Interactions:
    - Drag-and-drop (primary):
      - Shop -> Tray: Drag a Food Shop card onto an empty Tray slot to buy/place it (deduct gold if affordable). Dropping onto an occupied Tray slot is ignored.
      - Tray <-> Tray: Drag a Tray card onto any Tray slot to move it; dropping onto an occupied slot swaps the two cards.
      - Judges: Drag a Judge Shop item onto an empty Judge slot to place it. Drag between Judge slots to reorder; dropping onto an occupied slot swaps. Judge Shop item removal on place is wired. (Prototype note: no gold/economy yet.)
      - Storage: Dragging to/from Storage is not yet implemented in the prototype.
    - Selection-based fallback (secondary / planning):
      - Buy to Storage (auto-place): Select a shop card, then click the Storage button. If Storage has an empty slot, place it in the next available slot and deduct gold; if full, show an error and abort purchase.
      - Tray <-> Storage (auto-place): Select a Tray card, then click the Storage button to place it in the next available Storage slot if any; abort if full.
      - Storage <-> Tray: With Storage visible, select a Storage item, then click a Tray slot to move or swap.
      - Sell: Select a Tray or Storage item and click the Sell button to sell it for the current sell value.
  - Drag-and-drop (dev notes): Pointer sensor with a small activation distance reduces accidental drags; tray slots are droppable targets. A drag overlay mirrors the card under the pointer, with size adjustments for the rectangular tray slot to keep visuals aligned; default return animation is disabled to avoid snap-back on valid drops.
  - Card Info Pop-ups: The fixed Selection Info Zone panel is removed. When a card or slot is selected, show a pop-up with full details (stats, abilities, cost, tags, tier; judge abilities for judges). Pop-ups dismiss via backdrop tap, a close control, or navigation back.
  - Food Loop Tray UI: The tray renders inside a fixed aspect-ratio viewport that scales to available space to avoid clipping; compartments are laid out as a responsive 3x2 grid (four square slots and one rectangular slot spanning two columns).
  - Buttons and indicators:
    - Gold, round, lives, trophies.
    - Reroll: rerolls both shops. Cost starts at $1 each shop phase and increases by +$1 per subsequent reroll during that phase; resets to $1 after each battle.
    - Storage: toggles the Storage view. When active, the shop lists are hidden and a 6-slot Storage grid is shown. Items in Storage persist between battles but have no effect during battles.
    - Upgrade Tray: spend gold to increase tray compartments by 1, up to 9. Exact cost TBD via playtesting.
- Battle Screen: Opponent on top, player on bottom. Shows Food Loop Trays and Judges for both. Indicators highlight activations and charge progress. Displays point totals for all types and each player's Star Point Target.

---

## 4. Battle Logic

- Battles auto-play on entering the Battle screen; player cannot interact or rearrange during battle.
- Points and targets: Both players start at 0 points. The base Star Point Target is 100 for all players. Certain effects from cards or judges can lower a player's target or raise an opponent's target.
- Food Loop sequencing:
  - Exactly one food card charges at a time, in compartment order.
  - Card 1 charges until it reaches its charge time, then activates. Then Card 2 begins charging and activates, and so on. After the final card, loop back to Card 1 and repeat.
- Judges:
  - Judges may activate on their own charge times or triggers (e.g., after a food activation, on point thresholds, periodically). They do not only activate at loop end.
- Win/timeout conditions:
  - A player wins immediately upon reaching or exceeding their current Star Point Target.
  - If 20 seconds elapse: highest Star Points wins; ties result in no trophy gained and no life lost.

---

## 5. Economy and Shops

- Starting gold: Player receives $10 at the beginning of every shop phase (round). Unspent gold carries over after a battle.
- Prices (initial, subject to playtesting):
  - Food cards: start at $3 at low tiers; higher-tier foods may cost more.
  - Judges: TBD via playtesting.
  - Upgrade Tray: TBD via playtesting.
  - Sell value: TBD via playtesting (e.g., half of purchase cost rounded down).
- Shop details:
  - Food Shop shows 5 food cards at a time.
  - Judge Shop shows 2 judges at a time.
  - Reroll affects both shops together and follows the increasing cost rule described above.
  - Storage system:
    - 6-slot Storage accessible via the Storage button on the Shop screen.
    - Items in Storage persist between battles, have no effect during battles, and do not trigger abilities.
    - Buy into Storage (auto-place): select a shop card, then click the Storage button. If a slot is available, the item is placed in the next available slot and gold is deducted; if full, show an error and abort.
    - Tray <-> Storage (auto-place): select a Tray card, then click the Storage button to place it in the next available Storage slot if any; abort if full.
    - Storage <-> Tray: with Storage visible, select a Storage item and click a Tray slot to move or swap.
    - Sell from Storage or Tray: select an item and click Sell to receive the sell value (TBD).

---

## 6. Project Folder Structure

```
loopyfoods/
  .git/
  .gitattributes
  .gitignore
  .prettierignore
  .prettierrc
  .vscode/
    settings.json
  docs/
    loopyfoods_spec.md
  eslint.config.js
  index.html
  node_modules/
  package-lock.json
  package.json
  README.md
  src/
    App.css
    index.css
    main.tsx
    app/
      App.tsx
      screen.ts
      navigation.tsx
    assets/
      react.svg
    data/
      placeholder-food-cards.ts
      placeholder-judge-cards.ts
    screens/
      MainMenu.tsx
      Shop.tsx
    styles/
      globals.css
      shop.css
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```
