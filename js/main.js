// Francesc Borràs — portfolio
// Small, purposeful interactions only: nav toggle, scroll reveals,
// a count-up on stat callouts, and the signature EDPV curve draw-in.

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".site-nav ul");
  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (prefersReduced) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".curve-motif").forEach(function (el) {
      el.classList.add("in-view");
    });
    document.querySelectorAll(".stat .num[data-count]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
    return;
  }

  /* Scroll reveal */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* Signature curve draw-in */
  var curveObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          curveObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll(".curve-motif").forEach(function (el) {
    curveObserver.observe(el);
  });

  /* Stat count-up */
  function animateCount(el) {
    var target = el.getAttribute("data-count");
    var match = target.match(/^([^\d\-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) { el.textContent = target; return; }
    var prefix = match[1], endVal = parseFloat(match[2]), suffix = match[3];
    var isFloat = match[2].indexOf(".") !== -1;
    var duration = 900;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = endVal * eased;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + (isFloat ? endVal.toFixed(1) : endVal) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".stat .num[data-count]").forEach(function (el) {
    statObserver.observe(el);
  });
})();
