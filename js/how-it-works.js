/* Second Chance Raffles — How It Works steps (index.html), with GSAP + ScrollTrigger.
   As each step scrolls into view its text slides in from its own side and the
   phone mockup rises in. Scrubbed to the scroll position, so it reverses on the
   way back up. Without JS or with reduced motion everything is simply shown. */
(function () {
  "use strict";
  var steps = Array.prototype.slice.call(document.querySelectorAll("[data-hw-step]"));
  if (!steps.length || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add({
    desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)"
  }, function (ctx) {
    var desktop = ctx.conditions.desktop;
    steps.forEach(function (step) {
      var text = step.querySelector("[data-hw-text]");
      var media = step.querySelector("[data-hw-media]");
      // text on the left comes from the left, text on the right from the right;
      // on phones (stacked) a shorter slide keeps it inside the screen
      var fromRight = step.classList.contains("hw-step--flip");
      var dist = desktop ? 100 : 40;

      var tl = gsap.timeline({
        scrollTrigger: { trigger: step, start: "top 85%", end: "top 40%", scrub: 1 }
      });
      // fromTo, not from: the end state is always the step's normal layout
      tl.fromTo(text, { x: fromRight ? dist : -dist, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out" }, 0);
      tl.fromTo(media, { y: 40, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: "power2.out" }, 0.1);
    });
  });
})();
