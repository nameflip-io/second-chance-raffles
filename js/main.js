/* Second Chance Raffles — v2 site script. Plain JS, no build step. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var desktop = window.matchMedia("(min-width: 1024px)");
  var canHover = window.matchMedia("(hover: hover)");

  /* ---------- Competitions mega-menu: hover on desktop, click anywhere ---------- */
  document.querySelectorAll("[data-dropdown]").forEach(function (dd) {
    var btn = dd.querySelector("[data-dropdown-toggle]");
    var links = Array.prototype.slice.call(dd.querySelectorAll(".mega a"));
    var closeTimer;

    function setOpen(open) {
      dd.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    }
    function isOpen() { return dd.classList.contains("is-open"); }

    btn.addEventListener("click", function () { setOpen(!isOpen()); });

    dd.addEventListener("mouseenter", function () {
      if (!canHover.matches) return;
      clearTimeout(closeTimer);
      setOpen(true);
    });
    dd.addEventListener("mouseleave", function () {
      if (!canHover.matches) return;
      closeTimer = setTimeout(function () { setOpen(false); }, 200);
    });

    dd.addEventListener("keydown", function (e) {
      var i = links.indexOf(document.activeElement);
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        btn.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        links[i < 0 ? 0 : Math.min(i + 1, links.length - 1)].focus();
      } else if (e.key === "ArrowUp" && i >= 0) {
        e.preventDefault();
        if (i === 0) btn.focus(); else links[i - 1].focus();
      }
    });

    // close when focus or a click leaves the dropdown
    dd.addEventListener("focusout", function (e) {
      if (!dd.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (!dd.contains(e.target)) setOpen(false);
    });
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("mobile-menu");
  if (burger && menu) {
    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
      if (open) {
        menu.removeAttribute("inert");
        var first = menu.querySelector("a, button");
        if (first) first.focus();
      } else {
        menu.setAttribute("inert", "");
      }
    }
    menu.setAttribute("inert", "");
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); burger.focus(); }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    desktop.addEventListener("change", function (e) { if (e.matches) setMenu(false); });

    // Competitions accordion inside the menu
    menu.querySelectorAll("[data-accordion]").forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
      });
    });
  }

  /* ---------- Winners: category filter tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  if (tabs.length) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-cats]"));
    var title = document.querySelector("[data-winners-title]");
    var count = document.querySelector("[data-winners-count]");
    var empty = document.querySelector("[data-winners-empty]");

    function applyFilter(tab) {
      var key = tab.getAttribute("data-filter");
      var shown = 0;
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", String(t === tab)); });
      cards.forEach(function (card) {
        var match = key === "all" || card.getAttribute("data-cats").split(" ").indexOf(key) > -1;
        card.hidden = !match;
        if (match) shown++;
      });
      if (title) title.textContent = tab.textContent.trim();
      if (count) count.textContent = shown + (shown === 1 ? " winner" : " winners");
      if (empty) empty.hidden = shown > 0;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { applyFilter(tab); });
    });
    applyFilter(tabs.filter(function (t) { return t.getAttribute("aria-pressed") === "true"; })[0] || tabs[0]);
  }

  /* ---------- Images not uploaded yet: swap in a stand-in frame ---------- */
  document.querySelectorAll("[data-img-fallback] img").forEach(function (img) {
    function missing() { img.parentNode.classList.add("is-missing"); }
    if (img.complete && img.naturalWidth === 0) missing();
    else img.addEventListener("error", missing);
  });

  /* ---------- Home: featured carousel (auto-rotates every 4s) ---------- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
    var pauseBtn = carousel.querySelector("[data-carousel-pause]");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0, timer = null, userPaused = reduced, hovering = false;

    carousel.querySelector("[data-carousel-controls]").hidden = false;

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft, behavior: reduced ? "auto" : "smooth" });
      markDot();
    }
    function markDot() {
      dots.forEach(function (d, i) {
        if (i === current) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (userPaused || hovering || slides.length < 2) return;
      timer = setInterval(function () { goTo(current + 1); }, 4000);
    }
    function setPaused(p) {
      userPaused = p;
      carousel.classList.toggle("is-paused", p);
      pauseBtn.setAttribute("aria-label", p ? "Play slideshow" : "Pause slideshow");
      start();
    }

    dots.forEach(function (d) {
      d.addEventListener("click", function () { goTo(+d.getAttribute("data-dot")); start(); });
    });
    pauseBtn.addEventListener("click", function () { setPaused(!userPaused); });

    // pause while the pointer or keyboard focus is on the carousel
    carousel.addEventListener("mouseenter", function () { hovering = true; stop(); });
    carousel.addEventListener("mouseleave", function () { hovering = false; start(); });
    carousel.addEventListener("focusin", function () { hovering = true; stop(); });
    carousel.addEventListener("focusout", function (e) {
      if (!carousel.contains(e.relatedTarget)) { hovering = false; start(); }
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

    // keep the dots in sync when people swipe
    var scrollT;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollT);
      scrollT = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== current) { current = i; markDot(); start(); }
      }, 80);
    }, { passive: true });

    markDot();
    setPaused(userPaused);
  }

  /* ---------- Home: category tiles scroll to their section ----------
     The tiles are plain #links, so they work without JS; this just makes the
     jump smooth and moves keyboard focus to the section. */
  document.querySelectorAll("[data-cat-jump]").forEach(function (tile) {
    tile.addEventListener("click", function (e) {
      var target = document.getElementById(tile.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", "#" + target.id);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Home: search (results are wired up later) ---------- */
  var search = document.querySelector("[data-search]");
  if (search) {
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("scr:search", { detail: { query: search.q.value.trim() } }));
    });
  }

  /* ---------- Cart (localStorage) ----------
     Items are stored as [{ id, qty }]; names and prices come from
     data/competitions.js on the pages that need them. Exposed as SCR.cart
     for page scripts (competition.js, cart.js). */
  var CART_KEY = "scr-cart";
  var SEED_KEY = "scr-cart-seeded";
  var MAX_PER_COMP = 100;
  function readCart() {
    try {
      var items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(items) ? items.filter(function (it) { return it && it.id > 0 && it.qty > 0; }) : [];
    } catch (e) { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* private mode: cart lasts this page only */ }
    memoryCart = items;
    updateBadge();
    document.dispatchEvent(new CustomEvent("scr:cart"));
  }
  var memoryCart = readCart();

  // DEMO ONLY: the very first visit starts with two example items so the cart
  // page has something to show. Remove this block before launch.
  try {
    if (!localStorage.getItem(SEED_KEY)) {
      localStorage.setItem(SEED_KEY, "1");
      if (!memoryCart.length) memoryCart = [{ id: 1, qty: 5 }, { id: 9, qty: 5 }];
      localStorage.setItem(CART_KEY, JSON.stringify(memoryCart));
    }
  } catch (e) { /* storage blocked */ }

  var cart = {
    items: function () { return memoryCart.map(function (it) { return { id: it.id, qty: it.qty, image: it.image || "" }; }); },
    count: function () { return memoryCart.reduce(function (n, it) { return n + it.qty; }, 0); },
    add: function (id, qty, extra) {
      var items = cart.items();
      var it = items.filter(function (x) { return x.id === id; })[0];
      var before = it ? it.qty : 0;
      var after = Math.min(MAX_PER_COMP, before + qty);
      var image = (extra && extra.image) || (it && it.image) || "";
      if (it) { it.qty = after; it.image = image; } else items.push({ id: id, qty: after, image: image });
      writeCart(items);
      return after - before; // tickets actually added (capped at MAX_PER_COMP)
    },
    setQty: function (id, qty) {
      writeCart(cart.items().map(function (x) {
        if (x.id === id) x.qty = Math.max(1, Math.min(MAX_PER_COMP, qty));
        return x;
      }));
    },
    remove: function (id) { writeCart(cart.items().filter(function (x) { return x.id !== id; })); },
    max: MAX_PER_COMP
  };
  window.SCR = window.SCR || {};
  window.SCR.cart = cart;

  function updateBadge() {
    var n = cart.count();
    document.querySelectorAll(".cart__badge").forEach(function (b) { b.textContent = n > 99 ? "99+" : n; });
    document.querySelectorAll(".cart").forEach(function (a) {
      a.setAttribute("aria-label", "Basket, " + n + (n === 1 ? " ticket" : " tickets"));
    });
  }
  updateBadge();
  // keep other open tabs in step
  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY) { memoryCart = readCart(); updateBadge(); document.dispatchEvent(new CustomEvent("scr:cart")); }
  });

  /* ---------- Home: stats count up from 0 when scrolled into view ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length && "IntersectionObserver" in window && !reducedMotion) {
    function show(el, v) {
      var dec = +el.getAttribute("data-decimals") || 0;
      el.textContent = el.getAttribute("data-prefix") +
        v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) +
        el.getAttribute("data-suffix");
    }
    function countUp(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var t0 = null, dur = 1600;
      function tick(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        show(el, target * (1 - Math.pow(1 - p, 3))); // ease-out
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    counters.forEach(function (el) { show(el, 0); });
    var statsIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        statsIO.unobserve(en.target);
        countUp(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { statsIO.observe(el); });
  }


  /* ---------- Home: sort panel under the search bar (UI only for now) ---------- */
  var filters = document.querySelector("[data-filters]");
  if (filters) {
    var fToggle = filters.querySelector("[data-filter-toggle]");
    var fPanel = filters.querySelector("[data-filter-panel]");
    function setFilters(open, returnFocus) {
      fPanel.hidden = !open;
      fToggle.setAttribute("aria-expanded", String(open));
      if (!open && returnFocus) fToggle.focus();
    }
    fToggle.addEventListener("click", function () { setFilters(fPanel.hidden); });
    // close on a click anywhere outside the search bar + panel
    document.addEventListener("click", function (e) {
      if (!fPanel.hidden && !filters.contains(e.target)) setFilters(false);
    });
    filters.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !fPanel.hidden) { e.stopPropagation(); setFilters(false, true); }
    });
    // picking a sort pill applies it straight away and closes the panel
    // (the actual sorting is wired up later via the scr:sort event)
    var pills = Array.prototype.slice.call(fPanel.querySelectorAll("[data-sort]"));
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.setAttribute("aria-pressed", String(p === pill)); });
        document.dispatchEvent(new CustomEvent("scr:sort", { detail: { sort: pill.getAttribute("data-sort") } }));
        setFilters(false, true);
      });
    });
  }

  /* ---------- Home: Meet Our Winners slider ----------
     Native horizontal scrolling with scroll-snap (trackpad, touch, keyboard all
     work without any drag code). An IntersectionObserver marks the card in the
     middle as active; dots jump to a card. It never moves on its own: only
     the visitor's swipes, scrolls and dot clicks move it. */
  var ws = document.querySelector("[data-ws]");
  if (ws) {
    var wsViewport = ws.querySelector("[data-ws-viewport]");
    var wsSlides = Array.prototype.slice.call(ws.querySelectorAll("[data-ws-slide]"));
    var wsDots = Array.prototype.slice.call(ws.querySelectorAll("[data-ws-dot]"));
    var wsReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var wsIndex = Math.floor(wsSlides.length / 2);

    ws.classList.add("is-ready");
    ws.querySelector("[data-ws-controls]").hidden = false;

    function wsMark(i) {
      wsIndex = i;
      wsSlides.forEach(function (sl, k) { sl.classList.toggle("is-active", k === i); });
      wsDots.forEach(function (d, k) {
        if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
    }
    function wsScrollTo(i, instant) {
      var card = wsSlides[i];
      var left = card.offsetLeft - (wsViewport.clientWidth - card.offsetWidth) / 2;
      wsViewport.scrollTo({ left: left, behavior: instant || wsReduced ? "auto" : "smooth" });
    }

    // whichever card crosses the middle strip of the slider is the active one
    var wsIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) wsMark(wsSlides.indexOf(en.target));
      });
    }, { root: wsViewport, rootMargin: "0px -49% 0px -49%", threshold: 0 });
    wsSlides.forEach(function (sl) { wsIO.observe(sl); });

    wsDots.forEach(function (d) {
      d.addEventListener("click", function () { wsScrollTo(+d.getAttribute("data-ws-dot")); });
    });
    // keep the active card centred if the window size changes
    window.addEventListener("resize", function () { wsScrollTo(wsIndex, true); });

    // start on the middle card so neighbours show on both sides
    wsMark(wsIndex);
    wsScrollTo(wsIndex, true);
  }

  /* ---------- Quick-entry modal (competition cards: "Enter now" + basket icon) ----------
     Opens a <dialog> with the prize, a quantity slider and Add to basket, plus a
     Free Postal Entry tab. Without JS the "Enter now" link still opens the
     competition page. */
  var qeTriggers = document.querySelectorAll("[data-quick-entry]");
  if (qeTriggers.length && window.HTMLDialogElement) {
    var QE_MAX = 100;
    var chevrons = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg>';
    var qe = document.createElement("dialog");
    qe.className = "qe";
    qe.setAttribute("aria-labelledby", "qe-title");
    qe.innerHTML =
      '<div class="qe__panel">' +
        '<button class="qe__close" type="button" aria-label="Close" data-qe-close><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '<div class="qe__tabs" role="tablist" aria-label="How to enter">' +
          '<button class="qe__tab" type="button" role="tab" id="qe-tab-online" aria-controls="qe-online" aria-selected="true">Online Entry</button>' +
          '<button class="qe__tab" type="button" role="tab" id="qe-tab-postal" aria-controls="qe-postal" aria-selected="false" tabindex="-1">Free Postal Entry</button>' +
        "</div>" +
        '<div class="qe__body" id="qe-online" role="tabpanel" aria-labelledby="qe-tab-online">' +
          '<div class="qe__prize"><span class="qe__thumb" aria-hidden="true"></span>' +
            '<div><h2 class="qe__name" id="qe-title" data-qe-name></h2><p class="qe__price"><strong data-qe-price></strong> per ticket</p></div></div>' +
          '<div class="qe__qty-head"><label class="qe__label" for="qe-num">Quantity</label>' +
            '<div class="qe__stepper"><button type="button" aria-label="One fewer ticket" data-qe-step="-1">−</button>' +
            '<input id="qe-num" type="number" inputmode="numeric" min="1" max="' + QE_MAX + '" value="1" data-qe-num>' +
            '<button type="button" aria-label="One more ticket" data-qe-step="1">+</button></div></div>' +
          '<input class="qe__range" type="range" min="1" max="' + QE_MAX + '" value="1" aria-label="Number of tickets" data-qe-range>' +
          '<div class="qe__range-scale" aria-hidden="true"><span>1</span><span data-qe-range-val>1 ticket</span><span>' + QE_MAX + "</span></div>" +
          '<p class="qe__label">Quick select</p>' +
          '<div class="qe__quick">' +
            [5, 10, 25, 50].map(function (n) {
              return '<button class="qe__chip" type="button" aria-pressed="false" data-qe-quick="' + n + '">' +
                (n === 50 ? '<span class="qe__best">Best value</span>' : "") + n + " tickets</button>";
            }).join("") +
          "</div>" +
          '<p class="qe__total" aria-live="polite">Total: <strong data-qe-total>£0.00</strong></p>' +
          '<button class="btn btn--gold btn--block qe__add" type="button" data-qe-add>Add to basket ' + chevrons + "</button>" +
        "</div>" +
        '<div class="qe__body qe__postal" id="qe-postal" role="tabpanel" aria-labelledby="qe-tab-postal" tabindex="0" hidden>' +
          "<h3>Postal entry for competitions</h3>" +
          "<p>Second Chance Raffles offers an alternative method of participating in competitions through Postal Entry, which is detailed below. This method does not require payment beyond the cost of postage.</p>" +
          "<h3>Conditions for postal entry</h3>" +
          "<p>By using the Postal Entry route, you confirm that you have the legal capacity to participate. You also agree to adhere to our Terms and Conditions and any additional requirements outlined in related promotional materials.</p>" +
          "<h3>How to enter</h3>" +
          "<p>To enter a competition by Postal Entry, send a handwritten postcard or letter with the following information:</p>" +
          "<ol><li>Full name</li><li>Address, including city and postcode</li><li>Telephone number</li><li>Registered email address</li><li>Name of the Competition you wish to enter</li><li>Name of the Prize you wish to play for</li></ol>" +
          "<p>Ensure handwriting is clear. Mechanically reproduced entries are not permitted. Send to: <strong>[Client Address TBC]</strong>, with appropriate postage paid.</p>" +
          "<h3>Entry requirements</h3>" +
          "<p>Entries must be sent during the Promotion Period. Entries received within 2 working days of closing will be included in the draw. Only one entry per postcard. Each postal entry has an equal chance of winning alongside paid online tickets.</p>" +
          '<p><a href="free-entry.html">Full free postal entry details</a></p>' +
        "</div>" +
      "</div>";
    document.body.appendChild(qe);

    var qeName = qe.querySelector("[data-qe-name]"), qePrice = qe.querySelector("[data-qe-price]");
    var qeThumb = qe.querySelector(".qe__thumb");
    var qeNum = qe.querySelector("[data-qe-num]"), qeRange = qe.querySelector("[data-qe-range]");
    var qeRangeVal = qe.querySelector("[data-qe-range-val]"), qeTotal = qe.querySelector("[data-qe-total]");
    var qeChips = Array.prototype.slice.call(qe.querySelectorAll("[data-qe-quick]"));
    var qeTabs = Array.prototype.slice.call(qe.querySelectorAll('[role="tab"]'));
    var qeItem = null, qeQty = 1, qeOpener = null;

    function qeMoney(n) { return "£" + n.toFixed(2); }
    // after adding, that card's small basket button shows a green tick for 1.5s
    // ("Enter now" is left as it is), then the basket icon comes back
    var QE_TICK = '<svg class="qe-tick" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    function qeConfirm(opener) {
      var card = opener.closest(".ccard");
      var btn = card ? card.querySelector(".ccard__cart") : null;
      if (!btn) return;
      if (btn._qeOrig === undefined) btn._qeOrig = btn.innerHTML;
      btn.innerHTML = QE_TICK;
      btn.classList.add("is-added");
      clearTimeout(btn._qeT);
      btn._qeT = setTimeout(function () {
        btn.classList.remove("is-added");
        btn.innerHTML = btn._qeOrig;
      }, 1500);
    }
    function qeSet(n) {
      qeQty = Math.max(1, Math.min(QE_MAX, Math.round(n) || 1));
      qeNum.value = qeQty;
      qeRange.value = qeQty;
      qeRange.style.setProperty("--fill", ((qeQty - 1) / (QE_MAX - 1) * 100) + "%");
      qeRangeVal.textContent = qeQty + (qeQty === 1 ? " ticket" : " tickets");
      qeTotal.textContent = qeMoney(qeQty * qeItem.price);
      qeChips.forEach(function (c) { c.setAttribute("aria-pressed", String(+c.getAttribute("data-qe-quick") === qeQty)); });
    }
    function qeTab(tab, focus) {
      qeTabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    function qeOpen(trigger) {
      qeOpener = trigger;
      // prize image: data-image on the button, or an <img> inside the card if there is one
      var cardImg = trigger.closest(".ccard") && trigger.closest(".ccard").querySelector("img");
      qeItem = {
        id: +trigger.getAttribute("data-id"),
        name: trigger.getAttribute("data-name"),
        price: parseFloat(trigger.getAttribute("data-price")),
        image: trigger.getAttribute("data-image") || (cardImg ? cardImg.getAttribute("src") : "")
      };
      qeThumb.innerHTML = qeItem.image ? '<img src="' + qeItem.image + '" alt="">' : "";
      qeName.textContent = qeItem.name;
      qePrice.textContent = qeMoney(qeItem.price);
      qeTab(qeTabs[0]);
      qeSet(1);
      qe.showModal();
      document.body.classList.add("menu-open"); // stop the page scrolling behind
    }
    function qeClose() { qe.close(); }
    qe.addEventListener("close", function () {
      document.body.classList.remove("menu-open");
      if (qeOpener) qeOpener.focus();
    });

    qeTriggers.forEach(function (t) {
      t.addEventListener("click", function (e) { e.preventDefault(); qeOpen(t); });
    });
    qe.querySelector("[data-qe-close]").addEventListener("click", qeClose);
    // a click on the backdrop lands on the <dialog> itself, outside the panel
    qe.addEventListener("click", function (e) { if (e.target === qe) qeClose(); });

    qeRange.addEventListener("input", function () { qeSet(+qeRange.value); });
    qeNum.addEventListener("input", function () {
      var n = parseInt(qeNum.value, 10);
      if (n >= 1 && n <= QE_MAX) qeSet(n);
    });
    qeNum.addEventListener("change", function () { qeSet(+qeNum.value); });
    qe.querySelectorAll("[data-qe-step]").forEach(function (b) {
      b.addEventListener("click", function () { qeSet(qeQty + +b.getAttribute("data-qe-step")); });
    });
    qeChips.forEach(function (c) {
      c.addEventListener("click", function () { qeSet(+c.getAttribute("data-qe-quick")); });
    });
    qeTabs.forEach(function (t, i) {
      t.addEventListener("click", function () { qeTab(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        qeTab(qeTabs[(i + (e.key === "ArrowRight" ? 1 : qeTabs.length - 1)) % qeTabs.length], true);
      });
    });

    qe.querySelector("[data-qe-add]").addEventListener("click", function () {
      var added = window.SCR.cart.add(qeItem.id, qeQty, { image: qeItem.image }); // badge updates via the cart store
      var btn = qeOpener;
      qeClose(); // focus returns to the card button that opened the modal
      if (btn && added > 0) qeConfirm(btn);
      // show the mini-cart with the item just added. Deferred until this click
      // has finished bubbling, or the "click outside closes it" listener would
      // shut it again straight away.
      setTimeout(function () { if (window.SCR.openMiniCart) window.SCR.openMiniCart(); }, 0);
      var say = document.querySelector("[data-cart-announce]");
      if (say) say.textContent = added > 0 ? "Added " + added + (added === 1 ? " ticket" : " tickets") + " to your basket." : "You already have the maximum tickets for this competition.";
    });
  }

  /* ---------- Header basket: mini-cart dropdown ----------
     The basket icon opens a small panel listing what's in the cart. It is still
     a link to cart.html, so without JS it goes to the full cart page. */
  var mcToggle = document.querySelector("[data-mini-cart-toggle]");
  var mc = document.querySelector("[data-mini-cart]");
  if (mcToggle && mc) {
    var mcComps = {};
    (window.SCR_COMPETITIONS || []).forEach(function (c) { mcComps[c.id] = c; });
    function mcMoney(n) { return "£" + n.toFixed(2); }
    function mcEsc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
    function mcRender() {
      var rows = window.SCR.cart.items().filter(function (it) { return mcComps[it.id]; });
      if (!rows.length) {
        mc.innerHTML = '<p class="mini-cart__title">Your Cart</p><p class="mini-cart__empty">Your cart is empty</p>' +
          '<a class="btn btn--gold btn--block mini-cart__btn" href="index.html#all">Browse competitions</a>';
        return;
      }
      var total = 0;
      var list = rows.map(function (it) {
        var c = mcComps[it.id], line = c.price * it.qty;
        total += line;
        var img = it.image || c.image || "";
        return '<li class="mini-cart__item">' +
          (img ? '<img class="mini-cart__img" src="' + mcEsc(img) + '" alt="" width="48" height="48">'
               : '<span class="mini-cart__img" aria-hidden="true"></span>') +
          '<div class="mini-cart__info"><a class="mini-cart__name" href="competition.html?id=' + it.id + '">' + mcEsc(c.title) + "</a>" +
          '<span class="mini-cart__qty">Qty ' + it.qty + " · " + mcMoney(c.price) + " each</span></div>" +
          '<span class="mini-cart__line">' + mcMoney(line) + "</span></li>";
      }).join("");
      mc.innerHTML =
        '<p class="mini-cart__title">Your Cart</p>' +
        '<ul class="mini-cart__list">' + list + "</ul>" +
        '<p class="mini-cart__total"><span>Subtotal</span><strong>' + mcMoney(total) + "</strong></p>" +
        '<div class="mini-cart__actions">' +
          '<a class="mini-cart__view" href="cart.html">View Cart <span aria-hidden="true">→</span></a>' +
          '<button class="btn btn--gold mini-cart__btn" type="button" data-mini-checkout>Checkout</button>' +
        "</div>" +
        '<p class="mini-cart__status" aria-live="polite" data-mini-status></p>';
    }
    function mcSet(open, returnFocus) {
      if (open) mcRender();
      mc.hidden = !open;
      mcToggle.setAttribute("aria-expanded", String(open));
      if (!open && returnFocus) mcToggle.focus();
    }
    mcToggle.addEventListener("click", function (e) {
      e.preventDefault();
      mcSet(mc.hidden);
    });
    mc.addEventListener("click", function (e) {
      if (e.target.closest("[data-mini-checkout]")) {
        mc.querySelector("[data-mini-status]").textContent = "Secure checkout is coming soon. This is a demo, so no payment has been taken.";
      }
    });
    document.addEventListener("click", function (e) {
      if (!mc.hidden && !mc.contains(e.target) && !mcToggle.contains(e.target)) mcSet(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mc.hidden) mcSet(false, true);
    });
    document.addEventListener("scr:cart", function () { if (!mc.hidden) mcRender(); });
    // lets other code (the quick-entry modal) open the mini-cart; it re-renders
    // from the saved cart first, so it always shows the latest items
    window.SCR.openMiniCart = function () { mcSet(true); };
  }
})();
