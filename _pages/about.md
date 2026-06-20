---
layout: about
title: about
permalink: /

profile:
  align: right
  image: dara.png
  image_circular: false # crops the image to make it circular
  more_info: >
    <p>School of Computer Science, University College Dublin</p>
    <p>Belfield</p>
    <p>Dublin, Ireland</p>

news: true # includes a list of news items
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page
---

Hi, welcome to my profile page! You can call me Dara.

I am a Ph.D. Candidate at the University College Dublin, in the School of Computer Science under the [ML-Labs](https://www.ml-labs.ie/), the [Mood and Money Lab](https://moodmoney.ucd.ie/), and the [UCD Centre for Computing and Mental Health](https://ccmh.ucd.ie/wp/). My Ph.D. is also jointly sponsored by [Health Rhythms](https://www.linkedin.com/company/healthrhythms/), a data science and mental health company. I am being supervised by [Mark Matthews](https://people.ucd.ie/mark.matthews).

My research focuses on assessing the mental health of individuals with bipolar disorder using objective financial data, statistical analysis, privacy-preserving machine learning and public engaging participatory studies. My research also cuts across data instrumentation and collection for efficient modelling, and human computer interaction.

I am also an AWS- and Azure-certified data science and machine learning professional with 5+ years of experience across data analytics, data science, and machine learning in healthcare (mental health research), AI and software engineering education, security, telecommunications, power and supply chain industries.

#### Education

• Ph.D. in Machine Learning (in view), University College Dublin

• Master of Science in Engineering Artificial Intelligence (2023), Carnegie Mellon University

• Bachelor of Science in Electrical & Electronic Engineering (2019), University of Ibadan, Nigeria

If you are interested in what I do, and you want to connect, you can reach me via the contacts below.

 <!-- [Linkedin](https://www.linkedin.com/in/oluwadara-adedeji-183770106/) or [Twitter](https://twitter.com/darasiemi). -->
<div id="aboutCarousel" class="carousel slide mb-4 mx-auto">
  <div class="carousel-indicators">
    {% for i in (0..12) %}
      <button
        type="button"
        data-bs-target="#aboutCarousel"
        data-bs-slide-to="{{ i }}"
        {% if i == 0 %}class="active" aria-current="true"{% endif %}
        aria-label="Slide {{ i | plus: 1 }}">
      </button>
    {% endfor %}
  </div>

  <div class="carousel-inner rounded z-depth-1">
    {% for i in (1..13) %}
      <div class="carousel-item {% if i == 1 %}active{% endif %}">
        <img
          src="{{ '/assets/img/about_' | append: i | append: '.jpeg' | relative_url }}"
          class="d-block w-100"
          alt="About photo {{ i }}">
      </div>
    {% endfor %}
  </div>

  <button class="carousel-control-prev" type="button" data-bs-target="#aboutCarousel" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>

  <button class="carousel-control-next" type="button" data-bs-target="#aboutCarousel" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>

<style>
#aboutCarousel {
  max-width: 800px;
  margin: 0 auto;
}

#aboutCarousel .carousel-inner {
  border-radius: 12px;
  overflow: hidden;
}

#aboutCarousel .carousel-item img {
  height: 500px;
  object-fit: cover;
}

#aboutCarousel .carousel-control-prev,
#aboutCarousel .carousel-control-next {
  width: 60px;
  opacity: 1;
}

#aboutCarousel .carousel-control-prev {
  left: 10px;
}

#aboutCarousel .carousel-control-next {
  right: 10px;
}

#aboutCarousel .carousel-control-prev-icon,
#aboutCarousel .carousel-control-next-icon {
  width: 2.5rem;
  height: 2.5rem;
  filter: invert(1) drop-shadow(0 0 4px rgba(0,0,0,0.8));
}

#aboutCarousel .carousel-indicators {
  margin-bottom: 0.5rem;
}

#aboutCarousel .carousel-indicators [data-bs-target] {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin: 0 4px;
}

@media (max-width: 768px) {
  #aboutCarousel {
    max-width: 100%;
  }

  #aboutCarousel .carousel-item img {
    height: 320px;
  }
}
</style>

<script>
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
</script>
