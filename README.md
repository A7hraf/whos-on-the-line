# Who's on the Line? · مع من أتحدث؟

A 3–5 minute fraud-awareness game for **ahlibank** employees on **Omani Youth Day (26 October 2026)**.

The player signs in with their job title. Visitors then walk up to the counter, phone, email or message them. Each visitor is secretly a **Scammer, Attacker, Stealer or Legal customer**, and the player has to work out which.

- 30 scripted visitors in **English and Arabic**, matched to 9 job titles
- In-person visits at the branch or HQ, plus phone calls, WhatsApp, email and internal chat
- Up to 6 questions per visitor, words you can tap to flag them, and rubber-stamp verdicts
- 3 chances, a 5-minute shift and a leaderboard
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
| Collect winners | Leaderboard → **Export CSV** downloads every score saved on that laptop |
| Reset for a new day | Leaderboard → **Reset today's board** |

**The leaderboard lives on each device** (browser storage). With 2–3 laptops, export the CSV from each one at the end of the day to pick the overall winners. A shared live leaderboard across devices would need a small online database; it isn't included in the free version.

**Internet:** the game needs internet once to load its fonts and icons from Google Fonts and unpkg. Without internet it still works, just with plain fonts. Ask IT to allow `github.io`, `fonts.googleapis.com`, `fonts.gstatic.com` and `unpkg.com`.

---

## 3. How to play

1. **Ring the bell**, write your name and tick your post for today.
2. Read the briefing on the four kinds of visitor.
3. Each visitor talks first. Ask up to **6 questions** using the blue buttons ("Ask for ID", "Call back on file", "Check the system"…). **Other questions** shows more.
   - Checking things (ID, system, call-back) can add evidence to the desk or the record panel.
4. **Tap suspicious words** to flag them.
5. **Stamp your verdict**: Scammer, Attacker, Stealer or Legal.
6. A wrong stamp loses one of your 3 chances. The shift ends at 3 wrong stamps or when the 5-minute clock runs out.

**Points**

| Event | Points |
| --- | --- |
| Correct verdict | +100 |
| Decided within 3 questions | +50 |
| Checked ID, papers or the system first | +20 |
| Each real red flag you tapped (up to 3) | +10 |
| Each chance left at the end | +50 |

---

## 4. Changing the game

| I want to… | Edit |
| --- | --- |
| Change, add or remove visitors | `js/encounters.js`. Each visitor is one block: copy one, change the `id` and the text. |
| Change the questions players can ask | `ACTIONS` at the top of `js/encounters.js` |
| Change on-screen text (EN / AR) | `js/i18n.js` |
| Change the shift length, questions or chances | The top of `js/game.js`: `SHIFT_SECONDS`, `MAX_Q`, `CHANCES` |
| Change colours or layout | `css/style.css` |
| Change the characters' look | `js/characters.js` (or a visitor's `who.v` settings in `encounters.js`) |

Rules for a visitor block in `encounters.js`:

- Every line is written as `['English', 'Arabic']`.
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
js/characters.js    the four hand-drawn characters with colour/prop variants
js/encounters.js    the 30 visitors and the question list
js/game.js          game logic, screens, scoring, leaderboard, sound
assets/             ahlibank logo
```

All visitors are fictional. Never type real customer details into the game.
