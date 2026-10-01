/*
 * EXAMPLE DATA - client replaces
 *
 * All competitions live in this one array. Every number on the site
 * (price, sold %, odds, countdown) is calculated from these fields, so
 * editing this file is all it takes to update the site.
 *
 * Fields
 *   id               URL slug, used by competition.html?id=
 *   serial           Ticket serial shown on the card (SCR-0000). Issued in
 *                    launch order, so "Newest" sorts by serial.
 *   title            Prize name
 *   category         "tech" | "cars" | "cash" | "lifestyle"
 *   prizeValue       Retail value in £
 *   ticketPrice      Price per ticket in £
 *   maxTickets       Hard cap on entries (odds = 1 in maxTickets)
 *   ticketsSold      Tickets sold so far
 *   endsAt           ISO 8601 date/time the draw closes
 *   maxPerPerson     Most tickets one person can buy
 *   instantWins      [] or [{ ticket, prize, value, won }] — the winning ticket
 *                    numbers are published up front; won = already claimed
 *   question         Skill question: { text, options: [3 answers] }. The
 *                    correct answer is checked server-side, never stored here.
 *   cashAlternative  Cash alternative in £, or null
 *   description      One or two sentences of prize copy
 *   image            Path to a 1200×900 image, or null for the placeholder
 *   gallery          Up to 3 extra 1200×900 images ([] = placeholders)
 *   featured         true for the single hero competition
 *
 * Demo only: inDays() keeps the countdowns live, whatever day the demo is
 * opened. Replace each endsAt with a fixed ISO string such as
 * "2026-10-09T20:00:00+01:00" before launch.
 */
(function () {
  function inDays(days, hour) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  }

  window.SCR_COMPETITIONS = [
    {
      id: "vw-golf-r",
      serial: "SCR-0042",
      title: "VW Golf R",
      category: "cars",
      prizeValue: 44995,
      ticketPrice: 4.99,
      maxTickets: 12999,
      ticketsSold: 7843,
      endsAt: inDays(9, 20),
      instantWins: [],
      cashAlternative: 39000,
      description: "333PS, 4MOTION all-wheel drive and 0–62 in 4.6 seconds. A brand-new Golf R in Lapiz Blue, delivered to your door with insurance paid for the first year — or take £39,000 tax-free cash.",
      image: null,
      maxPerPerson: 100,
      question: { text: "Which country is Volkswagen based in?", options: ["Germany", "Italy", "Japan"] },
      gallery: [],
      featured: true
    },
    {
      id: "ps5-pro",
      serial: "SCR-0043",
      title: "PS5 Pro",
      category: "tech",
      prizeValue: 699,
      ticketPrice: 0.79,
      maxTickets: 1999,
      ticketsSold: 1412,
      endsAt: inDays(1, 20),
      instantWins: [
        { ticket: 37, prize: "£25 PlayStation Store credit", value: 25, won: true },
        { ticket: 214, prize: "£25 PlayStation Store credit", value: 25, won: true },
        { ticket: 388, prize: "£25 PlayStation Store credit", value: 25, won: false },
        { ticket: 502, prize: "£25 PlayStation Store credit", value: 25, won: true },
        { ticket: 761, prize: "£25 PlayStation Store credit", value: 25, won: false },
        { ticket: 908, prize: "£25 PlayStation Store credit", value: 25, won: false },
        { ticket: 1123, prize: "£25 PlayStation Store credit", value: 25, won: true },
        { ticket: 1340, prize: "£25 PlayStation Store credit", value: 25, won: false },
        { ticket: 1577, prize: "£25 PlayStation Store credit", value: 25, won: false },
        { ticket: 1862, prize: "£25 PlayStation Store credit", value: 25, won: false }
      ],
      cashAlternative: 550,
      description: "The fastest PlayStation ever made, with a 2TB SSD and a spare DualSense Edge in the box. Ten instant £25 PlayStation Store wins are hidden in the ticket pool.",
      image: null,
      maxPerPerson: 50,
      question: { text: "How many sides does a hexagon have?", options: ["5", "6", "8"] },
      gallery: [],
      featured: false
    },
    {
      id: "iphone-17-pro-max",
      serial: "SCR-0044",
      title: "iPhone 17 Pro Max",
      category: "tech",
      prizeValue: 1199,
      ticketPrice: 0.99,
      maxTickets: 2499,
      ticketsSold: 2161,
      endsAt: inDays(3, 20),
      instantWins: [],
      cashAlternative: 950,
      description: "256GB, any colour you like, unlocked to any network. Pick your phone or pocket £950 in cash.",
      image: null,
      maxPerPerson: 50,
      question: { text: "Which company makes the iPhone?", options: ["Samsung", "Apple", "Google"] },
      gallery: [],
      featured: false
    },
    {
      id: "5000-tax-free-cash",
      serial: "SCR-0045",
      title: "£5,000 Tax-Free Cash",
      category: "cash",
      prizeValue: 5000,
      ticketPrice: 1.49,
      maxTickets: 4999,
      ticketsSold: 2208,
      endsAt: inDays(5, 20),
      instantWins: [],
      cashAlternative: null,
      description: "Five grand, straight to your bank account within 48 hours of the live draw. No strings, no tax, no catch.",
      image: null,
      maxPerPerson: 100,
      question: { text: "How many pence are in £1?", options: ["10", "100", "1,000"] },
      gallery: [],
      featured: false
    },
    {
      id: "rolex-submariner",
      serial: "SCR-0046",
      title: "Rolex Submariner Date",
      category: "lifestyle",
      prizeValue: 11500,
      ticketPrice: 2.99,
      maxTickets: 5999,
      ticketsSold: 3376,
      endsAt: inDays(7, 20),
      instantWins: [],
      cashAlternative: 9500,
      description: "The 41mm Oystersteel Submariner Date with black Cerachrom bezel, full box and papers. Wear it, or take £9,500 cash.",
      image: null,
      maxPerPerson: 75,
      question: { text: "How many hours are shown on a standard watch face?", options: ["10", "12", "24"] },
      gallery: [],
      featured: false
    },
    {
      id: "macbook-pro-16",
      serial: "SCR-0047",
      title: "MacBook Pro 16\"",
      category: "tech",
      prizeValue: 2499,
      ticketPrice: 1.29,
      maxTickets: 2999,
      ticketsSold: 984,
      endsAt: inDays(11, 20),
      instantWins: [],
      cashAlternative: 2000,
      description: "Apple's M-series Pro chip, 24GB memory and a 1TB SSD in Space Black. Built for creators, gamers and anyone who's outgrown their laptop.",
      image: null,
      maxPerPerson: 50,
      question: { text: "What is 12 × 12?", options: ["124", "144", "164"] },
      gallery: [],
      featured: false
    },
    {
      id: "500-instant-win-bundle",
      serial: "SCR-0048",
      title: "£500 Instant Win Bundle",
      category: "cash",
      prizeValue: 500,
      ticketPrice: 0.49,
      maxTickets: 9999,
      ticketsSold: 6127,
      endsAt: inDays(4, 20),
      instantWins: [
        { ticket: 112, prize: "£50 cash", value: 50, won: true },
        { ticket: 1876, prize: "£50 cash", value: 50, won: true },
        { ticket: 4410, prize: "£50 cash", value: 50, won: true },
        { ticket: 8023, prize: "£50 cash", value: 50, won: false },
        { ticket: 305, prize: "£20 cash", value: 20, won: true },
        { ticket: 977, prize: "£20 cash", value: 20, won: true },
        { ticket: 1450, prize: "£20 cash", value: 20, won: true },
        { ticket: 2288, prize: "£20 cash", value: 20, won: true },
        { ticket: 3012, prize: "£20 cash", value: 20, won: true },
        { ticket: 5199, prize: "£20 cash", value: 20, won: true },
        { ticket: 6650, prize: "£20 cash", value: 20, won: false },
        { ticket: 7314, prize: "£20 cash", value: 20, won: false },
        { ticket: 8890, prize: "£20 cash", value: 20, won: false },
        { ticket: 9542, prize: "£20 cash", value: 20, won: false },
        { ticket: 64, prize: "£10 cash", value: 10, won: true },
        { ticket: 2741, prize: "£10 cash", value: 10, won: true },
        { ticket: 5873, prize: "£10 cash", value: 10, won: true },
        { ticket: 6402, prize: "£10 cash", value: 10, won: false },
        { ticket: 7008, prize: "£10 cash", value: 10, won: false },
        { ticket: 7765, prize: "£10 cash", value: 10, won: false },
        { ticket: 8251, prize: "£10 cash", value: 10, won: false },
        { ticket: 9120, prize: "£10 cash", value: 10, won: false },
        { ticket: 9667, prize: "£10 cash", value: 10, won: false },
        { ticket: 9930, prize: "£10 cash", value: 10, won: false }
      ],
      cashAlternative: null,
      description: "£500 cash for the main draw, plus £500 more spread across 24 instant wins. If your ticket number matches a prize, it's paid the moment you enter.",
      image: null,
      maxPerPerson: 100,
      question: { text: "What colour do you get by mixing blue and yellow?", options: ["Purple", "Orange", "Green"] },
      gallery: [],
      featured: false
    },
    {
      id: "dyson-home-set",
      serial: "SCR-0049",
      title: "Dyson Home Set",
      category: "lifestyle",
      prizeValue: 1649,
      ticketPrice: 0.99,
      maxTickets: 2499,
      ticketsSold: 1103,
      endsAt: inDays(14, 20),
      instantWins: [],
      cashAlternative: 1300,
      description: "The full set: V15 Detect cordless vacuum, Airwrap multi-styler and Supersonic hair dryer. Cleaner floors, better hair days.",
      image: null,
      maxPerPerson: 50,
      question: { text: "How many days are there in a leap year?", options: ["364", "365", "366"] },
      gallery: [],
      featured: false
    }
  ];

  /*
   * Recent winners (EXAMPLE DATA - client replaces). Newest first.
   * Fields: name (first name + initial), town, prize, date (YYYY-MM-DD),
   *         drawUrl (link to the recorded live draw; "#" until the client adds it),
   *         photo (optional, e.g. "assets/winners/jamie-r.jpg", 400×400)
   */
  window.SCR_WINNERS = [
    { name: "Dan W.", town: "Cardiff", prize: "£250 Second Chance draw", drawUrl: "#", date: "2026-09-30" },
    { name: "Jamie R.", town: "Manchester", prize: "PS5 Pro", drawUrl: "#", date: "2026-09-26" },
    { name: "Priya K.", town: "Leicester", prize: "£2,500 tax-free cash", drawUrl: "#", date: "2026-09-26" },
    { name: "Sophie M.", town: "Glasgow", prize: "iPhone 17 Pro", drawUrl: "#", date: "2026-09-19" },
    { name: "Marcus T.", town: "Leeds", prize: "Omega Seamaster", drawUrl: "#", date: "2026-09-19" },
    { name: "Aisha B.", town: "Birmingham", prize: "£50 instant win", drawUrl: "#", date: "2026-09-17" },
    { name: "Liam O.", town: "Belfast", prize: "MacBook Air", drawUrl: "#", date: "2026-09-12" },
    { name: "Chloe H.", town: "Bristol", prize: "Dyson Airwrap", drawUrl: "#", date: "2026-09-12" },
    { name: "Ryan P.", town: "Newcastle", prize: "Yamaha MT-07", drawUrl: "#", date: "2026-09-05" },
    { name: "Hannah L.", town: "Norwich", prize: "£1,000 tax-free cash", drawUrl: "#", date: "2026-09-05" },
    { name: "Owen J.", town: "Swansea", prize: "£250 Second Chance draw", drawUrl: "#", date: "2026-08-31" },
    { name: "Grace E.", town: "Edinburgh", prize: "Nintendo Switch 2", drawUrl: "#", date: "2026-08-29" }
  ];
})();
