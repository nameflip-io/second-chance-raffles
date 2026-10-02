/* Second Chance Raffles — free-entry.html. Builds the table of open competitions
   and their questions from data/competitions.js. ?comp=<id> highlights one. */
(function () {
  "use strict";
  var slot = document.querySelector('[data-render="postal-table"]');
  var comps = window.SCR_COMPETITIONS || [];
  if (!slot || !comps.length) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
  var focus = parseInt(new URLSearchParams(location.search).get("comp"), 10);

  var rows = comps.map(function (c) {
    return (
      "<tr" + (c.id === focus ? ' class="is-focus"' : "") + ' id="postal-' + c.id + '">' +
        '<th scope="row"><a href="competition.html?id=' + c.id + '">' + esc(c.title) + "</a></th>" +
        "<td>" + esc(c.question.text) + '<span class="postal-table__opts">' + c.question.options.map(esc).join(" / ") + "</span></td>" +
        '<td class="mono">' + esc(c.badge) + "</td>" +
      "</tr>"
    );
  }).join("");
  slot.innerHTML =
    '<table class="postal-table"><thead><tr><th scope="col">Competition</th><th scope="col">Question &amp; options</th><th scope="col">Entries close</th></tr></thead>' +
    "<tbody>" + rows + "</tbody></table>";

  var comp = comps.filter(function (c) { return c.id === focus; })[0];
  var note = document.querySelector("[data-postal-focus]");
  if (comp && note) {
    note.innerHTML = "You’re entering <strong>" + esc(comp.title) + "</strong>. Write its name and your answer to <em>“" +
      esc(comp.question.text) + "”</em> on your postcard. Entries must arrive before the competition closes (" + esc(comp.badge.toLowerCase()) + ").";
    note.hidden = false;
  }
})();
