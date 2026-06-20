function initAboutCarousel() {
  const carouselEl = document.getElementById("aboutCarousel");

  if (!carouselEl) return;

  if (typeof bootstrap === "undefined" || !bootstrap.Carousel) {
    // Bootstrap not ready yet, try again shortly
    setTimeout(initAboutCarousel, 200);
    return;
  }

  const carousel = new bootstrap.Carousel(carouselEl, {
    interval: 5000,
    ride: "carousel",
    pause: false,
    wrap: true,
  });

  setInterval(function () {
    carousel.next();
  }, 5000);
}

window.addEventListener("load", initAboutCarousel);
