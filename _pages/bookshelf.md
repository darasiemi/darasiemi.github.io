---
layout: page
title: bookshelf
permalink: /bookshelf/
nav: false
description: A selection of books I’ve read and am currently reading.
---

<div class="bookshelf-page" data-bookshelf>
  <!--
    WebGL rail — mounted by assets/js/bookshelf.js on top of the fallback.
    Visibility is driven by `.bookshelf-page.is-webgl-ready`, which the script
    adds only after it successfully gets a WebGL context. Without it (or when
    prefers-reduced-motion is set, or on older browsers) the DOM shelf below
    stays visible.
  -->
  <div class="bookshelf-stage" aria-hidden="true">
    <canvas id="bookshelfCanvas" class="bookshelf-canvas"></canvas>
    <div class="bookshelf-stage-hint">
      <span>Hover to focus</span>
      <span class="bookshelf-stage-hint-dot" aria-hidden="true"></span>
      <span>Click for details</span>
    </div>
  </div>

  <!-- Book data serialized for the WebGL module. -->

{% capture books_json %}[
{% assign currently_reading = site.data.books.currently_reading | default: empty %}
{% assign completed = site.data.books.completed | default: empty %}
{% for book in currently_reading %}
{
"title": {{ book.title | jsonify }},
"author": {{ book.author | jsonify }},
"isbn": {{ book.isbn | default: '' | jsonify }},
"cover": {% if book.cover and book.cover != '' %}{{ book.cover | relative_url | jsonify }}{% else %}""{% endif %},
"spine_color": {{ book.spine_color | default: '#0a7065' | jsonify }},
"text_color": {{ book.text_color | default: '#f3f4f6' | jsonify }},
"progress": {{ book.progress | default: 0 }},
"year": {{ book.year | default: '' | jsonify }},
"status": "reading"
}{% unless forloop.last and completed.size == 0 %},{% endunless %}
{% endfor %}
{% for book in completed %}
{
"title": {{ book.title | jsonify }},
"author": {{ book.author | jsonify }},
"isbn": {{ book.isbn | default: '' | jsonify }},
"cover": {% if book.cover and book.cover != '' %}{{ book.cover | relative_url | jsonify }}{% else %}""{% endif %},
"spine_color": {{ book.spine_color | default: '#0a7065' | jsonify }},
"text_color": {{ book.text_color | default: '#f3f4f6' | jsonify }},
"progress": 100,
"year": {{ book.year | default: '' | jsonify }},
"status": "completed"
}{% unless forloop.last %},{% endunless %}
{% endfor %}
]{% endcapture %}

  <script id="bookshelfData" type="application/json">{{ books_json | strip_newlines }}</script>

  <!-- ─────────────── DOM fallback (visible until .is-webgl-ready) ─────────────── -->
  <div class="bookshelf-fallback">
    {% if site.data.books.currently_reading and site.data.books.currently_reading.size > 0 %}
      <section class="bookshelf-section">
        <h2 class="bookshelf-section-title">Currently reading</h2>
        <div class="bookshelf">
          <div class="bookshelf-rail" role="list">
            {% for book in site.data.books.currently_reading %}
              <button
                type="button"
                class="book"
                role="listitem"
                data-title="{{ book.title | escape }}"
                data-author="{{ book.author | escape }}"
                data-cover="{% if book.cover %}{{ book.cover | relative_url }}{% endif %}"
                data-preview-cover="{% if book.isbn %}https://covers.openlibrary.org/b/isbn/{{ book.isbn }}-L.jpg?default=false{% endif %}"
                data-year="{{ book.year }}"
                data-progress="{{ book.progress | default: 0 }}"
                data-status="reading"
                style="--title-length: {{ book.title | size }}; --spine-color: {{ book.spine_color }}; --spine-text: {{ book.text_color | default: '#f3f4f6' }};"
                aria-label="{{ book.title | escape }} by {{ book.author | escape }}, {{ book.progress | default: 0 }}% read"
              >
                <span class="book-spine">
                  <span class="book-spine-title">{{ book.title }}</span>
                  <span class="book-spine-author">{{ book.author }}</span>
                </span>
              </button>
            {% endfor %}
          </div>
          <div class="bookshelf-plank" aria-hidden="true"></div>
        </div>
      </section>
    {% endif %}

    {% if site.data.books.completed and site.data.books.completed.size > 0 %}
      <section class="bookshelf-section">
        <h2 class="bookshelf-section-title">Read</h2>
        <div class="bookshelf">
          <div class="bookshelf-rail" role="list">
            {% for book in site.data.books.completed %}
              <button
                type="button"
                class="book"
                role="listitem"
                data-title="{{ book.title | escape }}"
                data-author="{{ book.author | escape }}"
                data-cover="{% if book.cover %}{{ book.cover | relative_url }}{% endif %}"
                data-preview-cover="{% if book.isbn %}https://covers.openlibrary.org/b/isbn/{{ book.isbn }}-L.jpg?default=false{% endif %}"
                data-year="{{ book.year }}"
                data-progress="100"
                data-status="completed"
                style="--title-length: {{ book.title | size }}; --spine-color: {{ book.spine_color }}; --spine-text: {{ book.text_color | default: '#f3f4f6' }};"
                aria-label="{{ book.title | escape }} by {{ book.author | escape }}, completed"
              >
                <span class="book-spine">
                  <span class="book-spine-title">{{ book.title }}</span>
                  <span class="book-spine-author">{{ book.author }}</span>
                </span>
              </button>
            {% endfor %}
          </div>
          <div class="bookshelf-plank" aria-hidden="true"></div>
        </div>
      </section>
    {% endif %}

  </div>

  <!-- Shared detail panel. Both WebGL and DOM-fallback paths populate this. -->
  <aside class="bookshelf-detail" id="bookshelfDetail" hidden aria-live="polite"></aside>
</div>

<script type="module" src="{{ '/assets/js/bookshelf.js' | relative_url | bust_file_cache }}"></script>

<script>
  // DOM-fallback interactivity — identical pull-out/panel logic as the WebGL
  // scene but driven by button clicks. Runs on every load; the WebGL script
  // uses CSS to hide the fallback books, so these handlers only fire when
  // WebGL is unavailable.
  (function () {
    var page = document.querySelector(".bookshelf-page");
    if (!page) return;
    var detail = page.querySelector(".bookshelf-detail");
    var currentlyPulled = null;

    function closeBook() {
      if (currentlyPulled) {
        currentlyPulled.classList.remove("is-pulled");
        currentlyPulled.setAttribute("aria-expanded", "false");
        currentlyPulled = null;
      }
      detail.classList.remove("is-visible");
      setTimeout(function () {
        if (!currentlyPulled) {
          detail.hidden = true;
          detail.innerHTML = "";
        }
      }, 320);
    }

    function makeEl(tag, className, text) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (text != null) el.textContent = text;
      return el;
    }

    function populateDetail(book) {
      var title = book.getAttribute("data-title") || "";
      var author = book.getAttribute("data-author") || "";
      var cover = book.getAttribute("data-cover") || "";
      var previewCover = book.getAttribute("data-preview-cover") || "";
      var year = book.getAttribute("data-year") || "";
      var progress = Math.max(0, Math.min(100, Number(book.getAttribute("data-progress") || 0)));
      var status = book.getAttribute("data-status") || "reading";
      var spineColor = book.style.getPropertyValue("--spine-color") || "#0a7065";

      detail.innerHTML = "";

      var closeBtn = makeEl("button", "bookshelf-detail-close");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close book details");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", closeBook);
      detail.appendChild(closeBtn);

      var top = makeEl("div", "bookshelf-detail-top");

      var coverEl = makeEl("div", "bookshelf-detail-cover");
      coverEl.style.setProperty("--cover-color", spineColor);
      if (previewCover) {
        var img = new Image();
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        function useCoverPlaceholder() {
          coverEl.classList.add("is-fallback");
          img.remove();
        }
        img.onerror = useCoverPlaceholder;
        img.onload = function () {
          if (img.naturalWidth <= 1 || img.naturalHeight <= 1) useCoverPlaceholder();
        };
        img.src = previewCover;
        coverEl.appendChild(img);
      } else {
        coverEl.classList.add("is-fallback");
      }
      coverEl.appendChild(makeEl("span", "bookshelf-detail-cover-title", title));
      top.appendChild(coverEl);

      var body = makeEl("div", "bookshelf-detail-body");
      body.appendChild(makeEl("h3", "bookshelf-detail-title", title));
      body.appendChild(makeEl("p", "bookshelf-detail-author", author + (year ? " · " + year : "")));

      var progressWrap = makeEl("div", "bookshelf-detail-progress");
      var bar = makeEl("div", "bookshelf-detail-progress-bar");
      var fill = makeEl("div", "bookshelf-detail-progress-fill");
      fill.style.width = progress + "%";
      if (status === "completed") fill.classList.add("is-complete");
      bar.appendChild(fill);
      progressWrap.appendChild(bar);
      progressWrap.appendChild(
        makeEl(
          "span",
          "bookshelf-detail-progress-label",
          status === "completed" ? "Completed" : progress + "% in"
        )
      );
      body.appendChild(progressWrap);

      top.appendChild(body);
      detail.appendChild(top);

      if (cover) {
        var copyEl = makeEl("div", "bookshelf-detail-copy");
        copyEl.appendChild(makeEl("span", "bookshelf-detail-copy-label", "My copy"));
        var figure = makeEl("div", "bookshelf-detail-copy-figure");
        var copyImg = new Image();
        copyImg.alt = "";
        copyImg.decoding = "async";
        copyImg.loading = "lazy";
        copyImg.onerror = function () {
          copyImg.remove();
        };
        copyImg.src = cover;
        figure.appendChild(copyImg);
        copyEl.appendChild(figure);
        detail.appendChild(copyEl);
      }
    }

    function pullBook(book) {
      if (currentlyPulled === book) {
        closeBook();
        return;
      }
      if (currentlyPulled) {
        currentlyPulled.classList.remove("is-pulled");
        currentlyPulled.setAttribute("aria-expanded", "false");
      }
      book.classList.add("is-pulled");
      book.setAttribute("aria-expanded", "true");
      currentlyPulled = book;

      populateDetail(book);
      detail.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          detail.classList.add("is-visible");
        });
      });
      detail.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    page.addEventListener("click", function (e) {
      var book = e.target.closest(".book");
      if (book) {
        pullBook(book);
        return;
      }
      if (currentlyPulled && !e.target.closest(".bookshelf-detail")) {
        closeBook();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && currentlyPulled) closeBook();
    });
  })();
</script>
