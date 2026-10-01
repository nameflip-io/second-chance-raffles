/* ==========================================================================
   Second Chance Raffles — competition page (competition.html?id=…)
   Renders one competition from data/competitions.js using the helpers that
   js/main.js exposes on window.SCR. Falls back to the featured competition.
   Optional ?qty= preselects a ticket quantity (used by the home page).
   ========================================================================== */
(function () {
  "use strict";

  var SCR = window.SCR;
  var root = document.querySelector('[data-render="competition"]');
  if (!SCR || !root) return;

  var BUNDLES = [1, 5, 10, 25, 50];
  var POPULAR_BUNDLE = 10;
  var SLIDER_MAX = 100;
  var DEFAULT_QUESTION = { text: "How many sides does a hexagon have?", options: ["5", "6", "8"] };

  var params = new URLSearchParams(window.location.search);
  var comp =
    SCR.findCompetition(params.get("id")) ||
    SCR.competitions.filter(function (c) { return c.featured; })[0] ||
    SCR.competitions[0];
  if (!comp) return;

  var esc = SCR.escapeHtml;
  var money = SCR.formatMoney;
  var num = SCR.formatNumber;
  var t = SCR.countdown(comp.endsAt);
  var left = SCR.remainingTickets(comp);
  var maxQty = Math.max(1, Math.min(SLIDER_MAX, comp.maxPerPerson || SLIDER_MAX, left));
  var question = comp.question || DEFAULT_QUESTION;
  var closed = t.ended || left === 0;

  var startQty = parseInt(params.get("qty"), 10) || POPULAR_BUNDLE;
  startQty = Math.min(Math.max(1, startQty), maxQty);

  /* ---------- Formatting ---------- */

  var DRAW_DATE = new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
  });
  function drawDate() { return DRAW_DATE.format(new Date(comp.endsAt)).replace(" at ", ", ").replace(/:00\s?/, "").replace(/\s?([ap])m$/i, "$1m"); }
  function oddsFor(qty) { return "1 in " + num(Math.max(1, Math.round(comp.maxTickets / qty))); }

  /* ---------- Page meta ---------- */

  document.title = comp.title + " | Second Chance Raffles";
  var descText = "Win a " + comp.title + " worth " + money(comp.prizeValue) + ". Tickets " +
    money(comp.ticketPrice) + ", " + SCR.odds(comp).toLowerCase() + ". Free postal entry available.";
  [['meta[name="description"]', descText], ['meta[property="og:description"]', descText],
   ['meta[property="og:title"]', document.title]].forEach(function (m) {
    var el = document.querySelector(m[0]);
    if (el) el.setAttribute("content", m[1]);
  });

  /* ---------- Gallery ---------- */

  function galleryHTML() {
    var images = [comp.image].concat(comp.gallery || []).slice(0, 4);
    while (images.length < 4) images.push(null);

    function slide(src, i) {
      return src
        ? '<img src="' + esc(src) + '" alt="' + esc(comp.title) + " — image " + (i + 1) + '" width="1200" height="900"' + (i ? ' loading="lazy"' : "") + ">"
        : SCR.placeholder(comp.category, "Prize image " + (i + 1) + " · 1200×900");
    }

    var thumbs = images.map(function (src, i) {
      return (
        '<button type="button" class="gallery__thumb" data-slide="' + i + '" aria-label="Show image ' + (i + 1) + '"' +
          (i === 0 ? ' aria-current="true"' : "") + ">" + slide(src, i) + "</button>"
      );
    }).join("");

    return (
      '<div class="gallery">' +
        '<div class="gallery__main">' +
          images.map(function (src, i) {
            return '<div class="gallery__slide"' + (i === 0 ? "" : " hidden") + ' data-slide-panel="' + i + '">' + slide(src, i) + "</div>";
          }).join("") +
          '<span class="gallery__serial">No. ' + esc(comp.serial || "") + "</span>" +
        "</div>" +
        '<div class="gallery__thumbs">' + thumbs + "</div>" +
      "</div>"
    );
  }

  /* ---------- Entry panel ---------- */

  function panelHTML() {
    var pct = SCR.soldPercent(comp);
    var badges = '<span class="badge badge--category">' + SCR.categoryLabel(comp.category) + "</span>" +
      SCR.badgesFor(comp).map(function (b) { return '<span class="badge badge--' + b.cls + '">' + b.label + "</span>"; }).join("");

    var bundles = BUNDLES.map(function (qty) {
      return (
        '<button type="button" class="qbtn' + (qty === POPULAR_BUNDLE ? " qbtn--popular" : "") + '" data-qty-set="' + qty + '"' +
          ' aria-pressed="false"' + (qty > maxQty || closed ? " disabled" : "") + ">" +
          (qty === POPULAR_BUNDLE ? '<span class="qbtn__flag">Most popular</span>' : "") +
          '<span class="qbtn__qty">' + qty + "</span>" +
          '<span class="qbtn__total">' + SCR.formatTotal(SCR.lineTotal(comp, qty)) + "</span>" +
        "</button>"
      );
    }).join("");

    var options = question.options.map(function (opt, i) {
      return (
        '<label class="answer">' +
          '<input type="radio" name="answer" value="' + esc(opt) + '"' + (closed ? " disabled" : "") + ">" +
          '<span class="answer__key">' + "ABC".charAt(i) + "</span>" +
          '<span class="answer__text">' + esc(opt) + "</span>" +
        "</label>"
      );
    }).join("");

    return (
      '<aside class="panel" aria-label="Enter this competition">' +
        '<div class="panel__badges">' + badges + "</div>" +
        '<h1 class="panel__title">' + esc(comp.title) + "</h1>" +
        '<p class="panel__worth">Worth <strong>' + money(comp.prizeValue) + "</strong></p>" +
        '<p class="panel__cash">' + (comp.cashAlternative
          ? "Or take a <strong>" + money(comp.cashAlternative) + " cash alternative</strong>. Your choice."
          : "Cash prize, paid straight to your bank.") + "</p>" +

        '<div class="panel__price"><span class="panel__price-value">' + money(comp.ticketPrice) + '</span><span class="panel__price-unit">per ticket</span></div>' +

        '<div class="panel__block"><p class="panel__label">' + (t.ended ? "Entries closed" : "Draw closes in") + "</p>" +
          SCR.countdownBoxes(comp.endsAt) + "</div>" +

        '<div class="panel__block panel__progress">' +
          '<div class="progress progress--lg" role="progressbar" aria-label="Tickets sold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
            '<div class="progress__bar" style="--value:' + pct + '%"></div>' +
          "</div>" +
          '<p class="progress-meta"><span><strong>' + num(comp.ticketsSold) + "</strong> / " + num(comp.maxTickets) + " sold</span>" +
            '<span class="panel__left">' + (left ? "Only " + num(left) + " left" : "Sold out") + "</span></p>" +
        "</div>" +

        '<div class="odds-box" aria-live="polite">' +
          '<p>Your odds: <strong>' + oddsFor(1) + "</strong> per ticket</p>" +
          '<p class="odds-box__live" data-odds-live hidden></p>' +
        "</div>" +

        '<fieldset class="panel__block qtypick"' + (closed ? " disabled" : "") + ">" +
          '<legend class="panel__label">How many tickets?</legend>' +
          '<div class="qtypick__bundles">' + bundles + "</div>" +
          '<div class="qtypick__slider">' +
            '<label class="sr-only" for="qty-range">Number of tickets</label>' +
            '<input type="range" id="qty-range" class="range" min="1" max="' + maxQty + '" step="1" value="' + startQty + '">' +
            '<output class="qtypick__readout" for="qty-range"><strong data-qty-count>' + startQty + "</strong> " +
              '<span data-qty-noun>tickets</span> · <strong data-qty-total>' + SCR.formatTotal(SCR.lineTotal(comp, startQty)) + "</strong></output>" +
          "</div>" +
          '<p class="hint">Max ' + num(comp.maxPerPerson || SLIDER_MAX) + " tickets per person.</p>" +
        "</fieldset>" +

        '<fieldset class="question" id="question"' + (closed ? " disabled" : "") + ">" +
          '<legend class="question__legend"><span class="question__tag">Answer to enter</span>' + esc(question.text) + "</legend>" +
          '<div class="question__options">' + options + "</div>" +
          '<p class="question__hint" data-question-hint>Pick an answer to unlock entry. Only correct answers go into the draw.</p>' +
        "</fieldset>" +

        '<div class="panel__ctas" data-panel-ctas>' +
          '<button type="button" class="btn btn--gold btn--lg btn--block" data-enter disabled' +
            ' data-checkout="' + esc(comp.id) + '" data-qty="' + startQty + '">' +
            (closed ? "Entries closed" : 'Enter now · <span data-qty-total>' + SCR.formatTotal(SCR.lineTotal(comp, startQty)) + "</span>") +
          "</button>" +
          '<a class="btn btn--outline btn--lg btn--block" href="free-entry.html?comp=' + encodeURIComponent(comp.id) + '">Enter for free by post →</a>' +
        "</div>" +
        '<p class="panel__small"><span class="chip-18 chip-18--sm" aria-hidden="true">18+</span>18+ only · Draw streamed live on Instagram · Max ' +
          num(comp.maxPerPerson || SLIDER_MAX) + " tickets per person</p>" +
      "</aside>"
    );
  }

  /* ---------- Details: description, instant wins, draw rules ---------- */

  function factsHTML() {
    var facts = [
      ["Prize value", money(comp.prizeValue)],
      ["Cash alternative", comp.cashAlternative ? money(comp.cashAlternative) : "Cash prize"],
      ["Ticket price", money(comp.ticketPrice)],
      ["Total tickets", num(comp.maxTickets)],
      ["Max per person", num(comp.maxPerPerson || SLIDER_MAX)],
      ["Draw date", drawDate()]
    ];
    return '<dl class="facts">' + facts.map(function (f) {
      return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>";
    }).join("") + "</dl>";
  }

  function instantWinsHTML() {
    var wins = comp.instantWins || [];
    var won = wins.filter(function (w) { return w.won; }).length;
    var total = wins.reduce(function (sum, w) { return sum + (w.value || 0); }, 0);
    var rows = wins.slice().sort(function (a, b) { return a.ticket - b.ticket; }).map(function (w) {
      return (
        "<tr" + (w.won ? ' class="is-won"' : "") + ">" +
          '<td class="mono">#' + String(w.ticket).padStart(4, "0") + "</td>" +
          "<td>" + esc(w.prize) + "</td>" +
          '<td><span class="iw-status">' + (w.won ? "Won" : "Still to win") + "</span></td>" +
        "</tr>"
      );
    }).join("");
    return (
      '<p class="iw-summary"><strong>' + wins.length + " instant wins</strong> worth " + money(total) + " in total · " +
        won + " won, " + (wins.length - won) + " still to win.</p>" +
      "<p class=\"muted\">These ticket numbers are fixed before sales open. If your ticket number matches, you win that prize on the spot, and you're still in the main draw.</p>" +
      '<div class="table-wrap"><table class="iw-table"><thead><tr><th scope="col">Ticket no.</th><th scope="col">Prize</th><th scope="col">Status</th></tr></thead>' +
        "<tbody>" + rows + "</tbody></table></div>"
    );
  }

  function rulesHTML() {
    var rules = [
      "Entries close on " + drawDate() + ", or earlier if all " + num(comp.maxTickets) + " tickets sell out.",
      "The winner is drawn live on Instagram with an independent random number generator. The draw is recorded and the winning ticket number published on our winners page.",
      "The draw goes ahead on the date shown even if not every ticket sells. There is always a winner.",
      "Only entries with the correct answer to the question are entered into the draw.",
      "Free postal entries go into the same draw with exactly the same odds as paid entries.",
      "Maximum " + num(comp.maxPerPerson || SLIDER_MAX) + " entries per person, paid and postal combined. 18+ and UK residents only.",
      "We contact the winner by phone and email within 24 hours of the draw." +
        (comp.cashAlternative ? " The winner can choose the prize or " + money(comp.cashAlternative) + " cash." : ""),
      "Every non-winning ticket is entered into the monthly Second Chance draw at no extra cost."
    ];
    return (
      '<ol class="rules">' + rules.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ol>" +
      '<p class="muted">Full details in our <a href="terms.html">terms &amp; conditions</a>.</p>'
    );
  }

  function tabsHTML() {
    var tabs = [
      { id: "description", label: "Description", html: '<div class="prose"><p class="lede">' + esc(comp.description) + "</p></div>" + factsHTML() }
    ];
    if (comp.instantWins && comp.instantWins.length) {
      tabs.push({ id: "instant-wins", label: "Instant wins <span class=\"tab__count\">" + comp.instantWins.length + "</span>", html: instantWinsHTML() });
    }
    tabs.push({ id: "draw-rules", label: "Draw rules", html: rulesHTML() });

    return (
      '<section class="details" aria-label="Competition details">' +
        '<div class="tabs" role="tablist" aria-label="Competition details">' +
          tabs.map(function (tab, i) {
            return '<button type="button" class="tab" role="tab" id="tab-' + tab.id + '" aria-controls="panel-' + tab.id + '"' +
              ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + tab.label + "</button>";
          }).join("") +
        "</div>" +
        tabs.map(function (tab, i) {
          return '<div class="tabpanel" role="tabpanel" id="panel-' + tab.id + '" aria-labelledby="tab-' + tab.id + '" tabindex="0"' +
            (i === 0 ? "" : " hidden") + ">" + tab.html + "</div>";
        }).join("") +
      "</section>"
    );
  }

  function relatedHTML() {
    var others = SCR.competitions.filter(function (c) { return c.id !== comp.id && !SCR.countdown(c.endsAt).ended; });
    var same = others.filter(function (c) { return c.category === comp.category; });
    var rest = others.filter(function (c) { return c.category !== comp.category; });
    var picks = same.concat(rest).slice(0, 3);
    if (!picks.length) return "";
    return (
      '<section class="related" aria-labelledby="related-title">' +
        '<header class="section-head"><p class="eyebrow">Keep playing</p><h2 id="related-title" class="section-title">You might also like</h2></header>' +
        '<div class="grid-cards">' + picks.map(SCR.renderTicketCard).join("") + "</div>" +
      "</section>"
    );
  }

  function buybarHTML() {
    if (closed) return "";
    return (
      '<div class="buybar" data-buybar aria-hidden="true">' +
        '<div class="buybar__info"><span class="buybar__price" data-qty-total>' + SCR.formatTotal(SCR.lineTotal(comp, startQty)) + "</span>" +
          '<span class="buybar__meta"><span data-qty-count>' + startQty + '</span> <span data-qty-noun>tickets</span> · ' + esc(comp.title) + "</span></div>" +
        '<button type="button" class="btn btn--gold" data-buybar-enter tabindex="-1">Enter now</button>' +
      "</div>"
    );
  }

  /* ---------- Render ---------- */

  root.innerHTML =
    '<nav class="crumbs" aria-label="Breadcrumb"><ol>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="competitions.html">Competitions</a></li>' +
      '<li aria-current="page">' + esc(comp.title) + "</li>" +
    "</ol></nav>" +
    '<div class="comp-layout">' + galleryHTML() + panelHTML() + "</div>" +
    tabsHTML() +
    relatedHTML();
  document.body.insertAdjacentHTML("beforeend", buybarHTML());

  /* ---------- Behaviour: gallery ---------- */

  root.querySelectorAll("[data-slide]").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var i = thumb.getAttribute("data-slide");
      root.querySelectorAll("[data-slide-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-slide-panel") !== i; });
      root.querySelectorAll("[data-slide]").forEach(function (b) {
        if (b === thumb) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
    });
  });

  /* ---------- Behaviour: quantity (bundles + slider kept in sync) ---------- */

  var range = root.querySelector("#qty-range");
  var enterBtn = root.querySelector("[data-enter]");
  var oddsLive = root.querySelector("[data-odds-live]");

  function setQty(qty) {
    qty = Math.min(Math.max(1, qty), maxQty);
    if (range) {
      range.value = qty;
      range.style.setProperty("--fill", ((qty - 1) / Math.max(1, maxQty - 1)) * 100 + "%");
    }
    root.querySelectorAll("[data-qty-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-qty-set"), 10) === qty));
    });
    document.querySelectorAll("[data-qty-count]").forEach(function (el) { el.textContent = qty; });
    document.querySelectorAll("[data-qty-noun]").forEach(function (el) { el.textContent = qty === 1 ? "ticket" : "tickets"; });
    document.querySelectorAll("[data-qty-total]").forEach(function (el) { el.textContent = SCR.formatTotal(SCR.lineTotal(comp, qty)); });
    if (enterBtn) enterBtn.setAttribute("data-qty", qty);
    if (oddsLive) {
      oddsLive.hidden = qty === 1;
      oddsLive.innerHTML = "With " + qty + " tickets: <strong>" + oddsFor(qty) + "</strong>";
    }
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-qty-set]");
    if (b) setQty(parseInt(b.getAttribute("data-qty-set"), 10));
  });
  if (range) range.addEventListener("input", function () { setQty(parseInt(range.value, 10)); });
  setQty(startQty);

  /* ---------- Behaviour: skill question gates entry ---------- */

  var answered = false;
  var hint = root.querySelector("[data-question-hint]");
  root.addEventListener("change", function (e) {
    if (e.target.name !== "answer" || closed) return;
    answered = true;
    enterBtn.disabled = false;
    enterBtn.setAttribute("data-answer", e.target.value);
    hint.textContent = "Answer locked in. You can change it any time before you pay.";
    hint.classList.add("is-ok");
  });

  /* ---------- Behaviour: tabs ---------- */

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length]
        : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  // Reveal animations for the content rendered above (no-op without GSAP).
  if (SCR.reveal) SCR.reveal(root);

  /* ---------- Behaviour: mobile sticky buy bar ---------- */

  var bar = document.querySelector("[data-buybar]");
  var ctas = root.querySelector("[data-panel-ctas]");
  if (bar && ctas && "IntersectionObserver" in window) {
    document.body.classList.add("has-buybar");
    var barBtn = bar.querySelector("[data-buybar-enter]");
    var ctaVisible = false;

    function syncBar() {
      var show = !ctaVisible;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", String(!show));
      barBtn.tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (entries) {
      ctaVisible = entries[0].isIntersecting;
      syncBar();
    }).observe(ctas);

    barBtn.addEventListener("click", function () {
      if (answered) { enterBtn.click(); return; }
      var q = document.getElementById("question");
      q.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      var first = q.querySelector("input");
      if (first) first.focus({ preventScroll: true });
      hint.classList.add("is-nudge");
      setTimeout(function () { hint.classList.remove("is-nudge"); }, 1200);
    });
  }
})();
