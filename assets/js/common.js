$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);

    // Replace Bootstrap's $.scrollspy — which was leaving multiple
    // sidebar links marked `.active` when scrolling between sections
    // (reported on the CV page). Walk the generated links once, resolve
    // each href to its target heading, then on scroll pick the single
    // section whose top sits just above the current scroll line and
    // mark only its link active.
    var tocLinks = $myNav[0].querySelectorAll(".nav-link");
    var tocTargets = Array.prototype.map.call(tocLinks, function (link) {
      var href = link.getAttribute("href") || "";
      if (!href || href.charAt(0) !== "#") return null;
      try {
        return document.querySelector(href);
      } catch (e) {
        return null;
      }
    });

    function setActive(idx) {
      for (var j = 0; j < tocLinks.length; j++) {
        tocLinks[j].classList.toggle("active", j === idx);
      }
    }

    // Document-relative Y of a target. getBoundingClientRect gives the
    // viewport-relative top; adding scrollY converts to document space.
    // Using this instead of `offsetTop` is critical because offsetTop is
    // relative to the nearest positioned ancestor (a Bootstrap card in
    // this case) and would therefore produce bogus scroll positions.
    function docTop(el) {
      if (!el) return 0;
      var rect = el.getBoundingClientRect();
      return rect.top + window.pageYOffset;
    }

    function updateTocActive() {
      // At the very top of the page the user hasn't entered any section
      // yet — don't highlight anything so the sidebar reads as "orient
      // yourself" rather than claiming a false position.
      if (window.scrollY < 50) {
        setActive(-1);
        return;
      }

      var scrollMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

      // Each section's natural activation threshold = (docTop - 120). It
      // becomes active once the user has scrolled past that point. For
      // sections near the page bottom this threshold can exceed scrollMax
      // (the page simply isn't tall enough to put their heading at the
      // top of the viewport). Without correction those sections either
      // never activate, or activate for only a single pixel at the floor
      // — which reads as the sidebar "skipping" over them.
      //
      // Walk the thresholds from the bottom up and clamp any unreachable
      // value down to scrollMax, reserving an exclusive window of 40 px
      // per trailing section so every section is guaranteed its own slice
      // of the final scroll range.
      var minWindow = 40;
      var thresholds = new Array(tocTargets.length);
      for (var i = 0; i < tocTargets.length; i++) {
        var top = docTop(tocTargets[i]);
        thresholds[i] = top > 0 ? top - 120 : -1;
      }
      var reservedBelow = 0;
      for (var j = thresholds.length - 1; j >= 0; j--) {
        if (thresholds[j] < 0) continue;
        var cap = scrollMax - reservedBelow;
        if (thresholds[j] > cap) thresholds[j] = cap;
        reservedBelow += minWindow;
      }

      var currentIdx = -1;
      for (var k = 0; k < thresholds.length; k++) {
        if (thresholds[k] >= 0 && thresholds[k] <= window.scrollY) currentIdx = k;
      }
      setActive(currentIdx);
    }

    // Explicit click-to-scroll. The native anchor jump was being swallowed on
    // the CV page (clicks on Awards/Interests/… did nothing), and the native
    // jump also lands flush with the sticky header. Smooth-scroll to the
    // target with a header offset, update the URL hash, blur the link so
    // its :focus border doesn't linger alongside the real active indicator,
    // and flip the active state immediately for instant feedback.
    tocLinks.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        var target = tocTargets[i];
        if (!target) return;
        e.preventDefault();
        // Use document-space Y via getBoundingClientRect — target.offsetTop
        // is relative to the nearest positioned ancestor (the Bootstrap
        // card wrapping each CV section), which caused clicks to scroll
        // to near the top of the page instead of the actual heading.
        var scrollTarget = Math.max(0, docTop(target) - 100);
        try {
          window.scrollTo({ top: scrollTarget, behavior: "smooth" });
        } catch (err) {
          // Older browsers / Safari fallbacks that don't accept the
          // options-object form.
          window.scrollTo(0, scrollTarget);
        }
        try {
          var href = link.getAttribute("href");
          if (href) history.replaceState(null, "", href);
        } catch (ignored) {
          /* no-op */
        }
        link.blur();
        setActive(i);
      });
    });

    window.addEventListener("scroll", updateTocActive, { passive: true });
    window.addEventListener("resize", updateTocActive);
    // Re-run after `load` as well as the initial tick — on first paint,
    // images/fonts may not have resolved and section offsetTops can read
    // as 0, so without this the sidebar can briefly latch on a wrong
    // section.
    window.addEventListener("load", updateTocActive);
    updateTocActive();
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let theme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });
});
