/* ==========================================================================
   Second Chance Raffles — shared site script
   - Injects the shared header, announcement bar, footer and checkout modal
   - Helpers: formatMoney, countdown, soldPercent, odds
   - renderTicketCard(comp) for the ticket-style competition card
   - Progressive enhancement only: pages are readable without this file.
   ========================================================================== */
(function () {
  "use strict";

  var COMPETITIONS = window.SCR_COMPETITIONS || [];
  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NAV = [
    { href: "competitions.html", label: "Competitions", page: "competitions" },
    { href: "winners.html", label: "Winners", page: "winners" },
    { href: "how-it-works.html", label: "How it works", page: "how-it-works" },
    { href: "free-entry.html", label: "Free entry", page: "free-entry" }
  ];

  var CATEGORY_LABELS = { tech: "Tech", cars: "Cars", cash: "Cash", lifestyle: "Lifestyle" };

  /* ---------- Helpers ---------- */

  var gbpWhole = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  var gbpPence = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
  var number = new Intl.NumberFormat("en-GB");

  /** £5,000 for whole pounds, £0.79 when there are pence. */
  function formatMoney(amount) {
    if (amount == null || isNaN(amount)) return "";
    return Number.isInteger(amount) ? gbpWhole.format(amount) : gbpPence.format(amount);
  }

  /** Basket totals always show pence: £499.00, £7.90. */
  function formatTotal(amount) { return gbpPence.format(amount); }

  function pad(n) { return String(n).padStart(2, "0"); }

  /** Time left until endsAt. `label` is ready to print, e.g. "3d 04h 12m 09s". */
  function countdown(endsAt) {
    var total = Math.max(0, new Date(endsAt).getTime() - Date.now());
    var s = Math.floor(total / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var minutes = Math.floor((s % 3600) / 60);
    var seconds = s % 60;
    var ended = total === 0;
    var label = ended
      ? "Draw closed"
      : (days > 0 ? days + "d " : "") + pad(hours) + "h " + pad(minutes) + "m " + pad(seconds) + "s";
    return { total: total, days: days, hours: hours, minutes: minutes, seconds: seconds, ended: ended, label: label };
  }

  /** Whole-number percentage sold. Rounds down so it never shows 100% early. */
  function soldPercent(comp) {
    if (!comp.maxTickets) return 0;
    return Math.min(100, Math.floor((comp.ticketsSold / comp.maxTickets) * 100));
  }

  /** "Odds 1 in 1,999" — one ticket against the capped number of entries. */
  function odds(comp) {
    return "Odds 1 in " + number.format(comp.maxTickets);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function findCompetition(id) {
    for (var i = 0; i < COMPETITIONS.length; i++) if (COMPETITIONS[i].id === id) return COMPETITIONS[i];
    return null;
  }

  /** The live competition with the most tickets sold. */
  function mostPopularId() {
    var best = null;
    COMPETITIONS.forEach(function (c) {
      if (countdown(c.endsAt).ended) return;
      if (!best || c.ticketsSold > best.ticketsSold) best = c;
    });
    return best ? best.id : null;
  }

  var ENDING_SOON_MS = 48 * 3600 * 1000;
  var ALMOST_GONE_PCT = 80;

  function isEndingSoon(comp) {
    var t = countdown(comp.endsAt);
    return !t.ended && t.total < ENDING_SOON_MS;
  }

  function remainingTickets(comp) { return Math.max(0, comp.maxTickets - comp.ticketsSold); }

  /** Status badges, all derived from the data. */
  function badgesFor(comp) {
    var t = countdown(comp.endsAt);
    var pct = soldPercent(comp);
    var out = [];
    if (t.ended) return [{ cls: "closed", label: "Closed" }];
    out.push({ cls: "live", label: "Live" });
    if (t.total < ENDING_SOON_MS) out.push({ cls: "ending", label: "Ending soon" });
    if (comp.instantWins && comp.instantWins.length) out.push({ cls: "instant", label: "Instant wins" });
    if (pct >= ALMOST_GONE_PCT) out.push({ cls: "almost", label: "Almost gone" });
    if (comp.id === mostPopularId()) out.push({ cls: "popular", label: "Most popular" });
    return out;
  }

  /* ---------- Icons ---------- */

  var ICONS = {
    tech: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18h20a8 8 0 0 1 8 8v2a6 6 0 0 1-10.6 3.9L29 29H19l-2.4 2.9A6 6 0 0 1 6 28v-2a8 8 0 0 1 8-8Z"/><path d="M15 22v6M12 25h6"/><circle cx="32" cy="24" r="1.2" fill="currentColor"/><circle cx="35" cy="27" r="1.2" fill="currentColor"/></svg>',
    cars: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 30v-5l4-2 5-7h16l6 7 5 1.5V30"/><path d="M6 30h4m10 0h8m10 0h4"/><circle cx="15" cy="31" r="4"/><circle cx="33" cy="31" r="4"/><path d="M16 23h20"/></svg>',
    cash: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="13" width="38" height="22" rx="3"/><circle cx="24" cy="24" r="5"/><path d="M11 18v0M37 30v0"/></svg>',
    lifestyle: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 8h20l8 10-18 22L6 18Z"/><path d="M6 18h36M19 8l-3 10 8 22 8-22-3-10"/></svg>',
    ticket: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 14h36v6a4 4 0 0 0 0 8v6H6v-6a4 4 0 0 0 0-8Z"/><path d="m24 18 1.8 3.7 4 .6-2.9 2.8.7 4L24 27.2l-3.6 1.9.7-4-2.9-2.8 4-.6Z"/></svg>'
  };

  function placeholder(category, label) {
    label = label || "Prize image · 1200×900";
    return (
      '<div class="placeholder" role="img" aria-label="' + escapeHtml(label) + ' placeholder">' +
        (ICONS[category] || ICONS.ticket) +
        '<span class="placeholder__label">' + escapeHtml(label) + "</span>" +
      "</div>"
    );
  }

  function compUrl(comp, qty) {
    return "competition.html?id=" + encodeURIComponent(comp.id) + (qty ? "&qty=" + qty : "");
  }

  function lineTotal(comp, qty) { return Math.round(qty * comp.ticketPrice * 100) / 100; }

  /* ---------- Ticket card ---------- */

  /**
   * Returns the HTML string for a ticket-style competition card.
   * Usage: el.innerHTML = COMPETITIONS.map(renderTicketCard).join("");
   */
  function renderTicketCard(comp) {
    var url = "competition.html?id=" + encodeURIComponent(comp.id);
    var t = countdown(comp.endsAt);
    var pct = soldPercent(comp);
    var title = escapeHtml(comp.title);
    var sold = number.format(comp.ticketsSold);
    var max = number.format(comp.maxTickets);
    var serial = escapeHtml(comp.serial || "SCR-" + pad(COMPETITIONS.indexOf(comp) + 1).padStart(4, "0"));

    var badges = badgesFor(comp).map(function (b) {
      return '<span class="badge badge--' + b.cls + '">' + b.label + "</span>";
    }).join("");

    var media = comp.image
      ? '<img src="' + escapeHtml(comp.image) + '" alt="' + title + '" width="1200" height="900" loading="lazy">'
      : placeholder(comp.category);

    var worth = "Worth <strong>" + formatMoney(comp.prizeValue) + "</strong>" +
      (comp.cashAlternative ? " · or " + formatMoney(comp.cashAlternative) + " cash" : "");

    return (
      '<article class="ticket" data-comp-id="' + escapeHtml(comp.id) + '"' +
        ' data-category="' + escapeHtml(comp.category) + '"' +
        ' data-ends="' + new Date(comp.endsAt).getTime() + '" data-price="' + comp.ticketPrice + '"' +
        ' data-serial="' + escapeHtml(comp.serial || "") + '"' +
        (isEndingSoon(comp) ? " data-ending-soon" : "") +
        (comp.instantWins && comp.instantWins.length ? " data-instant" : "") + ">" +
        '<a class="ticket__media" href="' + url + '" tabindex="-1" aria-hidden="true">' + media + "</a>" +
        '<div class="ticket__badges">' + badges + "</div>" +

        '<div class="ticket__body">' +
          '<div class="ticket__head">' +
            '<span class="badge badge--category">' + (CATEGORY_LABELS[comp.category] || comp.category) + "</span>" +
            '<h3 class="ticket__title"><a href="' + url + '">' + title + "</a></h3>" +
            '<p class="ticket__worth">' + worth + "</p>" +
          "</div>" +

          '<div class="ticket__price-row">' +
            '<p class="ticket__price">' +
              '<span class="ticket__price-value">' + formatMoney(comp.ticketPrice) + "</span>" +
              '<span class="ticket__price-unit">per ticket</span>' +
            "</p>" +
            '<p class="ticket__timer">' +
              '<span class="ticket__timer-label">' + (t.ended ? "Status" : "Draw closes in") + "</span>" +
              '<time datetime="' + escapeHtml(comp.endsAt) + '" data-countdown="' + escapeHtml(comp.endsAt) + '"' +
                (t.ended ? ' class="is-ended"' : "") + ">" + t.label + "</time>" +
            "</p>" +
          "</div>" +

          "<div>" +
            '<div class="progress" role="progressbar" aria-label="Tickets sold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
              '<div class="progress__bar" style="--value:' + pct + '%"></div>' +
            "</div>" +
            '<p class="progress-meta"><span><strong>' + sold + "</strong> / " + max + " sold</span><span>" + pct + "%</span></p>" +
          "</div>" +

          '<p class="ticket__odds">' + odds(comp).replace(/(1 in [\d,]+)/, "<strong>$1</strong>") + "</p>" +
        "</div>" +

        '<div class="ticket__perf" aria-hidden="true"></div>' +

        '<div class="ticket__stub">' +
          '<div class="ticket__actions">' +
            '<a class="btn btn--gold" href="' + url + '">' + (t.ended ? "View draw" : "Enter now") + "</a>" +
            '<a class="btn btn--outline" href="free-entry.html?comp=' + encodeURIComponent(comp.id) + '">Free postal entry</a>' +
          "</div>" +
          '<p class="ticket__serial"><span>No. ' + serial + "</span><span>Admit one</span></p>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Featured competition ---------- */

  var BUNDLES = [1, 5, 10, 25];
  var POPULAR_BUNDLE = 10;

  function countdownBoxes(endsAt) {
    var t = countdown(endsAt);
    function box(key, value, label) {
      return '<div class="cd__box"><span class="cd__num" data-unit="' + key + '">' + pad(value) + '</span><span class="cd__label">' + label + "</span></div>";
    }
    return (
      '<div class="cd" data-countdown-boxes="' + escapeHtml(endsAt) + '" role="timer" aria-label="Time left: ' + t.label + '">' +
        box("days", t.days, "Days") + box("hours", t.hours, "Hrs") + box("minutes", t.minutes, "Min") + box("seconds", t.seconds, "Sec") +
      "</div>"
    );
  }

  /** The wide "hero of the store" block for one competition. */
  function renderFeatured(comp) {
    var url = "competition.html?id=" + encodeURIComponent(comp.id);
    var t = countdown(comp.endsAt);
    var pct = soldPercent(comp);
    var left = remainingTickets(comp);
    var title = escapeHtml(comp.title);
    var startQty = POPULAR_BUNDLE <= left ? POPULAR_BUNDLE : 1;

    var media = comp.image
      ? '<img src="' + escapeHtml(comp.image) + '" alt="' + title + '" width="1200" height="900" loading="lazy">'
      : placeholder(comp.category);

    var badges = badgesFor(comp).filter(function (b) { return b.cls !== "popular"; }).map(function (b) {
      return '<span class="badge badge--' + b.cls + '">' + b.label + "</span>";
    }).join("");

    var bundles = BUNDLES.map(function (qty) {
      var disabled = qty > left || t.ended;
      return (
        '<label class="bundle' + (qty === POPULAR_BUNDLE ? " bundle--popular" : "") + '">' +
          '<input type="radio" name="bundle-' + escapeHtml(comp.id) + '" value="' + qty + '"' +
            (qty === startQty ? " checked" : "") + (disabled ? " disabled" : "") + ">" +
          (qty === POPULAR_BUNDLE ? '<span class="bundle__flag">Most popular</span>' : "") +
          '<span class="bundle__qty">' + qty + "</span>" +
          '<span class="bundle__unit">' + (qty === 1 ? "ticket" : "tickets") + "</span>" +
          '<span class="bundle__total">' + formatTotal(lineTotal(comp, qty)) + "</span>" +
        "</label>"
      );
    }).join("");

    return (
      '<article class="feature" data-feature="' + escapeHtml(comp.id) + '">' +
        '<a class="feature__media" href="' + url + '" tabindex="-1" aria-hidden="true">' + media +
          '<span class="feature__serial">No. ' + escapeHtml(comp.serial || "") + "</span>" +
        "</a>" +
        '<div class="feature__body">' +
          '<div class="feature__badges"><span class="badge badge--featured">★ Featured draw</span>' + badges + "</div>" +
          '<h3 class="feature__title"><a href="' + url + '">' + title + "</a></h3>" +
          '<p class="feature__worth">Worth <strong>' + formatMoney(comp.prizeValue) + "</strong>" +
            (comp.cashAlternative ? " · or take " + formatMoney(comp.cashAlternative) + " cash" : "") + "</p>" +
          '<p class="feature__desc">' + escapeHtml(comp.description) + "</p>" +

          '<div class="feature__price"><span class="feature__price-value">' + formatMoney(comp.ticketPrice) + '</span><span class="feature__price-unit">per ticket</span></div>' +

          '<div class="feature__timer"><p class="feature__label">Draw closes in</p>' + countdownBoxes(comp.endsAt) + "</div>" +

          '<div class="feature__progress">' +
            '<div class="progress progress--lg" role="progressbar" aria-label="Tickets sold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
              '<div class="progress__bar" style="--value:' + pct + '%"></div>' +
            "</div>" +
            '<p class="progress-meta"><span><strong>' + number.format(comp.ticketsSold) + "</strong> / " + number.format(comp.maxTickets) + " sold</span>" +
              "<span>" + pct + "% · " + number.format(left) + " left</span></p>" +
            '<p class="ticket__odds">' + odds(comp).replace(/(1 in [\d,]+)/, "<strong>$1</strong>") + " per ticket</p>" +
          "</div>" +

          '<fieldset class="bundles"><legend class="feature__label">Choose your tickets</legend>' +
            '<div class="bundles__grid">' + bundles + "</div>" +
          "</fieldset>" +

          '<a class="btn btn--gold btn--lg btn--block feature__cta" href="' + compUrl(comp, startQty) + '" data-feature-cta>' +
            'Enter now · <span data-bundle-total>' + formatTotal(lineTotal(comp, startQty)) + "</span>" +
          "</a>" +
          '<p class="feature__small"><span class="chip-18 chip-18--sm" aria-hidden="true">18+</span><span>18+ · <a href="free-entry.html?comp=' + encodeURIComponent(comp.id) + '">Free postal entry available</a></span><span>· Draw streamed live</span></p>' +
        "</div>" +
      "</article>"
    );
  }

  function initBundles(root) {
    root.addEventListener("change", function (e) {
      if (!e.target.matches('.bundle input[type="radio"]')) return;
      var feature = e.target.closest("[data-feature]");
      var comp = findCompetition(feature.getAttribute("data-feature"));
      var qty = parseInt(e.target.value, 10);
      var cta = feature.querySelector("[data-feature-cta]");
      cta.href = compUrl(comp, qty);
      cta.querySelector("[data-bundle-total]").textContent = formatTotal(lineTotal(comp, qty));
    });
  }

  /* ---------- Competition filters ---------- */

  var FILTERS = {
    all: function () { return true; },
    ending: function (card) { return card.hasAttribute("data-ending-soon"); },
    instant: function (card) { return card.hasAttribute("data-instant"); }
  };

  function filterItems(grid) {
    return Array.prototype.filter.call(grid.children, function (el) { return el.matches(".ticket, .winner"); });
  }

  /** Updates any [data-results-count="<grid id>"] with the number of visible items. */
  function updateCount(grid) {
    var el = document.querySelector('[data-results-count="' + grid.id + '"]');
    if (!el) return;
    var n = filterItems(grid).filter(function (c) { return !c.hidden; }).length;
    var noun = el.getAttribute("data-noun") || "competition";
    el.textContent = "Showing " + n + " " + noun + (n === 1 ? "" : "s");
  }

  /** Chips: [data-filter-group] with buttons [data-filter="all|ending|instant|<category>|<YYYY-MM>"],
      controlling the grid named in data-filter-group. Works for ticket cards and winner cards. */
  function initFilters(group) {
    var grid = document.getElementById(group.getAttribute("data-filter-group"));
    if (!grid) return;
    var empty = document.querySelector('[data-filter-empty="' + grid.id + '"]');
    group.hidden = false;
    updateCount(grid);

    group.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter]");
      if (!chip) return;
      var key = chip.getAttribute("data-filter");
      var test = FILTERS[key] || function (card) {
        return card.getAttribute("data-category") === key || card.getAttribute("data-month") === key;
      };
      var shown = 0;

      group.querySelectorAll("[data-filter]").forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      filterItems(grid).forEach(function (card) {
        var match = test(card);
        card.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      updateCount(grid);

      if (!REDUCED_MOTION && window.gsap) {
        window.gsap.fromTo(filterItems(grid).filter(function (c) { return !c.hidden; }),
          { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" });
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  var SORTS = {
    ending: function (a, b) { return a.getAttribute("data-ends") - b.getAttribute("data-ends"); },
    "price-asc": function (a, b) { return a.getAttribute("data-price") - b.getAttribute("data-price"); },
    newest: function (a, b) { return b.getAttribute("data-serial").localeCompare(a.getAttribute("data-serial")); }
  };

  /** <select data-sort-for="<grid id>"> with option values from SORTS. */
  function initSort(select) {
    var grid = document.getElementById(select.getAttribute("data-sort-for"));
    if (!grid) return;
    var wrap = select.closest("[data-sort-wrap]");
    if (wrap) wrap.hidden = false;
    function apply() {
      var sorter = SORTS[select.value];
      if (!sorter) return;
      filterItems(grid).sort(sorter).forEach(function (card) { grid.appendChild(card); });
    }
    select.addEventListener("change", apply);
    apply();
  }

  /** Builds month chips ("September 2026") for a winners list into [data-month-chips]. */
  function buildMonthChips(group) {
    var months = [];
    (window.SCR_WINNERS || []).forEach(function (w) {
      var m = w.date.slice(0, 7);
      if (months.indexOf(m) === -1) months.push(m);
    });
    var label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
    group.insertAdjacentHTML("beforeend", months.map(function (m) {
      return '<button type="button" class="filter-chip" data-filter="' + m + '" aria-pressed="false">' +
        label.format(new Date(m + "-15T12:00:00")) + "</button>";
    }).join(""));
  }

  /* ---------- Free postal entry helpers ---------- */

  var closeFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
  function closeLabel(iso) {
    return closeFmt.format(new Date(iso)).replace(":00", "").replace(/\s([ap]m)$/i, "$1");
  }

  /** Table of every live competition and its question, for postal entrants. */
  function renderPostalTable(el) {
    var focus = new URLSearchParams(window.location.search).get("comp");
    var rows = COMPETITIONS.filter(function (c) { return !countdown(c.endsAt).ended; })
      .sort(function (a, b) { return new Date(a.endsAt) - new Date(b.endsAt); })
      .map(function (c) {
        var q = c.question || { text: "", options: [] };
        return (
          "<tr" + (c.id === focus ? ' class="is-focus"' : "") + ' id="postal-' + escapeHtml(c.id) + '">' +
            '<th scope="row"><a href="' + compUrl(c) + '">' + escapeHtml(c.title) + "</a></th>" +
            "<td>" + escapeHtml(q.text) + '<span class="postal-table__opts">' + q.options.map(escapeHtml).join(" / ") + "</span></td>" +
            '<td class="mono">' + closeLabel(c.endsAt) + "</td>" +
          "</tr>"
        );
      }).join("");
    el.innerHTML =
      '<table class="postal-table"><thead><tr><th scope="col">Competition</th><th scope="col">Question &amp; options</th><th scope="col">Entries close</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table>";

    var row = focus && document.getElementById("postal-" + focus);
    var note = document.querySelector("[data-postal-focus]");
    var comp = focus && findCompetition(focus);
    if (row && note && comp) {
      note.innerHTML = "You're entering <strong>" + escapeHtml(comp.title) + "</strong>. Write its name and your answer to <em>“" +
        escapeHtml(comp.question.text) + "”</em> on your postcard. Entries must arrive before " +
        closeLabel(comp.endsAt) + ".";
      note.hidden = false;
    }
  }

  document.addEventListener("click", function (e) {
    var reset = e.target.closest("[data-filter-reset]");
    if (!reset) return;
    var all = document.querySelector('[data-filter-group="' + reset.getAttribute("data-filter-reset") + '"] [data-filter="all"]');
    if (all) { all.click(); all.focus(); }
  });

  /* ---------- Home hero: headline prize ---------- */

  /** Fills the hero from the competition named in data-hero-comp (falls back
      to the first featured one), so price, countdown and odds stay real. */
  function initHeroComp() {
    var hero = document.querySelector("[data-hero-comp]");
    if (!hero) return;
    var comp = findCompetition(hero.getAttribute("data-hero-comp")) ||
      COMPETITIONS.filter(function (c) { return c.featured; })[0];
    if (!comp) return;
    var t = countdown(comp.endsAt);
    var pct = soldPercent(comp);
    function set(sel, fn) { var el = hero.querySelector(sel); if (el) fn(el); }

    set("[data-hero-title]", function (el) { el.textContent = comp.title; });
    set("[data-hero-price]", function (el) { el.textContent = formatMoney(comp.ticketPrice); });
    set("[data-hero-countdown]", function (el) { el.innerHTML = countdownBoxes(comp.endsAt); });
    set("[data-hero-progress]", function (el) {
      el.innerHTML =
        '<div class="progress" role="progressbar" aria-label="Tickets sold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
          '<div class="progress__bar" style="--value:' + pct + '%"></div>' +
        "</div>" +
        '<p class="progress-meta"><span><strong>' + number.format(comp.ticketsSold) + "</strong> / " + number.format(comp.maxTickets) + " sold</span>" +
        "<span>" + odds(comp) + "</span></p>";
    });
    set("[data-hero-enter]", function (el) {
      el.href = compUrl(comp);
      if (t.ended) el.firstChild.textContent = "View draw ";
    });
    set("[data-hero-free]", function (el) { el.href = "free-entry.html?comp=" + encodeURIComponent(comp.id); });
    set("[data-hero-serial]", function (el) { el.textContent = "No. " + (comp.serial || ""); });
    set("[data-hero-status]", function (el) {
      var b = badgesFor(comp)[0];
      el.className = "badge badge--" + b.cls + " hero__badge";
      el.textContent = b.label;
    });
    if (comp.image) {
      set(".hero__placeholder", function (el) {
        el.outerHTML = '<img class="hero__img" src="' + escapeHtml(comp.image) + '" alt="' + escapeHtml(comp.title) + '" width="1200" height="900" fetchpriority="high">';
      });
    }
  }

  /* ---------- Home: category rows + sticky sub-nav ---------- */

  var ROW_WINDOW_MS = 7 * 24 * 3600 * 1000; // "Ending Soon" = closes within 7 days
  var ROWS = {
    ending: function (c) { var t = countdown(c.endsAt); return !t.ended && t.total < ROW_WINDOW_MS; },
    instant: function (c) { return !countdown(c.endsAt).ended && c.instantWins && c.instantWins.length > 0; },
    all: function (c) { return !countdown(c.endsAt).ended; }
  };

  /** Fills each [data-comp-row="ending|instant|all"] with ticket cards (scroll
      rows for ending/instant, a grid for all), soonest to close first. Empty rows hide their section and sub-nav link. */
  function renderCompRows() {
    document.querySelectorAll("[data-comp-row]").forEach(function (row) {
      var kind = row.getAttribute("data-comp-row");
      var list = COMPETITIONS.filter(ROWS[kind] || ROWS.all)
        .sort(function (a, b) { return new Date(a.endsAt) - new Date(b.endsAt); });
      var section = row.closest("[data-row-section]");
      document.querySelectorAll('[data-row-count="' + kind + '"]').forEach(function (el) { el.textContent = list.length; });
      if (!list.length) {
        if (section) {
          section.hidden = true;
          var link = document.querySelector('[data-subnav-link="' + section.id + '"]');
          if (link) link.hidden = true;
        }
        return;
      }
      row.innerHTML = list.map(renderTicketCard).join("");
      if (row.classList.contains("card-row")) initRowNav(row);
    });
  }

  /** Prev/next arrows for a horizontal row; shown only when the row overflows. */
  function initRowNav(row) {
    var section = row.closest("[data-row-section]");
    var nav = section && section.querySelector("[data-row-nav]");
    if (!nav) return;
    var prev = nav.querySelector("[data-row-prev]");
    var next = nav.querySelector("[data-row-next]");
    function sync() {
      var overflow = row.scrollWidth > row.clientWidth + 4;
      nav.hidden = !overflow;
      prev.disabled = row.scrollLeft <= 4;
      next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
    }
    function step(dir) {
      var card = row.querySelector(".ticket");
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      var by = card ? (card.getBoundingClientRect().width + gap) * Math.max(1, Math.floor(row.clientWidth / card.getBoundingClientRect().width)) : row.clientWidth;
      row.scrollBy({ left: dir * by, behavior: REDUCED_MOTION ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    row.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /** Sticky sub-nav: smooth jump to each section and gold highlight on the
      section currently in view (IntersectionObserver). */
  function initSubnav() {
    var nav = document.querySelector("[data-subnav]");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll("[data-subnav-link]"));
    var sections = links.map(function (l) { return document.getElementById(l.getAttribute("data-subnav-link")); })
      .filter(function (sec) { return sec && !sec.hidden; });

    function offset() {
      var header = document.querySelector(".site-header");
      return (header ? header.getBoundingClientRect().height : 0) + nav.getBoundingClientRect().height;
    }
    function setActive(id) {
      links.forEach(function (l) {
        var on = l.getAttribute("data-subnav-link") === id;
        l.classList.toggle("is-active", on);
        if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
      });
      var active = nav.querySelector(".is-active");
      var inner = nav.querySelector(".subnav__inner");
      // keep the active link visible when the bar scrolls sideways on phones
      if (active && inner.scrollWidth > inner.clientWidth) {
        inner.scrollTo({ left: active.offsetLeft - 24, behavior: REDUCED_MOTION ? "auto" : "smooth" });
      }
    }

    links.forEach(function (l) {
      l.addEventListener("click", function (e) {
        var target = document.getElementById(l.getAttribute("data-subnav-link"));
        if (!target) return;
        e.preventDefault();
        var lenis = window.SCR.lenis;
        if (lenis) lenis.scrollTo(target, { offset: -offset() + 1 });
        else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset() + 1, behavior: REDUCED_MOTION ? "auto" : "smooth" });
        history.replaceState(null, "", "#" + target.id);
        setActive(target.id);
      });
    });

    if (!("IntersectionObserver" in window)) return;
    var visible = {};
    var io;
    function observe() {
      if (io) io.disconnect();
      // a band from just under the sticky bars to the middle of the screen
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
        var current = null;
        sections.forEach(function (sec) { if (visible[sec.id]) current = current || sec.id; });
        if (current) setActive(current);
        else if (window.scrollY + offset() < sections[0].getBoundingClientRect().top + window.scrollY) setActive(null);
      }, { rootMargin: -Math.round(offset()) + "px 0px -50% 0px", threshold: 0 });
      sections.forEach(function (sec) { io.observe(sec); });
    }
    observe();
    window.addEventListener("resize", function () { clearTimeout(observe.t); observe.t = setTimeout(observe, 200); });
  }

  /* ---------- Winners ticker ---------- */

  var STAR = '<svg class="ticker__star" viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6Z"/></svg>';
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function shortDate(iso) { var p = iso.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1]; }

  /** Fills [data-winners-ticker] with two copies of the list for a seamless loop. */
  function renderWinnersTicker(track) {
    var winners = window.SCR_WINNERS || [];
    if (!winners.length) return;
    function items(hidden) {
      return winners.map(function (w) {
        return '<li class="ticker__item"' + (hidden ? ' aria-hidden="true"' : "") + ">" + STAR +
          "<span><strong>" + escapeHtml(w.name) + "</strong> · " + escapeHtml(w.town) +
          ' · won <span class="prize">' + escapeHtml(w.prize) + "</span> · " +
          '<time datetime="' + escapeHtml(w.date) + '">' + shortDate(w.date) + "</time></span></li>";
      }).join("");
    }
    track.innerHTML = items(false) + items(true);
    track.style.setProperty("--ticker-duration", winners.length * 6 + "s");
  }

  function initials(name) {
    return name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  /** Winner card: photo placeholder (initials), name, town, prize, date, draw link. */
  function renderWinnerCard(w) {
    return (
      '<li class="winner" data-month="' + escapeHtml(w.date.slice(0, 7)) + '">' +
        (w.photo
          ? '<span class="winner__photo"><img src="' + escapeHtml(w.photo) + '" alt="Photo of ' + escapeHtml(w.name) + '" width="400" height="400" loading="lazy"></span>'
          : '<span class="winner__photo" role="img" aria-label="Winner photo placeholder">' + escapeHtml(initials(w.name)) + "</span>") +
        '<div class="winner__body">' +
          '<p class="winner__who"><strong>' + escapeHtml(w.name) + "</strong> " + escapeHtml(w.town) + "</p>" +
          '<p class="winner__prize">' + escapeHtml(w.prize) + "</p>" +
          '<p class="winner__meta"><time datetime="' + escapeHtml(w.date) + '">' + shortDate(w.date) + "</time>" +
            '<a href="' + escapeHtml(w.drawUrl || "#") + '">Watch draw<span class="sr-only"> for ' + escapeHtml(w.name) + "</span></a></p>" +
        "</div>" +
      "</li>"
    );
  }

  /* ---------- Shared chrome ---------- */

  function currentPage() { return document.body.getAttribute("data-page") || ""; }

  function navLinks() {
    var page = currentPage();
    return NAV.map(function (item) {
      return '<li><a href="' + item.href + '"' + (item.page === page ? ' aria-current="page"' : "") + ">" + item.label + "</a></li>";
    }).join("");
  }

  function headerHTML() {
    return (
      '<div class="announce" role="region" aria-label="Announcement">' +
        '<p class="container">Next live draw: Friday 8pm on Instagram · <a href="free-entry.html">Free postal entry</a> on every competition</p>' +
      "</div>" +
      '<header class="site-header">' +
        '<div class="container site-header__inner">' +
          '<a class="brand" href="index.html" aria-label="Second Chance Raffles home">' +
            '<img src="assets/logo-mark.jpeg" alt="" width="590" height="560">' +
            '<span class="brand__name">Second <span>Chance</span><br>Raffles</span>' +
          "</a>" +
          '<nav class="site-nav" aria-label="Main"><ul>' + navLinks() + "</ul></nav>" +
          '<div class="site-header__actions">' +
            '<span class="chip-18" title="Over 18s only" aria-label="18 plus only">18+</span>' +
            '<a class="btn btn--gold btn--sm site-header__cta" href="competitions.html">Enter now</a>' +
            '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu">' +
              '<span class="sr-only">Menu</span><span class="menu-toggle__bars" aria-hidden="true"></span>' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</header>" +
      // Sibling of the header: its backdrop-filter would trap a fixed child.
      '<div class="mobile-menu" id="mobile-menu" hidden data-lenis-prevent>' +
          '<div class="container">' +
            '<nav aria-label="Mobile"><ul>' +
              '<li><a href="index.html"' + (currentPage() === "home" ? ' aria-current="page"' : "") + ">Home</a></li>" +
              navLinks() +
            "</ul></nav>" +
            '<div class="mobile-menu__foot">' +
              '<a class="btn btn--gold btn--block btn--lg" href="competitions.html">Enter now</a>' +
              '<a class="btn btn--outline btn--block" href="free-entry.html">Free postal entry</a>' +
              '<p class="mobile-menu__note"><span class="chip-18" aria-hidden="true">18+</span><span>Over 18s only. Play for fun and set a budget. <a href="responsible-play.html">Responsible play</a></span></p>' +
            "</div>" +
          "</div>" +
        "</div>"
    );
  }

  var PAYMENT_ICONS =
    '<svg viewBox="0 0 48 30" role="img" aria-label="Visa"><rect x=".5" y=".5" width="47" height="29" rx="5" fill="#1E1B15" stroke="rgba(244,238,223,.18)"/><text x="24" y="19.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" font-style="italic" fill="#F4EEDF" letter-spacing=".5">VISA</text></svg>' +
    '<svg viewBox="0 0 48 30" role="img" aria-label="Mastercard"><rect x=".5" y=".5" width="47" height="29" rx="5" fill="#1E1B15" stroke="rgba(244,238,223,.18)"/><circle cx="20" cy="15" r="7" fill="#A39B87" fill-opacity=".85"/><circle cx="28" cy="15" r="7" fill="#F5B400" fill-opacity=".85"/></svg>' +
    '<svg viewBox="0 0 48 30" role="img" aria-label="Apple Pay"><rect x=".5" y=".5" width="47" height="29" rx="5" fill="#1E1B15" stroke="rgba(244,238,223,.18)"/><text x="24" y="19" text-anchor="middle" font-family="-apple-system, Arial, sans-serif" font-size="8" font-weight="600" fill="#F4EEDF">Apple Pay</text></svg>' +
    '<svg viewBox="0 0 48 30" role="img" aria-label="Google Pay"><rect x=".5" y=".5" width="47" height="29" rx="5" fill="#1E1B15" stroke="rgba(244,238,223,.18)"/><text x="24" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="600" fill="#F4EEDF">G Pay</text></svg>' +
    '<svg viewBox="0 0 48 30" role="img" aria-label="PayPal"><rect x=".5" y=".5" width="47" height="29" rx="5" fill="#1E1B15" stroke="rgba(244,238,223,.18)"/><text x="24" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="700" font-style="italic" fill="#F4EEDF">PayPal</text></svg>';

  function footerHTML() {
    var year = new Date().getFullYear();
    return (
      '<footer class="site-footer theme-dark">' +
        '<div class="container">' +
          '<div class="footer__top">' +
            '<div class="footer__brand">' +
              '<img src="assets/logo-lockup.jpeg" alt="Second Chance Raffles" width="800" height="740" loading="lazy">' +
              '<p class="footer__tagline">Same people.<br><span class="gold">More chances.</span></p>' +
              '<p class="footer__pillars">Raffles · Community · Bigger opportunities · 2nd chance</p>' +
              "<p>Every losing ticket goes into our monthly Second Chance draw. Lose a draw, keep a chance.</p>" +
            "</div>" +
            '<div class="footer__cols">' +
              '<div class="footer__col"><h2>Play</h2><ul>' +
                '<li><a href="competitions.html">Competitions</a></li>' +
                '<li><a href="winners.html">Winners</a></li>' +
                '<li><a href="how-it-works.html">How it works</a></li>' +
                '<li><a href="free-entry.html">Free postal entry</a></li>' +
              "</ul></div>" +
              '<div class="footer__col"><h2>Legal</h2><ul>' +
                '<li><a href="terms.html">Terms &amp; conditions</a></li>' +
                '<li><a href="privacy.html">Privacy policy</a></li>' +
                '<li><a href="responsible-play.html">Responsible play</a></li>' +
              "</ul></div>" +
              '<div class="footer__col"><h2>Live draws</h2><ul>' +
                "<li>Fridays, 8pm</li>" +
                "<li>Streamed on Instagram</li>" +
                "<li>Every draw recorded</li>" +
              "</ul></div>" +
            "</div>" +
          "</div>" +

          '<div class="footer__play">' +
            '<span class="chip-18" aria-hidden="true">18+</span>' +
            "<p><strong>Over 18s only. UK residents.</strong> Competitions should be fun, not a way to make money. Set a budget before you play and stick to it. If it stops being fun, take a break — our " +
            '<a href="responsible-play.html">responsible play</a> page has tools and free, confidential support. ' +
            'No purchase necessary: <a href="free-entry.html">enter any competition free by post</a>.</p>' +
          "</div>" +

          '<div class="footer__pay" aria-label="Payment methods">' + PAYMENT_ICONS + "</div>" +

          '<div class="footer__bottom">' +
            "<p>[Company name] Ltd · Registered in England &amp; Wales No. [00000000] · [Registered address]</p>" +
            "<p>© " + year + " Second Chance Raffles. All rights reserved.</p>" +
          "</div>" +
        "</div>" +
      "</footer>"
    );
  }

  function modalHTML() {
    return (
      '<dialog class="modal" id="checkout-modal" aria-labelledby="checkout-title">' +
        '<div class="modal__panel">' +
          '<button type="button" class="modal__close" data-modal-close aria-label="Close">×</button>' +
          '<p class="eyebrow">Demo preview</p>' +
          '<h2 id="checkout-title">Secure checkout coming soon</h2>' +
          '<div class="modal__comp" data-modal-comp hidden></div>' +
          '<p class="muted">Ticket sales open shortly. When they do, every losing ticket still goes into our monthly Second Chance draw. You can always enter free by post.</p>' +
          '<div class="modal__actions">' +
            '<a class="btn btn--outline" href="free-entry.html" data-modal-free>Free postal entry</a>' +
            '<button type="button" class="btn btn--gold" data-modal-close>Got it</button>' +
          "</div>" +
        "</div>" +
      "</dialog>"
    );
  }

  /* ---------- Behaviour ---------- */

  function mountChrome() {
    var headerSlot = document.querySelector("[data-site-header]");
    var footerSlot = document.querySelector("[data-site-footer]");
    if (headerSlot) headerSlot.outerHTML = headerHTML();
    if (footerSlot) footerSlot.outerHTML = footerHTML();
    document.body.insertAdjacentHTML("beforeend", modalHTML());
    document.documentElement.classList.add("js");
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("mobile-menu");
    var header = document.querySelector(".site-header");
    if (!toggle || !menu) return;

    function setOpen(open) {
      if (open) menu.style.setProperty("--menu-top", header.getBoundingClientRect().bottom + "px");
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (window.SCR.lenis) open ? window.SCR.lenis.stop() : window.SCR.lenis.start();
      if (open) { var first = menu.querySelector("a"); if (first) first.focus(); }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  function initModal() {
    var modal = document.getElementById("checkout-modal");
    if (!modal) return;
    var compLine = modal.querySelector("[data-modal-comp]");
    var freeLink = modal.querySelector("[data-modal-free]");

    function row(label, value) {
      return "<div><dt>" + label + "</dt><dd>" + value + "</dd></div>";
    }

    /** Opens the demo checkout. qty and answer are optional and fill in the summary. */
    function open(compId, qty, answer) {
      var comp = findCompetition(compId);
      if (comp) {
        qty = qty || 1;
        compLine.innerHTML =
          '<dl class="summary">' +
            row("Prize", escapeHtml(comp.title)) +
            row("Tickets", qty + " × " + formatMoney(comp.ticketPrice)) +
            (answer ? row("Your answer", escapeHtml(answer)) : "") +
            row("Your odds", "1 in " + number.format(Math.max(1, Math.round(comp.maxTickets / qty)))) +
            '<div class="summary__total"><dt>Total</dt><dd>' + formatTotal(lineTotal(comp, qty)) + "</dd></div>" +
          "</dl>";
        compLine.hidden = false;
        freeLink.href = "free-entry.html?comp=" + encodeURIComponent(comp.id);
      } else {
        compLine.hidden = true;
        freeLink.href = "free-entry.html";
      }
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.setAttribute("open", "");
      if (window.SCR.lenis) window.SCR.lenis.stop();
    }
    function close() {
      if (typeof modal.close === "function") modal.close();
      else modal.removeAttribute("open");
    }
    modal.addEventListener("close", function () { if (window.SCR.lenis) window.SCR.lenis.start(); });

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-checkout]");
      if (trigger) { e.preventDefault(); open(trigger.getAttribute("data-checkout"), parseInt(trigger.getAttribute("data-qty"), 10) || 0, trigger.getAttribute("data-answer")); return; }
      if (e.target.closest("[data-modal-close]")) close();
    });
    // click on the backdrop closes
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  }

  function tickCountdowns() {
    var els = document.querySelectorAll("[data-countdown]");
    els.forEach(function (el) {
      var t = countdown(el.getAttribute("data-countdown"));
      if (el.textContent !== t.label) el.textContent = t.label;
      if (t.ended) el.classList.add("is-ended");
    });
    document.querySelectorAll("[data-countdown-boxes]").forEach(function (el) {
      var t = countdown(el.getAttribute("data-countdown-boxes"));
      ["days", "hours", "minutes", "seconds"].forEach(function (key) {
        var num = el.querySelector('[data-unit="' + key + '"]');
        var value = pad(t[key]);
        if (num && num.textContent !== value) num.textContent = value;
      });
      el.setAttribute("aria-label", "Time left: " + t.label);
      if (t.ended) el.classList.add("is-ended");
    });
  }

  /* ---------- Motion (progressive enhancement) ----------
     Everything here is optional: content is fully visible in the HTML, and
     nothing is hidden unless GSAP is loaded and about to animate it. Only
     transform and opacity are animated. Skipped under prefers-reduced-motion. */

  var REVEAL_HEADS = ".section-head, .sc__copy, .split__head, .same-odds, .final-cta__title, .community__copy";
  var REVEAL_CARDS = ".ticket, .feature, .winner, .step, .timeline__step, .social, .replay, .faq__item, " +
    ".sc__stat, .trust-item, .odds-example, .postcard, .address-card, .legal__section, .facts > div";

  function belowFold(el) { return el.getBoundingClientRect().top > window.innerHeight * 0.92; }

  /** Fade + rise for headings and cards inside root. Elements already on
      screen are left alone, so nothing flashes on load. */
  function initReveals(root) {
    var gsap = window.gsap;
    if (REDUCED_MOTION || !gsap || !window.ScrollTrigger) return;
    root = root || document;

    gsap.utils.toArray(root.querySelectorAll(REVEAL_HEADS)).forEach(function (el) {
      if (el.dataset.revealed || !belowFold(el)) return;
      el.dataset.revealed = "1";
      gsap.from(el, {
        autoAlpha: 0, y: 28, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    var cards = gsap.utils.toArray(root.querySelectorAll(REVEAL_CARDS)).filter(function (el) {
      if (el.dataset.revealed || el.closest(".steps--scrub") || !belowFold(el)) return false;
      el.dataset.revealed = "1";
      return true;
    });
    if (cards.length) {
      gsap.set(cards, { autoAlpha: 0, y: 32 });
      window.ScrollTrigger.batch(cards, {
        start: "top 90%", once: true,
        onEnter: function (batch) {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true });
        }
      });
    }

    // Progress bars fill from 0 to their real width (scaleX, so no layout work).
    gsap.utils.toArray(root.querySelectorAll(".progress__bar")).forEach(function (bar) {
      if (bar.dataset.revealed) return;
      bar.dataset.revealed = "1";
      gsap.from(bar, {
        scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: bar, start: "top 95%", once: true }
      });
    });
  }

  function splitWords(el) {
    var out = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement("span");
          w.className = "word";
          w.textContent = part;
          frag.appendChild(w);
          out.push(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        // e.g. the gold "second chance" span: split it, keeping its class on each word
        var cls = node.className;
        var words = node.textContent.split(/(\s+)/);
        var frag2 = document.createDocumentFragment();
        words.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag2.appendChild(document.createTextNode(part)); return; }
          var w2 = document.createElement("span");
          w2.className = "word " + cls;
          w2.textContent = part;
          frag2.appendChild(w2);
          out.push(w2);
        });
        node.parentNode.replaceChild(frag2, node);
      }
    });
    return out;
  }

  function initHeroMotion(gsap) {
    var hero = document.querySelector(".hero");
    var root = document.documentElement;
    if (!hero) return;

    var title = hero.querySelector(".hero__title");
    var words = title ? splitWords(title) : [];
    var copy = hero.querySelectorAll(".hero__sub, .hero__price, .hero__timer, .hero__progress, .hero__ctas, .hero__small");
    var art = hero.querySelector(".hero__media");

    gsap.set(words, { autoAlpha: 0, yPercent: 60, rotate: 2 });
    gsap.set(copy, { autoAlpha: 0, y: 16 });
    if (art) gsap.set(art, { autoAlpha: 0, scale: 0.96 });
    root.classList.remove("hero-pending");

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(words, { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.055 }, 0.15)
      .to(art, { autoAlpha: 1, scale: 1, duration: 1.2 }, 0.25)
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.45);

    // A little parallax on the prize image as the hero scrolls away.
    if (art) {
      gsap.to(art, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /** Home "How it works": desktop pins the section and steps through it while
      the ticket tears. Mobile keeps the plain stacked layout with reveals. */
  function initStepsScrub(gsap) {
    var stage = document.querySelector("[data-steps-stage]");
    if (!stage || !gsap.matchMedia) return;
    var section = stage.closest("section");
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (min-height: 760px)", function () {
      section.classList.add("steps--scrub");
      var steps = gsap.utils.toArray(stage.querySelectorAll(".step"));
      var ticket = stage.querySelector("[data-steps-ticket]");
      var gold = ticket.querySelector(".torn__half--gold");
      var black = ticket.querySelector(".torn__half--black");

      gsap.set(steps, { autoAlpha: 0.28, x: 0 });
      gsap.set(steps[0], { autoAlpha: 1, x: 12 });

      var tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: section, start: "top top", end: "+=" + steps.length * 70 + "%",
          pin: true, scrub: 0.7, anticipatePin: 1
        }
      });
      steps.slice(1).forEach(function (step, i) {
        tl.to(steps[i], { autoAlpha: 0.28, x: 0 }, i)
          .to(step, { autoAlpha: 1, x: 12 }, i);
      });
      // Final step ("Didn't win?"): the ticket tears in two.
      var last = steps.length - 2;
      tl.to(ticket, { rotate: -4, duration: 0.6 }, last)
        .to(gold, { x: -46, y: -8, rotate: -10 }, last + 0.3)
        .to(black, { x: 46, y: 22, rotate: 9 }, last + 0.3)
        .to({}, { duration: 0.4 });

      return function () {
        section.classList.remove("steps--scrub");
        gsap.set([steps, ticket, gold, black], { clearProps: "all" });
      };
    });
  }

  /** Home only: bottom "Enter now" bar once the hero has scrolled away. */
  function initHomeBuybar() {
    var hero = document.querySelector(".hero");
    if (!hero || !("IntersectionObserver" in window) || !COMPETITIONS.length) return;
    var live = COMPETITIONS.filter(function (c) { return !countdown(c.endsAt).ended; });
    var from = Math.min.apply(null, live.map(function (c) { return c.ticketPrice; }));
    document.body.insertAdjacentHTML("beforeend",
      '<div class="buybar" data-home-buybar aria-hidden="true">' +
        '<div class="buybar__info"><span class="buybar__price">From ' + formatMoney(from) + "</span>" +
        '<span class="buybar__meta">' + live.length + " live draws · Free postal entry</span></div>" +
        '<a class="btn btn--gold" href="competitions.html" tabindex="-1">Enter now</a>' +
      "</div>");
    var bar = document.querySelector("[data-home-buybar]");
    var link = bar.querySelector("a");
    var heroVisible = true;
    var ctaVisible = false;
    function sync() {
      var show = !heroVisible && !ctaVisible;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", String(!show));
      link.tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; sync(); }).observe(hero);
    var finalCta = document.querySelector(".final-cta");
    if (finalCta) new IntersectionObserver(function (e) { ctaVisible = e[0].isIntersecting; sync(); }).observe(finalCta);
    document.body.classList.add("has-buybar");
  }

  function initMotion() {
    var gsap = window.gsap;
    if (REDUCED_MOTION || !gsap || !window.ScrollTrigger) {
      document.documentElement.classList.remove("hero-pending");
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);

    // 1. Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
    if (window.Lenis) {
      var lenis = new window.Lenis({ lerp: 0.1 });
      window.SCR.lenis = lenis;
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Hero intro, float and parallax.
    initHeroMotion(gsap);

    // 6. Pinned How it works (desktop). Runs before reveals so its steps are skipped there.
    initStepsScrub(gsap);

    // 3 + 4. Headings, cards and progress bars.
    initReveals(document);

    // 5. Stats count up once. The final value stays in the HTML until this starts.
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      window.ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () {
          var state = { v: 0 };
          gsap.to(state, {
            v: target, duration: 2, ease: "power2.out",
            onUpdate: function () { el.textContent = prefix + number.format(Math.round(state.v)) + suffix; }
          });
        }
      });
    });

    // Recalculate trigger positions once web fonts have changed line lengths.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
  }

  /* ---------- Public API ---------- */

  window.SCR = {
    competitions: COMPETITIONS,
    formatMoney: formatMoney,
    countdown: countdown,
    soldPercent: soldPercent,
    odds: odds,
    findCompetition: findCompetition,
    renderTicketCard: renderTicketCard,
    renderFeatured: renderFeatured,
    reveal: initReveals,
    countdownBoxes: countdownBoxes,
    badgesFor: badgesFor,
    remainingTickets: remainingTickets,
    compUrl: compUrl,
    lineTotal: lineTotal,
    formatTotal: formatTotal,
    escapeHtml: escapeHtml,
    formatNumber: function (n) { return number.format(n); },
    categoryLabel: function (cat) { return CATEGORY_LABELS[cat] || cat; },
    isEndingSoon: isEndingSoon,
    placeholder: placeholder,
    tickCountdowns: tickCountdowns,
    lenis: null
  };
  // Short global aliases for page scripts
  window.formatMoney = formatMoney;
  window.countdown = countdown;
  window.soldPercent = soldPercent;
  window.odds = odds;
  window.renderTicketCard = renderTicketCard;

  function init() {
    mountChrome();
    initMobileMenu();
    initModal();

    // Fill any [data-render="ticket-cards"] grid. Optional attributes:
    // data-category="tech" and data-limit="3".
    document.querySelectorAll('[data-render="ticket-cards"]').forEach(function (grid) {
      var cat = grid.getAttribute("data-category");
      var limit = parseInt(grid.getAttribute("data-limit"), 10) || COMPETITIONS.length;
      var list = COMPETITIONS.filter(function (c) { return !cat || c.category === cat; }).slice(0, limit);
      grid.innerHTML = list.map(renderTicketCard).join("");
    });

    document.querySelectorAll('[data-render="featured"]').forEach(function (slot) {
      // up to two featured competitions, stacked full width
      var featured = COMPETITIONS.filter(function (c) { return c.featured && !countdown(c.endsAt).ended; }).slice(0, 2);
      if (!featured.length) return;
      slot.innerHTML = featured.map(renderFeatured).join("");
      initBundles(slot);
    });
    initHeroComp();
    renderCompRows();
    initSubnav();
    document.querySelectorAll("[data-winners-ticker]").forEach(renderWinnersTicker);
    document.querySelectorAll('[data-render="winners"]').forEach(function (list) {
      var limit = parseInt(list.getAttribute("data-limit"), 10) || undefined;
      list.innerHTML = (window.SCR_WINNERS || []).slice(0, limit).map(renderWinnerCard).join("");
    });
    document.querySelectorAll("[data-month-chips]").forEach(buildMonthChips);
    document.querySelectorAll("[data-filter-group]").forEach(initFilters);
    document.querySelectorAll("[data-sort-for]").forEach(initSort);
    document.querySelectorAll('[data-render="postal-table"]').forEach(renderPostalTable);
    document.querySelectorAll("[data-payment-icons]").forEach(function (el) { el.innerHTML = PAYMENT_ICONS; });

    tickCountdowns();
    setInterval(tickCountdowns, 1000);
    initHomeBuybar();
    initMotion();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
