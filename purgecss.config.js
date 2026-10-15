module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  // Leaflet adds the wrapper class from JavaScript. Keep all popup selectors,
  // including dark-theme variants, when purging the generated stylesheet.
  safelist: {
    greedy: [/journey-popup/],
  },
};
