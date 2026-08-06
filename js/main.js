// Francesc Borras Lleida - portfolio
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

/* ---------------------------------------------------------
   Contributions panel + page slide transition.
   Both degrade safely: without JS the deep dive stays visible
   and links navigate normally.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Collapse the contributions panel until asked for */
  var panel = document.getElementById("contributions");
  var toggle = document.getElementById("contributions-toggle");

  if (panel && toggle) {
    panel.classList.add("is-collapsed");

    toggle.addEventListener("click", function () {
      var opening = panel.classList.contains("is-collapsed");
      panel.classList.toggle("is-collapsed", !opening);
      toggle.setAttribute("aria-expanded", opening ? "true" : "false");
      toggle.textContent = opening ? "Hide Contributions" : "My Contributions";

      if (opening) {
        panel.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  }

  /* Slide out before navigating to another page of the site */
  if (reduced) return;

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href) return;

    // Ignore new tabs, anchors, downloads and anything off-site
    if (link.target === "_blank") return;
    if (link.hasAttribute("download")) return;
    if (href.charAt(0) === "#") return;
    if (/^(mailto:|tel:|https?:)/.test(href) && link.hostname !== window.location.hostname) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(function () {
      window.location.href = href;
    }, 340);
  });

  /* Restore state if the visitor comes back via the back button */
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) document.body.classList.remove("is-leaving");
  });
})();

/* ---------------------------------------------------------
   Transparent nav over the hero, solid once scrolled past it.
   Uses an IntersectionObserver on a sentinel rather than a
   scroll listener, so it costs nothing per frame.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  var hero = document.querySelector(".hero-video-wrap");
  if (!nav) return;

  if (!hero) {
    // No hero on this page: the solid bar is applied by CSS.
    return;
  }

  document.body.classList.add("has-hero");

  // Sentinel sits just below the fold of the nav itself.
  var sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:70vh;pointer-events:none;";
  hero.appendChild(sentinel);

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        nav.classList.toggle("is-scrolled", !entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );
  observer.observe(sentinel);
})();
