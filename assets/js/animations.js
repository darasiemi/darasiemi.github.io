/* GSAP scroll animations + terminal driver for darasiemi.github.io */

// The full-screen preloader can outlast DOMContentLoaded. Start visible
// animations when it clears rather than letting them finish behind it.
function afterPreloader(eventName, callback) {
  if (document.getElementById("site-preloader")) {
    document.addEventListener(eventName, callback, { once: true });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

/* ── Terminal driver ── */
(function () {
  var term = document.getElementById("bioTerminal");
  var body = document.getElementById("terminalBody");
  var scriptEl = document.getElementById("terminalScript");
  var full = document.getElementById("bioFull");
  var skipBtn = document.getElementById("terminalSkip");

  if (!term || !body || !scriptEl) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var script;
  try {
    script = JSON.parse(scriptEl.textContent);
  } catch (e) {
    return;
  }

  // Timing (ms per character / between steps). Faster is more "coder".
  var TYPE_CMD = 24;
  var TYPE_OUT = 5;
  var AFTER_CMD = 80;
  var AFTER_OUT = 60;
  var START_PAUSE = 150;

  var state = {
    started: false,
    skipped: false,
    done: false,
  };

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function makeLine() {
    var el = document.createElement("div");
    el.className = "term-line";
    body.appendChild(el);
    return el;
  }

  function cursorSpan() {
    var c = document.createElement("span");
    c.className = "term-cursor";
    return c;
  }

  function removeAllCursors() {
    var cursors = body.querySelectorAll(".term-cursor");
    cursors.forEach(function (c) {
      c.remove();
    });
  }

  async function typeInto(target, text, charDelay) {
    if (state.skipped || reduceMotion) {
      target.textContent += text;
      return;
    }
    for (var i = 0; i < text.length; i++) {
      if (state.skipped) {
        target.textContent += text.slice(i);
        return;
      }
      target.appendChild(document.createTextNode(text[i]));
      await sleep(charDelay);
    }
  }

  async function runPrompt(cmd, live) {
    var line = makeLine();
    var promptSpan = document.createElement("span");
    promptSpan.className = "term-prompt";
    promptSpan.textContent = "➜ ~";
    line.appendChild(promptSpan);

    var cmdSpan = document.createElement("span");
    cmdSpan.className = "term-cmd";
    line.appendChild(cmdSpan);

    var cursor = cursorSpan();
    line.appendChild(cursor);
    body.scrollTop = body.scrollHeight;

    await sleep(reduceMotion || state.skipped ? 0 : 60);
    await typeInto(cmdSpan, " " + cmd, reduceMotion ? 0 : TYPE_CMD);

    if (live) {
      // leave the cursor blinking at the end of this prompt (final line)
      return;
    }
    cursor.remove();
    await sleep(reduceMotion || state.skipped ? 0 : AFTER_CMD);
  }

  async function runOutput(text) {
    var line = makeLine();
    await typeInto(line, text, reduceMotion ? 0 : TYPE_OUT);
    await sleep(reduceMotion || state.skipped ? 0 : AFTER_OUT);
  }

  async function runOutputKey(key, value) {
    var line = makeLine();
    var keySpan = document.createElement("span");
    keySpan.className = "term-key";
    keySpan.textContent = key;
    line.appendChild(keySpan);

    var valSpan = document.createElement("span");
    valSpan.className = "term-value";
    line.appendChild(valSpan);

    await typeInto(valSpan, value, reduceMotion ? 0 : TYPE_OUT);
    await sleep(reduceMotion || state.skipped ? 0 : AFTER_OUT);
  }

  async function runOutputLs(items) {
    var line = makeLine();
    line.classList.add("term-ls-row");

    for (var i = 0; i < items.length; i++) {
      var span = document.createElement("span");
      span.className = "term-dir";
      line.appendChild(span);
      await typeInto(span, items[i], reduceMotion ? 0 : 12);
      if (!state.skipped && !reduceMotion) await sleep(20);
    }
    await sleep(reduceMotion || state.skipped ? 0 : AFTER_OUT);
  }

  async function run() {
    if (state.started) return;
    state.started = true;

    // Skip the typing animation on repeat visits in the same session —
    // navigating away and back to About should not replay the whole intro.
    // We still render the terminal content (so the frame is populated).
    var SESSION_KEY = "terminal-shown";
    try {
      if (window.sessionStorage && sessionStorage.getItem(SESSION_KEY) === "1") {
        state.skipped = true;
      }
    } catch (e) {
      /* storage unavailable; fall through to full playback */
    }

    await sleep(reduceMotion || state.skipped ? 0 : START_PAUSE);

    for (var i = 0; i < script.length; i++) {
      var step = script[i];
      switch (step.type) {
        case "prompt":
          await runPrompt(step.cmd, false);
          break;
        case "prompt-live":
          await runPrompt(step.cmd, true);
          break;
        case "output":
          await runOutput(step.text);
          break;
        case "output-key":
          await runOutputKey(step.key, step.value);
          break;
        case "output-ls":
          await runOutputLs(step.items);
          break;
      }
      body.scrollTop = body.scrollHeight;
    }

    state.done = true;
    if (skipBtn) skipBtn.classList.add("is-hidden");

    try {
      if (window.sessionStorage) sessionStorage.setItem("terminal-shown", "1");
    } catch (e) {
      /* ignore */
    }

    // Open the staged sections before notifying gallery/reveal listeners.
    document.documentElement.classList.add("terminal-done");
    document.dispatchEvent(new CustomEvent("terminal:done"));

    // Reveal the full bio below the terminal.
    // Two-stage: first put it back in the layout (`is-visible` flips display),
    // then on the next frame trigger the fade/slide (`is-revealed`), so the
    // opacity + transform transition actually plays instead of being skipped.
    if (full) {
      await sleep(state.skipped ? 0 : 300);
      full.classList.add("is-visible");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          full.classList.add("is-revealed");
        });
      });
    }
  }

  // Skip handler — jumps to end-state immediately
  if (skipBtn) {
    skipBtn.addEventListener("click", function () {
      state.skipped = true;
      skipBtn.classList.add("is-hidden");
    });
  }

  // Scroll-to-end auto-skip. While the stage gate hides every section below the
  // terminal, hitting the bottom of what's visible is a clear "I want more"
  // signal — treat it as a click on the skip button rather than forcing the
  // viewer to wait out the typing.
  var scrollSkip = function () {
    if (state.done || state.skipped) return;
    var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 32;
    if (atBottom) {
      state.skipped = true;
      if (skipBtn) skipBtn.classList.add("is-hidden");
      window.removeEventListener("scroll", scrollSkip);
    }
  };
  window.addEventListener("scroll", scrollSkip, { passive: true });
  document.addEventListener(
    "terminal:done",
    function () {
      window.removeEventListener("scroll", scrollSkip);
    },
    { once: true }
  );

  // Let the hero entrance become visible before the terminal begins typing.
  afterPreloader("site:ready", run);
})();

/* ── About-page entrance and scroll reveals ──
   Native CSS/IntersectionObserver keeps the experience independent of GSAP's
   CDN. The terminal is visible first; later sections reveal once it finishes. */
(function () {
  if (!document.getElementById("bioTerminal")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var intro = document.querySelectorAll(".hero-eyebrow, .hero-first, .hero-last, .hero-tagline, .hero-photo-col, .logo-strip-inner");
  intro.forEach(function (element) {
    element.classList.add("about-intro-reveal");
  });

  afterPreloader("site:ready", function () {
    intro.forEach(function (element, index) {
      setTimeout(
        function () {
          element.classList.add("is-visible");
        },
        element.classList.contains("logo-strip-inner") ? 120 : 60 + index * 65
      );
    });
  });

  var sections = document.querySelectorAll(
    ".terminal, .gallery-section, .pinboard, .achievement-strip, .photo-divider, .about-section, .social-section"
  );
  if (!("IntersectionObserver" in window)) return;

  function countAchievements(strip) {
    strip.querySelectorAll(".achievement-number[data-count-to]").forEach(function (element) {
      var target = Number(element.getAttribute("data-count-to"));
      var suffix = element.getAttribute("data-count-suffix") || "";
      var grouped = element.getAttribute("data-count-format") === "comma";
      var start = performance.now();

      function tick(now) {
        var progress = Math.min((now - start) / 1400, 1);
        var value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        element.textContent = (grouped ? value.toLocaleString() : value) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Micro-bounce once the number lands.
          element.classList.add("is-pulsing");
          element.addEventListener(
            "animationend",
            function () {
              element.classList.remove("is-pulsing");
            },
            { once: true }
          );
        }
      }

      requestAnimationFrame(tick);
    });
  }

  sections.forEach(function (section) {
    section.classList.add("about-scroll-reveal");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("achievement-strip")) countAchievements(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );

  afterPreloader("site:ready", function () {
    observer.observe(document.querySelector(".terminal"));
    function observeRest() {
      requestAnimationFrame(function () {
        sections.forEach(function (section) {
          if (!section.classList.contains("terminal")) observer.observe(section);
        });
      });
    }
    if (document.documentElement.classList.contains("terminal-done")) {
      observeRest();
    } else {
      document.addEventListener("terminal:done", observeRest, { once: true });
    }
  });
})();

/* ── GSAP scroll animations ── */
(function () {
  // About has its own dependency-free reveal above. Keep GSAP for other pages.
  if (document.getElementById("bioTerminal")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var hasTerminal = !!document.getElementById("bioTerminal");

  /* ── Always-on: fires immediately on load ─────────────────────────────── */

  afterPreloader("site:ready", function () {
    /* Start the entrance once the first-visit preloader is fully gone. */
    if (document.querySelector(".hero-section")) {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".hero-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.1)
        .fromTo(".hero-first", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25)
        .fromTo(".hero-last", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7 }, 0.38)
        .fromTo(".hero-tagline", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, 0.55)
        .fromTo(".hero-photo-col", { opacity: 0, x: 30, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power2.out" }, 0.2);
    }

    if (document.querySelector(".logo-strip-inner")) {
      gsap.fromTo(".logo-strip-inner", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.35, ease: "power2.out" });
    }

    /* The terminal rises into view before its typing sequence starts. */
    var terminal = document.querySelector(".terminal");
    if (terminal) {
      gsap.fromTo(
        terminal,
        { opacity: 0, y: 28, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: { trigger: terminal, start: "top 95%", once: true },
        }
      );
    }
  });

  /* Photo divider parallax — purely decorative, safe to run early. */
  var divider = document.querySelector(".photo-divider");
  if (divider) {
    gsap.fromTo(
      divider,
      { backgroundPositionY: "55%" },
      {
        backgroundPositionY: "75%",
        ease: "none",
        scrollTrigger: {
          trigger: divider,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      }
    );
  }

  /* ── Gated: reveal containers on scroll + inner element animations ────── */

  /* After the terminal dispatches `terminal:done` we (1) pre-hide the gated
     container selectors with gsap.set(opacity:0, y:60), (2) flip the body
     class so CSS lifts display:none, (3) register a ScrollTrigger.batch so
     each container fades up as the viewer scrolls to it (the pattern used on
     rashedatjinadu.com — start "top 85%", stagger 0.2, ease sine.out), then
     (4) register the inner-element animations (sticky notes, achievement
     count-up, section headings, news/pubs stagger, social inner). On pages
     without the terminal we skip the gate and register the inner triggers
     immediately. */

  var gatedContainers =
    ".pinboard, .achievement-strip, .about-section, .photo-divider, " + ".gallery-journey-link, .social-section, .gallery-section";

  function openGate() {
    /* 1. Pre-hide before display:none → block, so sections never flash in. */
    gsap.set(gatedContainers, { opacity: 0, y: 80 });

    /* 2. Lift display:none so ScrollTrigger can measure positions. */
    document.body.classList.add("terminal-done");

    /* 3. Scroll-reveal pattern (rashedatjinadu.com — opacity + rise, batched
       so neighbours cascade instead of each firing independently). */
    ScrollTrigger.batch(gatedContainers, {
      start: "top 85%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.15,
          overwrite: true,
        });
      },
    });

    /* 4. Inner animations (defined below). */
    registerInnerTriggers();

    /* Fire any ScrollTriggers whose targets are already in view. */
    ScrollTrigger.refresh();
  }

  function registerInnerTriggers() {
    /* Pinboard sticky notes */
    ScrollTrigger.create({
      trigger: ".pinboard",
      start: "top 82%",
      once: true,
      onEnter: function () {
        gsap.to(".sticky-note", { opacity: 1, duration: 0.6, stagger: 0.18, ease: "power2.out" });
      },
    });

    /* Achievement strip — stagger reveal + count-up numbers */
    ScrollTrigger.create({
      trigger: ".achievement-strip",
      start: "top 85%",
      once: true,
      onEnter: function () {
        gsap.fromTo(".achievement-item", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" });

        gsap.utils.toArray(".achievement-number[data-count-to]").forEach(function (el, i) {
          var target = parseFloat(el.getAttribute("data-count-to"));
          var suffix = el.getAttribute("data-count-suffix") || "";
          var format = el.getAttribute("data-count-format");
          var proxy = { val: 0 };

          gsap.to(proxy, {
            val: target,
            duration: 1.6,
            delay: 0.3 + i * 0.12,
            ease: "power2.out",
            onUpdate: function () {
              var v = Math.round(proxy.val);
              el.textContent = (format === "comma" ? v.toLocaleString() : v) + suffix;
            },
          });
        });
      },
    });

    /* Section headings slide in */
    gsap.utils.toArray(".about-section-heading, .social-heading").forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    /* News / pubs item stagger inside .about-section (containers themselves
       are revealed by the CSS gate; this handles each list item). */
    gsap.utils.toArray(".about-section").forEach(function (section) {
      var heading = section.querySelector(".about-section-heading");
      var headingText = heading ? heading.textContent.trim().toLowerCase() : "";
      var isNews = headingText === "news";
      var isPubs = headingText === "selected publications";

      if (isNews) {
        var newsItems = section.querySelectorAll("ol > li, ul > li");
        gsap.fromTo(
          newsItems,
          { opacity: 0, x: -18 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.09,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 82%", once: true },
          }
        );
      }

      if (isPubs) {
        var pubItems = section.querySelectorAll("ol.bibliography > li");
        gsap.fromTo(
          pubItems,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 82%", once: true },
          }
        );
      }
    });

    /* Social section — inner stagger (heading, icons, note). The container
       itself is revealed by the CSS gate. */
    var socialSection = document.querySelector(".social-section");
    if (socialSection) {
      gsap.fromTo(
        socialSection.querySelectorAll(".social-heading, .contact-icons, .contact-note"),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: socialSection, start: "top 85%", once: true },
        }
      );
    }
  }

  if (hasTerminal) {
    document.addEventListener("terminal:done", openGate, { once: true });
  } else {
    /* No terminal on this page (CV, blog, publications, projects, etc.) —
       no gate to open. Register the About-specific inner triggers as a no-op
       (selectors won't match), then apply a universal scroll-reveal in the
       rashedatjinadu style so content cards fade up as the viewer scrolls. */
    registerInnerTriggers();
    registerUniversalReveal();
  }

  /* Universal scroll-reveal for content cards on non-About pages. */
  function registerUniversalReveal() {
    var universalSelectors = [
      ".post > header",
      ".post-list > li",
      "ol.bibliography > li",
      ".card.mt-3",
      ".projects .grid-item",
      ".projects .row > div",
      ".archive > ul > li",
      ".news table tr",
      ".pagination",
    ].join(", ");

    var universalElements = gsap.utils.toArray(universalSelectors);
    if (!universalElements.length) return;

    gsap.set(universalElements, { opacity: 0, y: 60 });

    ScrollTrigger.batch(universalElements, {
      start: "top 85%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.15,
          overwrite: true,
        });
      },
    });
  }
})();
