# Horde Mode — App Instructions

A digital companion for the **Horde Mode** cooperative game variant for Warhammer 40,000 (10th Edition). The app replaces physical card draws, manual dice rolling, and score tracking during play sessions.

---

## Getting Started

### Setup Screen

When you open the app, you'll land on the **Setup Screen**. Configure your game before starting:

**1. Game Size**
- Choose **1,000 pts** or **2,000 pts**.
- The app automatically calculates the points-per-player split based on the number of players.

**2. Number of Players**
- Select **1–4 players**.
- Each player slot will appear below for naming and faction selection.

**3. Horde Faction**
- Pick the faction that controls the enemy Horde army from the dropdown.
- Each faction has a unique **Horde Faction Rule** (a passive buff applied to all Horde units). The rule is shown immediately below the dropdown so you know what you're up against before you start.

**4. Player Names and Factions**
- For each player, enter a name and choose their Warhammer 40K faction.

**5. Hard Mode (optional)**
- Toggle **Hard Mode** on to extend the game to 6 rounds with increased spawn difficulty.

Once everything is configured, tap **Start Game**.

---

## Game Screen

The game screen is divided into four tabs: **Round**, **Players**, **Spawn**, and **Resupply**.

---

### Round Tab

Your main hub each battle round. The header shows the current round number and which Horde faction you're fighting.

**At the start of each round:**

1. **Draw Misery Cards** — Tap "Draw Misery (X)" to reveal this round's Misery Cards. The number drawn increases as rounds progress (and is higher in Hard Mode). Each Misery Card applies a negative effect that buffs the Horde for the round — read them carefully and apply the effects to your game. Active Misery Cards remain displayed for reference.

2. **Draw Secondary** — Tap "Draw Secondary" to reveal this round's Secondary Mission. The card shows:
   - The **objective condition** you need to meet.
   - The **reward** if you succeed.
   - The **punishment** if you fail.
   - Tap **Complete** or **Fail** at the end of the round to record the result.

3. **Player overview** — A compact grid of all players' current SP and CP is visible at the bottom of the Round tab for quick reference.

4. **Next Round / End Game** — When the round is done, tap **Next Round** to advance. On the final round, the button changes to **End Game**, which returns you to the Setup Screen.

---

### Players Tab

Detailed view of each player's resources and secret objective.

**Supply Points (SP — yellow)**
- Use the **+** and **−** buttons to adjust each player's SP.
- SP is spent in the Resupply Shop. It cannot go below 0.

**Command Points (CP — blue)**
- Use the **+** and **−** buttons to adjust each player's CP.
- CP is used for Stratagems during the game. It cannot go below 0.

**Secret Objectives**
- Each player is dealt a Secret Objective at game start — a hidden personal win condition.
- Tap the **eye icon** to reveal or hide your objective.
- The objective name, condition, and tags (e.g. `End of Game`, `Early Reveal`, `Multiplayer`) are shown when revealed.
- Keep your objective secret from other players until the conditions require you to reveal it.

---

### Spawn Tab

Handles the enemy Horde reinforcement rolls each round.

**Spawn Roller**
- Tap **Roll Spawn** to roll 2D6 for the Horde's reinforcement.
- The result is automatically modified by the **round modifier** (increases as rounds progress, faster in Hard Mode).
- The raw roll and modified total are displayed, along with the **Spawn Bracket**:

| Result | Bracket |
|--------|---------|
| 2 (unmodified) | No Spawn |
| 3–4 | ~75 pts or less |
| 5–6 | 80–170 pts |
| 7–9 | 175–295 pts |
| 10+ | 300+ pts |

> An unmodified roll of 2 always means **No Spawn**, regardless of modifiers.

**Spawn Modifier Adjustments**
- Some Misery Cards or Secondary outcomes add or subtract from the Spawn Roll.
- Use the **+1 / +2 / +3** (red) and **−1** (green) buttons to apply extra modifiers for the round.
- Tap **Reset** to clear all extra modifiers at the end of the round (this also happens automatically when advancing to the next round).

**Spawn Brackets Reference**
- A quick reference table is shown below the roller.

**Horde Faction Rule**
- Your chosen Horde Faction Rule is displayed here as a reminder during play.

---

### Resupply Tab

The cooperative shop where players spend Supply Points on abilities, fortifications, and reinforcements.

**Selecting a Player**
- Tap a player's name at the top to select who is making a purchase. Their current SP is shown next to their name.

**Browsing and Buying**
- All available items are listed with their SP cost, name, effect, and category tags (e.g. `Tactics`, `Strike`, `Fortify`, `Supply`).
- Items you can't afford are dimmed.
- Tap **Buy** to purchase an item — the cost is automatically deducted from the selected player's SP.
- Apply the item's effect in your physical game immediately after purchasing.

**Notable purchases:**

| Item | Cost | Effect |
|------|------|--------|
| Basic Tactics | 2SP | Gain 1 CP |
| Air Strike | 3SP | Target area terrain: units take 2D3 MW, terrain removed |
| Forward Operating Base | 3SP | Fortify an objective; earn +1SP/round while controlled |
| Pizza Party | 3SP | Remove Battle-shock from any unit |
| Share Supplies | 3SP | Give 2SP to another player |
| Artillery Strike | 8SP | 9" radius, D6 per model: 5+ = 1 MW (3 MW vs Monsters/Vehicles) |
| Reinforcements Arrive | 12SP | Roll 2D6, spawn a unit from your Spawning Table |

---

## Round Flow Summary

Each battle round follows this sequence:

1. **Draw Misery Cards** (Round tab) — apply their effects immediately.
2. **Draw Secondary Mission** (Round tab) — read the condition.
3. **Play your battle round** physically on the tabletop.
4. **Track SP/CP changes** (Players tab or inline on Round tab) as events occur.
5. **Roll Spawn** (Spawn tab) — after applying any extra modifiers.
6. **Make Resupply purchases** (Resupply tab) between or after combat.
7. **Mark Secondary Complete or Fail** (Round tab) — apply reward or punishment.
8. **Tap Next Round** (Round tab) — advance to the next battle round.

Repeat for 5 rounds (6 in Hard Mode). After the final round, tap **End Game** to return to setup.

---

## Tips

- **Misery Cards stack** — multiple active Misery Cards all apply simultaneously for the round.
- **Spawn Modifiers reset each round** — use the Reset button or advance the round to clear them.
- **Secret Objectives are personal** — don't reveal them unless your card's tags say `Early Reveal` or the condition requires it.
- **SP cannot go below 0** — the app enforces this automatically.
- **Hard Mode** increases Misery count, spawn modifiers, and extends the game to 6 rounds. Only recommended for experienced groups.
