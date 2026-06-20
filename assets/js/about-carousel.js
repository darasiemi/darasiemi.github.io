document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.getElementById("aboutCarousel");

  if (!carousel) return;

  setInterval(function () {
    const nextButton = carousel.querySelector(".carousel-control-next");

    if (nextButton) {
      nextButton.click();
    }
  }, 5000);
});
