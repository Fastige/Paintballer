(function () {
  /** Official structure color — must match baked-in map art for detection */
  const VISION_LINE_COLOR = "#ff4fc8";
  const VISION_LINE_STEP = 5;

  const STRUCTURE_GREEN = "#00ff9d";
  const STRUCTURE_RGB = { r: 0, g: 255, b: 157 };
  const STRUCTURE_DETECT_TOLERANCE = 48;
  const STRUCTURE_MIN_PIXELS = 30;

  const TEAM_A = "#ff5c00";
  const TEAM_B = "#3b9eff";
  const PLAYERS_PER_TEAM = 5;
  const IS_COARSE = window.matchMedia("(pointer: coarse)").matches;

  const body = document.body;
  const stage = document.getElementById("fm-stage");
  const stageWrap = document.getElementById("fm-stage-wrap");
  const image = document.getElementById("fm-image");
  const structureCanvas = document.getElementById("fm-structure-canvas");
  const canvas = document.getElementById("fm-canvas");
  const visionCanvas = document.getElementById("fm-vision-canvas");
  const playersLayer = document.getElementById("fm-players");
  const mapUpload = document.getElementById("map-upload");
  const uploadPromptLabel = document.getElementById("fm-upload-prompt");
  const mapUploadPromptInput = document.getElementById("map-upload-prompt");
  const mapUploadMobile = document.getElementById("map-upload-mobile");
  const clearMapBtn = document.getElementById("clear-map");
  const clearDrawingsBtn = document.getElementById("clear-drawings");
  const undoStructureBtn = document.getElementById("undo-structure");
  const resetPlayersBtn = document.getElementById("reset-players");
  const resetPlayersMobile = document.getElementById("reset-players-mobile");
  const brushSizeInput = document.getElementById("brush-size");
  const brushColorInput = document.getElementById("brush-color");
  const structurePanel = document.getElementById("fm-structure-panel");
  const brushPanel = document.getElementById("fm-brush-panel");
  const toolBtns = document.querySelectorAll(".fm-tool-btn[data-tool]");
  const mobileToolBtns = document.querySelectorAll(".fm-mobile-btn[data-tool]");
  const shapeBtns = document.querySelectorAll(".fm-shape-btn[data-shape]");
  const toggleToolsBtn = document.getElementById("toggle-tools");
  const sidebar = document.getElementById("fm-sidebar");
  const workspace = document.getElementById("fm-workspace");
  const sizerPanel = document.getElementById("fm-sizer-panel");
  const sizerEmpty = document.getElementById("fm-sizer-empty");
  const sizerControls = document.getElementById("fm-sizer-controls");
  const sizerTypeLabel = document.getElementById("fm-sizer-type");
  const sizerWidth = document.getElementById("sizer-width");
  const sizerWidthNum = document.getElementById("sizer-width-num");
  const sizerHeight = document.getElementById("sizer-height");
  const sizerHeightNum = document.getElementById("sizer-height-num");
  const hint = document.getElementById("fm-hint");
  const mobileTip = document.getElementById("fm-mobile-tip");
  const intelSection = document.getElementById("fm-intel-section");
  const intelEmpty = document.getElementById("fm-intel-empty");
  const intelForm = document.getElementById("fm-intel-form");
  const intelPrompt = document.getElementById("fm-intel-prompt");
  const intelMeta = document.getElementById("fm-intel-meta");
  const intelName = document.getElementById("intel-name");
  const intelBio = document.getElementById("intel-bio");
  const intelList = document.getElementById("fm-intel-list");
  const openFullIntelBtn = document.getElementById("open-full-intel-report");
  const intelModal = document.getElementById("fm-intel-modal");
  const intelModalBackdrop = document.getElementById("fm-intel-modal-backdrop");
  const closeIntelModalBtn = document.getElementById("close-intel-modal");
  const intelModalForm = document.getElementById("fm-intel-modal-form");
  const intelReportName = document.getElementById("intel-report-name");
  const intelReportBio = document.getElementById("intel-report-bio");
  const intelModalList = document.getElementById("fm-intel-modal-list");
  const intelModalEmpty = document.getElementById("fm-intel-modal-empty");
  const intelModalTitle = document.getElementById("fm-intel-modal-title");

  const SIZER_MIN_PCT = 0.5;
  const SIZER_MAX_PCT = 80;
  const SIZER_MOVE_STEP = 0.75;

  if (!stage || !canvas || !structureCanvas || !visionCanvas) return;

  const ctx = canvas.getContext("2d");
  const structCtx = structureCanvas.getContext("2d");
  const visionCtx = visionCanvas.getContext("2d");

  let activeTool = "select";
  let uiTool = "select";
  let activeShape = "rectangle";
  let isDrawing = false;
  let isPlacingStructure = false;
  let placeStart = null;
  let placePreview = null;
  let hasMap = false;
  let draggedPlayer = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  /** @type {Array<{id:string,type:string,x1:number,y1:number,x2:number,y2:number,detected?:boolean,name?:string,bio?:string}>} */
  let structures = [];
  let selectedStructureId = null;
  let visionPlayerEl = null;
  let sizerSyncing = false;
  /** @type {{data:Uint8ClampedArray,w:number,h:number}|null} */
  let mapPixelCache = null;
  /** @type {{x:number,y:number,pid:number,handled:boolean}|null} */
  let structurePointer = null;
  let fieldIntelReport = { name: "", bio: "" };
  let intelModalOpen = false;

  if (IS_COARSE && brushSizeInput) {
    brushSizeInput.value = "12";
  }

  const defaultPositions = {
    a: [
      { x: 10, y: 38 },
      { x: 10, y: 44 },
      { x: 10, y: 50 },
      { x: 10, y: 56 },
      { x: 10, y: 62 },
    ],
    b: [
      { x: 90, y: 38 },
      { x: 90, y: 44 },
      { x: 90, y: 50 },
      { x: 90, y: 56 },
      { x: 90, y: 62 },
    ],
  };

  document.documentElement.style.setProperty("--team-a", TEAM_A);
  document.documentElement.style.setProperty("--team-b", TEAM_B);
  document.documentElement.style.setProperty("--structure-green", STRUCTURE_GREEN);

  window.PaintballerStructures = {
    COLOR: STRUCTURE_GREEN,
    RGB: STRUCTURE_RGB,
    getAll: () => structures.map((s) => ({ ...s })),
    isStructureColor: matchesStructureColor,
  };

  window.PaintballerIntelReport = {
    getReport: () => ({ ...fieldIntelReport }),
    getStructures: () =>
      structures.map((s) => ({
        id: s.id,
        type: s.type,
        name: s.name || "",
        bio: s.bio || "",
        detected: Boolean(s.detected),
      })),
  };

  function matchesStructureColor(r, g, b, a) {
    if (a < 80) return false;
    const dr = Math.abs(r - STRUCTURE_RGB.r);
    const dg = Math.abs(g - STRUCTURE_RGB.g);
    const db = Math.abs(b - STRUCTURE_RGB.b);
    return dr + dg + db <= STRUCTURE_DETECT_TOLERANCE;
  }

  function setInteractionLock(on) {
    body.classList.toggle("fm-drawing", on);
  }

  function setPlacingLock(on) {
    body.classList.toggle("fm-placing", on);
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function scrollMobilePanel(el) {
    if (!isMobileLayout() || !el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function updateMobileTip(tool) {
    if (!mobileTip) return;
    if (!isMobileLayout()) {
      mobileTip.textContent = "";
      return;
    }
    if (!hasMap) {
      mobileTip.textContent = "Tap Upload to add your field map.";
      return;
    }
    const tips = {
      select: "Move — drag players. Tap green bunkers for Intel.",
      brush: "Brush — draw on the map. Use Move or Intel to tag bunkers.",
      structure: "Struct — drag to place. Tap existing bunkers for Intel.",
      vision: "Vision — tap a player for lines (stay on when you switch tools).",
      sizer: "Sizer — tap a bunker, then resize or use arrows.",
      intel: "Intel — tap a green bunker, then name it below.",
    };
    mobileTip.innerHTML = tips[tool] || tips.select;
  }

  function updateControlStates() {
    const hasStructures = structures.length > 0;
    if (resetPlayersMobile) resetPlayersMobile.disabled = !hasMap;
    if (resetPlayersBtn) resetPlayersBtn.disabled = !hasMap;
    if (clearMapBtn) clearMapBtn.disabled = !hasMap;
    if (clearDrawingsBtn) clearDrawingsBtn.disabled = !hasMap;
    if (undoStructureBtn) undoStructureBtn.disabled = !hasMap || !hasStructures;
    if (openFullIntelBtn) openFullIntelBtn.disabled = !hasMap;
  }

  function setTool(tool) {
    uiTool = tool;
    activeTool = tool === "intel" ? "select" : tool;

    toolBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tool === activeTool);
    });
    mobileToolBtns.forEach((btn) => {
      const isActive = btn.dataset.tool === tool;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    stage.classList.toggle("tool-brush", activeTool === "brush");
    stage.classList.toggle("tool-structure", activeTool === "structure");
    stage.classList.toggle("tool-vision", activeTool === "vision");
    stage.classList.toggle("tool-sizer", activeTool === "sizer");
    stage.classList.toggle("tool-intel", tool === "intel");
    workspace?.classList.toggle("tool-sizer-active", activeTool === "sizer");
    workspace?.classList.toggle("tool-structure-active", activeTool === "structure");
    workspace?.classList.toggle("tool-intel-active", tool === "intel");

    if (structurePanel) structurePanel.hidden = activeTool !== "structure";
    if (brushPanel) brushPanel.hidden = activeTool === "structure" || activeTool === "sizer";
    if (sizerPanel) sizerPanel.hidden = activeTool !== "sizer";

    if (activeTool === "sizer" && structures.length && !selectedStructureId) {
      selectedStructureId = structures[structures.length - 1].id;
    }
    updateSizerPanel();
    updateIntelReport();
    redrawStructures();
    updateMobileTip(tool);

    if (tool === "intel") scrollMobilePanel(intelSection);
    if (activeTool === "sizer") scrollMobilePanel(sizerPanel);
    if (activeTool === "structure") scrollMobilePanel(structurePanel);

    if (hint && !isMobileLayout()) {
      hint.hidden = !hasMap;
      const hints = {
        select:
          "<strong>Move</strong> — drag players · click <span style=\"color:#00ff9d\">green bunkers</span> on the map to assign <strong>Intel</strong>",
        brush: "<strong>Brush</strong> — draw tactics on the map · click structures for intel",
        structure:
          "<strong>Structure</strong> — drag to place · click existing for <span style=\"color:#00ff9d\">intel</span>",
        vision:
          "<strong>Vision</strong> — click a player for <span style=\"color:#ff4fc8\">pink</span> lines · lines stay on when you switch tools",
        sizer:
          "<strong>Sizer</strong> — resize structures · <strong>arrows</strong> to move · intel below map",
        intel:
          "<strong>Intel</strong> — click a green bunker on the map, then file name and bio below",
      };
      hint.innerHTML = hints[tool] || hints.select;
    } else if (hint) {
      hint.hidden = true;
    }
  }

  function closeToolsPanel() {
    sidebar?.classList.remove("is-open");
    body.classList.remove("fm-tools-open");
    if (toggleToolsBtn) toggleToolsBtn.setAttribute("aria-expanded", "false");
  }

  function openToolsPanel() {
    sidebar?.classList.add("is-open");
    body.classList.add("fm-tools-open");
    if (toggleToolsBtn) toggleToolsBtn.setAttribute("aria-expanded", "true");
  }

  toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => setTool(btn.dataset.tool || "select"));
  });

  mobileToolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTool(btn.dataset.tool || "select");
      closeToolsPanel();
    });
  });

  shapeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeShape = btn.dataset.shape || "rectangle";
      shapeBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  toggleToolsBtn?.addEventListener("click", () => {
    if (sidebar?.classList.contains("is-open")) closeToolsPanel();
    else openToolsPanel();
  });

  function getCanvasSize() {
    return {
      w: structureCanvas.clientWidth,
      h: structureCanvas.clientHeight,
    };
  }

  function clearVisionLines() {
    visionPlayerEl = null;
    playersLayer.querySelectorAll(".fm-player").forEach((p) => {
      p.classList.remove("has-vision-lines");
    });
    visionCtx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);
  }

  function getPlayerCenterPx(el) {
    const { w, h } = getCanvasSize();
    const x = (parseFloat(el.style.left) / 100) * w;
    const y = (parseFloat(el.style.top) / 100) * h;
    return { x, y, w, h };
  }

  function rayMaxDistanceToStage(cx, cy, dx, dy, w, h) {
    let tMin = Infinity;

    if (Math.abs(dx) > 1e-6) {
      const tRight = (w - cx) / dx;
      const tLeft = -cx / dx;
      if (tRight > 0) tMin = Math.min(tMin, tRight);
      if (tLeft > 0) tMin = Math.min(tMin, tLeft);
    }
    if (Math.abs(dy) > 1e-6) {
      const tBottom = (h - cy) / dy;
      const tTop = -cy / dy;
      if (tBottom > 0) tMin = Math.min(tMin, tBottom);
      if (tTop > 0) tMin = Math.min(tMin, tTop);
    }

    return Number.isFinite(tMin) && tMin > 0 ? tMin : 0;
  }

  function smallestPositiveT(t1, t2) {
    const hits = [];
    if (t1 > 0.5) hits.push(t1);
    if (t2 > 0.5) hits.push(t2);
    return hits.length ? Math.min(...hits) : null;
  }

  function raySegmentHitT(ox, oy, dx, dy, x1, y1, x2, y2) {
    const sx = x2 - x1;
    const sy = y2 - y1;
    const denom = dx * sy - dy * sx;
    if (Math.abs(denom) < 1e-9) return null;
    const t = ((x1 - ox) * sy - (y1 - oy) * sx) / denom;
    const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
    if (t > 0.5 && u >= 0 && u <= 1) return t;
    return null;
  }

  function rayRectHitT(ox, oy, dx, dy, left, top, right, bottom) {
    let tmin = -Infinity;
    let tmax = Infinity;

    if (Math.abs(dx) < 1e-9) {
      if (ox < left || ox > right) return null;
    } else {
      const t1 = (left - ox) / dx;
      const t2 = (right - ox) / dx;
      tmin = Math.max(tmin, Math.min(t1, t2));
      tmax = Math.min(tmax, Math.max(t1, t2));
    }

    if (Math.abs(dy) < 1e-9) {
      if (oy < top || oy > bottom) return null;
    } else {
      const t1 = (top - oy) / dy;
      const t2 = (bottom - oy) / dy;
      tmin = Math.max(tmin, Math.min(t1, t2));
      tmax = Math.min(tmax, Math.max(t1, t2));
    }

    if (tmax < Math.max(tmin, 0)) return null;
    if (tmin > 0.5) return tmin;
    if (tmax > 0.5) return tmax;
    return null;
  }

  function rayEllipseHitT(ox, oy, dx, dy, cx, cy, rx, ry) {
    if (rx <= 0 || ry <= 0) return null;
    const ex = ox - cx;
    const ey = oy - cy;
    const A = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
    const B = 2 * ((ex * dx) / (rx * rx) + (ey * dy) / (ry * ry));
    const C = (ex * ex) / (rx * rx) + (ey * ey) / (ry * ry) - 1;
    const disc = B * B - 4 * A * C;
    if (disc < 0) return null;
    const sqrt = Math.sqrt(disc);
    return smallestPositiveT((-B - sqrt) / (2 * A), (-B + sqrt) / (2 * A));
  }

  function rayTriangleHitT(ox, oy, dx, dy, left, top, width, height) {
    const right = left + width;
    const bottom = top + height;
    const ax = left + width / 2;
    const ay = top;
    const hits = [
      raySegmentHitT(ox, oy, dx, dy, ax, ay, right, bottom),
      raySegmentHitT(ox, oy, dx, dy, right, bottom, left, bottom),
      raySegmentHitT(ox, oy, dx, dy, left, bottom, ax, ay),
    ].filter((t) => t !== null);
    return hits.length ? Math.min(...hits) : null;
  }

  function rayStructureHitT(ox, oy, dx, dy, shape, w, h) {
    const b = getStructureBounds(shape);
    const left = b.left * w;
    const top = b.top * h;
    const width = b.width * w;
    const height = b.height * h;
    const right = left + width;
    const bottom = top + height;

    if (shape.type === "rectangle") {
      return rayRectHitT(ox, oy, dx, dy, left, top, right, bottom);
    }
    if (shape.type === "circle") {
      return rayEllipseHitT(ox, oy, dx, dy, left + width / 2, top + height / 2, width / 2, height / 2);
    }
    if (shape.type === "triangle") {
      return rayTriangleHitT(ox, oy, dx, dy, left, top, width, height);
    }
    return null;
  }

  function rayCastVisionEnd(cx, cy, angleRad, w, h) {
    const dx = Math.cos(angleRad);
    const dy = Math.sin(angleRad);
    let tLimit = rayMaxDistanceToStage(cx, cy, dx, dy, w, h);

    structures.forEach((shape) => {
      const t = rayStructureHitT(cx, cy, dx, dy, shape, w, h);
      if (t !== null && t < tLimit) tLimit = t;
    });

    if (tLimit <= 0) return { x: cx, y: cy };
    return { x: cx + dx * tLimit, y: cy + dy * tLimit };
  }

  function redrawVisionLines() {
    const { w, h } = getCanvasSize();
    visionCtx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);
    if (!visionPlayerEl || !w || !h) return;

    const { x: cx, y: cy } = getPlayerCenterPx(visionPlayerEl);
    visionCtx.save();
    visionCtx.strokeStyle = VISION_LINE_COLOR;
    visionCtx.lineWidth = 1;
    visionCtx.globalAlpha = 0.85;

    for (let deg = 0; deg < 360; deg += VISION_LINE_STEP) {
      const rad = (deg * Math.PI) / 180;
      const end = rayCastVisionEnd(cx, cy, rad, w, h);
      visionCtx.beginPath();
      visionCtx.moveTo(cx, cy);
      visionCtx.lineTo(end.x, end.y);
      visionCtx.stroke();
    }

    visionCtx.restore();
  }

  function toggleVisionOnPlayer(el) {
    playersLayer.querySelectorAll(".fm-player").forEach((p) => {
      p.classList.remove("has-vision-lines");
    });
    if (visionPlayerEl === el) {
      visionPlayerEl = null;
    } else {
      visionPlayerEl = el;
      el.classList.add("has-vision-lines");
    }
    redrawVisionLines();
  }

  function getSelectedStructure() {
    return structures.find((s) => s.id === selectedStructureId) || null;
  }

  function getStructureBounds(shape) {
    return {
      left: Math.min(shape.x1, shape.x2),
      top: Math.min(shape.y1, shape.y2),
      width: Math.abs(shape.x2 - shape.x1),
      height: Math.abs(shape.y2 - shape.y1),
    };
  }

  function clampPct(n) {
    return Math.max(SIZER_MIN_PCT / 100, Math.min(SIZER_MAX_PCT / 100, n));
  }

  function setStructureSize(shape, widthPct, heightPct) {
    const w = clampPct(widthPct / 100);
    const h = clampPct(heightPct / 100);
    const bounds = getStructureBounds(shape);
    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;
    const hw = w / 2;
    const hh = h / 2;
    shape.x1 = Math.max(0, cx - hw);
    shape.x2 = Math.min(1, cx + hw);
    shape.y1 = Math.max(0, cy - hh);
    shape.y2 = Math.min(1, cy + hh);
  }

  function moveStructure(shape, direction) {
    const bounds = getStructureBounds(shape);
    const step = SIZER_MOVE_STEP / 100;
    let left = bounds.left;
    let top = bounds.top;

    if (direction === "left") left -= step;
    if (direction === "right") left += step;
    if (direction === "up") top -= step;
    if (direction === "down") top += step;

    left = Math.max(0, Math.min(1 - bounds.width, left));
    top = Math.max(0, Math.min(1 - bounds.height, top));

    shape.x1 = left;
    shape.y1 = top;
    shape.x2 = left + bounds.width;
    shape.y2 = top + bounds.height;
  }

  function updateSizerPanel() {
    const shape = getSelectedStructure();
    const hasSelection = Boolean(shape);

    workspace?.classList.toggle("has-sizer-selection", hasSelection);
    if (sizerEmpty) sizerEmpty.hidden = hasSelection;
    if (sizerControls) sizerControls.hidden = !hasSelection;

    if (!shape) return;

    const bounds = getStructureBounds(shape);
    const widthPct = Math.round(bounds.width * 1000) / 10;
    const heightPct = Math.round(bounds.height * 1000) / 10;

    if (sizerTypeLabel) {
      const label = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
      sizerTypeLabel.textContent = label;
    }

    sizerSyncing = true;
    [sizerWidth, sizerWidthNum].forEach((el) => {
      if (el) el.value = String(widthPct);
    });
    [sizerHeight, sizerHeightNum].forEach((el) => {
      if (el) el.value = String(heightPct);
    });
    sizerSyncing = false;
  }

  function onSizerAxisInput(axis, value) {
    if (sizerSyncing) return;
    const shape = getSelectedStructure();
    if (!shape) return;
    const n = Math.max(
      SIZER_MIN_PCT,
      Math.min(SIZER_MAX_PCT, Math.round((Number(value) || SIZER_MIN_PCT) * 10) / 10)
    );
    const bounds = getStructureBounds(shape);
    const widthPct = Math.round(bounds.width * 1000) / 10;
    const heightPct = Math.round(bounds.height * 1000) / 10;
    if (axis === "width") setStructureSize(shape, n, heightPct);
    else setStructureSize(shape, widthPct, n);
    updateSizerPanel();
    redrawStructures();
  }

  function bindSizerInputs() {
    const bindPair = (rangeEl, numEl, axis) => {
      rangeEl?.addEventListener("input", () => onSizerAxisInput(axis, rangeEl.value));
      numEl?.addEventListener("input", () => onSizerAxisInput(axis, numEl.value));
      numEl?.addEventListener("change", () => onSizerAxisInput(axis, numEl.value));
    };
    bindPair(sizerWidth, sizerWidthNum, "width");
    bindPair(sizerHeight, sizerHeightNum, "height");

    document.querySelectorAll(".fm-pad-btn[data-move]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const shape = getSelectedStructure();
        if (!shape) return;
        moveStructure(shape, btn.dataset.move);
        redrawStructures();
      });
    });
  }

  function refreshMapPixelCache() {
    if (!hasMap || !image.naturalWidth) {
      mapPixelCache = null;
      return;
    }
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    const off = document.createElement("canvas");
    off.width = nw;
    off.height = nh;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(image, 0, 0, nw, nh);
    const { data } = octx.getImageData(0, 0, nw, nh);
    mapPixelCache = { data, w: nw, h: nh };
  }

  function displayToImageCoords(px, py) {
    const { w, h } = getCanvasSize();
    if (!mapPixelCache || !w || !h) return null;
    const ix = Math.min(
      mapPixelCache.w - 1,
      Math.max(0, Math.floor((px / w) * mapPixelCache.w))
    );
    const iy = Math.min(
      mapPixelCache.h - 1,
      Math.max(0, Math.floor((py / h) * mapPixelCache.h))
    );
    return { ix, iy };
  }

  function isStructureGreenAtDisplay(px, py) {
    if (!mapPixelCache) return false;
    const coords = displayToImageCoords(px, py);
    if (!coords) return false;
    const { ix, iy } = coords;
    const i = (iy * mapPixelCache.w + ix) * 4;
    return matchesStructureColor(
      mapPixelCache.data[i],
      mapPixelCache.data[i + 1],
      mapPixelCache.data[i + 2],
      mapPixelCache.data[i + 3]
    );
  }

  function floodFillComponentFromImage(ix, iy, data, w, h, visited) {
    const idx = (x, y) => y * w + x;
    if (ix < 0 || iy < 0 || ix >= w || iy >= h || visited[idx(ix, iy)]) return null;

    const isStruct = (x, y) => {
      const i = (y * w + x) * 4;
      return matchesStructureColor(data[i], data[i + 1], data[i + 2], data[i + 3]);
    };

    if (!isStruct(ix, iy)) return null;

    let minX = ix;
    let maxX = ix;
    let minY = iy;
    let maxY = iy;
    let count = 0;
    const stack = [[ix, iy]];
    visited[idx(ix, iy)] = 1;

    while (stack.length) {
      const [cx, cy] = stack.pop();
      count++;
      minX = Math.min(minX, cx);
      maxX = Math.max(maxX, cx);
      minY = Math.min(minY, cy);
      maxY = Math.max(maxY, cy);

      for (const [nx, ny] of [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const id = idx(nx, ny);
        if (!visited[id] && isStruct(nx, ny)) {
          visited[id] = 1;
          stack.push([nx, ny]);
        }
      }
    }

    if (count < STRUCTURE_MIN_PIXELS) return null;

    return {
      x1: minX / w,
      y1: minY / h,
      x2: (maxX + 1) / w,
      y2: (maxY + 1) / h,
      count,
    };
  }

  function boundsContainPoint(b, nx, ny) {
    return nx >= b.left && nx <= b.left + b.width && ny >= b.top && ny <= b.top + b.height;
  }

  function boundsOverlap(a, b) {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.left + a.width, b.left + b.width);
    const bottom = Math.min(a.top + a.height, b.top + b.height);
    return right > left && bottom > top;
  }

  function assignStructureFromMapClick(px, py) {
    if (!mapPixelCache || !isStructureGreenAtDisplay(px, py)) return null;

    const coords = displayToImageCoords(px, py);
    if (!coords) return null;

    const { w, h } = getCanvasSize();
    const nx = px / w;
    const ny = py / h;

    for (let i = structures.length - 1; i >= 0; i--) {
      const s = structures[i];
      if (boundsContainPoint(getStructureBounds(s), nx, ny)) return s;
    }

    const visited = new Uint8Array(mapPixelCache.w * mapPixelCache.h);
    const component = floodFillComponentFromImage(
      coords.ix,
      coords.iy,
      mapPixelCache.data,
      mapPixelCache.w,
      mapPixelCache.h,
      visited
    );
    if (!component) return null;

    const hitBounds = {
      left: component.x1,
      top: component.y1,
      width: component.x2 - component.x1,
      height: component.y2 - component.y1,
    };

    for (let i = structures.length - 1; i >= 0; i--) {
      const s = structures[i];
      if (boundsOverlap(getStructureBounds(s), hitBounds)) return s;
    }

    const shape = {
      id: crypto.randomUUID(),
      type: classifyComponent(
        Math.floor(component.x1 * mapPixelCache.w),
        Math.floor(component.x2 * mapPixelCache.w) - 1,
        Math.floor(component.y1 * mapPixelCache.h),
        Math.floor(component.y2 * mapPixelCache.h) - 1
      ),
      x1: component.x1,
      y1: component.y1,
      x2: component.x2,
      y2: component.y2,
      detected: true,
    };
    structures.push(shape);
    updateControlStates();
    return shape;
  }

  function hitTestStructure(px, py) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return null;
    const nx = px / w;
    const ny = py / h;

    for (let i = structures.length - 1; i >= 0; i--) {
      const s = structures[i];
      const b = getStructureBounds(s);
      const left = b.left;
      const top = b.top;
      const right = left + b.width;
      const bottom = top + b.height;
      const cx = left + b.width / 2;
      const cy = top + b.height / 2;

      if (s.detected) {
        if (boundsContainPoint(b, nx, ny)) return s;
        continue;
      }

      if (s.type === "rectangle") {
        if (nx >= left && nx <= right && ny >= top && ny <= bottom) return s;
      } else if (s.type === "circle") {
        const rx = b.width / 2;
        const ry = b.height / 2;
        if (rx <= 0 || ry <= 0) continue;
        const dx = (nx - cx) / rx;
        const dy = (ny - cy) / ry;
        if (dx * dx + dy * dy <= 1) return s;
      } else if (s.type === "triangle") {
        if (nx < left || nx > right || ny < top || ny > bottom) continue;
        const ax = left + b.width / 2;
        const ay = top;
        const bx = right;
        const by = bottom;
        const cx2 = left;
        const cy2 = bottom;
        const denom = (by - cy2) * (ax - cx2) + (cx2 - bx) * (ay - cy2);
        if (Math.abs(denom) < 1e-8) continue;
        const a = ((by - cy2) * (nx - cx2) + (cx2 - bx) * (ny - cy2)) / denom;
        const b2 = ((cy2 - ay) * (nx - cx2) + (ax - cx2) * (ny - cy2)) / denom;
        const c = 1 - a - b2;
        if (a >= 0 && b2 >= 0 && c >= 0) return s;
      }
    }

    return assignStructureFromMapClick(px, py);
  }

  function structureHasIntel(shape) {
    return Boolean(shape?.name?.trim());
  }

  function selectStructureAt(px, py) {
    const hit = hitTestStructure(px, py);
    selectedStructureId = hit ? hit.id : null;
    updateSizerPanel();
    updateIntelReport();
    redrawStructures();
    return hit;
  }

  function pickStructureAt(px, py, scrollToIntel) {
    const hit = selectStructureAt(px, py);
    if (!hit) return null;
    if (scrollToIntel && isMobileLayout()) scrollMobilePanel(intelSection);
    if (activeTool === "sizer" && isMobileLayout()) scrollMobilePanel(sizerPanel);
    return hit;
  }

  function renderIntelList() {
    if (!intelList) return;
    intelList.innerHTML = "";
    const filed = structures.filter(structureHasIntel);
    filed.forEach((shape) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fm-intel-list-item";
      if (shape.id === selectedStructureId) btn.classList.add("is-active");
      const nameEl = document.createElement("span");
      nameEl.className = "fm-intel-list-name";
      nameEl.textContent = shape.name.trim();
      const snippetEl = document.createElement("span");
      snippetEl.className = "fm-intel-list-snippet";
      const bio = (shape.bio || "").trim();
      snippetEl.textContent = bio.length > 72 ? `${bio.slice(0, 72)}…` : bio || "No bio";
      btn.append(nameEl, snippetEl);
      btn.addEventListener("click", () => {
        selectedStructureId = shape.id;
        updateSizerPanel();
        updateIntelReport();
        redrawStructures();
      });
      li.append(btn);
      intelList.append(li);
    });
  }

  function updateIntelReport() {
    if (!intelSection) return;

    if (!hasMap) {
      intelSection.hidden = true;
      return;
    }

    intelSection.hidden = false;
    const shape = getSelectedStructure();
    const hasSelection = Boolean(shape);

    if (intelEmpty) intelEmpty.hidden = hasSelection;
    if (intelForm) intelForm.hidden = !hasSelection;

    if (!shape) {
      const detectedCount = structures.filter((s) => s.detected).length;
      if (intelEmpty && detectedCount > 0) {
        intelEmpty.textContent = `${detectedCount} green bunker${detectedCount === 1 ? "" : "s"} found — tap one on the map to assign intel.`;
      } else if (intelEmpty) {
        intelEmpty.textContent = "Tap a green bunker on the map to assign intel.";
      }
      renderIntelList();
      return;
    }

    const hasIntel = structureHasIntel(shape);
    const typeLabel = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);

    if (intelPrompt) intelPrompt.hidden = hasIntel;
    if (intelMeta) {
      intelMeta.hidden = false;
      intelMeta.textContent = `${typeLabel}${hasIntel ? " · on file" : " · no intel yet"}`;
    }

    if (intelName) intelName.value = shape.name || "";
    if (intelBio) intelBio.value = shape.bio || "";

    renderIntelList();
  }

  function saveIntelReport(e) {
    e.preventDefault();
    const shape = getSelectedStructure();
    if (!shape) return;
    const name = intelName?.value.trim() || "";
    const bio = intelBio?.value.trim() || "";
    if (!name) {
      intelName?.focus();
      return;
    }
    shape.name = name;
    shape.bio = bio;
    updateIntelReport();
    redrawStructures();
    if (intelModalOpen) renderIntelModal();
  }

  function syncIntelModalFields() {
    if (intelReportName) intelReportName.value = fieldIntelReport.name || "";
    if (intelReportBio) intelReportBio.value = fieldIntelReport.bio || "";
    if (intelModalTitle) {
      intelModalTitle.textContent = fieldIntelReport.name?.trim()
        ? fieldIntelReport.name.trim()
        : "Intel Report";
    }
  }

  function renderIntelModal() {
    syncIntelModalFields();

    if (!intelModalList || !intelModalEmpty) return;

    intelModalList.innerHTML = "";
    const hasStructures = structures.length > 0;
    intelModalEmpty.hidden = hasStructures;

    if (!hasStructures) return;

    structures.forEach((shape, index) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const hasName = Boolean(shape.name?.trim());
      const hasBio = Boolean(shape.bio?.trim());
      btn.className = "fm-intel-modal-card";
      if (!hasName) btn.classList.add("is-missing");
      if (shape.id === selectedStructureId) btn.classList.add("is-active");

      const typeEl = document.createElement("span");
      typeEl.className = "fm-intel-modal-card-type";
      const typeLabel = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
      typeEl.textContent = `${typeLabel}${shape.detected ? " · map" : ""} · #${index + 1}`;

      const nameEl = document.createElement("span");
      nameEl.className = "fm-intel-modal-card-name";
      nameEl.textContent = hasName ? shape.name.trim() : "Unnamed structure";

      const bioEl = document.createElement("span");
      bioEl.className = "fm-intel-modal-card-bio";
      bioEl.textContent = hasBio ? shape.bio.trim() : "No bio filed.";

      btn.append(typeEl, nameEl, bioEl);
      btn.addEventListener("click", () => {
        selectedStructureId = shape.id;
        updateSizerPanel();
        updateIntelReport();
        redrawStructures();
        renderIntelModal();
        closeIntelModal();
        if (isMobileLayout()) scrollMobilePanel(intelSection);
      });

      li.append(btn);
      intelModalList.append(li);
    });
  }

  function openIntelModal() {
    if (!hasMap || !intelModal) return;
    intelModalOpen = true;
    intelModal.hidden = false;
    intelModal.setAttribute("aria-hidden", "false");
    body.classList.add("fm-intel-modal-open");
    renderIntelModal();
    intelReportName?.focus();
  }

  function closeIntelModal() {
    if (!intelModal) return;
    intelModalOpen = false;
    intelModal.hidden = true;
    intelModal.setAttribute("aria-hidden", "true");
    body.classList.remove("fm-intel-modal-open");
    openFullIntelBtn?.focus();
  }

  function saveFieldIntelReport(e) {
    e.preventDefault();
    fieldIntelReport = {
      name: intelReportName?.value.trim() || "",
      bio: intelReportBio?.value.trim() || "",
    };
    syncIntelModalFields();
    renderIntelModal();
  }

  function drawSelectionOutline(context, shape, w, h) {
    const b = getStructureBounds(shape);
    const left = b.left * w;
    const top = b.top * h;
    const width = b.width * w;
    const height = b.height * h;

    context.save();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.setLineDash([6, 4]);

    if (shape.type === "rectangle") {
      context.strokeRect(left, top, width, height);
    } else if (shape.type === "circle") {
      context.beginPath();
      context.ellipse(left + width / 2, top + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      context.stroke();
    } else if (shape.type === "triangle") {
      context.beginPath();
      context.moveTo(left + width / 2, top);
      context.lineTo(left + width, top + height);
      context.lineTo(left, top + height);
      context.closePath();
      context.stroke();
    }

    context.restore();
  }

  function getLayerPoint(e, layer) {
    const rect = layer.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function drawShapeOnContext(context, shape, w, h, preview) {
    const x1 = shape.x1 * w;
    const y1 = shape.y1 * h;
    const x2 = shape.x2 * w;
    const y2 = shape.y2 * h;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    if (width < 2 && height < 2) return;

    context.save();
    context.fillStyle = preview ? "rgba(0, 255, 157, 0.35)" : STRUCTURE_GREEN;
    context.strokeStyle = preview ? "rgba(0, 255, 157, 0.8)" : "#00cc7a";
    context.lineWidth = preview ? 2 : 1.5;

    if (shape.type === "rectangle") {
      context.fillRect(left, top, width, height);
      context.strokeRect(left, top, width, height);
    } else if (shape.type === "circle") {
      const cx = left + width / 2;
      const cy = top + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      context.beginPath();
      context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    } else if (shape.type === "triangle") {
      context.beginPath();
      context.moveTo(left + width / 2, top);
      context.lineTo(left + width, top + height);
      context.lineTo(left, top + height);
      context.closePath();
      context.fill();
      context.stroke();
    }

    context.restore();
  }

  function redrawStructures() {
    const { w, h } = getCanvasSize();
    if (!w || !h) return;
    structCtx.clearRect(0, 0, structureCanvas.width, structureCanvas.height);
    structures.forEach((s) => drawShapeOnContext(structCtx, s, w, h, false));
    if (placePreview) drawShapeOnContext(structCtx, placePreview, w, h, true);
    const selected = getSelectedStructure();
    if (selected) {
      drawSelectionOutline(structCtx, selected, w, h);
    }
    updateControlStates();
    if (visionPlayerEl) redrawVisionLines();
  }

  function resizeCanvases() {
    if (!hasMap || !image.naturalWidth) return;

    const w = image.offsetWidth;
    const h = image.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newW = Math.floor(w * dpr);
    const newH = Math.floor(h * dpr);

    [canvas, structureCanvas, visionCanvas].forEach((c) => {
      const isVisionLayer = c === visionCanvas;
      let snapshot = null;
      const cctx = c.getContext("2d");
      if (!isVisionLayer && c.width > 0 && c.height > 0) {
        snapshot = document.createElement("canvas");
        snapshot.width = c.width;
        snapshot.height = c.height;
        snapshot.getContext("2d").drawImage(c, 0, 0);
      }
      c.width = newW;
      c.height = newH;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (c === canvas) {
        cctx.lineCap = "round";
        cctx.lineJoin = "round";
      }
      if (snapshot) {
        cctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, w, h);
      }
    });

    refreshMapPixelCache();
    redrawStructures();
    redrawVisionLines();
  }

  function classifyComponent(minX, maxX, minY, maxY) {
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const ratio = bw / (bh || 1);
    if (ratio > 0.82 && ratio < 1.22) return "circle";
    if (bh > bw * 1.1) return "triangle";
    return "rectangle";
  }

  function detectStructuresFromImage(img) {
    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight, 1));
    const w = Math.max(1, Math.floor(img.naturalWidth * scale));
    const h = Math.max(1, Math.floor(img.naturalHeight * scale));
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(img, 0, 0, w, h);
    const { data } = octx.getImageData(0, 0, w, h);
    const visited = new Uint8Array(w * h);
    const found = [];
    const idx = (x, y) => y * w + x;

    const isStruct = (x, y) => {
      const i = (y * w + x) * 4;
      return matchesStructureColor(data[i], data[i + 1], data[i + 2], data[i + 3]);
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (visited[idx(x, y)] || !isStruct(x, y)) continue;

        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let count = 0;
        const stack = [[x, y]];
        visited[idx(x, y)] = 1;

        while (stack.length) {
          const [cx, cy] = stack.pop();
          count++;
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];
          for (const [nx, ny] of neighbors) {
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const id = idx(nx, ny);
            if (!visited[id] && isStruct(nx, ny)) {
              visited[id] = 1;
              stack.push([nx, ny]);
            }
          }
        }

        if (count < STRUCTURE_MIN_PIXELS) continue;

        found.push({
          id: crypto.randomUUID(),
          type: classifyComponent(minX, maxX, minY, maxY),
          x1: minX / w,
          y1: minY / h,
          x2: (maxX + 1) / w,
          y2: (maxY + 1) / h,
          detected: true,
        });
      }
    }

    return found;
  }

  function createPlayers() {
    playersLayer.innerHTML = "";
    ["a", "b"].forEach((team) => {
      for (let n = 1; n <= PLAYERS_PER_TEAM; n++) {
        const el = document.createElement("div");
        el.className = `fm-player team-${team}`;
        el.dataset.team = team;
        el.dataset.num = String(n);
        el.textContent = String(n);
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", `Team ${team === "a" ? "Alpha" : "Bravo"} player ${n}`);
        playersLayer.appendChild(el);
        bindPlayerDrag(el);
      }
    });
  }

  function positionPlayer(el, xPercent, yPercent) {
    el.style.left = `${xPercent}%`;
    el.style.top = `${yPercent}%`;
  }

  function resetPlayerPositions() {
    playersLayer.querySelectorAll(".fm-player").forEach((el) => {
      const team = el.dataset.team;
      const num = Number(el.dataset.num) - 1;
      const pos = defaultPositions[team]?.[num];
      if (pos) positionPlayer(el, pos.x, pos.y);
    });
    if (visionPlayerEl) redrawVisionLines();
  }

  function bindPlayerDrag(el) {
    el.addEventListener("pointerdown", (e) => {
      if (!hasMap) return;

      if (activeTool === "vision") {
        e.preventDefault();
        e.stopPropagation();
        toggleVisionOnPlayer(el);
        return;
      }

      if (activeTool !== "select") return;
      e.preventDefault();
      e.stopPropagation();
      draggedPlayer = el;
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
      setInteractionLock(true);

      const stageRect = stage.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const centerX = elRect.left + elRect.width / 2 - stageRect.left;
      const centerY = elRect.top + elRect.height / 2 - stageRect.top;
      dragOffsetX = e.clientX - stageRect.left - centerX;
      dragOffsetY = e.clientY - stageRect.top - centerY;
    });

    el.addEventListener("pointermove", (e) => {
      if (!draggedPlayer || draggedPlayer !== el) return;
      e.preventDefault();
      const stageRect = stage.getBoundingClientRect();
      let x = ((e.clientX - stageRect.left - dragOffsetX) / stageRect.width) * 100;
      let y = ((e.clientY - stageRect.top - dragOffsetY) / stageRect.height) * 100;
      x = Math.max(2, Math.min(98, x));
      y = Math.max(2, Math.min(98, y));
      positionPlayer(el, x, y);
      if (visionPlayerEl === el) redrawVisionLines();
    });

    const endDrag = (e) => {
      if (draggedPlayer !== el) return;
      el.classList.remove("is-dragging");
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      draggedPlayer = null;
      setInteractionLock(false);
      if (visionPlayerEl === el) redrawVisionLines();
    };

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
  }

  function startDraw(e) {
    if (activeTool !== "brush" || !hasMap) return;
    e.preventDefault();
    isDrawing = true;
    setInteractionLock(true);
    const { x, y } = getLayerPoint(e, canvas);
    ctx.strokeStyle = brushColorInput?.value || "#7cfc3b";
    ctx.lineWidth = Number(brushSizeInput?.value) || 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getLayerPoint(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function endDraw(e) {
    if (!isDrawing) return;
    isDrawing = false;
    setInteractionLock(false);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    ctx.beginPath();
  }

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);

  function normalizedShapeFromPoints(x1, y1, x2, y2) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return null;
    const nx1 = Math.max(0, Math.min(1, x1 / w));
    const ny1 = Math.max(0, Math.min(1, y1 / h));
    const nx2 = Math.max(0, Math.min(1, x2 / w));
    const ny2 = Math.max(0, Math.min(1, y2 / h));
    if (Math.abs(nx2 - nx1) * w < 6 && Math.abs(ny2 - ny1) * h < 6) return null;
    return {
      id: crypto.randomUUID(),
      type: activeShape,
      x1: nx1,
      y1: ny1,
      x2: nx2,
      y2: ny2,
      detected: false,
    };
  }

  function startStructurePlace(e) {
    if (!hasMap) return;

    const { x, y } = getLayerPoint(e, structureCanvas);
    const hit = hitTestStructure(x, y);

    structurePointer = {
      x: e.clientX,
      y: e.clientY,
      pid: e.pointerId,
      handled: false,
    };

    if (hit) {
      e.preventDefault();
      structurePointer.handled = true;
      pickStructureAt(x, y, uiTool === "intel" || activeTool === "select");
      if (activeTool === "sizer" || activeTool === "structure") return;
      return;
    }

    if (activeTool === "sizer") {
      e.preventDefault();
      structurePointer.handled = true;
      selectStructureAt(x, y);
      return;
    }

    if (activeTool !== "structure") return;
    e.preventDefault();
    structurePointer.handled = true;
    isPlacingStructure = true;
    setInteractionLock(true);
    setPlacingLock(true);
    placeStart = getLayerPoint(e, structureCanvas);
    placePreview = null;
    structureCanvas.setPointerCapture(e.pointerId);
  }

  function endStructurePointer(e) {
    if (!structurePointer || structurePointer.pid !== e.pointerId) return;

    const dx = e.clientX - structurePointer.x;
    const dy = e.clientY - structurePointer.y;
    const moved = dx * dx + dy * dy;
    const wasTap = moved < 144;

    if (
      isMobileLayout() &&
      wasTap &&
      !structurePointer.handled &&
      !isPlacingStructure &&
      hasMap &&
      activeTool !== "structure"
    ) {
      const { x, y } = getLayerPoint(e, structureCanvas);
      pickStructureAt(x, y, uiTool === "intel" || activeTool === "select");
    }

    structurePointer = null;
  }

  function moveStructurePlace(e) {
    if (!isPlacingStructure || !placeStart) return;
    e.preventDefault();
    const end = getLayerPoint(e, structureCanvas);
    placePreview = normalizedShapeFromPoints(
      placeStart.x,
      placeStart.y,
      end.x,
      end.y
    );
    redrawStructures();
  }

  function endStructurePlace(e) {
    if (!isPlacingStructure) return;
    isPlacingStructure = false;
    setInteractionLock(false);
    setPlacingLock(false);
    if (structureCanvas.hasPointerCapture(e.pointerId)) {
      structureCanvas.releasePointerCapture(e.pointerId);
    }
    if (placePreview) {
      structures.push(placePreview);
      selectedStructureId = placePreview.id;
      placeStart = null;
      placePreview = null;
      redrawStructures();
      setTool("sizer");
      return;
    }
    placeStart = null;
    placePreview = null;
    redrawStructures();
    updateSizerPanel();
  }

  structureCanvas.addEventListener("pointerdown", startStructurePlace);
  structureCanvas.addEventListener("pointermove", moveStructurePlace);
  structureCanvas.addEventListener("pointerup", (e) => {
    endStructurePlace(e);
    endStructurePointer(e);
  });
  structureCanvas.addEventListener("pointercancel", (e) => {
    endStructurePlace(e);
    endStructurePointer(e);
  });

  function handleMapFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      image.onload = () => {
        showMapUI();
        closeToolsPanel();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function showMapUI() {
    hasMap = true;
    structures = [];
    stage.classList.add("has-map");
    stageWrap?.classList.add("has-map");
    if (uploadPromptLabel) uploadPromptLabel.hidden = true;
    stage.hidden = false;
    image.hidden = false;
    canvas.hidden = false;
    structureCanvas.hidden = false;
    visionCanvas.hidden = false;
    playersLayer.hidden = false;
    createPlayers();
    resetPlayerPositions();
    requestAnimationFrame(() => {
      refreshMapPixelCache();
      resizeCanvases();
      const detected = detectStructuresFromImage(image);
      if (detected.length) {
        structures = detected;
        redrawStructures();
        if (isMobileLayout()) setTool("intel");
      }
      updateControlStates();
      updateIntelReport();
      updateMobileTip(uiTool);
    });
  }

  function hideMapUI() {
    hasMap = false;
    mapPixelCache = null;
    fieldIntelReport = { name: "", bio: "" };
    closeIntelModal();
    structures = [];
    placePreview = null;
    selectedStructureId = null;
    clearVisionLines();
    updateSizerPanel();
    updateIntelReport();
    stage.classList.remove("has-map");
    stageWrap?.classList.remove("has-map");
    if (uploadPromptLabel) uploadPromptLabel.hidden = false;
    stage.hidden = true;
    image.hidden = true;
    image.removeAttribute("src");
    canvas.hidden = true;
    structureCanvas.hidden = true;
    visionCanvas.hidden = true;
    playersLayer.hidden = true;
    playersLayer.innerHTML = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    structCtx.clearRect(0, 0, structureCanvas.width, structureCanvas.height);
    if (mapUpload) mapUpload.value = "";
    if (mapUploadPromptInput) mapUploadPromptInput.value = "";
    if (mapUploadMobile) mapUploadMobile.value = "";
    updateControlStates();
    setInteractionLock(false);
  }

  mapUpload?.addEventListener("change", (e) => handleMapFile(e.target.files?.[0]));
  mapUploadPromptInput?.addEventListener("change", (e) => handleMapFile(e.target.files?.[0]));
  mapUploadMobile?.addEventListener("change", (e) => {
    handleMapFile(e.target.files?.[0]);
    e.target.value = "";
  });

  clearMapBtn?.addEventListener("click", () => {
    if (confirm("Remove the map and clear all drawings, structures, and player positions?")) {
      hideMapUI();
    }
  });

  clearDrawingsBtn?.addEventListener("click", () => {
    resizeCanvases();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  undoStructureBtn?.addEventListener("click", () => {
    if (structures.length === 0) return;
    const removed = structures.pop();
    if (selectedStructureId === removed?.id) {
      selectedStructureId = structures.length ? structures[structures.length - 1].id : null;
      updateIntelReport();
    }
    placePreview = null;
    redrawStructures();
    updateSizerPanel();
    updateIntelReport();
  });

  function bindIntelForm() {
    intelForm?.addEventListener("submit", saveIntelReport);
    intelModalForm?.addEventListener("submit", saveFieldIntelReport);
    openFullIntelBtn?.addEventListener("click", openIntelModal);
    closeIntelModalBtn?.addEventListener("click", closeIntelModal);
    intelModalBackdrop?.addEventListener("click", closeIntelModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && intelModalOpen) closeIntelModal();
  });

  bindSizerInputs();
  bindIntelForm();

  resetPlayersBtn?.addEventListener("click", resetPlayerPositions);
  resetPlayersMobile?.addEventListener("click", resetPlayerPositions);

  image.addEventListener("load", resizeCanvases);
  window.addEventListener("resize", () => {
    resizeCanvases();
    updateMobileTip(uiTool);
    if (hint) hint.hidden = isMobileLayout() || !hasMap;
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      resizeCanvases();
      updateMobileTip(uiTool);
    }, 150);
  });

  const resizeObserver = new ResizeObserver(() => resizeCanvases());
  resizeObserver.observe(stage);

  document.addEventListener(
    "touchmove",
    (e) => {
      if (isDrawing || isPlacingStructure || draggedPlayer) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  setTool("select");
  updateControlStates();
})();
