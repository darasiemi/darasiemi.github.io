---
layout: about
title: about
permalink: /

profile:
  align: right
  image: dara.png
  image_circular: false
  more_info: >
    <p>School of Computer Science</p>
    <p>University College Dublin</p>
    <p>Dublin, Ireland</p>

news: true
selected_papers: true
social: true
images:
  slider: true
gsap: true
---

<div class="bio-container">
  <!-- ── Terminal window ──────────────────────────────────────────────── -->
  <div class="terminal" id="bioTerminal" role="region" aria-label="Interactive terminal introduction">
    <div class="terminal-chrome">
      <span class="terminal-dot terminal-dot--close"></span>
      <span class="terminal-dot terminal-dot--min"></span>
      <span class="terminal-dot terminal-dot--max"></span>
      <span class="terminal-title">dara@darasi.me — zsh</span>
    </div>

    <div class="terminal-body" id="terminalBody">
      <!-- Lines injected by JS. Script source lives in data attributes. -->
    </div>

    <button type="button" class="terminal-skip" id="terminalSkip" aria-label="Skip terminal animation">
      skip ⏭
    </button>

  </div>

  <!-- Script that drives the terminal, encoded in data attributes to keep JS dumb -->
  <script type="application/json" id="terminalScript">
    [
      { "type": "prompt", "cmd": "whoami" },
      { "type": "output", "text": "oluwadara adedeji — phd researcher, ai engineer, community builder" },
      { "type": "prompt", "cmd": "cat ./role.yaml" },
      { "type": "output-key", "key": "research:", "value": "mental health × ai × finance @ ucd" },
      { "type": "output-key", "key": "engineering:", "value": "aws + azure certified · 5+ yrs ml" },
      { "type": "output-key", "key": "community:", "value": "1,500+ youth impacted across 3 countries" },
      { "type": "output-key", "key": "writing:", "value": "notes on ml, mental health, and the phd life" },
      { "type": "prompt", "cmd": "ls ./pages" },
      { "type": "output-ls", "items": ["research/", "cv/", "blog/", "community/", "teaching/"] },
      { "type": "prompt-live", "cmd": "scroll ↓ for the full story" }
    ]
  </script>

  <!-- ── Full bio (hidden until terminal finishes, then fades in) ────── -->
  <div class="bio-full" id="bioFull" markdown="1">

Hi, welcome to my profile page! You can call me Dara.

I am a fourth-year Ph.D. Candidate at the University College Dublin, in the School of Computer Science under the [ML-Labs](https://www.ml-labs.ie/), the [Mood and Money Lab](https://moodmoney.ucd.ie/), and the [UCD Centre for Computing and Mental Health](https://ccmh.ucd.ie/wp/). My Ph.D. is also jointly sponsored by [Health Rhythms](https://www.linkedin.com/company/healthrhythms/), a data science and mental health company. I am being supervised by [Assistant Professor Mark Matthews](https://people.ucd.ie/mark.matthews).

My research focuses on assessing the mental health of individuals with bipolar disorder using objective financial data, statistical analysis, privacy-preserving machine learning and public engaging participatory studies. My research also cuts across data instrumentation and collection for efficient modelling, and human computer interaction.

I am also an AWS- and Azure-certified data science and machine learning professional with 5+ years of experience across data analytics, data science, and machine learning in healthcare (mental health research), AI and software engineering education, security, telecommunications, power and supply chain industries.

#### Education

- Ph.D. in Machine Learning (2027), University College Dublin
- Master of Science in Engineering Artificial Intelligence (2023), Carnegie Mellon University
- Bachelor of Science in Electrical &amp; Electronic Engineering (2019), University of Ibadan, Nigeria

^

</div>
</div>

{% assign carousel_images = "about_x1.jpeg,dara5.jpeg,about_1.jpeg,about_2.jpeg,about_3.jpeg,about_4.jpeg,about_5.jpeg,about_6.jpeg,about_7.jpeg,about_8.jpeg,about_9.jpeg,about_10.jpeg,about_11.jpeg,about_12.jpeg,about_13.jpeg,about_14.jpeg,about_101.jpg,about_102.jpg,about_103.jpg,about_104.jpg,aware_volunteering.JPG,about_105.jpeg" | split: "," %}

{% assign carousel_captions = "Computational Methods for Mental Health and Wellbeing Workshop Presentation at CIBB, Rome, Italy (2026)|Participating at the Tech Ireland Hackathon (2026)|My First PhD Poster at the UCD PhD/MSc by Research Poster Presentation (2024)|MSc Graduation, Carnegie Mellon University (2023)|ML-Labs Summer School Social Activity (2023)|Dublin Tech Summit (2024)|President's Office, University College Cork (2024)|CMU Social Feature for the Highest-Ranked Rwandan Team at Umoja Hack (2022)|Huawei Tech Arena Award Presentation (2025)|Huawei Tech Arena Award Plaque (2025)|ML-Labs Summer School (2026)|George Boole Statue, University College Cork (2024)|CMU-Africa Social Event (2022)|Visit to Zipline Rwanda (2022)|IBM Research AI Workshop (2024)|UCC AI Quest Award Presentation (2024)|Etisalat Merit Award Presentation (2015)|Etisalat Merit Award Presentation (2016)|Winner, Etisalat Innovation Moment for Etisalat Merit Awardees (2016)|RISE Initiative Leadership Bootcamp (2019)|Aware Volunteer Training Weekend (2026)|At the Colosseum, Rome, Italy (2026)" | split: "|" %}

<div class="gallery-section" id="gallery">
  <swiper-container
    class="photo-swiper"
    effect="coverflow"
    grab-cursor="true"
    centered-slides="true"
    slides-per-view="auto"
    slide-to-clicked-slide="true"
    simulate-touch="true"
    allow-touch-move="true"
    short-swipes="true"
    long-swipes="true"
    long-swipes-ratio="0.3"
    touch-ratio="1"
    touch-angle="45"
    threshold="3"
    resistance="true"
    resistance-ratio="0.65"
    coverflow-effect-rotate="25"
    coverflow-effect-stretch="0"
    coverflow-effect-depth="120"
    coverflow-effect-modifier="1"
    coverflow-effect-slide-shadows="true"
    pagination="true"
    pagination-clickable="true"
    loop="true"
    loop-additional-slides="3"
    loop-prevents-sliding="false"
    rewind="false"
    watch-slides-progress="true"
    autoplay-delay="4000"
    autoplay-disable-on-interaction="false"
    autoplay-pause-on-mouse-enter="true"
    speed="900"
    keyboard-enabled="true"
    a11y-prev-slide-message="Previous slide"
    a11y-next-slide-message="Next slide"
  >
    {% for img in carousel_images %}
      <swiper-slide data-photo="{{ img }}" data-photo-index="{{ forloop.index0 }}">
        <div class="swiper-photo-slide{% if img == 'about_5.jpeg' or img == 'about_10.jpeg' or img == 'about_13.jpeg' %} swiper-photo-slide--lower-focus{% endif %}">
          <img
            src="{{ '/assets/img/' | append: img | relative_url }}"
            alt="{{ carousel_captions[forloop.index0] }}"
            loading="{% if forloop.first %}eager{% else %}lazy{% endif %}"
            draggable="false"
          />
          <div class="swiper-slide-caption">{{ carousel_captions[forloop.index0] }}</div>
        </div>
      </swiper-slide>
    {% endfor %}
  </swiper-container>

  <p class="gallery-journey-link">
    See where these moments happened —
    <a href="{{ '/journey/' | relative_url }}">on the map <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
  </p>
</div>

<script>
  /* ── Force mouse-drag on the photo coverflow (desktop) ──
     Swiper's web-component reads simulate-touch="true" from attributes, but on
     some builds the live Swiper instance ends up with mouse-drag disabled.
     We wait for the instance to mount, then explicitly enable the three
     touch-related params and call update() so Swiper rebinds its pointer
     listeners. On mobile this is a no-op since touch already works. */
  (function () {
    var el = document.querySelector("swiper-container.photo-swiper");
    if (!el) return;
    var requestedPhoto = new URLSearchParams(window.location.search).get("photo");
    var tries = 0;
    function enableMouseDrag() {
      if (el.swiper) {
        try {
          el.swiper.params.simulateTouch = true;
          el.swiper.params.allowTouchMove = true;
          el.swiper.params.grabCursor = true;
          el.swiper.allowTouchMove = true;
          el.swiper.update();
          /* Re-detach + re-attach events so the new params take effect. */
          if (typeof el.swiper.detachEvents === "function" && typeof el.swiper.attachEvents === "function") {
            el.swiper.detachEvents();
            el.swiper.attachEvents();
          }
          if (requestedPhoto && typeof el.swiper.slideToLoop === "function") {
            var target = el.querySelector('swiper-slide[data-photo="' + requestedPhoto.replace(/[^a-zA-Z0-9_.-]/g, "") + '"]');
            if (target) {
              el.swiper.slideToLoop(Number(target.getAttribute("data-photo-index")), 0);
              document.getElementById("gallery").scrollIntoView({ block: "start" });
            }
          }
        } catch (e) {
          /* no-op */
        }
        return;
      }
      if (tries++ < 80) requestAnimationFrame(enableMouseDrag);
    }
    enableMouseDrag();
  })();
</script>
