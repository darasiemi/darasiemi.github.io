---
layout: page
permalink: /journey/
title: journey
description: The places that have shaped the work — talks, research, volunteering, and the lives met along the way.
nav: false
map: true
---

<div class="journey-intro">
  <p>
    This map shows places where a piece of my work happened — a workshop presented, a paper written, students taught, or a visit that changed how I think. Select a country on the map or below it to see the events there.
  </p>
</div>

<div class="journey-legend" aria-label="Legend of event types">
  <span class="journey-chip" data-type="research"><i class="fa-solid fa-microscope" aria-hidden="true"></i> Research</span>
  <span class="journey-chip" data-type="talk"><i class="fa-solid fa-microphone" aria-hidden="true"></i> Talks</span>
  <span class="journey-chip" data-type="volunteering"><i class="fa-solid fa-heart" aria-hidden="true"></i> Volunteering</span>
  <span class="journey-chip" data-type="education"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Education</span>
  <span class="journey-chip" data-type="award"><i class="fa-solid fa-trophy" aria-hidden="true"></i> Awards</span>
  <span class="journey-chip" data-type="visit"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Visits</span>
</div>

<div class="journey-map-wrap">
  <div id="journey-map" class="journey-map" role="region" aria-label="Interactive map of visited locations"></div>
  <div class="journey-map-actions">
    <button id="journey-reset" class="journey-reset-control" type="button" hidden>Reset Map</button>
  </div>
</div>

<section id="journey-countries" class="journey-countries" aria-label="Countries visited, grouped by continent"></section>

{% comment %} Pin data lives in \_data/journey.yml, serialized here for the map JS. {% endcomment %}

<script id="journey-data" type="application/json">{{ site.data.journey | jsonify }}</script>

<script>
  function initJourneyMap() {
    if (typeof L === "undefined") {
      // Leaflet is loaded with defer; keep polling until it's on window.
      return setTimeout(initJourneyMap, 50);
    }

    var raw = document.getElementById("journey-data");
    if (!raw) return;
    var data;
    try {
      data = JSON.parse(raw.textContent);
    } catch (e) {
      return;
    }
    if (!data || !data.locations) return;

    var container = document.getElementById("journey-map");
    var resetButton = document.getElementById("journey-reset");
    if (!container || !resetButton) return;

    var EVENT_META = {
      research: { icon: "fa-microscope", label: "Research", phrase: "I researched here" },
      talk: { icon: "fa-microphone", label: "Talk", phrase: "I spoke here" },
      volunteering: { icon: "fa-heart", label: "Volunteering", phrase: "I volunteered here" },
      education: { icon: "fa-graduation-cap", label: "Education", phrase: "I schooled here" },
      visit: { icon: "fa-location-dot", label: "Visit", phrase: "I visited" },
      award: { icon: "fa-trophy", label: "Award", phrase: "I was awarded here" }
    };

    // Country flag + continent for the summary cards below the map.
    // Expand as new countries are added to the journey data.
    var COUNTRY_META = {
      Ireland: { flag: "🇮🇪", continent: "Europe" },
      "United Kingdom": { flag: "🇬🇧", continent: "Europe" },
      Italy: { flag: "🇮🇹", continent: "Europe" },
      Albania: { flag: "🇦🇱", continent: "Europe" },
      Rwanda: { flag: "🇷🇼", continent: "Africa" },
      Nigeria: { flag: "🇳🇬", continent: "Africa" },
      Morocco: { flag: "🇲🇦", continent: "Africa" },
      Kenya: { flag: "🇰🇪", continent: "Africa" }
    };

    // Track the currently selected country layer so we can darken it on click
    // and reset it when another country is picked / popup closes.
    var selectedLayer = null;
    function highlightLayer(layer) {
      if (!layer) return;
      layer.setStyle({ fillOpacity: 0.72, color: "#083e38", weight: 2.2 });
      layer.bringToFront();
    }
    function clearHighlight() {
      if (selectedLayer) {
        selectedLayer.setStyle({ fillColor: "#0a7065", fillOpacity: 0.42, color: "#0a7065", weight: 1.1 });
        selectedLayer = null;
      }
    }
    function selectCountry(layer) {
      if (selectedLayer === layer) return;
      clearHighlight();
      selectedLayer = layer;
      highlightLayer(layer);
    }

    function escapeHtml(s) {
      return String(s || "").replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function assetUrl(path) {
      if (!path) return "";
      if (/^https?:/i.test(path)) return path;
      return "/" + String(path).replace(/^\/+/, "");
    }

    // Group all events by country for the country-fill popup.
    var byCountry = {};
    data.locations.forEach(function (loc) {
      var c = loc.country;
      if (!c) return;
      if (!byCountry[c]) byCountry[c] = { count: 0, cities: [] };
      byCountry[c].count += loc.events.length;
      byCountry[c].cities.push(loc);
    });

    // Summarize events for the country popup.
    function countryEventCounts(info) {
      var counts = {};
      info.cities.forEach(function (loc) {
        loc.events.forEach(function (ev) {
          if (!ev.type) return;
          counts[ev.type] = (counts[ev.type] || 0) + 1;
        });
      });
      return counts;
    }

    var COUNTRY_EVENT_ORDER = ["education", "talk", "research", "volunteering", "award", "visit"];

    // Compact action-phrase summary at the top of each click popup.
    function buildCountrySummary(info) {
      var counts = countryEventCounts(info);
      var rows = COUNTRY_EVENT_ORDER.filter(function (t) { return counts[t]; }).map(function (t) {
        var m = EVENT_META[t];
        var n = counts[t];
        return (
          '<li class="journey-popup-summary-item" data-type="' + t + '">' +
            '<i class="fa-solid ' + m.icon + '" aria-hidden="true"></i>' +
            '<span class="journey-popup-summary-phrase">' + escapeHtml(m.phrase) + "</span>" +
            (n > 1 ? '<span class="journey-popup-summary-count">×' + n + "</span>" : "") +
          "</li>"
        );
      }).join("");
      return rows ? '<ul class="journey-popup-summary">' + rows + "</ul>" : "";
    }

    function eventSortYear(ev) {
      var year = String(ev.year || "");
      if (/present/i.test(year)) return Infinity;
      var years = year.match(/\b(?:19|20)\d{2}\b/g);
      return years ? Math.max.apply(null, years.map(Number)) : -Infinity;
    }

    function sortedCityEvents(loc) {
      return loc.events.map(function (ev, index) {
        return { event: ev, order: index };
      }).sort(function (a, b) {
        var aEducation = a.event.type === "education" || a.event.sort_as_education;
        var bEducation = b.event.type === "education" || b.event.sort_as_education;
        if (aEducation !== bEducation) return aEducation ? -1 : 1;
        var yearDifference = eventSortYear(b.event) - eventSortYear(a.event);
        return yearDifference || a.order - b.order;
      });
    }

    function buildCountryPopup(country, info) {
      var meta = COUNTRY_META[country] || {};
      var cities = info.cities.map(function (l) { return l.name; }).join(" · ");
      var subtitle = (meta.continent ? meta.continent : "") +
        (meta.continent && cities ? " · " : "") + cities;
      var header =
        '<header class="journey-popup-head">' +
          '<div class="journey-popup-head-main">' +
            '<h3 class="journey-popup-title">' + escapeHtml(country) + "</h3>" +
            (subtitle ? '<p class="journey-popup-subtitle">' + escapeHtml(subtitle) + "</p>" : "") +
          "</div>" +
          '<span class="journey-popup-count">' + info.count + " event" + (info.count === 1 ? "" : "s") + "</span>" +
        "</header>";
      var summary = buildCountrySummary(info);

      var cityBlocks = info.cities.map(function (loc) {
        var events = sortedCityEvents(loc).map(function (entry) {
          var ev = entry.event;
          var meta = EVENT_META[ev.type] || { icon: "fa-circle", label: ev.type || "Event" };
          var photo = ev.photo
            ? '<img class="journey-popup-event-photo" data-journey-src="' + escapeHtml(assetUrl(ev.photo)) + '" alt="" loading="lazy">'
            : "";
          var note = ev.note ? '<p class="journey-popup-event-note">' + escapeHtml(ev.note) + "</p>" : "";
          var opening = ev.url
            ? '<a class="journey-popup-event-link" data-journey-href="' + escapeHtml(ev.url) + '">'
            : '<div class="journey-popup-event-content">';
          var closing = ev.url ? "</a>" : "</div>";
          return (
            '<li class="journey-popup-event" data-type="' + escapeHtml(ev.type || "") + '">' +
              opening +
              photo +
              '<div class="journey-popup-event-body">' +
                '<h4 class="journey-popup-event-title">' + escapeHtml(ev.title) + "</h4>" +
                '<p class="journey-popup-event-meta">' +
                  '<span class="journey-popup-event-type"><i class="fa-solid ' + meta.icon + '" aria-hidden="true"></i> ' + escapeHtml(meta.label) + "</span>" +
                  (ev.year ? '<span class="journey-popup-event-year">' + escapeHtml(ev.year) + "</span>" : "") +
                "</p>" +
                note +
              "</div>" +
              closing +
            "</li>"
          );
        }).join("");
        return (
          '<div class="journey-popup-city">' +
            '<h5 class="journey-popup-city-name">' + escapeHtml(loc.name) + "</h5>" +
            '<ol class="journey-popup-events">' + events + "</ol>" +
          "</div>"
        );
      }).join("");

      var popup = document.createElement("div");
      popup.className = "journey-popup";
      popup.innerHTML = header + summary + cityBlocks;
      // Set URL attributes on the DOM so the source link checker does not read
      // JavaScript template expressions as literal file paths.
      Array.prototype.forEach.call(popup.querySelectorAll("[data-journey-src]"), function (img) {
        img.setAttribute("src", img.getAttribute("data-journey-src"));
        img.removeAttribute("data-journey-src");
      });
      Array.prototype.forEach.call(popup.querySelectorAll("[data-journey-href]"), function (link) {
        link.setAttribute("href", link.getAttribute("data-journey-href"));
        link.removeAttribute("data-journey-href");
      });
      return popup;
    }

    // Flat map — no tiles. Country selection zooms in; the reset control
    // returns to this initial world view.
    var WORLD_CENTER = [25, 10];
    var WORLD_ZOOM = 2;
    var map = L.map(container, {
      scrollWheelZoom: false,
      zoomControl: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
      dragging: true,
      worldCopyJump: true,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 6
    }).setView(WORLD_CENTER, WORLD_ZOOM);

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var focusRequest = 0;

    function focusCountry(layer) {
      if (!layer) return;
      var request = ++focusRequest;
      map.closePopup();
      selectCountry(layer);
      resetButton.hidden = false;

      map.once("moveend", function () {
        if (request === focusRequest) layer.openPopup();
      });
      var options = { padding: [50, 50], maxZoom: 6 };
      if (reducedMotion) {
        map.fitBounds(layer.getBounds(), options);
      } else {
        map.flyToBounds(layer.getBounds(), Object.assign(options, { duration: 0.65 }));
      }
    }

    function resetMap() {
      ++focusRequest;
      map.closePopup();
      clearHighlight();
      resetButton.hidden = true;
      if (reducedMotion) {
        map.setView(WORLD_CENTER, WORLD_ZOOM);
      } else {
        map.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: 0.65 });
      }
    }

    resetButton.addEventListener("click", resetMap);

    // Load world countries GeoJSON (Natural Earth 110m via jsDelivr).
    // Lightweight (~250KB), low-res country borders — perfect for a flat
    // schematic world view.
    var GEO_URL = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson";

    function styleFor(name) {
      if (byCountry[name]) {
        return {
          fillColor: "#0a7065",
          fillOpacity: 0.42,
          color: "#0a7065",
          weight: 1.1,
          opacity: 0.9
        };
      }
      return {
        fillColor: "#eef0f2",
        fillOpacity: 1,
        color: "#dadde1",
        weight: 0.6,
        opacity: 1
      };
    }

    // Keep a reference from country name to its Leaflet layer so the
    // "Countries" cards below the map can trigger the same highlight+popup.
    var countryLayers = {};

    fetch(GEO_URL)
      .then(function (r) { return r.json(); })
      .then(function (geo) {
        L.geoJSON(geo, {
          style: function (feature) {
            return styleFor(feature.properties.ADMIN || feature.properties.NAME);
          },
          onEachFeature: function (feature, layer) {
            var name = feature.properties.ADMIN || feature.properties.NAME;
            var info = byCountry[name];
            if (!info) return;
            countryLayers[name] = layer;
            layer.bindPopup(buildCountryPopup(name, info), {
              maxWidth: 420,
              minWidth: 280,
              className: "journey-popup-wrap"
            });
            layer.on("mouseover", function () {
              if (selectedLayer !== layer) layer.setStyle({ fillOpacity: 0.6 });
            });
            layer.on("mouseout", function () {
              if (selectedLayer !== layer) layer.setStyle({ fillOpacity: 0.42 });
            });
            layer.on("click", function () { focusCountry(layer); });
          }
        }).addTo(map);

        // Build the Countries summary now that we have the map's layer refs.
        buildCountriesList();
      })
      .catch(function () {
        /* graceful no-op; map stays empty if the GeoJSON fetch fails. */
      });

    // Clear the darkened "selected" style whenever the popup is dismissed.
    map.on("popupclose", clearHighlight);

    // ── Countries summary cards ────────────────────────────────────────────
    // Return the top-2 badges per country in a fixed priority order
    // (education first, then volunteering, then talk, award, visit).
    // Research is skipped — always implied for PhD-touching countries.
    function uniqueEventTypes(info) {
      var seen = {};
      info.cities.forEach(function (loc) {
        loc.events.forEach(function (ev) {
          if (!ev.type || ev.type === "research") return;
          seen[ev.type] = true;
        });
      });
      var ORDER = ["education", "volunteering", "talk", "award", "visit"];
      return ORDER.filter(function (t) { return seen[t]; }).slice(0, 2);
    }

    function buildCountryCard(country, info) {
      var meta = COUNTRY_META[country] || { flag: "🏳️", continent: "Other" };
      var badges = uniqueEventTypes(info).map(function (t) {
        var m = EVENT_META[t];
        return (
          '<span class="journey-country-badge" data-type="' + t + '" title="' + escapeHtml(m.label) + '">' +
          '<i class="fa-solid ' + m.icon + '" aria-hidden="true"></i>' +
          "</span>"
        );
      }).join("");
      return (
        '<button type="button" class="journey-country-card" data-country="' + escapeHtml(country) + '">' +
          '<span class="journey-country-flag" aria-hidden="true">' + meta.flag + "</span>" +
          '<span class="journey-country-name">' + escapeHtml(country) + "</span>" +
          '<span class="journey-country-badges">' + badges + "</span>" +
        "</button>"
      );
    }

    function buildCountriesList() {
      var mount = document.getElementById("journey-countries");
      if (!mount) return;

      // Group visited countries by continent, keeping stable continent order.
      var CONTINENT_ORDER = ["Europe", "Africa", "North America", "South America", "Asia", "Oceania", "Other"];
      var grouped = {};
      Object.keys(byCountry).forEach(function (c) {
        var cont = (COUNTRY_META[c] || {}).continent || "Other";
        if (!grouped[cont]) grouped[cont] = [];
        grouped[cont].push(c);
      });

      var totalCountries = Object.keys(byCountry).length;
      var html =
        '<header class="journey-countries-head">' +
          '<h2 class="journey-countries-title">Countries <span class="journey-countries-count">' + totalCountries + "</span></h2>" +
          '<p class="journey-countries-note">Select a flag to find it on the map</p>' +
        "</header>";

      CONTINENT_ORDER.forEach(function (cont) {
        var countries = grouped[cont];
        if (!countries || !countries.length) return;
        countries.sort();
        html +=
          '<div class="journey-countries-group">' +
            '<h3 class="journey-countries-group-title">' + escapeHtml(cont) + ' <span>' + countries.length + "</span></h3>" +
            '<div class="journey-countries-grid">' +
              countries.map(function (c) { return buildCountryCard(c, byCountry[c]); }).join("") +
            "</div>" +
          "</div>";
      });

      mount.innerHTML = html;

      // Clicking a card highlights the matching country on the map and
      // opens its popup. Also scroll the map into view so the popup is seen.
      mount.addEventListener("click", function (e) {
        var card = e.target.closest ? e.target.closest(".journey-country-card") : null;
        if (!card) return;
        var name = card.getAttribute("data-country");
        var layer = countryLayers[name];
        if (!layer) return;
        container.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
        focusCountry(layer);
      });
    }

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJourneyMap);
  } else {
    initJourneyMap();
  }
</script>
