$(document).ready(function () {
  $("#aboutCarousel").carousel({
    interval: 5000,
    pause: false,
    wrap: true,
  });

  $("#aboutCarousel").carousel("cycle");
});
