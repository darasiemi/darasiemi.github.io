// ── /bookshelf/ WebGL rail ────────────────────────────────────────────────
// A single Three.js scene renders the book spines as a curved coverflow rail.
// The focused book comes forward while attention walks across the row.
//
// The DOM-based spine shelf in bookshelf.md is kept as a fallback (shown if
// WebGL is unavailable or `prefers-reduced-motion: reduce` is set). When this
// script mounts successfully it adds `is-webgl-ready` to `.bookshelf-page`,
// which hides the DOM fallback and reveals the canvas.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

(function () {
  const root = document.querySelector(".bookshelf-page");
  if (!root) return;

  const dataNode = document.getElementById("bookshelfData");
  const canvas = document.getElementById("bookshelfCanvas");
  const detail = document.getElementById("bookshelfDetail");
  if (!dataNode || !canvas || !detail) return;

  // The canvas is shown by default. Each branch below that bails flips the
  // page to `.needs-fallback`, which hides the empty canvas and reveals the
  // DOM spine shelf. In the happy path we just leave the default alone.
  function useFallback() {
    root.classList.add("needs-fallback");
  }

  // Respect prefers-reduced-motion by softening the animation rather than
  // bailing out entirely — the autoplay cycle is a gentle focus shift, not
  // the kind of continuous parallax the preference is designed to prevent.
  // When the preference is set we still mount the WebGL but slow the cycle
  // and snap the focus (no lerp), so each book change is a quiet step
  // rather than a sweeping camera motion.
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let books;
  try {
    books = JSON.parse(dataNode.textContent);
  } catch (e) {
    useFallback();
    return;
  }
  if (!books || !books.length) {
    useFallback();
    return;
  }

  // Smoke-test WebGL before building the scene — some mobile browsers report
  // the context lost immediately. On failure we fall back to the DOM shelf.
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") || probe.getContext("webgl");
  if (!gl) {
    useFallback();
    return;
  }

  // ── Scene, camera, renderer ────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  // Keep the whole rail in frame while making narrow spines large enough to read.
  camera.position.set(0, 0, 3.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  function sizeToCanvas() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  sizeToCanvas();

  // Catmull-Rom spline was overkill for the current book count: its X extent
  // put the first and last book outside the camera frustum. Replace with a
  // closed-form flat row + parabolic Z/Y depth. Same visual effect (edges
  // tuck back, center comes forward), far simpler to reason about, and every
  // book is guaranteed to sit inside the view at the default offset.

  // ── Book meshes ────────────────────────────────────────────────────────
  // Each book is a shallow 3D block. Its front face is a deliberately drawn
  // spine, rather than a cropped strip of a front cover: OL cover art has no
  // spine/title information and the crop made the books look incorrect.
  const BOOK_WIDTH = 0.3;
  const BOOK_HEIGHT = 1.65;
  const BOOK_DEPTH = 0.13;
  const geometry = new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH);

  function makeSpineTexture(book) {
    // Draw directly into a tall-narrow canvas and rotate the drawing
    // context 90° so text runs top-to-bottom down the spine (standard
    // American book-spine convention).
    const W = 192;
    const H = 1024;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");

    // Base spine color
    ctx.fillStyle = book.spine_color || "#0a7065";
    ctx.fillRect(0, 0, W, H);

    // Highlight on the "front" edge (left), shadow on the "back" edge (right)
    const edge = ctx.createLinearGradient(0, 0, W, 0);
    edge.addColorStop(0, "rgba(255,255,255,0.22)");
    edge.addColorStop(0.5, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, W, H);

    // Rotate the context so drawing horizontally lays text down the spine.
    // After translate+rotate(+π/2), logical +x points DOWN on the real canvas
    // and logical +y points LEFT. We draw with textBaseline="middle" so text
    // sits centered horizontally on the spine.
    ctx.save();
    ctx.translate(W / 2, 0);
    ctx.rotate(Math.PI / 2);
    ctx.textBaseline = "middle";
    ctx.fillStyle = book.text_color || "#f5f5f5";

    // Reserve roughly 55% of the spine length for the title and ~32% for
    // the author so the two never run into each other on long names.
    const TITLE_AREA = H * 0.55;
    const AUTHOR_AREA = H * 0.32;

    // Title near the top of the spine. Shrink to fit the title budget.
    const titleText = book.title || "";
    let fontSize = 58;
    ctx.font = `700 ${fontSize}px 'Bricolage Grotesque', 'Instrument Sans', sans-serif`;
    while (fontSize > 25 && ctx.measureText(titleText).width > TITLE_AREA) {
      fontSize -= 2;
      ctx.font = `700 ${fontSize}px 'Bricolage Grotesque', sans-serif`;
    }
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 2;
    ctx.fillText(titleText, H * 0.06, 0, TITLE_AREA);
    ctx.shadowBlur = 0;

    // Author near the bottom of the spine. Shrink its font to fit the
    // author budget so long multi-author names (e.g. "Grootendorst &
    // Alammar") don't collide with a long title above.
    const authorText = (book.author || "").toUpperCase();
    let authorSize = 21;
    ctx.font = `600 ${authorSize}px 'Geist Mono', 'SF Mono', monospace`;
    while (authorSize > 13 && ctx.measureText(authorText).width > AUTHOR_AREA) {
      authorSize -= 1;
      ctx.font = `600 ${authorSize}px 'Geist Mono', monospace`;
    }
    ctx.textAlign = "right";
    ctx.globalAlpha = 0.76;
    ctx.fillText(authorText, H - H * 0.06, 0, AUTHOR_AREA);
    ctx.globalAlpha = 1;

    ctx.restore();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeWoodTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    const base = ctx.createLinearGradient(0, 0, 0, c.height);
    base.addColorStop(0, "#aa7953");
    base.addColorStop(0.45, "#875a3c");
    base.addColorStop(1, "#68442f");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, c.width, c.height);
    // Deterministic fine grain keeps the wood warm without competing with
    // the small spine lettering.
    for (let i = 0; i < 52; i++) {
      const y = ((i * 97) % c.height) + 0.5;
      ctx.strokeStyle = i % 4 === 0 ? "rgba(246,211,165,0.11)" : "rgba(44,25,14,0.075)";
      ctx.lineWidth = i % 7 === 0 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(c.width * 0.28, y - 12, c.width * 0.7, y + 10, c.width, y - 3);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const woodTexture = makeWoodTexture();
  const woodMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
  const plainWoodMaterial = new THREE.MeshBasicMaterial({ color: "#825536" });

  // A back panel and thick shelf board give the books a clear place to sit.
  // They stay behind the spines in depth, so they cannot cover the titles.
  const shelfWidth = Math.max(2.75, (books.length - 1) * BOOK_WIDTH + 0.8);
  const backboard = new THREE.Mesh(new THREE.PlaneGeometry(shelfWidth, 2.35), woodMaterial);
  backboard.position.set(0, 0.03, -1.02);
  scene.add(backboard);

  const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth + 0.18, 0.14, 0.58), [
    plainWoodMaterial,
    plainWoodMaterial,
    woodMaterial,
    plainWoodMaterial,
    woodMaterial,
    plainWoodMaterial,
  ]);
  shelfBoard.position.set(0, -0.9, -0.16);
  scene.add(shelfBoard);

  const bookMeshes = books.map((book) => {
    const spineMaterial = new THREE.MeshBasicMaterial({ map: makeSpineTexture(book) });
    const coverMaterial = new THREE.MeshBasicMaterial({ color: book.spine_color || "#0a7065" });
    const pagesMaterial = new THREE.MeshBasicMaterial({ color: "#e9e0cf" });
    const backMaterial = new THREE.MeshBasicMaterial({ color: "#554133" });
    // BoxGeometry groups: +X, -X, +Y, -Y, +Z (spine), -Z (back cover).
    const materials = [pagesMaterial, coverMaterial, pagesMaterial, pagesMaterial, spineMaterial, backMaterial];
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.userData = { book, pullAmount: 0, pullTarget: 0 };
    scene.add(mesh);
    return mesh;
  });

  // ── Flat-row layout with parabolic depth ───────────────────────────────
  // Books are laid out along X with constant spacing. Z depth is a parabola
  // (edges tuck back, center comes forward), and so is Y (slight droop at
  // the ends). Books at the ends also tilt Y-rotation inward so the whole
  // row reads as a shallow curved rail.
  // Books sit edge-to-edge like a real shelf — BOOK_SPACING equals BOOK_WIDTH.
  const BOOK_SPACING = BOOK_WIDTH;

  // Total row width and half-span, derived once from the book count.
  const totalWidth = Math.max(0, (books.length - 1) * BOOK_SPACING);
  const halfSpan = totalWidth / 2 || 1;

  // ── Coverflow focus cycle ──────────────────────────────────────────────
  // Instead of drifting the whole row, we cycle a "focused" index. The
  // focused book comes forward and un-tilts; its neighbours step back with
  // progressively more yaw-tilt the further they sit from focus. This is
  // what gives the shelf its coverflow-style attention sweep.
  // Softer motion when reduced-motion is set: slower cycle, instant focus
  // snap (no camera lerp), and instant pull-out (no spring).
  const AUTO_CYCLE_PERIOD = reducedMotion ? 5000 : 2500; // ms per book
  const FOCUS_LERP = reducedMotion ? 1 : 0.085; // 1 = snap, no interp
  const MAX_YAW = 0.3; // radians at the fully-tilted end
  const MAX_Z_BACK = 0.75;
  const MAX_Y_DROOP = 0;

  let targetFocus = 0;
  let currentFocus = 0;
  let autoCycleEnabled = true;
  let autoCycleDir = 1;
  let autoCycleTimer = 0;
  let hoveredIndex = null;
  let lastFrameTime = performance.now();

  function layoutBooks(delta) {
    // Pull-out animation lerp. On reduced-motion we snap instead of
    // springing so the book just "appears" lifted.
    const pullLerp = reducedMotion ? 1 : 1 - Math.exp(-delta / 180);
    for (let i = 0; i < bookMeshes.length; i++) {
      const mesh = bookMeshes[i];
      const x = -halfSpan + i * BOOK_SPACING;
      // Distance (signed, continuous) from the currently-focused slot.
      const d = i - currentFocus;
      const absD = Math.abs(d);
      // Depth: focused book sits forward; falls off softly.
      const z = -MAX_Z_BACK * Math.pow(Math.min(absD * 0.35, 1), 1.4);
      // Vertical droop: edges sag very slightly.
      const y = -MAX_Y_DROOP * Math.pow(Math.min(absD * 0.3, 1), 2);
      // Yaw: tilt inward toward the focused book.
      const yaw = -Math.sign(d) * Math.min(absD * 0.14, MAX_YAW);
      mesh.userData.pullAmount += (mesh.userData.pullTarget - mesh.userData.pullAmount) * pullLerp;
      const pullAmount = mesh.userData.pullAmount;
      mesh.position.set(x, y + 0.32 * pullAmount, z + 0.65 * pullAmount);
      mesh.rotation.set(0, yaw * (1 - pullAmount), -0.12 * pullAmount);
      mesh.scale.setScalar(1 + 0.1 * pullAmount);
    }
  }

  function advanceFocus() {
    if (books.length < 2) return;
    targetFocus += autoCycleDir;
    if (targetFocus >= books.length - 1) {
      targetFocus = books.length - 1;
      autoCycleDir = -1;
    } else if (targetFocus <= 0) {
      targetFocus = 0;
      autoCycleDir = 1;
    }
  }

  // ── Input: pointer click + hover ───────────────────────────────────────
  // No wheel/drag any more — the whole shelf fits on-screen and auto-cycles.
  // Hovering a spine pauses the cycle and focuses that book; moving away
  // resumes from wherever the cycle currently is (no jump).
  let pointerDownX = 0;
  let pointerDownAt = 0;

  function onPointerDown(e) {
    pointerDownX = e.clientX;
    pointerDownAt = performance.now();
  }
  function onPointerMove(e) {
    if (e.pointerType === "touch") return;
    const idx = pickBookIndex(e);
    if (idx !== null) {
      hoveredIndex = idx;
      targetFocus = idx;
      autoCycleEnabled = false;
      autoCycleTimer = 0;
      canvas.style.cursor = "pointer";
    }
  }
  function onPointerLeave() {
    hoveredIndex = null;
    if (targetFocus <= 0) autoCycleDir = 1;
    else if (targetFocus >= books.length - 1) autoCycleDir = -1;
    autoCycleEnabled = true;
    autoCycleTimer = 0;
    canvas.style.cursor = "default";
  }
  function onPointerUp(e) {
    const dx = e.clientX - pointerDownX;
    const dt = performance.now() - pointerDownAt;
    if (Math.abs(dx) < 6 && dt < 400) {
      handleClick(e);
    }
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function pickBookIndex(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(bookMeshes, false);
    if (!hits.length) return null;
    return bookMeshes.indexOf(hits[0].object);
  }

  function handleClick(e) {
    const idx = pickBookIndex(e);
    if (idx === null) {
      closePulled();
      return;
    }
    pullBook(bookMeshes[idx], idx);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointercancel", () => {
    pointerDownAt = 0;
  });

  // ── Pull-out + detail panel ────────────────────────────────────────────
  let pulledMesh = null;

  function pullBook(mesh, index) {
    if (pulledMesh === mesh) {
      closePulled();
      return;
    }
    if (pulledMesh) pulledMesh.userData.pullTarget = 0;
    pulledMesh = mesh;
    mesh.userData.pullTarget = 1;
    targetFocus = index;
    autoCycleTimer = 0;
    // Deliberately do NOT shift the rail. The clicked book just lifts off
    // the shelf in place; the neighbours stay where they were so the viewer
    // can still see the whole row.
    populateDetail(mesh.userData.book);
  }

  function closePulled() {
    if (!pulledMesh) return;
    pulledMesh.userData.pullTarget = 0;
    pulledMesh = null;
    autoCycleEnabled = hoveredIndex === null;
    autoCycleTimer = 0;
    hideDetail();
  }

  function populateDetail(book) {
    detail.innerHTML = "";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "bookshelf-detail-close";
    close.setAttribute("aria-label", "Close book details");
    close.textContent = "×";
    close.addEventListener("click", () => {
      closePulled();
    });
    detail.appendChild(close);

    // Top row: canonical Open Library cover (preview) + title/author/progress.
    const top = document.createElement("div");
    top.className = "bookshelf-detail-top";

    const cover = document.createElement("div");
    cover.className = "bookshelf-detail-cover";
    cover.style.setProperty("--cover-color", book.spine_color || "#0a7065");
    const previewUrl = book.openlibrary_cover || (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false` : "");
    if (previewUrl) {
      cover.classList.add("is-loading");
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.loading = "eager";
      img.fetchPriority = "high";
      img.referrerPolicy = "no-referrer";
      const useCoverPlaceholder = () => {
        cover.classList.remove("is-loading");
        cover.classList.add("is-fallback");
        img.remove();
      };
      img.onerror = useCoverPlaceholder;
      img.onload = () => {
        if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
          useCoverPlaceholder();
        } else {
          cover.classList.remove("is-loading");
          cover.classList.add("is-loaded");
        }
      };
      img.src = previewUrl;
      cover.appendChild(img);
    } else {
      cover.classList.add("is-fallback");
    }
    const coverTitle = document.createElement("span");
    coverTitle.className = "bookshelf-detail-cover-title";
    coverTitle.textContent = book.title;
    cover.appendChild(coverTitle);
    top.appendChild(cover);

    const body = document.createElement("div");
    body.className = "bookshelf-detail-body";
    const h3 = document.createElement("h3");
    h3.className = "bookshelf-detail-title";
    h3.textContent = book.title;
    body.appendChild(h3);
    const author = document.createElement("p");
    author.className = "bookshelf-detail-author";
    author.textContent = book.author + (book.year ? " · " + book.year : "");
    body.appendChild(author);

    const progressWrap = document.createElement("div");
    progressWrap.className = "bookshelf-detail-progress";
    const bar = document.createElement("div");
    bar.className = "bookshelf-detail-progress-bar";
    const fill = document.createElement("div");
    fill.className = "bookshelf-detail-progress-fill";
    const progress = book.status === "completed" ? 100 : Math.max(0, Math.min(100, Number(book.progress) || 0));
    fill.style.width = progress + "%";
    if (book.status === "completed") fill.classList.add("is-complete");
    bar.appendChild(fill);
    progressWrap.appendChild(bar);
    const label = document.createElement("span");
    label.className = "bookshelf-detail-progress-label";
    label.textContent = book.status === "completed" ? "Completed" : progress + "% in";
    progressWrap.appendChild(label);
    body.appendChild(progressWrap);

    top.appendChild(body);
    detail.appendChild(top);

    // "My copy" row — personal photo of the physical book, below the preview.
    // Only mounted if the YAML has a `cover` entry for this book.
    if (book.cover) {
      const copy = document.createElement("div");
      copy.className = "bookshelf-detail-copy";

      const copyLabel = document.createElement("span");
      copyLabel.className = "bookshelf-detail-copy-label";
      copyLabel.textContent = "My copy";
      copy.appendChild(copyLabel);

      // Skeleton while the photo decodes. The prefetch hints in bookshelf.md
      // mean the request is usually already in cache by the time a book is
      // clicked, but keep the loading state for the slow-network edge case.
      const copyFigure = document.createElement("div");
      copyFigure.className = "bookshelf-detail-copy-figure is-loading";
      copyFigure.style.setProperty("--cover-color", book.spine_color || "#0a7065");
      const copyImg = new Image();
      copyImg.alt = "";
      copyImg.decoding = "async";
      copyImg.loading = "eager";
      copyImg.fetchPriority = "high";
      copyImg.onload = () => {
        copyFigure.classList.remove("is-loading");
        copyFigure.classList.add("is-loaded");
      };
      copyImg.onerror = () => {
        copyFigure.classList.remove("is-loading");
        copyFigure.classList.add("is-fallback");
        copyImg.remove();
      };
      copyImg.src = book.cover;
      copyFigure.appendChild(copyImg);
      copy.appendChild(copyFigure);

      detail.appendChild(copy);
    }

    detail.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        detail.classList.add("is-visible");
      });
    });
    detail.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function hideDetail() {
    detail.classList.remove("is-visible");
    setTimeout(() => {
      if (!pulledMesh) {
        detail.hidden = true;
        detail.innerHTML = "";
      }
    }, 320);
  }

  // Clicking outside the canvas + detail closes the pulled book.
  document.addEventListener("click", (e) => {
    if (!pulledMesh) return;
    if (e.target.closest(".bookshelf-detail")) return;
    if (e.target.closest("canvas#bookshelfCanvas")) return;
    closePulled();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pulledMesh) closePulled();
  });

  // ── Resize ─────────────────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => sizeToCanvas());
  resizeObserver.observe(canvas);

  // ── Frame loop ─────────────────────────────────────────────────────────
  function tick() {
    const now = performance.now();
    const delta = Math.min(now - lastFrameTime, 100);
    lastFrameTime = now;

    if (autoCycleEnabled && hoveredIndex === null && !pulledMesh) {
      autoCycleTimer += delta;
      if (autoCycleTimer >= AUTO_CYCLE_PERIOD) {
        autoCycleTimer -= AUTO_CYCLE_PERIOD;
        advanceFocus();
      }
    }

    currentFocus += (targetFocus - currentFocus) * FOCUS_LERP;
    if (Math.abs(targetFocus - currentFocus) < 0.001) currentFocus = targetFocus;
    layoutBooks(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
