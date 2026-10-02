/* Second Chance Raffles — cart.html. Reads the basket from SCR.cart (js/main.js)
   and competition details from data/competitions.js. Plain JS. */
(function () {
  "use strict";
  var page = document.querySelector("[data-cart-page]");
  if (!page || !window.SCR || !window.SCR.cart) return;

  var cart = window.SCR.cart;
  var byId = {};
  (window.SCR_COMPETITIONS || []).forEach(function (c) { byId[c.id] = c; });

  // DEMO promo codes. Real codes must be validated by the checkout server.
  var PROMOS = { WELCOME10: { label: "10% off", rate: 0.1 } };
  var promo = null;

  var list = page.querySelector("[data-cart-list]");
  var full = page.querySelector("[data-cart-full]");
  var empty = page.querySelector("[data-cart-empty]");
  var subEl = page.querySelector("[data-sum-subtotal]");
  var discEl = page.querySelector("[data-sum-discount]");
  var totalEl = page.querySelector("[data-sum-total]");

  function money(n) { return "£" + n.toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  function lines() {
    // skip anything in storage that no longer matches a competition
    return cart.items().filter(function (it) { return byId[it.id]; }).map(function (it) {
      var c = byId[it.id];
      return { id: it.id, qty: it.qty, comp: c, max: Math.min(cart.max, c.totalTickets - c.ticketsSold), total: it.qty * c.price };
    });
  }

  function renderTotals(rows) {
    var subtotal = rows.reduce(function (n, r) { return n + r.total; }, 0);
    var discount = promo ? Math.round(subtotal * promo.rate * 100) / 100 : 0;
    subEl.textContent = money(subtotal);
    discEl.textContent = "-" + money(discount);
    totalEl.textContent = money(subtotal - discount);
  }

  function render() {
    var rows = lines();
    empty.hidden = rows.length > 0;
    full.hidden = rows.length === 0;
    if (!rows.length) { list.innerHTML = ""; return; }

    list.innerHTML = rows.map(function (r) {
      var url = "competition.html?id=" + r.id;
      return (
        '<li class="cart-item" data-id="' + r.id + '">' +
          '<a class="cart-item__img" href="' + url + '" tabindex="-1" aria-hidden="true"></a>' +
          '<div class="cart-item__info">' +
            '<h2 class="cart-item__name"><a href="' + url + '">' + esc(r.comp.title) + "</a></h2>" +
            '<p class="cart-item__each">' + money(r.comp.price) + " per ticket</p>" +
            '<div class="cart-item__qty">' +
              '<button class="qty__btn" type="button" data-step="-1" aria-label="One fewer ticket for ' + esc(r.comp.title) + '"' + (r.qty <= 1 ? " disabled" : "") + ">−</button>" +
              '<span class="cart-item__count" aria-live="polite"><span class="visually-hidden">Tickets: </span>' + r.qty + "</span>" +
              '<button class="qty__btn" type="button" data-step="1" aria-label="One more ticket for ' + esc(r.comp.title) + '"' + (r.qty >= r.max ? " disabled" : "") + ">+</button>" +
            "</div>" +
          "</div>" +
          '<div class="cart-item__end">' +
            '<p class="cart-item__price">' + money(r.total) + "</p>" +
            '<button class="cart-item__remove" type="button" data-remove>Remove<span class="visually-hidden"> ' + esc(r.comp.title) + "</span></button>" +
          "</div>" +
        "</li>"
      );
    }).join("");
    renderTotals(rows);
  }

  // one listener for every row
  list.addEventListener("click", function (e) {
    var row = e.target.closest(".cart-item");
    if (!row) return;
    var id = +row.getAttribute("data-id");
    var step = e.target.closest("[data-step]");
    if (step) {
      var it = cart.items().filter(function (x) { return x.id === id; })[0];
      if (!it) return;
      cart.setQty(id, Math.min(it.qty + +step.getAttribute("data-step"), Math.min(cart.max, byId[id].totalTickets - byId[id].ticketsSold)));
      // keep focus on the same button after the re-render
      var dir = step.getAttribute("data-step");
      var again = list.querySelector('.cart-item[data-id="' + id + '"] [data-step="' + dir + '"]');
      if (again && !again.disabled) again.focus();
      else { var other = list.querySelector('.cart-item[data-id="' + id + '"] [data-step]:not(:disabled)'); if (other) other.focus(); }
    } else if (e.target.closest("[data-remove]")) {
      cart.remove(id);
      // move focus somewhere sensible once the row has gone
      var next = list.querySelector(".cart-item [data-remove]") || page.querySelector("[data-cart-empty] a");
      if (next) next.focus();
    }
  });

  // re-render whenever the cart changes (here or in another tab)
  document.addEventListener("scr:cart", render);

  /* ---------- Promo code (demo) ---------- */
  var promoForm = page.querySelector("[data-promo]");
  var promoMsg = page.querySelector("[data-promo-msg]");
  promoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = promoForm.code.value.trim().toUpperCase();
    if (!code) { promo = null; promoMsg.textContent = "Type a code first."; promoMsg.className = "promo__msg is-wrong"; }
    else if (PROMOS[code]) { promo = PROMOS[code]; promoMsg.textContent = code + " applied: " + promo.label + "."; promoMsg.className = "promo__msg is-ok"; }
    else { promo = null; promoMsg.textContent = "That code isn’t valid."; promoMsg.className = "promo__msg is-wrong"; }
    renderTotals(lines());
  });

  /* ---------- Checkout (demo) ---------- */
  page.querySelector("[data-checkout]").addEventListener("click", function () {
    page.querySelector("[data-checkout-status]").textContent = "Secure checkout is coming soon. This is a demo, so no payment has been taken.";
  });

  render();
})();
