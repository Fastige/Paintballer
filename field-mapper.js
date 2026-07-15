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
  const DEFAULT_PLAYERS_PER_TEAM = 5;
  const MIN_PLAYERS_PER_TEAM = 1;
  const MAX_PLAYERS_PER_TEAM = 10;
  const TEAM_NUDGE_STEP = 1.5;
  const IS_COARSE = window.matchMedia("(pointer: coarse)").matches;

  const body = document.body;
  const stage = document.getElementById("fm-stage");
  const stageWrap = document.getElementById("fm-stage-wrap");
  const image = document.getElementById("fm-image");
  const structureCanvas = document.getElementById("fm-structure-canvas");
  const canvas = document.getElementById("fm-canvas");
  const visionCanvas = document.getElementById("fm-vision-canvas");
  const shootCanvas = document.getElementById("fm-shoot-canvas");
  const playersLayer = document.getElementById("fm-players");
  const mapUpload = document.getElementById("map-upload");
  const uploadPromptLabel = document.getElementById("fm-upload-prompt");
  const mapUploadPromptInput = document.getElementById("map-upload-prompt");
  const mapUploadMobile = document.getElementById("map-upload-mobile");
  const saveMapPackBtn = document.getElementById("save-map-pack");
  const saveMapPackMobileBtn = document.getElementById("save-map-pack-mobile");
  const uploadMapPackBtn = document.getElementById("upload-map-pack");
  const uploadMapPackMobileBtn = document.getElementById("upload-map-pack-mobile");
  const mapPackZipInput = document.getElementById("map-pack-zip");
  const mapPackFolderInput = document.getElementById("map-pack-folder");
  const clearMapBtn = document.getElementById("clear-map");
  const clearDrawingsBtn = document.getElementById("clear-drawings");
  const undoStructureBtn = document.getElementById("undo-structure");
  const placePlayersBtn = document.getElementById("place-players");
  const resetPlayersBtn = document.getElementById("reset-players");
  const resetPlayersMobile = document.getElementById("reset-players-mobile");
  const brushSizeInput = document.getElementById("brush-size");
  const brushColorInput = document.getElementById("brush-color");
  const structurePanel = document.getElementById("fm-structure-panel");
  const brushPanel = document.getElementById("fm-brush-panel");
  const toolBtns = document.querySelectorAll(".fm-tool-btn[data-tool]");
  const mobileToolBtns = document.querySelectorAll(".fm-mobile-btn[data-tool]");
  const shapeBtns = document.querySelectorAll(".fm-shape-btn[data-shape]");
  const structureStyleBtns = document.querySelectorAll(".fm-style-btn[data-structure-style]");
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
  const undoSizerBtn = document.getElementById("undo-sizer");
  const sizerStyleBtns = document.querySelectorAll(".fm-style-btn[data-sizer-style]");
  const teamPanel = document.getElementById("fm-team-panel");
  const teamStatus = document.getElementById("fm-team-status");
  const teamHint = document.getElementById("fm-team-hint");
  const placementTeamBtns = document.querySelectorAll(".fm-team-tab[data-placement-team]");
  const playerCountInput = document.getElementById("player-count");
  const playerCountMinus = document.getElementById("player-count-minus");
  const playerCountPlus = document.getElementById("player-count-plus");
  const shootPanel = document.getElementById("fm-shoot-panel");
  const shootEmpty = document.getElementById("fm-shoot-empty");
  const shootControls = document.getElementById("fm-shoot-controls");
  const shootPlayerLabel = document.getElementById("fm-shoot-player");
  const shootTimeInput = document.getElementById("shoot-time");
  const shootTargetPlayerInput = document.getElementById("shoot-target-player");
  const shootStandStillInput = document.getElementById("shoot-stand-still");
  const shootTargetStatus = document.getElementById("fm-shoot-target-status");
  const shootRunBtn = document.getElementById("shoot-run");
  const shootResetRunBtn = document.getElementById("shoot-reset-run");
  const shootClearBtn = document.getElementById("shoot-clear");
  const shootSaveSetupBtn = document.getElementById("shoot-save-setup");
  const shootNewSetupBtn = document.getElementById("shoot-new-setup");
  const shootPlaySceneBtn = document.getElementById("shoot-play-scene");
  const shootResetSceneBtn = document.getElementById("shoot-reset-scene");
  const shootClearSceneBtn = document.getElementById("shoot-clear-scene");
  const shootSceneList = document.getElementById("shoot-scene-list");
  const shootSceneCount = document.getElementById("shoot-scene-count");
  const shootModeBtns = document.querySelectorAll(".fm-shoot-mode-btn[data-shoot-mode]");
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
  const FIELD_STATE_KEY = "paintballer-field-state";
  const SHOOT_LINE_COLOR = "#ffd43b";
  const SHOOT_BLOCKED_COLOR = "#ff4f4f";
  const RUN_POINT_COLOR = "#7cfc3b";
  const SHOOT_DOT_SPAWN_MS = 200;
  const SHOOT_DOT_TRAVEL_MS = 700;

  if (!stage || !canvas || !structureCanvas || !visionCanvas || !shootCanvas) return;

  const ctx = canvas.getContext("2d");
  const structCtx = structureCanvas.getContext("2d");
  const visionCtx = visionCanvas.getContext("2d");
  const shootCtx = shootCanvas.getContext("2d");

  let activeTool = "select";
  let uiTool = "select";
  let activeShape = "rectangle";
  let activeStructureStyle = "filled";
  let isDrawing = false;
  let isPlacingStructure = false;
  let placeStart = null;
  let placePreview = null;
  let hasMap = false;
  let draggedPlayer = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  /** @type {Array<{id:string,type:string,x1:number,y1:number,x2:number,y2:number,detected?:boolean,name?:string,bio?:string,fill?:string}>} */
  let structures = [];
  let selectedStructureId = null;
  let visionPlayerEl = null;
  let shootPlayerEl = null;
  let shootTargetPlayerEl = null;
  let shootUseTargetPlayer = false;
  let shootStandStill = false;
  let shootMode = "shoot";
  let shootPoint = null;
  let runPoint = null;
  let targetRunPoint = null;
  let runAnimationFrame = null;
  let lastRunStartPositions = null;
  /** @type {{setups:object[],setupIds:Set<string>,dots:object[],lastSpawnAt:Map<string,number>,startedAt:number,spawnMs:number,travelMs:number,spawning:boolean}|null} */
  let shootSceneDotAnim = null;
  let shootSceneSetups = [];
  let activeShootSetupId = null;
  let activePlacementTeam = "a";
  let teamPlacement = createDefaultTeamPlacement();
  let sizerSyncing = false;
  let activeSizerEdit = null;
  let sizerUndoState = null;
  /** @type {{data:Uint8ClampedArray,w:number,h:number}|null} */
  let mapPixelCache = null;
  /** @type {{x:number,y:number,pid:number,handled:boolean}|null} */
  let structurePointer = null;
  let fieldIntelReport = { name: "", bio: "" };
  let intelModalOpen = false;
  /** @type {ReturnType<typeof serializeFieldState>|null} */
  let pendingPackState = null;

  if (IS_COARSE && brushSizeInput) {
    brushSizeInput.value = "12";
  }

  const TEAM_LABELS = {
    a: { short: "Team 1", name: "Team 1 / Alpha", css: "team-a" },
    b: { short: "Team 2", name: "Team 2 / Bravo", css: "team-b" },
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

  function createDefaultTeamPlacement() {
    return {
      a: {
        count: DEFAULT_PLAYERS_PER_TEAM,
        placed: false,
        locked: false,
        spawn: null,
      },
      b: {
        count: DEFAULT_PLAYERS_PER_TEAM,
        placed: false,
        locked: false,
        spawn: null,
      },
    };
  }

  function clampPlayerCount(value) {
    return Math.max(
      MIN_PLAYERS_PER_TEAM,
      Math.min(MAX_PLAYERS_PER_TEAM, Math.round(Number(value) || DEFAULT_PLAYERS_PER_TEAM))
    );
  }

  function getTeamLabel(team) {
    return TEAM_LABELS[team]?.name || "Team";
  }

  function normalizeStructureFill(fill) {
    if (fill === "outline" || fill === "border") return "border";
    if (fill === "transparent") return "transparent";
    return "filled";
  }

  function setActiveStructureStyle(style) {
    activeStructureStyle = normalizeStructureFill(style);
    structureStyleBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.structureStyle === activeStructureStyle);
    });
    if (placePreview) {
      placePreview.fill = activeStructureStyle;
      redrawStructures();
    }
  }

  function setSelectedStructureStyle(style) {
    const shape = getSelectedStructure();
    if (!shape) return;
    shape.fill = normalizeStructureFill(style);
    persistFieldState();
    updateSizerPanel();
    redrawStructures();
    redrawShootOverlay();
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
      players: "Teams — choose Team 1 count, tap spawn, nudge with ghost arrows, then lock.",
      brush: "Brush — draw on the map. Use Move or Intel to tag bunkers.",
      structure: "Struct — drag to place. Tap existing bunkers for Intel.",
      vision: "Vision — tap a player for lines (stay on when you switch tools).",
      shoot: "Shoot — tap runner, set shoot/run points, or target an opposing player.",
      sizer: "Sizer — tap a bunker, then resize or use arrows.",
      intel: "Intel — tap a green bunker, then name it below.",
    };
    mobileTip.innerHTML = tips[tool] || tips.select;
  }

  function updateControlStates() {
    const hasStructures = structures.length > 0;
    if (resetPlayersMobile) resetPlayersMobile.disabled = !hasMap;
    if (resetPlayersBtn) resetPlayersBtn.disabled = !hasMap;
    if (placePlayersBtn) placePlayersBtn.disabled = !hasMap;
    if (clearMapBtn) clearMapBtn.disabled = !hasMap;
    if (clearDrawingsBtn) clearDrawingsBtn.disabled = !hasMap;
    if (undoStructureBtn) undoStructureBtn.disabled = !hasMap || !hasStructures;
    if (undoSizerBtn) undoSizerBtn.disabled = !hasMap || !hasSizerUndo();
    if (openFullIntelBtn) openFullIntelBtn.disabled = !hasMap;
    if (saveMapPackBtn) saveMapPackBtn.disabled = !hasMap;
    if (saveMapPackMobileBtn) saveMapPackMobileBtn.disabled = !hasMap;
    updateTeamPlacementPanel();
    updateShootPanel();
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
    stage.classList.toggle("tool-players", activeTool === "players");
    stage.classList.toggle("tool-vision", activeTool === "vision");
    stage.classList.toggle("tool-shoot", activeTool === "shoot");
    stage.classList.toggle("tool-sizer", activeTool === "sizer");
    stage.classList.toggle("tool-intel", tool === "intel");
    workspace?.classList.toggle("tool-sizer-active", activeTool === "sizer");
    workspace?.classList.toggle("tool-structure-active", activeTool === "structure");
    workspace?.classList.toggle("tool-players-active", activeTool === "players");
    workspace?.classList.toggle("tool-shoot-active", activeTool === "shoot");
    workspace?.classList.toggle("tool-intel-active", tool === "intel");

    if (structurePanel) structurePanel.hidden = activeTool !== "structure";
    if (brushPanel) brushPanel.hidden = activeTool === "structure" || activeTool === "players" || activeTool === "sizer" || activeTool === "shoot";
    if (sizerPanel) sizerPanel.hidden = activeTool !== "sizer";
    if (teamPanel) teamPanel.hidden = activeTool !== "players";
    if (shootPanel) shootPanel.hidden = activeTool !== "shoot";

    if (activeTool === "sizer" && structures.length && !selectedStructureId) {
      selectedStructureId = structures[structures.length - 1].id;
    }
    updateSizerPanel();
    updateShootPanel();
    updateIntelReport();
    redrawStructures();
    updateMobileTip(tool);

    if (tool === "intel") scrollMobilePanel(intelSection);
    if (activeTool === "sizer") scrollMobilePanel(sizerPanel);
    if (activeTool === "structure") scrollMobilePanel(structurePanel);
    if (activeTool === "players") scrollMobilePanel(teamPanel);
    if (activeTool === "shoot") scrollMobilePanel(shootPanel);

    if (hint && !isMobileLayout()) {
      hint.hidden = !hasMap;
      const hints = {
        select:
          "<strong>Move</strong> — drag players · click <span style=\"color:#00ff9d\">green bunkers</span> on the map to assign <strong>Intel</strong>",
        players:
          "<strong>Players</strong> — choose team size, click a spawn, nudge with ghost arrows, then lock with ✓",
        brush: "<strong>Brush</strong> — draw tactics on the map · click structures for intel",
        structure:
          "<strong>Structure</strong> — drag to place · click existing for <span style=\"color:#00ff9d\">intel</span>",
        vision:
          "<strong>Vision</strong> — click a player for <span style=\"color:#ff4fc8\">pink</span> lines · lines stay on when you switch tools",
        shoot:
          "<strong>Shoot</strong> — click a runner, set shoot/run points, or target an opposing player",
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

  placePlayersBtn?.addEventListener("click", () => {
    setTool("players");
    closeToolsPanel();
  });

  placementTeamBtns.forEach((btn) => {
    btn.addEventListener("click", () => setPlacementTeam(btn.dataset.placementTeam || "a"));
  });

  playerCountInput?.addEventListener("change", () => setPlacementCount(playerCountInput.value));
  playerCountInput?.addEventListener("input", () => setPlacementCount(playerCountInput.value));
  playerCountMinus?.addEventListener("click", () => setPlacementCount(teamPlacement[activePlacementTeam].count - 1));
  playerCountPlus?.addEventListener("click", () => setPlacementCount(teamPlacement[activePlacementTeam].count + 1));

  structureStyleBtns.forEach((btn) => {
    btn.addEventListener("click", () => setActiveStructureStyle(btn.dataset.structureStyle || "filled"));
  });

  sizerStyleBtns.forEach((btn) => {
    btn.addEventListener("click", () => setSelectedStructureStyle(btn.dataset.sizerStyle || "filled"));
  });

  shootModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      shootMode = btn.dataset.shootMode || "shoot";
      shootModeBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      updateShootPanel();
    });
  });

  shootTargetPlayerInput?.addEventListener("change", () => {
    shootUseTargetPlayer = Boolean(shootTargetPlayerInput.checked);
    if (!shootUseTargetPlayer) {
      if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
      shootTargetPlayerEl = null;
      targetRunPoint = null;
    } else {
      shootPoint = null;
      shootMode = "shoot";
    }
    updateShootPanel();
    redrawShootOverlay();
  });

  shootStandStillInput?.addEventListener("change", () => {
    shootStandStill = Boolean(shootStandStillInput.checked);
    if (shootStandStill) {
      runPoint = null;
      if (shootMode === "run") shootMode = "shoot";
    }
    updateShootPanel();
    redrawShootOverlay();
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

  function getPlayerLabel(el) {
    if (!el) return "No player selected";
    const team = el.dataset.team === "a" ? "Team 1 / Alpha" : "Team 2 / Bravo";
    return `${team} ${el.dataset.num || ""}`.trim();
  }

  function getPlayerKey(el) {
    if (!el) return "";
    return `${el.dataset.team || ""}:${el.dataset.num || ""}`;
  }

  function getPlayerByKey(key) {
    const [team, num] = String(key || "").split(":");
    if (!team || !num) return null;
    return playersLayer.querySelector(`.fm-player[data-team="${team}"][data-num="${num}"]`);
  }

  function getPlayerLabelByKey(key) {
    return getPlayerLabel(getPlayerByKey(key));
  }

  function playerMatchesKey(el, key) {
    return Boolean(el && key && getPlayerKey(el) === key);
  }

  function playerAffectsShootOverlay(el) {
    if (!el) return false;
    if (el === shootPlayerEl || el === shootTargetPlayerEl) return true;
    return shootSceneSetups.some(
      (setup) => playerMatchesKey(el, setup.playerKey) || playerMatchesKey(el, setup.targetPlayerKey)
    );
  }

  function isGhostPlayer(el) {
    return el?.dataset.ghost === "true";
  }

  function clonePoint(point) {
    return point ? { x: point.x, y: point.y } : null;
  }

  function getShootSetupComplete(setup) {
    if (!setup?.playerKey) return false;
    const hasShoot = setup.useTargetPlayer
      ? Boolean(setup.targetPlayerKey)
      : Boolean(setup.shootPoint);
    if (!hasShoot) return false;
    if (setup.standStill) return true;
    return Boolean(setup.runPoint);
  }

  function getCurrentShootSetup(allowIncomplete) {
    if (!shootPlayerEl) return null;
    const setup = {
      id: activeShootSetupId || crypto.randomUUID(),
      playerKey: getPlayerKey(shootPlayerEl),
      timeSec: Math.max(0.5, Math.min(30, Number(shootTimeInput?.value) || 3)),
      useTargetPlayer: shootUseTargetPlayer,
      standStill: shootStandStill,
      targetPlayerKey: shootUseTargetPlayer ? getPlayerKey(shootTargetPlayerEl) : "",
      shootPoint: shootUseTargetPlayer ? null : clonePoint(shootPoint),
      runPoint: shootStandStill ? null : clonePoint(runPoint),
      targetRunPoint: clonePoint(targetRunPoint),
    };
    if (!allowIncomplete && !getShootSetupComplete(setup)) return null;
    return setup;
  }

  function selectShootPlayer(el) {
    const activeSetup = shootSceneSetups.find((s) => s.id === activeShootSetupId);
    if (activeSetup && activeSetup.playerKey !== getPlayerKey(el)) activeShootSetupId = null;
    if (shootPlayerEl) shootPlayerEl.classList.remove("is-shoot-selected");
    if (shootTargetPlayerEl === el) {
      shootTargetPlayerEl.classList.remove("is-shoot-target");
      shootTargetPlayerEl = null;
      targetRunPoint = null;
    }
    shootPlayerEl = el;
    if (shootPlayerEl) shootPlayerEl.classList.add("is-shoot-selected");
    if (shootTargetPlayerEl && shootTargetPlayerEl.dataset.team === shootPlayerEl.dataset.team) {
      shootTargetPlayerEl.classList.remove("is-shoot-target");
      shootTargetPlayerEl = null;
      targetRunPoint = null;
    }
    updateShootPanel();
    redrawShootOverlay();
  }

  function selectShootTargetPlayer(el) {
    if (!shootPlayerEl || !el || el === shootPlayerEl) return;
    if (el.dataset.team === shootPlayerEl.dataset.team) return;
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootTargetPlayerEl = el;
    shootTargetPlayerEl.classList.add("is-shoot-target");
    shootPoint = null;
    updateShootPanel();
    redrawShootOverlay();
  }

  function clearShootSceneDots() {
    shootSceneDotAnim = null;
  }

  function clearShootPlan() {
    if (runAnimationFrame) {
      cancelAnimationFrame(runAnimationFrame);
      runAnimationFrame = null;
    }
    clearShootSceneDots();
    if (shootPlayerEl) shootPlayerEl.classList.remove("is-shoot-selected");
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootPlayerEl = null;
    shootTargetPlayerEl = null;
    shootUseTargetPlayer = false;
    shootStandStill = false;
    if (shootTargetPlayerInput) shootTargetPlayerInput.checked = false;
    if (shootStandStillInput) shootStandStillInput.checked = false;
    shootPoint = null;
    runPoint = null;
    targetRunPoint = null;
    lastRunStartPositions = null;
    activeShootSetupId = null;
    updateShootPanel();
    redrawShootOverlay();
  }

  function updateShootPanel() {
    const hasPlayer = Boolean(shootPlayerEl);
    const currentSetup = getCurrentShootSetup(false);
    if (shootEmpty) shootEmpty.hidden = hasPlayer;
    if (shootControls) shootControls.hidden = !hasPlayer;
    if (shootPlayerLabel) shootPlayerLabel.textContent = getPlayerLabel(shootPlayerEl);
    if (shootStandStillInput) shootStandStillInput.checked = shootStandStill;
    if (shootTargetStatus) {
      if (!shootUseTargetPlayer) {
        shootTargetStatus.textContent = "Shoot point is a map spot.";
      } else if (shootTargetPlayerEl) {
        shootTargetStatus.textContent = `Target player: ${getPlayerLabel(shootTargetPlayerEl)}`;
      } else {
        shootTargetStatus.textContent = "Tap an opposing player to make them the shoot point.";
      }
    }
    if (shootRunBtn) {
      shootRunBtn.disabled = !hasMap || !currentSetup;
      shootRunBtn.textContent = shootStandStill ? "Play shoot" : "Run selected player";
    }
    if (shootResetRunBtn) shootResetRunBtn.disabled = !lastRunStartPositions;
    if (shootSaveSetupBtn) {
      shootSaveSetupBtn.disabled = !currentSetup;
      shootSaveSetupBtn.textContent = activeShootSetupId ? "Update player setup" : "Save player setup";
    }
    if (shootPlaySceneBtn) {
      shootPlaySceneBtn.disabled = !shootSceneSetups.some(getShootSetupComplete);
    }
    if (shootResetSceneBtn) shootResetSceneBtn.disabled = !lastRunStartPositions;
    if (shootClearSceneBtn) shootClearSceneBtn.disabled = shootSceneSetups.length === 0;
    if (shootSceneCount) {
      shootSceneCount.textContent = `${shootSceneSetups.length} saved`;
    }
    shootModeBtns.forEach((btn) => {
      const mode = btn.dataset.shootMode;
      const isRun = mode === "run";
      btn.disabled = isRun && shootStandStill;
      btn.classList.toggle("is-active", mode === shootMode);
      if (mode === "shoot") {
        btn.textContent = shootUseTargetPlayer ? "Pick target" : "Set shoot";
      }
    });
    renderShootSceneList();
  }

  function renderShootSceneList() {
    if (!shootSceneList) return;
    shootSceneList.innerHTML = "";
    shootSceneSetups.forEach((setup) => {
      const li = document.createElement("li");
      li.className = "fm-shoot-scene-item";

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "fm-shoot-scene-load";
      if (setup.id === activeShootSetupId) loadBtn.classList.add("is-active");

      const name = document.createElement("span");
      name.className = "fm-shoot-scene-name";
      name.textContent = getPlayerLabelByKey(setup.playerKey);

      const meta = document.createElement("span");
      meta.className = "fm-shoot-scene-meta";
      const targetLabel = setup.useTargetPlayer
        ? `shoots ${getPlayerLabelByKey(setup.targetPlayerKey)}`
        : "shoots map point";
      meta.textContent = setup.standStill
        ? `${targetLabel} · stands still`
        : `${targetLabel} · runs ${setup.timeSec || 3}s`;

      loadBtn.append(name, meta);
      loadBtn.addEventListener("click", () => loadShootSetup(setup.id));

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "fm-shoot-scene-remove";
      removeBtn.setAttribute("aria-label", `Remove ${getPlayerLabelByKey(setup.playerKey)} setup`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => removeShootSetup(setup.id));

      li.append(loadBtn, removeBtn);
      shootSceneList.append(li);
    });
  }

  function loadShootSetup(id) {
    const setup = shootSceneSetups.find((s) => s.id === id);
    if (!setup) return;
    const player = getPlayerByKey(setup.playerKey);
    if (!player) return;

    activeShootSetupId = setup.id;
    selectShootPlayer(player);
    activeShootSetupId = setup.id;

    shootUseTargetPlayer = Boolean(setup.useTargetPlayer);
    shootStandStill = Boolean(setup.standStill) || !setup.runPoint;
    if (shootTargetPlayerInput) shootTargetPlayerInput.checked = shootUseTargetPlayer;
    if (shootStandStillInput) shootStandStillInput.checked = shootStandStill;
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootTargetPlayerEl = shootUseTargetPlayer ? getPlayerByKey(setup.targetPlayerKey) : null;
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.add("is-shoot-target");

    shootPoint = clonePoint(setup.shootPoint);
    runPoint = shootStandStill ? null : clonePoint(setup.runPoint);
    targetRunPoint = clonePoint(setup.targetRunPoint);
    if (shootTimeInput) shootTimeInput.value = String(setup.timeSec || 3);
    shootMode = "shoot";

    updateShootPanel();
    redrawShootOverlay();
  }

  function removeShootSetup(id) {
    shootSceneSetups = shootSceneSetups.filter((s) => s.id !== id);
    if (activeShootSetupId === id) activeShootSetupId = null;
    updateShootPanel();
    redrawShootOverlay();
  }

  function saveShootSetup() {
    const setup = getCurrentShootSetup(false);
    if (!setup) return;
    const existingIndex = shootSceneSetups.findIndex((s) => s.id === setup.id);
    if (existingIndex >= 0) {
      shootSceneSetups[existingIndex] = setup;
    } else {
      const samePlayerIndex = shootSceneSetups.findIndex((s) => s.playerKey === setup.playerKey);
      if (samePlayerIndex >= 0) {
        setup.id = shootSceneSetups[samePlayerIndex].id;
        shootSceneSetups[samePlayerIndex] = setup;
      } else {
        shootSceneSetups.push(setup);
      }
      activeShootSetupId = setup.id;
    }
    updateShootPanel();
    redrawShootOverlay();
  }

  function newShootSetup() {
    activeShootSetupId = null;
    if (shootPlayerEl) shootPlayerEl.classList.remove("is-shoot-selected");
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootPlayerEl = null;
    shootTargetPlayerEl = null;
    shootPoint = null;
    runPoint = null;
    targetRunPoint = null;
    shootUseTargetPlayer = false;
    shootStandStill = false;
    if (shootTargetPlayerInput) shootTargetPlayerInput.checked = false;
    if (shootStandStillInput) shootStandStillInput.checked = false;
    shootMode = "shoot";
    updateShootPanel();
    redrawShootOverlay();
  }

  function clearShootScene() {
    shootSceneSetups = [];
    activeShootSetupId = null;
    resetShootRun();
    updateShootPanel();
    redrawShootOverlay();
  }

  function normalizeLayerPoint(point) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return null;
    return {
      x: Math.max(0, Math.min(1, point.x / w)),
      y: Math.max(0, Math.min(1, point.y / h)),
    };
  }

  function denormalizePoint(point) {
    const { w, h } = getCanvasSize();
    return { x: point.x * w, y: point.y * h };
  }

  function rayCastToPoint(start, target, w, h) {
    const vx = target.x - start.x;
    const vy = target.y - start.y;
    const distance = Math.hypot(vx, vy);
    if (distance <= 0.5) return { end: target, blocked: false };

    const dx = vx / distance;
    const dy = vy / distance;
    let tLimit = distance;

    structures.forEach((shape) => {
      const t = rayStructureHitT(start.x, start.y, dx, dy, shape, w, h);
      if (t !== null && t < tLimit) tLimit = t;
    });

    return {
      end: { x: start.x + dx * tLimit, y: start.y + dy * tLimit },
      blocked: tLimit < distance - 0.5,
    };
  }

  function drawPointMarker(context, point, color, label) {
    const { x, y } = denormalizePoint(point);
    context.save();
    context.beginPath();
    context.setLineDash([]);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.miterLimit = 2;
    context.fillStyle = color;
    context.strokeStyle = "#0f1210";
    context.lineWidth = 2;
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath();
    context.font = "700 11px Outfit, sans-serif";
    context.textBaseline = "bottom";
    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(0, 0, 0, 0.75)";
    context.lineWidth = 3;
    context.strokeText(label, x + 9, y - 7);
    context.fillText(label, x + 9, y - 7);
    context.restore();
    context.beginPath();
  }

  function strokeShootLine(context, start, end, color, width, dash) {
    context.save();
    context.beginPath();
    context.setLineDash(dash || []);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.miterLimit = 2;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.restore();
    context.beginPath();
  }

  function drawShootDot(context, point, color, radius) {
    context.save();
    context.beginPath();
    context.setLineDash([]);
    context.fillStyle = color;
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.restore();
    context.beginPath();
  }

  function getSetupShootLine(setup) {
    const { w, h } = getCanvasSize();
    const playerEl = getPlayerByKey(setup.playerKey);
    if (!playerEl || !w || !h) return null;

    const player = getPlayerCenterPx(playerEl);
    const start = { x: player.x, y: player.y };
    const targetPlayerEl = setup.useTargetPlayer ? getPlayerByKey(setup.targetPlayerKey) : null;
    const shootTarget =
      setup.useTargetPlayer && targetPlayerEl
        ? getPlayerCenterPx(targetPlayerEl)
        : setup.shootPoint
        ? denormalizePoint(setup.shootPoint)
        : null;
    if (!shootTarget) return null;

    const target = { x: shootTarget.x, y: shootTarget.y };
    const shot = rayCastToPoint(start, target, w, h);
    return {
      start,
      end: shot.end,
      blocked: shot.blocked,
      color: shot.blocked ? SHOOT_BLOCKED_COLOR : SHOOT_LINE_COLOR,
    };
  }

  function spawnShootSceneDot(setup, bornAt) {
    const line = getSetupShootLine(setup);
    if (!line || !shootSceneDotAnim) return;
    shootSceneDotAnim.dots.push({
      bornAt,
      travelMs: shootSceneDotAnim.travelMs,
      start: { x: line.start.x, y: line.start.y },
      end: { x: line.end.x, y: line.end.y },
      color: line.color,
    });
  }

  function startShootSceneDots(setups) {
    const lines = setups.filter((setup) => getSetupShootLine(setup));
    if (!lines.length) {
      clearShootSceneDots();
      return;
    }

    const now = performance.now();
    shootSceneDotAnim = {
      setups: lines,
      setupIds: new Set(lines.map((setup) => setup.id)),
      dots: [],
      lastSpawnAt: new Map(),
      startedAt: now,
      spawnMs: SHOOT_DOT_SPAWN_MS,
      travelMs: SHOOT_DOT_TRAVEL_MS,
      spawning: true,
    };
    lines.forEach((setup) => {
      spawnShootSceneDot(setup, now);
      shootSceneDotAnim.lastSpawnAt.set(setup.id, now);
    });
  }

  function updateShootSceneDots(now) {
    if (!shootSceneDotAnim) return;
    shootSceneDotAnim.dots = shootSceneDotAnim.dots.filter((dot) => now - dot.bornAt < dot.travelMs);
    if (!shootSceneDotAnim.spawning) return;

    shootSceneDotAnim.setups.forEach((setup) => {
      let last = shootSceneDotAnim.lastSpawnAt.get(setup.id) ?? shootSceneDotAnim.startedAt;
      while (now - last >= shootSceneDotAnim.spawnMs) {
        last += shootSceneDotAnim.spawnMs;
        spawnShootSceneDot(setup, last);
      }
      shootSceneDotAnim.lastSpawnAt.set(setup.id, last);
    });
  }

  function drawShootSceneDots() {
    if (!shootSceneDotAnim?.dots.length) return;
    const now = performance.now();
    shootSceneDotAnim.dots.forEach((dot) => {
      const t = Math.min(1, (now - dot.bornAt) / dot.travelMs);
      const eased = t * (2 - t);
      drawShootDot(
        shootCtx,
        {
          x: dot.start.x + (dot.end.x - dot.start.x) * eased,
          y: dot.start.y + (dot.end.y - dot.start.y) * eased,
        },
        dot.color,
        4
      );
    });
  }

  function drawShootSetupOverlay(setup, muted) {
    const { w, h } = getCanvasSize();
    const playerEl = getPlayerByKey(setup.playerKey);
    if (!playerEl || !w || !h) return;

    const player = getPlayerCenterPx(playerEl);
    const start = { x: player.x, y: player.y };
    const targetPlayerEl = setup.useTargetPlayer ? getPlayerByKey(setup.targetPlayerKey) : null;
    const shootTarget =
      setup.useTargetPlayer && targetPlayerEl
        ? getPlayerCenterPx(targetPlayerEl)
        : setup.shootPoint
        ? denormalizePoint(setup.shootPoint)
        : null;

    shootCtx.save();
    shootCtx.globalAlpha = muted ? 0.55 : 1;
    shootCtx.setLineDash([]);
    shootCtx.lineCap = "round";
    shootCtx.lineJoin = "round";
    shootCtx.miterLimit = 2;
    shootCtx.beginPath();

    if (setup.shootPoint && !setup.useTargetPlayer) {
      drawPointMarker(shootCtx, setup.shootPoint, SHOOT_LINE_COLOR, "Shoot");
    }
    if (setup.runPoint) drawPointMarker(shootCtx, setup.runPoint, RUN_POINT_COLOR, "Run");
    if (setup.targetRunPoint) {
      drawPointMarker(shootCtx, setup.targetRunPoint, SHOOT_BLOCKED_COLOR, "Target run");
    }

    if (shootTarget) {
      const target = { x: shootTarget.x, y: shootTarget.y };
      const shot = rayCastToPoint(start, target, w, h);
      strokeShootLine(
        shootCtx,
        start,
        shot.end,
        shot.blocked ? SHOOT_BLOCKED_COLOR : SHOOT_LINE_COLOR,
        muted ? 2 : 3
      );
      if (shot.blocked) {
        drawShootDot(shootCtx, shot.end, SHOOT_BLOCKED_COLOR, muted ? 4 : 5);
      }
    }

    if (setup.runPoint) {
      const run = denormalizePoint(setup.runPoint);
      strokeShootLine(shootCtx, start, run, RUN_POINT_COLOR, muted ? 2 : 3, [8, 6]);
    }

    if (setup.useTargetPlayer && setup.targetPlayerKey && setup.targetRunPoint) {
      const targetEl = getPlayerByKey(setup.targetPlayerKey);
      if (targetEl) {
        const targetStart = getPlayerCenterPx(targetEl);
        const targetRun = denormalizePoint(setup.targetRunPoint);
        strokeShootLine(shootCtx, targetStart, targetRun, SHOOT_BLOCKED_COLOR, muted ? 2 : 3, [4, 6]);
      }
    }

    shootCtx.restore();
    shootCtx.beginPath();
  }

  function redrawShootOverlay() {
    const { w, h } = getCanvasSize();
    shootCtx.save();
    shootCtx.setTransform(1, 0, 0, 1, 0, 0);
    shootCtx.clearRect(0, 0, shootCanvas.width, shootCanvas.height);
    shootCtx.restore();
    shootCtx.beginPath();
    if (!w || !h) return;

    shootSceneSetups.forEach((setup) => {
      if (setup.id !== activeShootSetupId) drawShootSetupOverlay(setup, true);
    });

    const currentSetup = getCurrentShootSetup(true);
    if (currentSetup) drawShootSetupOverlay(currentSetup, false);
    drawShootSceneDots();
  }

  function setShootPointFromEvent(e) {
    if (activeTool !== "shoot" || !hasMap || !shootPlayerEl) return;
    e.preventDefault();
    const point = normalizeLayerPoint(getLayerPoint(e, shootCanvas));
    if (!point) return;
    if (shootMode === "run") {
      if (shootStandStill) return;
      runPoint = point;
      shootStandStill = false;
      if (shootStandStillInput) shootStandStillInput.checked = false;
    } else if (!shootUseTargetPlayer) {
      shootPoint = point;
    }
    updateShootPanel();
    redrawShootOverlay();
  }

  function getPlayerPercentPosition(el) {
    return {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
    };
  }

  function getSetupRunners(setup) {
    if (setup.standStill || !setup.runPoint) return [];
    const playerEl = getPlayerByKey(setup.playerKey);
    if (!playerEl) return [];
    const runners = [
      {
        key: setup.playerKey,
        el: playerEl,
        point: setup.runPoint,
        duration: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000,
      },
    ];
    if (setup.useTargetPlayer && setup.targetPlayerKey && setup.targetRunPoint) {
      const targetEl = getPlayerByKey(setup.targetPlayerKey);
      if (targetEl) {
        runners.push({
          key: setup.targetPlayerKey,
          el: targetEl,
          point: setup.targetRunPoint,
          duration: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000,
        });
      }
    }
    return runners;
  }

  function getSetupDurationMs(setup) {
    return Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000;
  }

  function runShootSetups(setups, options = {}) {
    if (!setups.length) return;
    const runners = setups.flatMap(getSetupRunners);
    const useSceneDots = Boolean(options.sceneDots);
    const playDots = useSceneDots || setups.every((setup) => setup.standStill || !setup.runPoint);
    const holdMs = Math.max(0, ...setups.map(getSetupDurationMs));
    if (!runners.length && !playDots) return;
    if (runAnimationFrame) cancelAnimationFrame(runAnimationFrame);

    if (playDots) startShootSceneDots(setups);
    else clearShootSceneDots();

    const startedAt = performance.now();
    const startByKey = new Map();
    runners.forEach(({ key, el }) => {
      if (!startByKey.has(key)) startByKey.set(key, { el, ...getPlayerPercentPosition(el) });
    });
    lastRunStartPositions = runners.length ? Array.from(startByKey.values()) : null;
    updateShootPanel();

    const step = (now) => {
      let stillRunning = false;
      if (shootSceneDotAnim) updateShootSceneDots(now);

      if (runners.length) {
        runners.forEach(({ key, el, point, duration }) => {
          const start = startByKey.get(key);
          if (!start) return;
          const t = Math.min(1, (now - startedAt) / duration);
          if (t < 1) stillRunning = true;
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const endX = point.x * 100;
          const endY = point.y * 100;
          positionPlayer(el, start.x + (endX - start.x) * eased, start.y + (endY - start.y) * eased);
          if (visionPlayerEl === el) redrawVisionLines();
        });
      } else if (playDots && now - startedAt < holdMs) {
        stillRunning = true;
      }

      redrawShootOverlay();

      const dotsRemaining = Boolean(shootSceneDotAnim?.dots.length);
      if (stillRunning) {
        runAnimationFrame = requestAnimationFrame(step);
        return;
      }

      if (shootSceneDotAnim?.spawning) {
        shootSceneDotAnim.spawning = false;
        runAnimationFrame = requestAnimationFrame(step);
        return;
      }

      if (dotsRemaining) {
        runAnimationFrame = requestAnimationFrame(step);
        return;
      }

      runAnimationFrame = null;
      clearShootSceneDots();
      updateShootPanel();
    };

    runAnimationFrame = requestAnimationFrame(step);
  }

  function runShootPlayer() {
    const setup = getCurrentShootSetup(false);
    if (!setup) return;
    runShootSetups([setup]);
  }

  function runShootScene() {
    const readySetups = shootSceneSetups.filter(getShootSetupComplete);
    if (!readySetups.length) return;
    runShootSetups(readySetups, { sceneDots: true });
  }

  function resetShootRun() {
    if (!lastRunStartPositions) return;
    if (runAnimationFrame) {
      cancelAnimationFrame(runAnimationFrame);
      runAnimationFrame = null;
    }
    clearShootSceneDots();
    lastRunStartPositions.forEach(({ el, x, y }) => {
      if (!el?.isConnected) return;
      positionPlayer(el, x, y);
      if (visionPlayerEl === el) redrawVisionLines();
    });
    lastRunStartPositions = null;
    updateShootPanel();
    redrawShootOverlay();
  }

  function getSelectedStructure() {
    return structures.find((s) => s.id === selectedStructureId) || null;
  }

  function snapshotSizerShape(shape) {
    return {
      id: shape.id,
      x1: shape.x1,
      y1: shape.y1,
      x2: shape.x2,
      y2: shape.y2,
    };
  }

  function hasSizerUndo() {
    return Boolean(sizerUndoState && structures.some((s) => s.id === sizerUndoState.id));
  }

  function rememberSizerUndo(shape) {
    sizerUndoState = snapshotSizerShape(shape);
    updateControlStates();
  }

  function clearSizerUndo() {
    activeSizerEdit = null;
    sizerUndoState = null;
    updateControlStates();
  }

  function beginSizerEdit(shape, key) {
    if (!shape) return;
    if (activeSizerEdit?.key === key && activeSizerEdit.id === shape.id) return;
    activeSizerEdit = { key, id: shape.id };
    rememberSizerUndo(shape);
  }

  function endSizerEdit() {
    activeSizerEdit = null;
  }

  function undoSizerChange() {
    if (!hasSizerUndo()) {
      clearSizerUndo();
      return;
    }
    const shape = structures.find((s) => s.id === sizerUndoState.id);
    if (!shape) return;
    shape.x1 = sizerUndoState.x1;
    shape.y1 = sizerUndoState.y1;
    shape.x2 = sizerUndoState.x2;
    shape.y2 = sizerUndoState.y2;
    selectedStructureId = shape.id;
    clearSizerUndo();
    updateSizerPanel();
    redrawStructures();
    redrawShootOverlay();
    updateIntelReport();
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
    const style = normalizeStructureFill(shape.fill);
    shape.fill = style;
    sizerStyleBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sizerStyle === style);
    });

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
    if ((axis === "width" && n === widthPct) || (axis === "height" && n === heightPct)) {
      updateSizerPanel();
      return;
    }
    beginSizerEdit(shape, axis);
    if (axis === "width") setStructureSize(shape, n, heightPct);
    else setStructureSize(shape, widthPct, n);
    updateSizerPanel();
    redrawStructures();
    redrawShootOverlay();
  }

  function bindSizerInputs() {
    const bindPair = (rangeEl, numEl, axis) => {
      rangeEl?.addEventListener("input", () => onSizerAxisInput(axis, rangeEl.value));
      rangeEl?.addEventListener("change", endSizerEdit);
      rangeEl?.addEventListener("pointerup", endSizerEdit);
      rangeEl?.addEventListener("blur", endSizerEdit);
      numEl?.addEventListener("input", () => onSizerAxisInput(axis, numEl.value));
      numEl?.addEventListener("change", () => {
        onSizerAxisInput(axis, numEl.value);
        endSizerEdit();
      });
      numEl?.addEventListener("blur", endSizerEdit);
    };
    bindPair(sizerWidth, sizerWidthNum, "width");
    bindPair(sizerHeight, sizerHeightNum, "height");

    document.querySelectorAll(".fm-pad-btn[data-move]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const shape = getSelectedStructure();
        if (!shape) return;
        rememberSizerUndo(shape);
        endSizerEdit();
        moveStructure(shape, btn.dataset.move);
        redrawStructures();
        redrawShootOverlay();
      });
    });

    undoSizerBtn?.addEventListener("click", undoSizerChange);
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
      fill: "filled",
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
    persistFieldState();
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
    persistFieldState();
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

  function drawShapeOnContext(context, shape, w, h, preview, bake) {
    const x1 = shape.x1 * w;
    const y1 = shape.y1 * h;
    const x2 = shape.x2 * w;
    const y2 = shape.y2 * h;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    if (width < 2 && height < 2) return;
    const style = normalizeStructureFill(shape.fill);
    shape.fill = style;
    const isBorderOnly = style === "border";
    const isTransparentWall = style === "transparent";

    context.save();
    if (bake) {
      context.fillStyle = isTransparentWall ? "rgba(0, 0, 0, 0)" : STRUCTURE_GREEN;
      context.strokeStyle = STRUCTURE_GREEN;
      context.lineWidth = Math.max(2, Math.min(w, h) * 0.006);
    } else {
      context.fillStyle = isBorderOnly
        ? preview
          ? "rgba(0, 255, 157, 0.12)"
          : "rgba(0, 255, 157, 0.03)"
        : isTransparentWall
        ? preview
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.015)"
        : preview
        ? "rgba(0, 255, 157, 0.35)"
        : STRUCTURE_GREEN;
      context.strokeStyle = isTransparentWall
        ? preview
          ? "rgba(255, 255, 255, 0.55)"
          : "rgba(255, 255, 255, 0.25)"
        : preview
        ? "rgba(0, 255, 157, 0.8)"
        : "#00cc7a";
      context.lineWidth = isBorderOnly || isTransparentWall ? 2.5 : preview ? 2 : 1.5;
      if ((isBorderOnly || isTransparentWall) && !preview) context.setLineDash([8, 5]);
    }
    const shouldFill = bake ? style === "filled" : !isBorderOnly || preview;
    const shouldStroke = !bake || isBorderOnly;

    if (shape.type === "rectangle") {
      if (shouldFill) context.fillRect(left, top, width, height);
      if (shouldStroke) context.strokeRect(left, top, width, height);
    } else if (shape.type === "circle") {
      const cx = left + width / 2;
      const cy = top + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      context.beginPath();
      context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      if (shouldFill) context.fill();
      if (shouldStroke) context.stroke();
    } else if (shape.type === "triangle") {
      context.beginPath();
      context.moveTo(left + width / 2, top);
      context.lineTo(left + width, top + height);
      context.lineTo(left, top + height);
      context.closePath();
      if (shouldFill) context.fill();
      if (shouldStroke) context.stroke();
    }

    context.restore();
  }

  function serializeFieldState() {
    return {
      version: 1,
      report: { name: fieldIntelReport.name || "", bio: fieldIntelReport.bio || "" },
      structures: structures.map((s) => ({
        type: s.type,
        x1: s.x1,
        y1: s.y1,
        x2: s.x2,
        y2: s.y2,
        fill: normalizeStructureFill(s.fill),
        name: s.name || "",
        bio: s.bio || "",
      })),
      shootScene: shootSceneSetups.map((setup) => ({
        playerKey: setup.playerKey,
        timeSec: setup.timeSec,
        useTargetPlayer: Boolean(setup.useTargetPlayer),
        standStill: Boolean(setup.standStill),
        targetPlayerKey: setup.targetPlayerKey || "",
        shootPoint: clonePoint(setup.shootPoint),
        runPoint: setup.standStill ? null : clonePoint(setup.runPoint),
        targetRunPoint: clonePoint(setup.targetRunPoint),
      })),
    };
  }

  function persistFieldState() {
    try {
      localStorage.setItem(FIELD_STATE_KEY, JSON.stringify(serializeFieldState()));
    } catch {
      /* storage full or blocked */
    }
  }

  function boundsIoU(a, b) {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.left + a.width, b.left + b.width);
    const bottom = Math.min(a.top + a.height, b.top + b.height);
    if (right <= left || bottom <= top) return 0;
    const inter = (right - left) * (bottom - top);
    const union = a.width * a.height + b.width * b.height - inter;
    return union > 0 ? inter / union : 0;
  }

  function mergeIntelFromSavedState() {
    try {
      const raw = localStorage.getItem(FIELD_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.report) {
        fieldIntelReport = {
          name: saved.report.name || "",
          bio: saved.report.bio || "",
        };
      }
      const prev = saved.structures || [];
      if (!prev.length || !structures.length) return;

      structures.forEach((shape) => {
        const sb = getStructureBounds(shape);
        let best = null;
        let bestIoU = 0;
        prev.forEach((p) => {
          const pb = {
            left: Math.min(p.x1, p.x2),
            top: Math.min(p.y1, p.y2),
            width: Math.abs(p.x2 - p.x1),
            height: Math.abs(p.y2 - p.y1),
          };
          const iou = boundsIoU(sb, pb);
          if (iou > bestIoU) {
            bestIoU = iou;
            best = p;
          }
        });
        if (best && bestIoU >= 0.35) {
          if (best.name) shape.name = best.name;
          if (best.bio) shape.bio = best.bio;
          if (best.fill) shape.fill = normalizeStructureFill(best.fill);
        }
      });
    } catch {
      /* ignore corrupt storage */
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function getPackFolderName() {
    return `paintballer-field-${new Date().toISOString().slice(0, 10)}`;
  }

  function renderMapToBlob() {
    return new Promise((resolve) => {
      if (!hasMap || !image.naturalWidth) {
        resolve(null);
        return;
      }
      const nw = image.naturalWidth;
      const nh = image.naturalHeight;
      const off = document.createElement("canvas");
      off.width = nw;
      off.height = nh;
      const octx = off.getContext("2d");
      if (!octx) {
        resolve(null);
        return;
      }
      octx.drawImage(image, 0, 0, nw, nh);
      if (canvas.width > 0 && canvas.height > 0) {
        octx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, nw, nh);
      }
      structures.forEach((s) => drawShapeOnContext(octx, s, nw, nh, false, true));
      off.toBlob((blob) => resolve(blob), "image/png", 1);
    });
  }

  async function saveMapPack() {
    if (!hasMap || !image.naturalWidth || typeof JSZip === "undefined") return;

    const pngBlob = await renderMapToBlob();
    if (!pngBlob) return;

    persistFieldState();
    const folderName = getPackFolderName();
    const state = serializeFieldState();
    const zip = new JSZip();
    const folder = zip.folder(folderName);
    folder.file("map.png", pngBlob);
    folder.file("intel.json", JSON.stringify(state, null, 2));

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    downloadBlob(zipBlob, `${folderName}.zip`);
  }

  function mimeFromFilename(name) {
    const match = String(name).match(/\.(png|jpe?g|webp|gif)$/i);
    if (!match) return "";
    const ext = match[1].toLowerCase();
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "webp") return "image/webp";
    if (ext === "gif") return "image/gif";
    return "";
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.startsWith("image/")) return true;
    return Boolean(mimeFromFilename(file.name));
  }

  function findPackFiles(files) {
    const list = Array.from(files);
    const jsonFile =
      list.find((f) => /^intel\.json$/i.test(f.name)) ||
      list.find((f) => /\.json$/i.test(f.name) && /intel|paintballer/i.test(f.name)) ||
      list.find((f) => /\.json$/i.test(f.name));
    const imageFile =
      list.find((f) => /^map\.(png|jpe?g|webp)$/i.test(f.name)) ||
      list.find(isImageFile);
    return { jsonFile, imageFile };
  }

  function parsePackState(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("Invalid pack");
    return data;
  }

  function applyPackState(state) {
    if (state.report) {
      fieldIntelReport = {
        name: state.report.name || "",
        bio: state.report.bio || "",
      };
    }
    shootSceneSetups = Array.isArray(state.shootScene)
      ? state.shootScene.map((setup) => {
          const standStill = Boolean(setup.standStill) || !setup.runPoint;
          return {
            id: crypto.randomUUID(),
            playerKey: setup.playerKey || "",
            timeSec: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)),
            useTargetPlayer: Boolean(setup.useTargetPlayer),
            standStill,
            targetPlayerKey: setup.targetPlayerKey || "",
            shootPoint: clonePoint(setup.shootPoint),
            runPoint: standStill ? null : clonePoint(setup.runPoint),
            targetRunPoint: clonePoint(setup.targetRunPoint),
          };
        })
      : [];
    activeShootSetupId = null;
    try {
      localStorage.setItem(FIELD_STATE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    if (!Array.isArray(state.structures) || !state.structures.length) return;

    structures = state.structures.map((s) => ({
      id: crypto.randomUUID(),
      type: s.type || "rectangle",
      x1: s.x1,
      y1: s.y1,
      x2: s.x2,
      y2: s.y2,
      name: s.name || "",
      bio: s.bio || "",
      fill: normalizeStructureFill(s.fill),
      detected: true,
    }));
  }

  function loadMapImageFromFile(file, packState) {
    if (!isImageFile(file)) return false;

    pendingPackState = packState || null;
    const reader = new FileReader();
    reader.onload = () => {
      image.onload = () => {
        showMapUI();
        closeToolsPanel();
        stageWrap?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      image.onerror = () => {
        pendingPackState = null;
        window.alert("Could not load the map image from this pack.");
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      pendingPackState = null;
      window.alert("Could not read the map image from this pack.");
    };
    reader.readAsDataURL(file);
    return true;
  }

  async function handleMapPackZip(file) {
    if (!file) return;
    if (typeof JSZip === "undefined") {
      window.alert("Map pack upload is not available. Check your connection and refresh the page.");
      return;
    }
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
    const blobs = await Promise.all(
      entries.map(async (path) => {
        const name = path.split("/").pop();
        const blob = await zip.files[path].async("blob");
        const mime = blob.type || mimeFromFilename(name);
        return new File([blob], name, { type: mime || "application/octet-stream" });
      })
    );
    await handleMapPackFiles(blobs);
  }

  async function handleMapPackFiles(files) {
    const { jsonFile, imageFile } = findPackFiles(files);
    if (!imageFile) {
      window.alert("Map pack needs map.png (or another image) in the folder.");
      return;
    }

    let packState = null;
    if (jsonFile) {
      try {
        packState = parsePackState(await jsonFile.text());
      } catch {
        window.alert("Could not read intel.json from the map pack.");
        return;
      }
    }

    if (!loadMapImageFromFile(imageFile, packState)) {
      window.alert("Could not load map.png from the map pack.");
    }
  }

  async function openMapPackUpload() {
    if (!isMobileLayout() && "showDirectoryPicker" in window) {
      try {
        const dir = await window.showDirectoryPicker({ mode: "read" });
        const files = [];
        for await (const entry of dir.values()) {
          if (entry.kind === "file") files.push(await entry.getFile());
        }
        if (files.length) {
          await handleMapPackFiles(files);
          return;
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    if (!isMobileLayout() && mapPackFolderInput) {
      mapPackFolderInput.click();
      return;
    }

    mapPackZipInput?.click();
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
    redrawShootOverlay();
  }

  function resizeCanvases() {
    if (!hasMap || !image.naturalWidth) return;

    const w = image.offsetWidth;
    const h = image.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newW = Math.floor(w * dpr);
    const newH = Math.floor(h * dpr);

    [canvas, structureCanvas, visionCanvas, shootCanvas].forEach((c) => {
      const isVisionLayer = c === visionCanvas;
      let snapshot = null;
      const cctx = c.getContext("2d");
      const shouldSnapshot = !isVisionLayer && c !== shootCanvas;
      if (shouldSnapshot && c.width > 0 && c.height > 0) {
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
    redrawShootOverlay();
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
          fill: "filled",
          detected: true,
        });
      }
    }

    return found;
  }

  function clearTeamControls() {
    playersLayer.querySelectorAll(".fm-team-nudges").forEach((el) => el.remove());
  }

  function removeTeamPlayers(team) {
    playersLayer.querySelectorAll(`.fm-player[data-team="${team}"]`).forEach((el) => {
      if (isGhostPlayer(el)) {
        el.remove();
        return;
      }
      if (visionPlayerEl === el) clearVisionLines();
      if (shootPlayerEl === el || shootTargetPlayerEl === el) clearShootPlan();
      el.remove();
    });
  }

  function createPlayerElement(team, n) {
    const el = document.createElement("div");
    el.className = `fm-player team-${team}`;
    el.dataset.team = team;
    el.dataset.num = String(n);
    el.textContent = String(n);
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${getTeamLabel(team)} player ${n}`);
    playersLayer.appendChild(el);
    bindPlayerDrag(el);
    return el;
  }

  function createTeamPlayers(team, count, ghost) {
    removeTeamPlayers(team);
    for (let n = 1; n <= count; n++) {
      const el = createPlayerElement(team, n);
      el.dataset.ghost = ghost ? "true" : "false";
    }
  }

  function getTeamPlayers(team) {
    return Array.from(playersLayer.querySelectorAll(`.fm-player[data-team="${team}"]`));
  }

  function getTeamStackPositions(spawn, count) {
    const x = Math.max(2, Math.min(98, spawn.x));
    if (count <= 0) return [];
    const preferredSpacing = count <= 5 ? 2.6 : 2.2;
    const halfCount = (count - 1) / 2;
    const availableHalf = Math.max(0, Math.min(spawn.y - 2, 98 - spawn.y));
    const spacing = halfCount > 0 ? Math.min(preferredSpacing, availableHalf / halfCount) : 0;
    return Array.from({ length: count }, (_, index) => ({
      x,
      y: Math.max(2, Math.min(98, spawn.y + spacing * (index - halfCount))),
    }));
  }

  function setTeamPlayerState(team) {
    const state = teamPlacement[team];
    getTeamPlayers(team).forEach((el) => {
      const isGhost = state.placed && !state.locked;
      el.dataset.ghost = isGhost ? "true" : "false";
      el.classList.toggle("is-team-ghost", isGhost);
      el.setAttribute(
        "aria-label",
        `${isGhost ? "Ghost " : ""}${getTeamLabel(team)} player ${el.dataset.num || ""}`.trim()
      );
    });
  }

  function renderTeamNudges() {
    clearTeamControls();
    ["a", "b"].forEach((team) => {
      const state = teamPlacement[team];
      if (!state.placed || state.locked || !state.spawn) return;
      const controls = document.createElement("div");
      controls.className = "fm-team-nudges";
      controls.dataset.team = team;
      controls.style.left = `${state.spawn.x}%`;
      controls.style.top = `${state.spawn.y}%`;

      [
        ["up", "▲"],
        ["left", "◀"],
        ["right", "▶"],
        ["down", "▼"],
        ["lock", "✓"],
      ].forEach(([direction, label]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fm-team-nudge";
        btn.dataset.direction = direction;
        btn.setAttribute(
          "aria-label",
          direction === "lock" ? `Lock ${getTeamLabel(team)}` : `Nudge ${getTeamLabel(team)} ${direction}`
        );
        btn.textContent = label;
        btn.addEventListener("pointerdown", (e) => e.stopPropagation());
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (direction === "lock") lockTeamPlacement(team);
          else nudgeTeam(team, direction);
        });
        controls.append(btn);
      });

      playersLayer.append(controls);
    });
  }

  function updateTeamPlacementPanel() {
    const state = teamPlacement[activePlacementTeam];
    const team2Available = teamPlacement.a.locked;
    if (!team2Available && activePlacementTeam === "b") activePlacementTeam = "a";

    placementTeamBtns.forEach((btn) => {
      const team = btn.dataset.placementTeam;
      btn.classList.toggle("is-active", team === activePlacementTeam);
      btn.disabled = team === "b" && !team2Available;
    });

    const activeState = teamPlacement[activePlacementTeam];
    if (playerCountInput) {
      playerCountInput.value = String(activeState.count);
      playerCountInput.disabled = activeState.locked;
    }
    if (playerCountMinus) playerCountMinus.disabled = activeState.locked || activeState.count <= MIN_PLAYERS_PER_TEAM;
    if (playerCountPlus) playerCountPlus.disabled = activeState.locked || activeState.count >= MAX_PLAYERS_PER_TEAM;

    if (teamStatus) {
      if (!hasMap) {
        teamStatus.textContent = "Upload a map before placing teams.";
      } else if (!teamPlacement.a.placed) {
        teamStatus.textContent = "Start with Team 1. Choose 1-10 players, then tap the spawn point to preview ghosts.";
      } else if (!teamPlacement.a.locked) {
        teamStatus.textContent = "Previewing Team 1 ghosts. Nudge them, then tap ✓ to lock.";
      } else if (!teamPlacement.b.placed) {
        teamStatus.textContent = "Team 1 is locked. Choose Team 2 count, then tap its spawn point to preview ghosts.";
      } else if (!teamPlacement.b.locked) {
        teamStatus.textContent = "Previewing Team 2 ghosts. Nudge them, then tap ✓ to lock.";
      } else {
        teamStatus.textContent = "Both teams are locked. Switch to Move to drag players individually.";
      }
    }

    if (teamHint) {
      const label = TEAM_LABELS[activePlacementTeam]?.short || "Team";
      teamHint.textContent = activeState.locked
        ? `${label} is locked. Use Move to adjust individual players.`
        : `${label}: tap the map to preview a vertical stack above the click, then use arrows before locking.`;
    }

    renderTeamNudges();
  }

  function setPlacementTeam(team) {
    if (team === "b" && !teamPlacement.a.locked) return;
    activePlacementTeam = team === "b" ? "b" : "a";
    updateTeamPlacementPanel();
  }

  function setPlacementCount(value) {
    const state = teamPlacement[activePlacementTeam];
    if (state.locked) return;
    state.count = clampPlayerCount(value);
    if (state.placed && state.spawn) placeTeamAtSpawn(activePlacementTeam, state.spawn);
    updateTeamPlacementPanel();
  }

  function placeTeamAtSpawn(team, spawn) {
    const state = teamPlacement[team];
    const count = clampPlayerCount(state.count);
    state.count = count;
    state.placed = true;
    state.spawn = {
      x: Math.max(4, Math.min(96, spawn.x)),
      y: Math.max(4, Math.min(96, spawn.y)),
    };
    createTeamPlayers(team, count, !state.locked);
    const positions = getTeamStackPositions(state.spawn, count);
    getTeamPlayers(team).forEach((el, index) => {
      const position = positions[index] || state.spawn;
      positionPlayer(el, position.x, position.y);
    });
    setTeamPlayerState(team);
    updateTeamPlacementPanel();
    redrawVisionLines();
    redrawShootOverlay();
  }

  function placeActiveTeamFromEvent(e) {
    if (activeTool !== "players" || !hasMap) return;
    const state = teamPlacement[activePlacementTeam];
    if (state.locked) return;
    if (activePlacementTeam === "b" && !teamPlacement.a.locked) return;
    e.preventDefault();
    const point = getLayerPoint(e, structureCanvas);
    const { w, h } = getCanvasSize();
    if (!w || !h) return;
    placeTeamAtSpawn(activePlacementTeam, {
      x: (point.x / w) * 100,
      y: (point.y / h) * 100,
    });
  }

  function nudgeTeam(team, direction) {
    const state = teamPlacement[team];
    if (!state.placed || state.locked || !state.spawn) return;
    const dx = direction === "left" ? -TEAM_NUDGE_STEP : direction === "right" ? TEAM_NUDGE_STEP : 0;
    const dy = direction === "up" ? -TEAM_NUDGE_STEP : direction === "down" ? TEAM_NUDGE_STEP : 0;
    state.spawn = {
      x: Math.max(4, Math.min(96, state.spawn.x + dx)),
      y: Math.max(4, Math.min(96, state.spawn.y + dy)),
    };
    getTeamPlayers(team).forEach((el) => {
      positionPlayer(
        el,
        Math.max(2, Math.min(98, (parseFloat(el.style.left) || 0) + dx)),
        Math.max(2, Math.min(98, (parseFloat(el.style.top) || 0) + dy))
      );
    });
    renderTeamNudges();
    redrawVisionLines();
    redrawShootOverlay();
  }

  function lockTeamPlacement(team) {
    const state = teamPlacement[team];
    if (!state.placed) return;
    state.locked = true;
    setTeamPlayerState(team);
    if (team === "a" && !teamPlacement.b.placed) activePlacementTeam = "b";
    updateTeamPlacementPanel();
  }

  function resetPlayerPositions() {
    if (runAnimationFrame) {
      cancelAnimationFrame(runAnimationFrame);
      runAnimationFrame = null;
    }
    clearShootPlan();
    clearVisionLines();
    teamPlacement = createDefaultTeamPlacement();
    activePlacementTeam = "a";
    playersLayer.innerHTML = "";
    lastRunStartPositions = null;
    setTool("players");
    updateTeamPlacementPanel();
    updateShootPanel();
    redrawShootOverlay();
  }

  function positionPlayer(el, xPercent, yPercent) {
    el.style.left = `${xPercent}%`;
    el.style.top = `${yPercent}%`;
  }

  function bindPlayerDrag(el) {
    el.addEventListener("pointerdown", (e) => {
      if (!hasMap) return;
      if (isGhostPlayer(el)) return;

      if (activeTool === "vision") {
        e.preventDefault();
        e.stopPropagation();
        toggleVisionOnPlayer(el);
        return;
      }

      if (activeTool === "shoot") {
        e.preventDefault();
        e.stopPropagation();
        if (shootUseTargetPlayer && shootPlayerEl && el !== shootPlayerEl) {
          selectShootTargetPlayer(el);
        } else {
          selectShootPlayer(el);
        }
        return;
      }

      if (activeTool !== "select") return;
      if (teamPlacement[el.dataset.team]?.placed && !teamPlacement[el.dataset.team]?.locked) return;
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
      if (playerAffectsShootOverlay(el)) redrawShootOverlay();
    });

    const endDrag = (e) => {
      if (draggedPlayer !== el) return;
      el.classList.remove("is-dragging");
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      draggedPlayer = null;
      setInteractionLock(false);
      if (visionPlayerEl === el) redrawVisionLines();
      if (playerAffectsShootOverlay(el)) redrawShootOverlay();
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

  shootCanvas.addEventListener("pointerdown", setShootPointFromEvent);
  shootRunBtn?.addEventListener("click", runShootPlayer);
  shootResetRunBtn?.addEventListener("click", resetShootRun);
  shootClearBtn?.addEventListener("click", clearShootPlan);
  shootSaveSetupBtn?.addEventListener("click", saveShootSetup);
  shootNewSetupBtn?.addEventListener("click", newShootSetup);
  shootPlaySceneBtn?.addEventListener("click", runShootScene);
  shootResetSceneBtn?.addEventListener("click", resetShootRun);
  shootClearSceneBtn?.addEventListener("click", clearShootScene);
  shootTimeInput?.addEventListener("change", updateShootPanel);

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
      fill: activeStructureStyle,
      detected: false,
    };
  }

  function startStructurePlace(e) {
    if (!hasMap) return;

    if (activeTool === "players") {
      placeActiveTeamFromEvent(e);
      return;
    }

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
      persistFieldState();
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
    loadMapImageFromFile(file, null);
  }

  function showMapUI() {
    hasMap = true;
    clearSizerUndo();
    clearShootPlan();
    const packToApply = pendingPackState;
    pendingPackState = null;
    if (!packToApply) {
      structures = [];
      shootSceneSetups = [];
      activeShootSetupId = null;
    }

    stage.classList.add("has-map");
    stageWrap?.classList.add("has-map");
    if (uploadPromptLabel) uploadPromptLabel.hidden = true;
    stage.hidden = false;
    image.hidden = false;
    canvas.hidden = false;
    structureCanvas.hidden = false;
    visionCanvas.hidden = false;
    shootCanvas.hidden = false;
    playersLayer.hidden = false;

    if (canvas.width > 0 && canvas.height > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (structureCanvas.width > 0 && structureCanvas.height > 0) {
      structCtx.clearRect(0, 0, structureCanvas.width, structureCanvas.height);
    }

    teamPlacement = createDefaultTeamPlacement();
    activePlacementTeam = "a";
    playersLayer.innerHTML = "";

    const finishMapSetup = () => {
      refreshMapPixelCache();
      resizeCanvases();
      if (packToApply) applyPackState(packToApply);
      if (!structures.length) {
        const detected = detectStructuresFromImage(image);
        if (detected.length) {
          structures = detected;
          mergeIntelFromSavedState();
        }
      }
      redrawStructures();
      setTool("players");
      updateControlStates();
      updateIntelReport();
      updateMobileTip(uiTool);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(finishMapSetup);
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
    clearSizerUndo();
    clearVisionLines();
    clearShootPlan();
    shootSceneSetups = [];
    activeShootSetupId = null;
    teamPlacement = createDefaultTeamPlacement();
    activePlacementTeam = "a";
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
    shootCanvas.hidden = true;
    playersLayer.hidden = true;
    playersLayer.innerHTML = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    structCtx.clearRect(0, 0, structureCanvas.width, structureCanvas.height);
    shootCtx.clearRect(0, 0, shootCanvas.width, shootCanvas.height);
    if (mapUpload) mapUpload.value = "";
    if (mapUploadPromptInput) mapUploadPromptInput.value = "";
    if (mapUploadMobile) mapUploadMobile.value = "";
    updateControlStates();
    setInteractionLock(false);
  }

  saveMapPackBtn?.addEventListener("click", () => {
    saveMapPack().catch(() => window.alert("Could not save map pack."));
  });
  saveMapPackMobileBtn?.addEventListener("click", () => {
    saveMapPack().catch(() => window.alert("Could not save map pack."));
  });
  uploadMapPackBtn?.addEventListener("click", () => {
    openMapPackUpload().catch(() => window.alert("Could not open map pack."));
  });
  uploadMapPackMobileBtn?.addEventListener("click", () => {
    openMapPackUpload().catch(() => window.alert("Could not open map pack."));
  });
  mapPackZipInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleMapPackZip(file).catch(() => window.alert("Could not read map pack .zip."));
    e.target.value = "";
  });
  mapPackFolderInput?.addEventListener("change", (e) => {
    if (e.target.files?.length) {
      handleMapPackFiles(e.target.files).catch(() => window.alert("Could not read map pack folder."));
    }
    e.target.value = "";
  });

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
