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
   Page slide transition between internal pages.
   Degrades safely: without JS the links navigate normally.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  var hero = document.querySelector(".hero-video-wrap, .title-hero");
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

/* ---------------------------------------------------------
   Trailer facade: the YouTube player is only requested once
   the visitor clicks play. Keeps the page light and avoids
   loading third-party scripts nobody asked for.
   --------------------------------------------------------- */
(function () {
  "use strict";

  document.querySelectorAll(".trailer-facade").forEach(function (facade) {
    facade.addEventListener("click", function () {
      var id = facade.getAttribute("data-yt");
      if (!id) return;

      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = facade.getAttribute("aria-label") || "Game trailer";
      iframe.allow = "autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      facade.replaceWith(iframe);
    });
  });
})();

/* ---------------------------------------------------------
   Image lightbox for project pages.
   - Auto-wraps .ph-shots img in a button so hero shots are clickable.
   - Collects all .tg-shot and wrapped hero shots into a single list.
   - Arrows and keyboard navigate; click on backdrop or Esc closes.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var box = document.getElementById("lightbox");
  if (!box) return;

  // Wrap hero shots in a clickable button so they behave like gallery items
  var heroImgs = document.querySelectorAll(".ph-shots img");
  heroImgs.forEach(function (img) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ph-shot-btn";
    btn.setAttribute("data-full", img.getAttribute("src"));
    btn.setAttribute("data-caption", img.getAttribute("alt") || "");
    var parent = img.parentNode;
    parent.insertBefore(btn, img);
    btn.appendChild(img);
  });

  // Collect all lightbox-openable elements in DOM order
  var shots = Array.prototype.slice.call(
    document.querySelectorAll(".ph-shot-btn, .tg-shot")
  );
  if (!shots.length) return;

  var img = box.querySelector("#lb-image") || box.querySelector(".lb-img");
  var caption = box.querySelector(".caption") || box.querySelector(".lb-caption");
  var counter = box.querySelector(".counter") || box.querySelector(".lb-counter");
  var btnPrev = box.querySelector(".lb-prev");
  var btnNext = box.querySelector(".lb-next");
  var btnClose = box.querySelector(".lb-close");

  var current = 0;
  var lastFocused = null;

  function show(index) {
    current = (index + shots.length) % shots.length;
    var shot = shots[current];
    var src = shot.getAttribute("data-full");
    var cap = shot.getAttribute("data-caption") || "";
    img.src = src;
    img.alt = cap;
    if (caption) caption.textContent = cap;
    if (counter) counter.textContent = (current + 1) + " / " + shots.length;
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    box.hidden = false;
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (btnClose) btnClose.focus();
  }

  function close() {
    box.classList.remove("is-open");
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  shots.forEach(function (shot, i) {
    shot.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });

  if (btnPrev) btnPrev.addEventListener("click", function () { show(current - 1); });
  if (btnNext) btnNext.addEventListener("click", function () { show(current + 1); });
  if (btnClose) btnClose.addEventListener("click", close);

  box.addEventListener("click", function (e) {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();

/* ---------------------------------------------------------
   Contributions background reel: only start playing once the
   section is on screen, and drop it entirely if the file is
   missing so nothing looks broken.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var video = document.querySelector(".contrib-bg");
  if (!video) return;

  video.addEventListener("error", function () { video.remove(); }, true);

  var section = video.closest(".contributions");
  if (!section || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        video.preload = "auto";
        video.load();
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        observer.disconnect();
      }
    });
  }, { rootMargin: "200px" });

  observer.observe(section);
})();

/* Language toggle */
(function () {
  var langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    var LANGS = ['en', 'es', 'cat'];
    var LABELS = { en: 'EN', es: 'ES', cat: 'CAT' };

    function currentLang() {
      try {
        var saved = localStorage.getItem('fb-lang');
        if (saved && LANGS.indexOf(saved) >= 0) return saved;
      } catch (e) {}
      return 'en';
    }

    function setLang(lang) {
      try { localStorage.setItem('fb-lang', lang); } catch (e) {}
      var label = langBtn.querySelector('.lang-label');
      if (label) label.textContent = LABELS[lang];
      if (typeof window.applyI18n === 'function') {
        window.applyI18n(lang);
      }
    }

    // On load: apply saved language
    setLang(currentLang());

    // On click: cycle EN -> ES -> CAT -> EN
    langBtn.addEventListener('click', function () {
      var cur = currentLang();
      var next = LANGS[(LANGS.indexOf(cur) + 1) % LANGS.length];
      setLang(next);
    });
  }
})();

/* Traditional pipeline flip cards - tap support on touch devices */
(function () {
  var cards = document.querySelectorAll('.trad-card');
  if (!cards.length) return;
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('is-flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });
})();

/* ==========================================================
   Conclusions experience (AI pipeline page)
   Scroll reveal + metric counters + section triggers
   ========================================================== */
(function () {
  var root = document.querySelector('.cc-opening');
  if (!root) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Scroll reveal on major blocks --- */
  var revealTargets = document.querySelectorAll(
    '.cc-opening .wrap > *, .cc-numbers .wrap > *, .cc-catch .wrap > *, ' +
    '.cc-learned .wrap > *, .cc-redo .wrap > *, .cc-shift .wrap > *, ' +
    '.cc-pipeline .wrap > *, .cc-roadmap .wrap > *, .cc-final .wrap > *'
  );
  revealTargets.forEach(function (el) { el.classList.add('cc-reveal'); });

  if (reduced) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObs.observe(el); });
  }

  /* --- Metric counters --- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateMetric(el) {
    var numEl = el.querySelector('.cc-metric-num');
    if (!numEl) return;

    var to = parseFloat(el.dataset.countTo);
    if (isNaN(to)) return;

    var from = el.dataset.countFrom !== undefined ? parseFloat(el.dataset.countFrom) : 0;
    var decimal = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var isArrow = el.dataset.arrow === 'true';

    function fmt(v) {
      if (decimal === 2) return (v / 100).toFixed(2);
      if (decimal === 1) return (v / 10).toFixed(1);
      return Math.round(v).toString();
    }

    if (reduced) {
      numEl.textContent = isArrow ? fmt(from) + ' → ' + fmt(to) : prefix + fmt(to) + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = easeOut(p);
      var current = from + (to - from) * eased;
      numEl.textContent = isArrow
        ? fmt(from) + ' → ' + fmt(current)
        : prefix + fmt(current) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var metrics = document.querySelectorAll('.cc-metric[data-count-to]');
  if (metrics.length) {
    var metricObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateMetric(entry.target);
          metricObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    metrics.forEach(function (m) { metricObs.observe(m); });
  }

  /* --- Trigger the AI chip nudge and the pipeline tags when in view --- */
  function triggerOnce(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (reduced) { el.classList.add('is-in'); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  }
  triggerOnce('.cc-swap');
  triggerOnce('.cc-pipe-flow');
})();

/* Hours-per-phase chart: grow bars when scrolled into view */
(function () {
  var chart = document.querySelector('.hpp');
  if (!chart) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    chart.classList.add('is-in');
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  obs.observe(chart);
})();

/* ==========================================================
   Before / after comparator
   ========================================================== */
(function () {
  var stage = document.getElementById('ba-stage');
  if (!stage) return;
  var clip = document.getElementById('ba-clip');
  var handle = document.getElementById('ba-handle');
  var dragging = false;

  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    clip.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  function fromEvent(e) {
    var r = stage.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setPos((x / r.width) * 100);
  }

  stage.addEventListener('mousedown', function (e) { dragging = true; fromEvent(e); });
  window.addEventListener('mousemove', function (e) { if (dragging) fromEvent(e); });
  window.addEventListener('mouseup', function () { dragging = false; });

  stage.addEventListener('touchstart', function (e) { dragging = true; fromEvent(e); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (dragging) fromEvent(e); }, { passive: true });
  window.addEventListener('touchend', function () { dragging = false; });

  handle.addEventListener('keydown', function (e) {
    var cur = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(cur - 4); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setPos(cur + 4); }
  });

  setPos(50);
})();

/* ==========================================================
   Prompt explorer: tabs + copy to clipboard
   ========================================================== */
(function () {
  var tabs = document.querySelectorAll('.px-tab');
  if (!tabs.length) return;
  var panels = document.querySelectorAll('.px-panel');

  function activate(key) {
    tabs.forEach(function (t) {
      var on = t.dataset.px === key;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.px === key); });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activate(tab.dataset.px); });
    tab.addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(tabs);
      var i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var next = i;
      if (e.key === 'ArrowRight') next = (i + 1) % list.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + list.length) % list.length;
      else return;
      e.preventDefault();
      list[next].focus();
      activate(list[next].dataset.px);
    });
  });

  document.querySelectorAll('.px-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.closest('.px-panel');
      var code = panel && panel.querySelector('code');
      if (!code) return;
      var text = code.textContent;
      var done = function () {
        var original = btn.textContent;
        btn.textContent = btn.dataset.copiedLabel || 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('is-done');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });
})();
