/* Scroll animations for darasiemi.github.io */

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

/* ── Hero glow follows the cursor ── */
(function () {
  var hero = document.querySelector(".hero-section");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var x = 50;
  var y = 50;
  var targetX = 50;
  var targetY = 50;
  var frame = 0;

  function update() {
    var dx = targetX - x;
    var dy = targetY - y;
    if (Math.abs(dx) + Math.abs(dy) < 0.2) {
      x = targetX;
      y = targetY;
      frame = 0;
    } else {
      x += dx * 0.16;
      y += dy * 0.16;
      frame = window.requestAnimationFrame(update);
    }
    hero.style.setProperty("--hero-glow-x", x.toFixed(2) + "%");
    hero.style.setProperty("--hero-glow-y", y.toFixed(2) + "%");
  }

  function moveTo(nextX, nextY) {
    targetX = nextX;
    targetY = nextY;
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  // Touch pointers get cancelled as soon as Chromium decides a drag is a scroll
  // gesture, so pointer events alone leave the glow stuck. We drive it from the
  // native touch stream too — those events keep firing through a scroll — and
  // suppress the pointerleave reset while a finger is still down.
  var touchActive = false;

  function moveFrom(clientX, clientY) {
    var rect = hero.getBoundingClientRect();
    moveTo(((clientX - rect.left) / rect.width) * 100, ((clientY - rect.top) / rect.height) * 100);
  }

  hero.addEventListener(
    "pointermove",
    function (event) {
      moveFrom(event.clientX, event.clientY);
    },
    { passive: true }
  );
  hero.addEventListener("pointerleave", function () {
    if (!touchActive) moveTo(50, 50);
  });

  hero.addEventListener(
    "touchstart",
    function (event) {
      touchActive = true;
      if (event.touches.length) moveFrom(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: true }
  );
  hero.addEventListener(
    "touchmove",
    function (event) {
      if (event.touches.length) moveFrom(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: true }
  );
  function endTouch() {
    touchActive = false;
  }
  hero.addEventListener("touchend", endTouch);
  hero.addEventListener("touchcancel", endTouch);
})();

/* ── Draggable affiliation marquee ──
   Replaces the CSS keyframe animation with a rAF-driven transform so the
   viewer can touch-drag or click-drag the strip in either direction to catch
   a logo that moved past. Auto-scroll leftward resumes a short beat after
   release. Hover pauses on desktop. The CSS still owns layout, duration via
   --marquee-duration, and the prefers-reduced-motion fallback (which falls
   back to a static wrap and no JS). */
(function () {
  var marquee = document.querySelector(".logo-marquee");
  var track = marquee && marquee.querySelector(".logo-marquee-track");
  if (!marquee || !track) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var copyWidth = 0;
  var offset = 0;
  var auto = true;
  var hoverPaused = false;
  var dragging = false;
  var dragPointerId = null;
  var dragStartX = 0;
  var dragStartOffset = 0;
  var dragDistance = 0;
  var resumeTimer = 0;
  var lastTs = 0;
  // Velocity sampling for flick momentum.
  var samples = [];
  var coastVelocity = 0; // px / second
  var coasting = false;

  function sampleVelocity(clientX) {
    var now = performance.now();
    samples.push({ t: now, x: clientX });
    var cutoff = now - 90;
    while (samples.length > 2 && samples[0].t < cutoff) samples.shift();
  }

  function flingVelocity() {
    if (samples.length < 2) return 0;
    var first = samples[0];
    var last = samples[samples.length - 1];
    var dt = (last.t - first.t) / 1000;
    if (dt <= 0) return 0;
    return (last.x - first.x) / dt;
  }

  function startCoast() {
    coastVelocity = flingVelocity();
    samples.length = 0;
    coasting = Math.abs(coastVelocity) > 60; // ignore tiny unintentional nudges
  }

  function durationSeconds() {
    var raw = getComputedStyle(track).getPropertyValue("--marquee-duration").trim();
    var seconds = parseFloat(raw);
    return isFinite(seconds) && seconds > 0 ? seconds : 34;
  }

  function normalize(x) {
    if (copyWidth <= 0) return x;
    while (x <= -copyWidth) x += copyWidth;
    while (x > 0) x -= copyWidth;
    return x;
  }

  function apply() {
    track.style.transform = "translateX(" + offset.toFixed(2) + "px)";
  }

  function measure() {
    // Track contains two identical copies for a seamless loop; one copy = half.
    copyWidth = track.scrollWidth / 2;
    offset = normalize(offset);
    apply();
  }

  function step(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min(ts - lastTs, 50) / 1000;
    lastTs = ts;
    if (coasting && !dragging) {
      offset += coastVelocity * dt;
      offset = normalize(offset);
      apply();
      // Friction: velocity halves ~every 400ms, so a brisk flick coasts for a
      // second or two before settling.
      coastVelocity *= Math.pow(0.18, dt);
      if (Math.abs(coastVelocity) < 15) {
        coasting = false;
        coastVelocity = 0;
      }
    } else if (auto && !hoverPaused && !dragging && !coasting && copyWidth > 0) {
      offset -= (copyWidth / durationSeconds()) * dt;
      offset = normalize(offset);
      apply();
    }
    window.requestAnimationFrame(step);
  }

  marquee.addEventListener("pointerenter", function (event) {
    if (event.pointerType === "mouse") hoverPaused = true;
  });
  marquee.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse") hoverPaused = false;
  });

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== dragPointerId) return;
    var delta = event.clientX - dragStartX;
    dragDistance = Math.abs(delta);
    offset = normalize(dragStartOffset + delta);
    apply();
    sampleVelocity(event.clientX);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    marquee.classList.remove("is-dragging");
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", endDrag);
    document.removeEventListener("pointercancel", endDrag);
    startCoast();
    resumeTimer = setTimeout(function () {
      auto = true;
    }, 1800);
  }

  marquee.addEventListener("pointerdown", function (event) {
    dragging = true;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartOffset = offset;
    dragDistance = 0;
    coasting = false;
    coastVelocity = 0;
    samples.length = 0;
    sampleVelocity(event.clientX);
    clearTimeout(resumeTimer);
    auto = false;
    marquee.classList.add("is-dragging");
    // Follow the pointer at the document level so a drag that strays above or
    // below the strip still updates and ends cleanly.
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    event.preventDefault();
  });

  // Touch fallback. On mobile Chromium cancels the pointer stream the moment
  // it decides the gesture looks like a scroll, which leaves the strip stuck
  // after a brief jump. Native touchmove events keep firing through the same
  // gesture, so we mirror the drag off touch as well.
  marquee.addEventListener(
    "touchstart",
    function (event) {
      if (!event.touches.length) return;
      dragging = true;
      dragPointerId = null;
      dragStartX = event.touches[0].clientX;
      dragStartOffset = offset;
      dragDistance = 0;
      coasting = false;
      coastVelocity = 0;
      samples.length = 0;
      sampleVelocity(event.touches[0].clientX);
      clearTimeout(resumeTimer);
      auto = false;
      marquee.classList.add("is-dragging");
      markTouched();
    },
    { passive: true }
  );
  marquee.addEventListener(
    "touchmove",
    function (event) {
      if (!dragging || !event.touches.length) return;
      var tx = event.touches[0].clientX;
      var delta = tx - dragStartX;
      dragDistance = Math.abs(delta);
      offset = normalize(dragStartOffset + delta);
      apply();
      sampleVelocity(tx);
    },
    { passive: true }
  );
  function endTouchDrag() {
    if (!dragging) return;
    dragging = false;
    marquee.classList.remove("is-dragging");
    startCoast();
    resumeTimer = setTimeout(function () {
      auto = true;
    }, 1800);
  }
  marquee.addEventListener("touchend", endTouchDrag);
  marquee.addEventListener("touchcancel", endTouchDrag);

  // Suppress link activation when a drag ended on a logo.
  marquee.addEventListener(
    "click",
    function (event) {
      if (dragDistance > 5) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  measure();
  // Match the previous CSS animation-delay: start the loop with RISE (7th / last
  // logo) at the left edge so UCD enters fresh from the right.
  offset = normalize(-copyWidth * (6 / 7));
  apply();

  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);

  window.requestAnimationFrame(step);
})();

/* ── Bio scroll highlight ── */
(function () {
  var full = document.getElementById("bioFull");
  if (!full) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupBioScrollHighlight(container) {
    if (reduceMotion) return;

    var words = [];
    container.querySelectorAll("p, li, h4").forEach(function (element) {
      var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach(function (node) {
        var parts = node.textContent.split(/(\s+)/);
        var fragment = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            var word = document.createElement("span");
            word.className = "bio-scroll-word";
            word.textContent = part;
            fragment.appendChild(word);
            words.push(word);
          }
        });
        node.parentNode.replaceChild(fragment, node);
      });
    });
    if (!words.length) return;

    container.classList.add("has-scroll-highlight");
    var pending = false;
    var lastProgress = -1;

    function update() {
      pending = false;
      var viewportHeight = window.innerHeight;
      var rect = container.getBoundingClientRect();
      var lastWordBottom = words[words.length - 1].getBoundingClientRect().bottom;
      var progress = Math.max(0, Math.min(1, (viewportHeight * 0.9 - rect.top) / (lastWordBottom - rect.top + viewportHeight * 0.1)));
      if (progress === lastProgress) return;
      lastProgress = progress;

      var count = words.length;
      var fadeWidth = 3;
      words.forEach(function (word, index) {
        var start = index / count;
        var end = Math.min(1, (index + fadeWidth) / count);
        var reveal = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        word.style.opacity = (0.62 + reveal * 0.38).toFixed(3);
        word.style.webkitTextStrokeWidth = (reveal * 0.45).toFixed(2) + "px";
        word.classList.toggle("is-lit", reveal >= 0.98);
      });
    }

    function requestUpdate() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
  }

  afterPreloader("site:ready", function () {
    setupBioScrollHighlight(full);
  });
})();

/* ── About-page entrance and scroll reveals ──
   Native CSS/IntersectionObserver keeps the experience independent of GSAP's CDN. */
(function () {
  if (!document.querySelector(".hero-section")) return;
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

  var sections = document.querySelectorAll(".gallery-section, .pinboard, .achievement-strip, .photo-divider, .about-section, .social-section");
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
    sections.forEach(function (section) {
      observer.observe(section);
    });
  });
})();

/* ── GSAP scroll animations on other pages ── */
(function () {
  if (document.querySelector(".hero-section")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

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
})();
