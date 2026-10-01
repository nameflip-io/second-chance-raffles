# Second Chance Raffles: website handover

This is a demo version of the Second Chance Raffles website. It looks and behaves like the real thing, but it does not take money or run draws yet (see [What this demo does not do yet](#5-what-this-demo-does-not-do-yet)).

The site is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

---

## 1. How to make changes

You can edit files in two ways:

- **On GitHub (easiest).** Open the file at https://github.com/nameflip-io/second-chance-raffles, click the pencil icon, make your change, then click **Commit changes**. Vercel publishes the new version automatically within about a minute.
- **On your computer.** Edit the files in any text editor, then commit and push to the `main` branch. Vercel publishes it the same way.

To preview on your computer before publishing, open a terminal in the project folder, run `python3 -m http.server 8000`, then go to http://localhost:8000.

> **Tip:** Make one change at a time and check the live site afterwards. If something breaks, it is usually a missing comma or quote mark in `data/competitions.js`.

---

## 2. Competitions, prices and dates

Every competition on the site comes from one file: **`data/competitions.js`**. The home page, competitions page, competition detail pages and free entry page all read from it. Change it once and every page updates.

The data in the file now is **example data**. Replace it with your real competitions before launch.

### What one competition looks like

```js
{
  id: "ps5-pro",
  serial: "SCR-0043",
  title: "PS5 Pro",
  category: "tech",
  prizeValue: 699,
  ticketPrice: 0.79,
  maxTickets: 1999,
  ticketsSold: 1412,
  endsAt: "2026-10-09T20:00:00+01:00",
  instantWins: [],
  cashAlternative: 550,
  description: "The fastest PlayStation ever made, with a 2TB SSD and a spare DualSense Edge in the box.",
  image: "assets/prizes/ps5-pro-1.jpg",
  maxPerPerson: 50,
  question: { text: "How many sides does a hexagon have?", options: ["5", "6", "8"] },
  gallery: ["assets/prizes/ps5-pro-2.jpg", "assets/prizes/ps5-pro-3.jpg"],
  featured: false
},
```

### What each line means

| Field | What to put | Example |
|---|---|---|
| `id` | A short, unique web address name. Lowercase letters, numbers and hyphens only. Don't change it once the competition is live, or old links will break. | `"ps5-pro"` |
| `serial` | The ticket serial number printed on the card. Give each new competition the next number. | `"SCR-0050"` |
| `title` | The prize name. | `"PS5 Pro"` |
| `category` | One of `"tech"`, `"cars"`, `"cash"` or `"lifestyle"`. This controls the filters. | `"tech"` |
| `prizeValue` | The prize's value in pounds. Numbers only, no £ sign or commas. | `699` |
| `ticketPrice` | The price of one ticket in pounds. | `0.79` |
| `maxTickets` | The total number of tickets. The site works out the odds from this: "Odds 1 in 1,999". | `1999` |
| `ticketsSold` | How many tickets have sold so far. In this demo you update it by hand. | `1412` |
| `endsAt` | When entries close (see [Dates](#dates) below). | `"2026-10-09T20:00:00+01:00"` |
| `instantWins` | `[]` if there are none (see [Instant wins](#instant-wins) below). | `[]` |
| `cashAlternative` | The cash alternative in pounds, or `null` if there isn't one. | `550` or `null` |
| `description` | One or two sentences about the prize. | |
| `image` | The main prize photo, or `null` to show the placeholder. | `"assets/prizes/ps5-pro-1.jpg"` |
| `maxPerPerson` | The most tickets one person can buy. | `50` |
| `question` | The skill question and exactly **three** answers. Do **not** mark the correct answer here (see the note below). | |
| `gallery` | Up to 3 extra photos for the competition page, or `[]`. | |
| `featured` | `true` for the **one** competition shown big on the home page. All others must be `false`. | `false` |

> **Important:** never put the correct answer to the question in this file. Anyone can read it in their browser. The real checkout system must check answers on the server.

### Dates

The example data uses `inDays(…)` so the demo's countdowns never run out. For real competitions, replace it with a fixed date and time:

```js
endsAt: "2026-10-09T20:00:00+01:00",   // 9 October 2026, 8pm UK summer time (BST)
endsAt: "2026-11-13T20:00:00+00:00",   // 13 November 2026, 8pm UK winter time (GMT)
```

Use `+01:00` between late March and late October (BST) and `+00:00` the rest of the year (GMT).

When the date passes, the site automatically shows the competition as **Closed** and stops entries.

### Common changes

- **Change a price:** edit `ticketPrice`. Bundle totals and the checkout summary update by themselves.
- **Move a closing date:** edit `endsAt`.
- **Add a competition:** copy a whole block from `{` to `},`, paste it below, and change every value. Make sure `id` and `serial` are new.
- **Remove a competition:** delete its whole block from `{` to `},`.
- **Change the featured competition:** set `featured: true` on the new one and `featured: false` on the old one.

### Instant wins

List each winning ticket number. Set `won: true` once it has been claimed.

```js
instantWins: [
  { ticket: 37,  prize: "£25 PlayStation Store credit", value: 25, won: true },
  { ticket: 388, prize: "£25 PlayStation Store credit", value: 25, won: false }
],
```

### Winners

Winners are in the same file, in the list called `SCR_WINNERS` near the bottom. Put the newest winner at the top:

```js
{ name: "Jamie R.", town: "Manchester", prize: "PS5 Pro", drawUrl: "https://www.instagram.com/reel/…", date: "2026-09-26", photo: "assets/winners/jamie-r.jpg" },
```

- `drawUrl` is the link to the recorded draw. The "Watch draw" link uses it.
- `photo` is optional. Without it, the winner's initials are shown in a gold circle.
- Only publish a winner's name, town and photo **with their permission**.

---

## 3. Replacing images

Every grey box with a thin gold frame and a label like "Prize image · 1200×900" is a placeholder. Never use images copied from other websites. Use your own photos, or photos you have the rights to use.

Keep files small: under about 300 KB each, JPG for photos, PNG only where you need transparency.

| Image | Size | Where the file goes | How to switch it on |
|---|---|---|---|
| **Prize photos** | **1200 × 900 px** (landscape, 4:3) | `assets/prizes/` e.g. `ps5-pro-1.jpg` | Set `image:` (main photo) and `gallery:` (up to 3 more) for that competition in `data/competitions.js`. |
| **Winner photos** | **400 × 400 px** (square, face centred) | `assets/winners/` e.g. `jamie-r.jpg` | Add `photo:` to that winner in `data/competitions.js`. |
| **Hero mascot mask** | **1200 px wide, transparent PNG** | `assets/mask.png` | See the steps below. |
| **Logo (optional upgrade)** | Transparent PNG, mark about 600 px, full logo about 800 px | `assets/logo-mark.png`, `assets/logo-lockup.png` | Ask your developer to swap the file names in `js/main.js`. |
| **Social share image** | 1200 × 630 px | `assets/og-image.jpg` | Replace the file and keep the same name. |
| **Favicon** | 32 × 32 px and 180 × 180 px PNG | `assets/favicon-32.png`, `assets/apple-touch-icon.png` | Replace the files and keep the same names. |

Name files in lowercase with hyphens and no spaces: `vw-golf-r-1.jpg`, not `VW Golf R (1).JPG`.

### Hero mascot

The home page hero currently uses a crop of your logo. When you have a transparent PNG of the mask:

1. Save it as `assets/mask.png`.
2. In `index.html`, find this line:

   ```html
   <img class="hero__mask" src="assets/logo-mark.jpeg" alt="" width="590" height="560" fetchpriority="high">
   ```

3. Change it to the line below. Set `width` and `height` to your image's real size.

   ```html
   <img class="hero__mask hero__mask--cutout" src="assets/mask.png" alt="" width="1200" height="1140" fetchpriority="high">
   ```

### Live draw replays

The three video boxes on `winners.html` are styled placeholders, not image files. Swapping them for real video thumbnails needs a small code change from your developer. The links themselves are easy to change (see below).

---

## 4. Text and links you must fill in

Search each file for `[` to find placeholders in square brackets, and for `href="#"` to find empty links.

### Links

| What | File | What to change |
|---|---|---|
| Instagram, TikTok, Facebook and WhatsApp group buttons | `index.html` ("Join the community") | 4 × `href="#"`: replace each with your real profile or invite link. |
| Live draw replays | `winners.html` | 3 links to `https://www.instagram.com/`: replace each with the specific reel URL. Also update the titles and dates under them. |
| "Watch draw" on each winner | `data/competitions.js` | `drawUrl: "#"`: replace with the reel URL for that draw. |
| Social share image | `<head>` of every `.html` page | `assets/og-image.jpg` → `https://YOUR-DOMAIN/assets/og-image.jpg` once your domain is live. |

### Trustpilot

In `index.html`, find the block marked `PLACEHOLDER: replace this block with the real Trustpilot widget`. Replace the whole block with the widget code from your Trustpilot business account.

**Do not launch with "Rated Excellent" unless that is your real rating.**

### Company details

| Where | File | Placeholder |
|---|---|---|
| Footer (every page) | `js/main.js` | `[Company name] Ltd · Registered in England & Wales No. [00000000] · [Registered address]` |
| Trust strip | `index.html` | `[Company name] Ltd · No. [00000000]` |

### Free postal entry

In `free-entry.html`:

- The postal address: `[Company name] Ltd – Free Entry`, `[Address line 1]`, `[Address line 2]`, `[Town / City]`, `[Postcode]`.
- `[X] working days` for how quickly you confirm postal entries.

### Legal pages

`terms.html`, `privacy.html` and `responsible-play.html` are **templates**. Each has many `[bracketed]` gaps for your business details, plus a yellow banner at the top saying it must be reviewed.

1. Fill in every `[bracket]`, including the "Last updated" date.
2. **Have a legal professional review all three pages.** Prize competitions in the UK must follow specific rules (see section 5).
3. Only then delete the yellow "Template - to be reviewed…" banner at the top of each page.

On `responsible-play.html`, add the current official website links and helpline numbers for GamCare, BeGambleAware and any other services you list.

### Example figures and promises to check

These are examples. Change them to your real numbers, or remove them:

- **Stats band**, on `index.html` and `winners.html`: "£48,250 paid out", "312 winners", "100% every draw live". Change both the `data-count="…"` value and the visible number next to it.
- **Monthly Second Chance prize: £1,000**, on `index.html` and `how-it-works.html`.
- **Announcement bar** ("Next live draw: Friday 8pm on Instagram"), in `js/main.js`. "Fridays, 8pm" also appears in the footer and on several pages.
- **Promises in the FAQ and draw rules.** Make sure these match your terms and what you can really deliver:
  - winners contacted within 24 hours
  - cash paid within 48 hours
  - physical prizes delivered within 14 days
  - an independent random number generator is used
  - the draw goes ahead even if a competition doesn't sell out

### Before launch

- Delete `styleguide.html`. It is an internal design reference page.

---

## 5. What this demo does not do yet

The website is a **front end only**. These parts are not built yet:

| Feature | Current state in the demo |
|---|---|
| **Payments** | "Enter now" opens a "Secure checkout coming soon" message. No money is taken. |
| **Customer accounts** | No sign-up, login, order history or "my tickets". |
| **Age verification** | "18+" is shown, but nobody's age is checked. |
| **Ticket allocation** | No ticket numbers are given out. "Tickets sold" and the progress bars only change when you edit `ticketsSold` by hand. |
| **Skill question** | The site makes people choose an answer, but nothing checks whether it is correct. |
| **Instant wins** | The table is for display only. Nothing checks whether someone's ticket number has won. |
| **Draws** | No random number generator, no winner selection, and no monthly Second Chance draw. These happen outside the website for now. |
| **Postal entries** | The site explains how to enter by post. Recording postal entries and adding them to draws is not built. |
| **Emails** | No order confirmations, winner notices or marketing emails. |
| **Responsible play tools** | The responsible play page describes spend limits, breaks and self-exclusion. **These tools don't exist yet** and must be built, or the page wording changed, before launch. |
| **Cookies and analytics** | No analytics and no cookie consent banner. |

### Payments: important

**Standard payment providers such as Stripe, PayPal and Shopify Payments usually do not allow prize competitions.** Their terms often class them with lotteries and games of chance. Accounts that take these payments without approval risk being frozen, sometimes with funds held.

Before going live you will need a **specialist payment provider** that knowingly supports UK prize competitions, or written approval from your provider. Plan this early. It also affects the move to Shopify, because Shopify Payments is unlikely to be available for this business and you would need a third-party payment gateway that Shopify supports.

### Legal: important

UK prize competitions must stay outside the definition of a lottery under the Gambling Act 2005. This is why every competition has a skill question and a free postal entry route. How these are set up (question difficulty, postal rules, terms, advertising) needs to be checked by a legal professional before launch.

---

## 6. Quick reference: where things live

| What | File |
|---|---|
| Competitions, prices, dates, questions, instant wins, winners | `data/competitions.js` |
| Header, menu, footer, announcement bar, checkout message | `js/main.js` |
| Competition detail page behaviour | `js/competition.js` |
| Colours, fonts, spacing, all styling | `css/styles.css` (colours are at the top) |
| Page text | the matching `.html` file, e.g. `how-it-works.html` |
| Images | `assets/` |
| Project rules for developers | `CLAUDE.md` |
