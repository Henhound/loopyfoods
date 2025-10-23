# LoopyFoods — Autobattler Prototype Specification

_(Single source of truth for ChatGPT & dev notes)_

---

## 0. TL;DR

- Game type: Turn-based autobattler inspired by Super Auto Pets, The Bazaar, and Balatro. Theme: cooking competition.
- Core loop: Shop → Arrange → Battle → Repeat.
- Goal: Playable prototype to validate fun before backend work.
- Tech stack: React + TypeScript + Vite + DnD-Kit (frontend only).
- Out of scope (for now): Firebase, accounts, leaderboards, persistence. Opposing players are placeholders for the prototype.

---

## 1. Game Flow

1. Main Menu — shows a “Play” button.
2. Shop Screen — player can buy/sell food cards and judge cards, and rearrange the Food Loop. Higher‑tier cards unlock as rounds progress.
3. Battle Screen — player is paired with an opponent; the battle plays out automatically. First to hit their Star Point target wins.
4. Results — show win/loss/draw, then return to Shop for the next round.
5. Game End — player starts with 5 lives. Wins grant a trophy; losses cost a life. Reach 10 trophies to win; lose 5 lives to lose the game.

---

## 2. Game Overview

- Food Card: Has a shop cost, cooldown, category tags, tier, and abilities.
- Food Loop: Player arranges a list of food cards that activate sequentially in a loop during battle. After each full loop, judge cards activate.
- Card Categories: Used for certain abilities (e.g., Mexican, Asian, Italian, Fast Food, Delicacy).
- Types of Points: Abilities generate points (e.g., Savory). Certain effects convert points into Star Points.
- Abilities: Two types — basic (activate on cooldown, e.g., “+5 Savory Points”) and triggered (activate on a trigger, e.g., “Whenever a Mexican Food Card is activated, give +1 Savory Points”).
- Judges: Separate card type placed into Judge slots. Judges convert other points into Star Points. Some have cooldowns; some are triggered. They activate separately from the Food Loop.

---

## 3. User Interface

- Mobile-first: Playable one-screen experience in vertical orientation. No URL routing required.
- Cards: Small square sprites; tapping opens a tooltip with details.
- Shop Screen: Top half shows player’s Food Loop and Judge slots. Bottom half shows Food Cards for sale and Judge Cards for sale. Drag from shop areas into Food Loop to purchase; drag to a designated sell area to sell. Shows gold, round, lives/health, trophies.
- Battle Screen: Opponent on top, player on bottom. Shows Food Loops and Judges for both. Indicators highlight activations and cooldowns. Displays point totals for all types and each player’s Star Point Target.

---

## 4. Battle Logic

- Battles auto-play on entering the Battle screen; player cannot interact or rearrange during battle.
- Both players start at 0 points; targets may differ.
- Flow: First Food Card in each player’s loop begins its countdown. On reaching cooldown, it activates; then proceed to the next card. After the final card, loop back to the first. After each full Food Loop, Judges activate. Continue until:
  - A player reaches their Star Point Target (that player wins), or
  - 20 seconds elapse: highest Star Points wins; ties result in no trophy gained and no life lost.

---

## 5. Project Folder Structure

```
loopyfoods/
  .git/
  .gitattributes
  .gitignore
  .prettierignore
  .prettierrc
  .vscode/
  docs/
    loopyfoods_spec.md
  eslint.config.js
  index.html
  node_modules/
  package-lock.json
  package.json
  public/
  README.md
  src/
    app/
      App.tsx
      screen.ts
    assets/
      react.svg
    screens/
      MainMenu.tsx
      Shop.tsx
    styles/
      globals.css
      shop.css
    App.css
    index.css
    main.tsx
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```

