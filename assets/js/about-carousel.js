function initAboutCarousel() {
  const carouselEl = document.getElementById("aboutCarousel");

  if (!carouselEl) return;

  if (typeof bootstrap === "undefined" || !bootstrap.Carousel) {
    setTimeout(initAboutCarousel, 200);
    return;
  }

  bootstrap.Carousel.getOrCreateInstance(carouselEl, {
    interval: 5000,
    ride: "carousel",
    pause: false,
    wrap: true,
  });
}

window.addEventListener("load", initAboutCarousel);
