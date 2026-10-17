module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // Keep JavaScript-added journey popups and About reveal states in deployed CSS.
  safelist: {
    greedy: [
      /journey-popup/,
      /about-(intro|scroll)-reveal/,
      /about-staged/,
      /terminal-done/,
      /is-pulsing/,
      /blog-(header|title|title-ink|title-pen)/,
      /bookshelf-(detail|stage|canvas|fallback)/,
      /bookshelf-detail-(top|copy|copy-label|copy-figure)/,
      /is-(pulled|visible|fallback|complete|loading|loaded)/,
      /needs-fallback/,
    ],
  },
};
