# Hot Lunch Autobattler - Prototype Specification

_(Single source of truth for ChatGPT & dev notes)_

---

## 0. TL;DR

- Game type: Turn-based autobattler inspired by Super Auto Pets, The Bazaar, and Balatro. Theme: chaotic school cafeteria lunch rush. Players assemble a Hot Lunch Tray of foods and line up cafeteria kids who react to the meal.
- Core loop: Shop -> Arrange -> Draft Kid -> Battle -> Repeat.
- Goal: Ship a playable prototype to validate fun before backend work.
- Tech stack: React + TypeScript + Vite (frontend only). Drag-and-drop in the Shop via @dnd-kit; tap/click selection fallback optional. Navigation is in-memory (NavigationProvider); no URL routing.
- Kids replace the old "judge" concept. The Lunch Line has unlimited slots and kids can be reordered but never sold or removed.
- Out of scope (for now): Firebase, accounts, leaderboards, persistence. Opposing players are placeholders for the prototype.

---

## 1. Game Flow

1. **Main Menu** - shows a "Play Hot Lunch" call-to-action.
2. **Shop Screen** - buy/sell food cards, arrange the Hot Lunch Tray, and draft exactly one kid into the Lunch Line from the Pick Kid panel each round. Higher-tier foods unlock as rounds progress.
3. **Battle Screen** - the player is paired with an opponent; the Hot Lunch Tray fires in order and the Lunch Line kids trigger their effects. First to hit their Star Point Target wins.
4. **Results** - show win/loss/draw, then return to the Shop for the next round.
5. **Game End** - player starts with 5 lives. Wins grant a trophy; losses cost a life. Reach 10 trophies to win; lose 5 lives to lose the game.

---

## 2. Game Overview

- **Food Cards** - Have a shop cost, charge time, category tags, tier, and abilities.
- **Hot Lunch Tray** - Ordered sequence of foods that activate sequentially. Visualized as a cafeteria tray with numbered compartments indicating activation order. Starts with 5 compartments; tray upgrades are future work and not available in this prototype.
- **Lunch Line & Kids** - Kids represent cafeteria personalities. The Lunch Line has no slot cap; once drafted, kids stay for the entire run. They can be reordered freely to change their reaction order.
- **Card Categories** - Used for certain abilities (e.g., Mexican, Asian, Italian, Fast Food, Delicacy).
- **Points** - Abilities generate various point flavors (Savory, Sweet, etc.). Certain effects convert those into Star Points.
- **Abilities**
  - **Basic** - activate when the food's turn in the tray reaches its charge time (e.g., "+5 Savory Points").
  - **Triggered** - react to triggers (e.g., "Whenever a Mexican food activates, gain +1 Savory Points").
- **Kids** - Trigger off specific food activations, point thresholds, or sequencing moments. They excel at converting resource points into Star Points, adjusting win targets, or altering tray behavior.

---

## 3. User Interface

- **Mobile-first** - Playable one-screen experience in vertical orientation. No URL routing required.
- **Navigation** - In-memory stack via `NavigationProvider` with helpers `navigate`, `replace`, `back`, and `reset`.
- **Cards** - Small square sprites; tap/click to select. Selections highlight the card and open contextual pop-ups (modal overlays). Pop-ups dismiss via tap outside, a close button, or the Back control.

### Shop Screen

- **Layout**
  - Top bar with Back + round stats.
  - **Lunch Line section** shows drafted kids as reorderable circular tokens with a horizontal scroll strip. An empty "Drop Kid" slot is always visible so drag targets remain available even before drafting.
  - **Hot Lunch Tray** sits beneath, retaining the 3x2 grid layout (four squares + one rectangle) with drag handles for food cards.
  - **Pick Kid panel** replaces the Judge Shop. It shows 3 random kids every round as compact circular tokens. Players **must** pick exactly one option before "Lunch Time" becomes available. Once a kid is drafted, the other two choices lock until the next round; rerolls only refresh kid options if the player hasn't drafted yet. Kids cannot be sold.
  - **Food Shop** still displays 5 cards. Storage toggle remains on the roadmap but unimplemented.
- **Interactions**
  - **Drag-and-drop**
    - Shop -> Tray: Drag a Food Shop card onto an empty tray slot to buy/place it (deduct gold).
    - Tray <-> Tray: Drag to swap foods.
    - Lunch Line reorder: Drag any kid token onto another to swap their order.
  - **Pick Kid**: Tap a kid token to inspect details and highlight it, then tap the "Pick Selected Kid" button to draft it for free. Alternatively, drag a kid token directly into the Lunch Line to instantly draft and place it. Exactly one kid must be drafted each round before the player can proceed to battle.
  - **Selection fallback**: When a card or kid is selected, `CardPopover` shows title + description. Sell applies only to tray/storage food cards.
- **Buttons & Indicators**
  - Gold, round, lives, trophies, star target.
  - **Reroll**: Refreshes the Food Shop (and Pick Kid options if you haven't drafted yet). Cost starts at $1 per shop phase, +$1 per additional reroll within the same phase.
  - **Storage**: Reserved for future implementation; button is present but disabled in the prototype.
  - **Lunch Time CTA**: Disabled until a kid is drafted for the current round.

### Battle Screen

- Opponent on top, player on bottom. Shows both Hot Lunch Trays and Lunch Lines.
- Highlight tray activations and kid triggers (placeholder for now). Display point totals plus each side's Star Point Target.

---

## 4. Battle Logic

- Battles auto-play when entering the Battle screen; no mid-battle interactions.
- **Points & Targets** - Both players start at 0 points with a base Star Point Target of 100. Kid or food effects can raise/lower targets.
- **Hot Lunch Tray sequencing**
  - Exactly one food charges at a time, in compartment order.
  - When a food reaches its charge time, it fires, then the next food begins charging. After the final slot, loop back to the first slot.
- **Kids**
  - Each kid in the Lunch Line may trigger on different cues: after specific tray slots resolve, when certain point thresholds are met, or on timer-based cadences.
  - Kids persist indefinitely; there is no sell mechanic. Reordering the Lunch Line changes their trigger sequence.
- **Win/Timeout**
  - Immediate win on hitting or exceeding the current Star Point Target.
  - If 20 seconds elapse, the higher Star Point total wins; ties result in no trophy gain and no life loss.

---

## 5. Economy and Shops

- Starting gold: $10 at the beginning of every shop phase. Unspent gold carries over.
- Prices (initial, subject to playtesting):
  - Food cards: $3 baseline; higher tiers may cost more.
  - Pick Kid: drafting a kid is free but mandatory each round.
  - Sell value: TBD (e.g., half of purchase cost, rounded down). Only food cards (tray or storage) can be sold.
- Shop details:
  - Food Shop shows 5 food cards at a time.
  - Pick Kid shows 3 kids. Once a kid is drafted, the panel locks until the next round.
  - Reroll affects the Food Shop plus the Pick Kid options if and only if no kid has been drafted that round.
  - Storage system (future):
    - 6-slot Storage accessible via the Storage button on the Shop screen.
    - Items in Storage persist between battles.
    - Buy to Storage: Select a shop card, then tap Storage. If there's room, the card moves into Storage.
    - Tray <-> Storage and Storage <-> Tray swaps follow the same interaction rules as before.
    - Sell from Storage or Tray to receive sell value.

---

## 6. Project Folder Structure

```
loopyfoods/        # Hot Lunch Autobattler prototype root
  .git/
  .gitattributes
  .gitignore
  .prettierignore
  .prettierrc
  .vscode/
    settings.json
  docs/
    hot-lunch-autobattler_spec.md
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
      placeholder-kid-cards.ts
    screens/
      MainMenu.tsx
      Shop.tsx
      Battle.tsx
    styles/
      globals.css
      shop.css
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```
