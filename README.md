# Who's on the Line? · مع من أتحدث؟

A 3–5 minute fraud-awareness game for **ahlibank** employees on **Omani Youth Day (26 October 2026)**.

The player signs in with their job title. Visitors then walk up to the counter, phone, email or message them. Each visitor is secretly a **Scammer, Attacker, Money launderer, Insider or Legal customer**, and the player has to work out which.

- 63 scripted visitors in **English and Arabic**, matched to 9 job titles
- 5 hidden roles:

| Role | What they want |
| --- | --- |
| Scammer · محتال | To trick the bank or a customer into moving money |
| Attacker · مخترق | To break into bank systems or staff accounts |
| Money launderer · غاسل أموال | To hide where dirty money came from |
| Insider · موظف مخالف | A real colleague using their job to break the rules |
| Legal · عميل حقيقي | A genuine service |

- 3 difficulty levels (**Easy, Medium, Hard**), and every game gets harder as you play
- In-person visits at the branch or HQ, plus phone calls, WhatsApp, email and internal chat
- Up to 6 questions per visitor, words you can tap to flag them, and rubber-stamp verdicts
- 3 chances, a 5-minute shift and a leaderboard
- Background music, office sounds (chatter, phones, typing, the queue ding-dong) and spoken visitor voices, all switchable
- **100% free:** no server, no AI key and no accounts. It runs on GitHub Pages.

---

## 1. Put it on GitHub Pages (about 5 minutes)

1. Sign in to [github.com](https://github.com) and click **New repository**.
   - Name it something like `whos-on-the-line`.
   - Choose **Public**. GitHub Pages is free for public repositories.
   - Click **Create repository**.
2. On the new repository page, click **uploading an existing file**.
3. Unzip `whos-on-the-line.zip` on your computer.
4. Drag **everything inside the folder** onto the GitHub page: `index.html`, `css`, `js`, `assets`, `README.md` and `.nojekyll`.
   - `.nojekyll` may be hidden on your computer. Show hidden files, or skip it; the game still works.
5. Click **Commit changes**.
6. Go to **Settings → Pages**.
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**.
   - Set **Branch** to `main` and the folder to `/ (root)`.
   - Click **Save**.
7. Wait 1–2 minutes. Refresh the page and GitHub shows your link, for example:
   `https://YOUR-USERNAME.github.io/whos-on-the-line/`

To change something later, edit the file on GitHub (pencil icon) and commit. The site updates in about a minute.

> **Private repository?** GitHub Pages on private repos needs a paid GitHub plan. Keep the repo public: it contains no customer data, only fictional characters.

---

## 2. Running the booth on Youth Day

| What | How |
| --- | --- |
| Game laptops | Open the GitHub Pages link in Chrome or Edge and press **F11** for full screen |
| Big-screen leaderboard | Open the same link with `?board` at the end, e.g. `…/whos-on-the-line/?board`, on the **same laptop** in a second window. It refreshes by itself. |
| Start in Arabic | Add `?lang=ar` to the link |
| Pause | The pause button (top right) or the **Esc** key |
| Go back | The **Back** buttons, the **Esc** key or the browser's back button. From the pause menu, **Back to welcome page** leaves a game without saving it |
| Sound | The **Sound board** on the welcome page (or the pause menu) turns Music, Office sounds, Visitor voices and Effects on or off. Sound starts after the first click |
| Collect winners | Leaderboard → **Export CSV** downloads every score saved on that laptop |
| Reset for a new day | Leaderboard → **Reset today's board** |

**The leaderboard lives on each device** (browser storage). With 2–3 laptops, export the CSV from each one at the end of the day to pick the overall winners. A shared live leaderboard across devices would need a small online database; it isn't included in the free version.

**Visitor voices** use the voices built into the laptop's browser. For English, Chrome and Edge always have one. For Arabic, **Microsoft Edge** is best: it includes natural Omani Arabic voices. If a laptop has no Arabic voice (common in Chrome on Windows), the game streams the Arabic lines from Google's free online text-to-speech instead, so it needs internet; this is an unofficial service and a company network may block `translate.google.com`.

**Internet:** the game needs internet once to load its fonts and icons from Google Fonts and unpkg. Without internet it still works, just with plain fonts. Ask IT to allow `github.io`, `fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com` and (for Arabic voices in Chrome) `translate.google.com`.

---

## 3. How to play

1. **Ring the bell**, write your name and tick your post for today.
2. Read the briefing on the five kinds of visitor, then **choose your level**: Easy, Medium or Hard.
3. Each visitor talks first. Ask up to **6 questions** using the blue buttons ("Ask for ID", "Call back on file", "Check the system"…). **Other questions** shows more.
   - Checking things (ID, system, call-back) can add evidence to the desk or the record panel.
4. **Tap suspicious words** to flag them.
5. **Stamp your verdict**: Scammer, Attacker, Launderer, Insider or Legal.
6. A wrong stamp loses one of your 3 chances. The shift ends at 3 wrong stamps or when the 5-minute clock runs out.

**Levels.** Every 3 visitors the game moves up a stage (a "Level up!" banner appears): trickier visitors, fewer questions and, from Medium up, visitors who give up and leave if you take too long. A visitor who leaves costs a chance.

| | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Visitors | clear cases, then trickier | mixed, then expert | trickier, then expert |
| Questions per visitor (stage 1 → 2 → 3) | 6 → 6 → 5 | 6 → 5 → 4 | 5 → 4 → 3 |
| Visitor waits | no limit | no limit → 60 s → 45 s | 50 s → 40 s → 30 s |
| Hints | red-flag words underlined, bad evidence in red | bad evidence in red (stages 1–2) | none, and no red-flag memo |
| Points | ×1 | ×1.5 | ×2 |

**Points**

| Event | Points |
| --- | --- |
| Correct verdict | +100 |
| Decided within 3 questions | +50 |
| Checked ID, papers or the system first | +20 |
| Each real red flag you tapped (up to 3) | +10 |
| Each chance left at the end | +50 |
| Difficulty | ×1.5 on Medium, ×2 on Hard, plus 25% per stage |

---

## 4. Changing the game

| I want to… | Edit |
| --- | --- |
| Change, add or remove visitors | `js/encounters.js`. Each visitor is one block: copy one, change the `id` and the text. |
| Change the questions players can ask | `ACTIONS` at the top of `js/encounters.js` |
| Change on-screen text (EN / AR) | `js/i18n.js` |
| Change the shift length or chances | The top of `js/game.js`: `SHIFT_SECONDS`, `CHANCES` |
| Change the difficulty levels | `LEVELS` at the top of `js/game.js` (questions, waiting time, hints and points per stage) |
| Change colours or layout | `css/style.css` |
| Change the music, office sounds or voices | `js/audio.js` |
| Change the characters' look | `js/characters.js` (or a visitor's `who.v` settings in `encounters.js`) |

Rules for a visitor block in `encounters.js`:

- Every line is written as `['English', 'Arabic']`.
- Arabic: what the visitor **says** (`open`, the replies in `acts`, `exit`) is natural Gulf/Omani dialect. Everything the game narrates (`claim`, `arrive`, `card`, `reveal`, `flags`, `key`, `sum`, `exitNote`, `line`) is Modern Standard Arabic (فصحى).
- `role` is `scammer`, `attacker`, `launderer`, `insider` or `legal`. Non-legal visitors need at least 3 `[[red flags]]`; legal visitors have none.
- `level` is `1` (clear case), `2` (trickier) or `3` (expert). It decides at which difficulty and stage the visitor can appear.
- Wrap a real red flag in `[[double brackets]]`, for example `'I need it [[today]]'`. Players earn points for tapping it.
- `jobs` lists the job titles that meet this visitor (`guard`, `reception`, `teller`, `hr`, `ceo`, `rm`, `it`, `ops`). "Any employee" meets everyone.
- `channel` is `person`, `phone`, `whatsapp`, `email` or `internal`.
- In `acts`, a reply can be `{ say: [...], reveal: [[label, value, 1]] }`. The `reveal` rows are added to the evidence when the player asks, and a `1` at the end shows the value in red.

---

## 5. Files

```
index.html          the page
css/style.css       the Teller's Window look (1600×900 stage, scales to any screen)
js/i18n.js          interface text, English + Arabic
js/characters.js    the four hand-drawn character bodies with colour/prop variants
js/encounters.js    the 63 visitors and the question list
tools/check-visitors.js   checks every visitor (run: node tools/check-visitors.js)
js/game.js          game logic, screens, scoring, leaderboard, sound effects
js/audio.js         background music, office ambience, visitor voices (no sound files)
assets/             ahlibank logo
```

All visitors are fictional. Never type real customer details into the game.
