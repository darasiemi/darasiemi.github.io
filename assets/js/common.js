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

    function updateTocActive() {
      var y = window.scrollY + 120; // small offset so headings activate as they near the top
      var currentIdx = -1;
      for (var i = 0; i < tocTargets.length; i++) {
        var el = tocTargets[i];
        if (el && el.offsetTop <= y) currentIdx = i;
      }
      for (var j = 0; j < tocLinks.length; j++) {
        tocLinks[j].classList.toggle("active", j === currentIdx);
      }
    }

    window.addEventListener("scroll", updateTocActive, { passive: true });
    window.addEventListener("resize", updateTocActive);
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
