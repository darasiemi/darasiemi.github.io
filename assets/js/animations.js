/* GSAP scroll animations + terminal driver for darasiemi.github.io */

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
  var TYPE_CMD = 55;
  var TYPE_OUT = 14;
  var AFTER_CMD = 240;
  var AFTER_OUT = 160;
  var START_PAUSE = 400;

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
    if (state.skipped) {
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

    await sleep(reduceMotion || state.skipped ? 0 : 180);
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
      await typeInto(span, items[i], reduceMotion ? 0 : 25);
      if (!state.skipped) await sleep(60);
    }
    await sleep(reduceMotion || state.skipped ? 0 : AFTER_OUT);
  }

  async function run() {
    if (state.started) return;
    state.started = true;

    await sleep(reduceMotion ? 0 : START_PAUSE);

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

    // Reveal the full bio below the terminal
    if (full) {
      await sleep(300);
      full.classList.add("is-revealed");
    }
  }

  // Skip handler — jumps to end-state immediately
  if (skipBtn) {
    skipBtn.addEventListener("click", function () {
      state.skipped = true;
      skipBtn.classList.add("is-hidden");
    });
  }

  // Play only when terminal scrolls into view
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(term);
  } else {
    run();
  }
})();

/* ── GSAP scroll animations ── */
(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero entrance (page load) ── */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .fromTo(".hero-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.1)
    .fromTo(".hero-first", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25)
    .fromTo(".hero-last", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7 }, 0.38)
    .fromTo(".hero-tagline", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, 0.55)
    .fromTo(".hero-photo-col", { opacity: 0, x: 30, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power2.out" }, 0.2);

  /* ── Pinboard sticky notes ── */
  ScrollTrigger.create({
    trigger: ".pinboard",
    start: "top 82%",
    once: true,
    onEnter: function () {
      // Fade in while preserving each note's existing rotation (set via :nth-child)
      gsap.to(".sticky-note", { opacity: 1, duration: 0.6, stagger: 0.18, ease: "power2.out" });
    },
  });

  /* ── Achievement strip — stagger reveal + count-up numbers ── */
  ScrollTrigger.create({
    trigger: ".achievement-strip",
    start: "top 85%",
    once: true,
    onEnter: function () {
      // Stagger the items with icon + number + label all rising together
      gsap.fromTo(".achievement-item", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" });

      // Count-up each number from 0 to its data-count-to value
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

  /* ── Section headings slide in ── */
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

  /* ── Photo divider parallax ── */
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

  /* ── News list stagger — each news item rises in sequence ── */
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

  /* ── Logo strip — fade-in reveal with soft lift ── */
  var logoStrip = document.querySelector(".logo-strip");
  if (logoStrip) {
    gsap.fromTo(
      logoStrip,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: logoStrip, start: "top 90%", once: true },
      }
    );
  }

  /* ── Bio terminal — subtle rise as it enters viewport (not the type anim) ── */
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
        scrollTrigger: { trigger: terminal, start: "top 85%", once: true },
      }
    );
  }

  /* ── Social section — stagger reveal (heading, icons, note) ── */
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
})();
