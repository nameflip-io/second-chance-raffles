# Second Chance Raffles — project rules

## Project
Marketing + demo website for **Second Chance Raffles**, a UK-style online prize competition brand (people buy low-cost tickets to win prizes in capped-entry draws).

- This version is a high-fidelity demo hosted on **Vercel**.
- It will later be migrated to a **Shopify theme**, so keep the code simple and portable.

## Tech
- Plain HTML, CSS and vanilla JavaScript. **No frameworks, no build step.**
- Pages:
  - `index.html`
  - `competitions.html`
  - `competition.html` (reads `?id=` from the URL)
  - `winners.html`
  - `how-it-works.html`
  - `free-entry.html`
  - `terms.html`
  - `privacy.html`
  - `responsible-play.html`
- Shared files:
  - `css/styles.css`
  - `js/main.js`
  - `data/competitions.js` — all competition data in one array
- Shared header and footer are injected by `js/main.js` so they are edited in one place only.
- Libraries via CDN only: **GSAP + ScrollTrigger**, **Lenis**.
- Google Fonts:
  - **Anton** — display
  - **Manrope** — body
  - **JetBrains Mono** — numbers, ticket IDs, timers

## Brand
- Logo: `assets/logo.jpeg` (gold/black half-and-half mask with headphones and a ticket).
- Mascot mask: `assets/mask.jpeg` if present.
- Taglines:
  - "Same people. More chances."
  - "Raffles · Community · Bigger opportunities · 2nd chance"
- Brand promise: **every losing ticket goes into a monthly Second Chance draw.**
- Look: clean white pages with metallic gold accents and black contrast bands (footer, stats band). Huge condensed uppercase headlines, lots of space. Not a cheap lottery site.
- Colour tokens (light theme):

  ```css
  --bg:        #FFFFFF;
  --surface:   #F7F4EE;
  --surface-2: #EFEAE0;
  --text:      #0A0908;
  --muted:     #645D4F;
  --ink:       #0A0908;  /* brand black for dark bands and chips */
  --gold:      #F5B400;  /* accents: fills, borders, buttons, bars */
  --gold-light:#FFD75A;
  --gold-dark: #C98A00;
  --gold-ink:  #8A6100;  /* gold for TEXT on white (bright gold fails contrast) */
  --live:      #2FD17A;  /* dot only; text uses --live-ink #0F7A43 */
  ```

- Never put bright gold (#F5B400) as text on white; use `--gold-ink`, or `--metal-text` for gradient headline text.
- Dark bands use the `.theme-dark` class, which restores the original black palette for everything inside.
- Signature detail: competition cards look like real tickets — perforated edge, notched corners, serial number like `SCR-0042`.

## Rules
- **Mobile-first.** Must look perfect at 375px wide.
- **All content visible without JS.** Animations are progressive enhancement and are disabled under `prefers-reduced-motion`.
- **Honest conversion design:** real countdowns from data, real sold %, odds shown (e.g. "Odds 1 in 1,999"). No fake "someone just bought" popups or invented urgency.
- Every competition shows a **free postal entry** link with **equal prominence** to the paid button.
- **18+** shown in header and footer.
- Images: use styled placeholders (dark card, thin gold frame, icon, label "Prize image · 1200×900") that the client will replace. **Never hotlink random images.**
- Write real, punchy English copy. **No lorem ipsum.** Currency: **GBP (£)**.
- The "Enter now" button is a demo: it opens a modal saying "Secure checkout coming soon".
