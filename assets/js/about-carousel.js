document.addEventListener("DOMContentLoaded", function () {
  const carouselEl = document.getElementById("aboutCarousel");

  if (!carouselEl || typeof bootstrap === "undefined") return;

  const carousel = new bootstrap.Carousel(carouselEl, {
    interval: 5000,
    ride: "carousel",
    pause: false,
    wrap: true,
  });

  // Belt-and-braces: force advance every 5 seconds in case
  // the built-in interval doesn't kick in for any reason.
  setInterval(function () {
    carousel.next();
  }, 5000);
});
