/* Second Chance Raffles — competition.html (reads ?id= from the URL). Plain JS. */
(function () {
  "use strict";
  var root = document.querySelector("[data-competition]");
  if (!root) return;

  var comps = window.SCR_COMPETITIONS || [];
  var id = parseInt(new URLSearchParams(location.search).get("id") || "1", 10);
  var comp = comps.filter(function (c) { return c.id === id; })[0];

  function $(sel) { return root.querySelector(sel); }
  function money(n) { return "£" + n.toFixed(2); }
  function num(n) { return n.toLocaleString("en-GB"); }

  /* ---------- Unknown id: say so instead of showing the wrong prize ---------- */
  if (!comp) {
    root.innerHTML =
      '<div class="container comp-missing">' +
        '<h1 class="comp__title">Competition not found</h1>' +
        "<p>This competition has ended or the link is wrong.</p>" +
        '<a class="btn btn--gold" href="index.html">See live competitions</a>' +
      "</div>";
    document.title = "Competition not found · Second Chance Raffles";
    return;
  }

  /* ---------- Fill the page from the data ---------- */
  // same figures as the homepage card: ticketsSold / totalTickets, whole-number %
  var pct = Math.round(comp.ticketsSold / comp.totalTickets * 100);
  var ticketsLeft = comp.totalTickets - comp.ticketsSold;
  $("[data-comp-title]").textContent = comp.title;
  $("[data-comp-badge]").textContent = comp.badge;
  $("[data-comp-price]").textContent = money(comp.price);
  $("[data-comp-pct]").textContent = pct + "% sold";
  $("[data-comp-count]").textContent = num(comp.ticketsSold) + " / " + num(comp.totalTickets);
  var bar = $("[data-comp-bar]");
  bar.setAttribute("aria-valuenow", pct);
  bar.firstElementChild.style.width = pct + "%";
  $("[data-comp-desc]").textContent = comp.description;
  $("[data-question]").textContent = comp.question.text;
  root.querySelectorAll("[data-answer]").forEach(function (input, i) {
    input.parentNode.lastChild.textContent = " " + comp.question.options[i];
  });
  document.title = comp.title + " · Second Chance Raffles";
  // free postal entry link goes straight to this competition's row
  root.querySelectorAll('a[href="free-entry.html"]').forEach(function (a) { a.href = "free-entry.html?comp=" + comp.id; });
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", "Enter to win " + comp.title + ". Tickets from " + money(comp.price) + ", drawn live on Instagram.");

  /* ---------- Gallery: thumbnails swap the main image ---------- */
  var main = $("[data-gallery-main]");
  var label = $("[data-gallery-label]");
  var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-thumb]"));
  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      var n = t.getAttribute("data-thumb");
      thumbs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
      main.setAttribute("data-shade", n);
      label.textContent = "Prize image " + n;
    });
  });

  /* ---------- Ticket quantity ---------- */
  var MAX = Math.max(1, Math.min(100, ticketsLeft));
  var input = $("[data-qty-input]");
  var total = $("[data-qty-total]");
  var presets = Array.prototype.slice.call(root.querySelectorAll("[data-qty]"));
  input.max = MAX;
  var slider = $("[data-qty-range]");
  if (slider) slider.max = MAX; // same cap as the number box: 100, or fewer if fewer tickets are left
  // Presets: 1 plus quarter steps of this competition's maximum (1, 25%, 50%, 75%, max),
  // e.g. 1 · 25 · 50 · 75 · 100. Duplicates are dropped when the maximum is very small.
  var steps = [1, MAX * 0.25, MAX * 0.5, MAX * 0.75, MAX]
    .map(function (v) { return Math.max(1, Math.round(v)); })
    .filter(function (v, i, arr) { return arr.indexOf(v) === i; });
  presets.forEach(function (p, i) {
    if (i >= steps.length) { p.hidden = true; return; }
    var v = steps[i], last = i === steps.length - 1 && steps.length > 1;
    p.setAttribute("data-qty", v);
    p.innerHTML = v + (last ? '<span class="qty__best">Best value</span>' : "");
  });
  presets = presets.filter(function (p) { return !p.hidden; });

  function syncSlider(n) {
    if (!slider) return;
    slider.value = n;
    slider.style.setProperty("--fill", (MAX > 1 ? (n - 1) / (MAX - 1) * 100 : 100) + "%");
  }
  function setQty(n) {
    n = Math.max(1, Math.min(MAX, Math.round(n) || 1));
    input.value = n;
    syncSlider(n);
    total.textContent = money(n * comp.price);
    presets.forEach(function (p) { p.setAttribute("aria-pressed", String(+p.getAttribute("data-qty") === n)); });
  }
  presets.forEach(function (p) {
    p.addEventListener("click", function () { setQty(+p.getAttribute("data-qty")); });
  });
  root.querySelectorAll("[data-qty-step]").forEach(function (b) {
    b.addEventListener("click", function () { setQty(+input.value + +b.getAttribute("data-qty-step")); });
  });
  input.addEventListener("input", function () {
    // live total while typing; tidy the number when the field is left
    var n = parseInt(input.value, 10);
    if (n >= 1 && n <= MAX) {
      syncSlider(n);
      total.textContent = money(n * comp.price);
      presets.forEach(function (p) { p.setAttribute("aria-pressed", String(+p.getAttribute("data-qty") === n)); });
    }
  });
  input.addEventListener("change", function () { setQty(+input.value); });
  // slider: moves the quantity (and total) live, and follows the other controls via setQty
  if (slider) {
    // "input" fires while dragging; "change" on release (covers older browsers)
    slider.addEventListener("input", function () { setQty(+slider.value); });
    slider.addEventListener("change", function () { setQty(+slider.value); });
  }
  setQty(1);

  /* ---------- Skill question gates the buttons ---------- */
  var answered = false;
  var msg = $("[data-skill-msg]");
  var actionBtns = Array.prototype.slice.call(root.querySelectorAll("[data-action]"));
  function setReady(ok) {
    answered = ok;
    actionBtns.forEach(function (b) { b.setAttribute("aria-disabled", String(!ok)); });
  }
  root.querySelectorAll("[data-answer]").forEach(function (r) {
    r.addEventListener("change", function () {
      var ok = +r.value === comp.question.correct;
      setReady(ok);
      msg.textContent = ok ? "Correct — you’re ready to enter." : "Not quite. Have another go.";
      msg.className = "skill__msg " + (ok ? "is-ok" : "is-wrong");
    });
  });

  /* ---------- Add to cart / Buy now (demo: no real checkout yet) ---------- */
  var status = $("[data-comp-status]");
  var form = $("[data-entry-form]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var action = e.submitter ? e.submitter.getAttribute("data-action") : "cart";
    if (!answered) {
      msg.textContent = "Answer the question above to enter.";
      msg.className = "skill__msg is-wrong";
      var first = root.querySelector("[data-answer]");
      if (first) first.focus();
      return;
    }
    var qty = +input.value;
    if (action === "cart") {
      // save to the basket (capped at the per-person maximum), then go to it
      window.SCR.cart.add(comp.id, qty);
      window.location.href = "cart.html";
    } else {
      status.textContent = "Secure checkout is coming soon. This is a demo, so no payment has been taken.";
    }
  });

  /* ---------- Tabs ---------- */
  var tablist = root.querySelector("[data-tablist]");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    tablist.hidden = false;
    root.querySelectorAll(".comp-tabs__h").forEach(function (h) { h.classList.add("visually-hidden"); });
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (j === null) return;
        e.preventDefault();
        select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
    select(tabs[0]);
  }
})();
