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
  const designCanvas = document.getElementById("fm-design-canvas");
  const designMapBtn = document.getElementById("design-map");
  const designMapMobileBtn = document.getElementById("design-map-mobile");
  const designPanel = document.getElementById("fm-design-panel");
  const designSwitch = document.getElementById("design-switch");
  const designSelectedLabel = document.getElementById("fm-design-selected");
  const designSelectHint = document.getElementById("fm-design-select-hint");
  const designSelectedRow = document.getElementById("fm-design-selected-row");
  const designSelectedFill = document.getElementById("design-selected-fill");
  const designSelectedReset = document.getElementById("design-selected-reset");
  const designClearFillsBtn = document.getElementById("design-clear-fills");
  const designResetThemeBtn = document.getElementById("design-reset-theme");
  const designPresetsEl = document.getElementById("fm-design-presets");
  const designColorInputs = document.querySelectorAll("input[data-design-key]");
  const structureCanvas = document.getElementById("fm-structure-canvas");
  const canvas = document.getElementById("fm-canvas");
  const visionCanvas = document.getElementById("fm-vision-canvas");
  const shootCanvas = document.getElementById("fm-shoot-canvas");
  const mirrorCanvas = document.getElementById("fm-mirror-canvas");
  const mirrorPrompt = document.getElementById("fm-mirror-prompt");
  const mirrorPromptText = document.getElementById("fm-mirror-prompt-text");
  const mirrorCancelBtn = document.getElementById("mirror-cancel");
  const mirrorLayoutBtn = document.getElementById("mirror-layout");
  const mirrorLayoutMobileBtn = document.getElementById("mirror-layout-mobile");
  const mirrorConfirm = document.getElementById("fm-mirror-confirm");
  const mirrorConfirmBackdrop = document.getElementById("fm-mirror-confirm-backdrop");
  const mirrorConfirmYes = document.getElementById("mirror-confirm-yes");
  const mirrorConfirmNo = document.getElementById("mirror-confirm-no");
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
  const presetMapPackBtn = document.getElementById("preset-map-pack");
  const presetMapPackMobileBtn = document.getElementById("preset-map-pack-mobile");
  const presetModal = document.getElementById("fm-preset-modal");
  const presetBackdrop = document.getElementById("fm-preset-backdrop");
  const presetList = document.getElementById("fm-preset-list");
  const presetCancelBtn = document.getElementById("preset-cancel");

  const MAP_PRESETS = [{ name: "MID-ATLANTIC 2026", folder: "presets/mid-atlantic-2026" }];
  const clearMapBtn = document.getElementById("clear-map");
  const clearDrawingsBtn = document.getElementById("clear-drawings");
  const undoStructureBtn = document.getElementById("undo-structure");
  const placePlayersBtn = document.getElementById("place-players");
  const resetPlayersBtn = document.getElementById("reset-players");
  const resetPlayersMobile = document.getElementById("reset-players-mobile");
  const brushSizeInput = document.getElementById("brush-size");
  const brushColorInput = document.getElementById("brush-color");
  const structurePanel = document.getElementById("fm-structure-panel");
  const autoPanel = document.getElementById("fm-auto-panel");
  const autoCanvas = document.getElementById("fm-auto-canvas");
  const autoSensitivityInput = document.getElementById("auto-sensitivity");
  const autoSensitivityValue = document.getElementById("auto-sensitivity-value");
  const autoSplitInput = document.getElementById("auto-split");
  const autoDarkInput = document.getElementById("auto-dark");
  const autoReplaceInput = document.getElementById("auto-replace");
  const autoStepBox = document.getElementById("auto-step-box");
  const autoStepWhiteout = document.getElementById("auto-step-whiteout");
  const autoStepColors = document.getElementById("auto-step-colors");
  const autoClearBoxBtn = document.getElementById("auto-clear-box");
  const autoEditWhiteoutBtn = document.getElementById("auto-edit-whiteout");
  const autoWhiteoutTools = document.getElementById("auto-whiteout-tools");
  const autoWhiteoutSizeInput = document.getElementById("auto-whiteout-size");
  const autoWhiteoutSizeValue = document.getElementById("auto-whiteout-size-value");
  const autoClearWhiteoutBtn = document.getElementById("auto-clear-whiteout");
  const autoWhiteoutDoneBtn = document.getElementById("auto-whiteout-done");
  const autoPickList = document.getElementById("auto-pick-list");
  const autoUndoBtn = document.getElementById("auto-undo");
  const autoUndoAllBtn = document.getElementById("auto-undo-all");
  const autoStatus = document.getElementById("auto-status");
  const brushPanel = document.getElementById("fm-brush-panel");
  const toolBtns = document.querySelectorAll(".fm-tool-btn[data-tool]");
  const mobileToolBtns = document.querySelectorAll(".fm-mobile-btn[data-tool]");
  const shapeBtns = document.querySelectorAll(".fm-shape-btn[data-shape]");
  const structureStyleBtns = document.querySelectorAll(".fm-style-btn[data-structure-style]");
  const mobileBrushSlot = document.getElementById("fm-mobile-brush-slot");
  const mobileActionsSlot = document.getElementById("fm-mobile-actions-slot");
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
  const sizerStepInput = document.getElementById("sizer-step");
  const sizerStepValue = document.getElementById("sizer-step-value");
  const duplicateStructureBtn = document.getElementById("duplicate-structure");
  const deleteStructureBtn = document.getElementById("delete-structure");
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
  const shootNoShotInput = document.getElementById("shoot-no-shot");
  const shootOverInput = document.getElementById("shoot-over");
  const shootTargetStatus = document.getElementById("fm-shoot-target-status");
  const shootRunBtn = document.getElementById("shoot-run");
  const shootResetRunBtn = document.getElementById("shoot-reset-run");
  const shootClearBtn = document.getElementById("shoot-clear");
  const shootSaveSetupBtn = document.getElementById("shoot-save-setup");
  const shootPrevPlayerBtn = document.getElementById("shoot-prev-player");
  const shootNextPlayerBtn = document.getElementById("shoot-next-player");
  const shootPlayerStep = document.getElementById("shoot-player-step");
  const shootNewSetupBtn = document.getElementById("shoot-new-setup");
  const shootPlaySceneBtn = document.getElementById("shoot-play-scene");
  const shootPlayWindowBtn = document.getElementById("shoot-play-window");
  const shootDownloadGifBtn = document.getElementById("shoot-download-gif");
  const theater = document.getElementById("fm-theater");
  const theaterBackdrop = document.getElementById("fm-theater-backdrop");
  const theaterCanvas = document.getElementById("fm-theater-canvas");
  const theaterCloseBtn = document.getElementById("fm-theater-close");
  const theaterReplayBtn = document.getElementById("fm-theater-replay");
  const theaterGifBtn = document.getElementById("fm-theater-gif");
  const theaterStatus = document.getElementById("fm-theater-status");
  const shootResetSceneBtn = document.getElementById("shoot-reset-scene");
  const shootClearSceneBtn = document.getElementById("shoot-clear-scene");
  const shootSceneList = document.getElementById("shoot-scene-list");
  const shootSceneCount = document.getElementById("shoot-scene-count");
  const shootTimeline = document.getElementById("shoot-timeline");
  const shootTimelineRuler = document.getElementById("shoot-timeline-ruler");
  const shootTimelinePlayhead = document.getElementById("shoot-timeline-playhead");
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
  const SIZER_STEP_KEY = "paintballer-sizer-step";
  const FIELD_STATE_KEY = "paintballer-field-state";
  const SHOOT_LINE_COLOR = "#ffd43b";
  const SHOOT_BLOCKED_COLOR = "#ff4f4f";
  const RUN_POINT_COLOR = "#7cfc3b";
  const SHOOT_DOT_COLOR = "#7cfc3b";
  const SHOOT_DOT_SPAWN_MS = 200;
  const SHOOT_DOT_TRAVEL_MS = 700;

  if (!stage || !canvas || !structureCanvas || !visionCanvas || !shootCanvas) return;

  const ctx = canvas.getContext("2d");
  const structCtx = structureCanvas.getContext("2d");
  const visionCtx = visionCanvas.getContext("2d");
  const shootCtx = shootCanvas.getContext("2d");
  const designCtx = designCanvas?.getContext("2d");

  let designMapOn = false;
  const DESIGN_THEME_DEFAULT = {
    turf: "#132018",
    turfCenter: "#1b2d1f",
    stripes: "#ffffff",
    grid: "#ffffff",
    lines: "#e8efe4",
    vignette: "#000000",
    fill: "#00ff9d",
    outline: "#00cc7a",
    glow: "#00ff9d",
  };
  const DESIGN_PRESETS = [
    { name: "Neon", theme: DESIGN_THEME_DEFAULT },
    {
      name: "Night",
      theme: { turf: "#0a0f1c", turfCenter: "#141d33", stripes: "#9fb4ff", grid: "#9fb4ff", lines: "#cfe0ff", vignette: "#000000", fill: "#4f8cff", outline: "#9fc2ff", glow: "#4f8cff" },
    },
    {
      name: "Desert",
      theme: { turf: "#3a2a17", turfCenter: "#5a4325", stripes: "#ffe7b8", grid: "#ffe7b8", lines: "#fff1d6", vignette: "#1a0f05", fill: "#ff9a3b", outline: "#ffd08a", glow: "#ff7a1a" },
    },
    {
      name: "Ice",
      theme: { turf: "#16303a", turfCenter: "#24505e", stripes: "#e6fbff", grid: "#e6fbff", lines: "#ffffff", vignette: "#06141a", fill: "#3bd5ff", outline: "#c9f4ff", glow: "#3bd5ff" },
    },
    {
      name: "Inferno",
      theme: { turf: "#1c0d0d", turfCenter: "#341414", stripes: "#ffb3b3", grid: "#ffb3b3", lines: "#ffd6d6", vignette: "#000000", fill: "#ff3b3b", outline: "#ffb000", glow: "#ff3b3b" },
    },
    {
      name: "Toxic",
      theme: { turf: "#120a1c", turfCenter: "#24113a", stripes: "#d8b4ff", grid: "#d8b4ff", lines: "#d8b4ff", vignette: "#000000", fill: "#b6ff00", outline: "#e6ff8a", glow: "#b6ff00" },
    },
    {
      name: "Synthwave",
      theme: { turf: "#1a0b2e", turfCenter: "#3a0f4f", stripes: "#ffffff", grid: "#ff4fc8", lines: "#3bd5ff", vignette: "#0a0014", fill: "#ff4fc8", outline: "#3bd5ff", glow: "#ff4fc8" },
    },
    {
      name: "Blueprint",
      theme: { turf: "#0b2a4a", turfCenter: "#12406e", stripes: "#ffffff", grid: "#bfe2ff", lines: "#ffffff", vignette: "#031426", fill: "#e8f4ff", outline: "#ffffff", glow: "#7cc4ff" },
    },
    {
      name: "Woodland",
      theme: { turf: "#1f2a14", turfCenter: "#34421f", stripes: "#e8dcc0", grid: "#e8dcc0", lines: "#e8dcc0", vignette: "#0a0d05", fill: "#c2a46b", outline: "#6b4f2a", glow: "#e0c48a" },
    },
    {
      name: "Gold Rush",
      theme: { turf: "#14110a", turfCenter: "#2a2312", stripes: "#ffe08a", grid: "#ffe08a", lines: "#ffe08a", vignette: "#000000", fill: "#ffc83b", outline: "#fff0b3", glow: "#ffb000" },
    },
    {
      name: "Stealth",
      theme: { turf: "#0e0f10", turfCenter: "#1b1d1f", stripes: "#ffffff", grid: "#c9ced3", lines: "#c9ced3", vignette: "#000000", fill: "#9aa3ab", outline: "#e6e9ec", glow: "#ffffff" },
    },
    {
      name: "Sunset",
      theme: { turf: "#2a0f1a", turfCenter: "#5a1f2a", stripes: "#ffd27a", grid: "#ffb37a", lines: "#ffc09a", vignette: "#12040a", fill: "#ff8a3b", outline: "#ffd27a", glow: "#ff5c7a" },
    },
    {
      name: "Ocean",
      theme: { turf: "#04222b", turfCenter: "#0a3d4a", stripes: "#9ff5ff", grid: "#9ff5ff", lines: "#9ff5ff", vignette: "#01090c", fill: "#2ee6c8", outline: "#b3fff3", glow: "#2ee6c8" },
    },
    {
      name: "Bubblegum",
      theme: { turf: "#2a1430", turfCenter: "#43204d", stripes: "#ffffff", grid: "#ffd1ec", lines: "#ffd1ec", vignette: "#12051a", fill: "#ff9ad5", outline: "#ffffff", glow: "#ff6fc0" },
    },
    {
      name: "Arcade",
      theme: { turf: "#050505", turfCenter: "#101018", stripes: "#00e5ff", grid: "#ff2bd6", lines: "#00e5ff", vignette: "#000000", fill: "#ffe600", outline: "#ff2bd6", glow: "#00e5ff" },
    },
  ];
  const STRUCTURE_COMBOS = [
    { name: "Neon Lime", fill: "#00ff9d", outline: "#00cc7a", glow: "#00ff9d" },
    { name: "Electric", fill: "#3b9eff", outline: "#b8dcff", glow: "#3b9eff" },
    { name: "Blaze", fill: "#ff7a1a", outline: "#ffd0a3", glow: "#ff5c00" },
    { name: "Hot Pink", fill: "#ff4fc8", outline: "#ffc2ec", glow: "#ff4fc8" },
    { name: "Cyber", fill: "#ffe600", outline: "#fff6a3", glow: "#ffc400" },
    { name: "Ice", fill: "#3bd5ff", outline: "#e0f8ff", glow: "#3bd5ff" },
    { name: "Royal", fill: "#9b5cff", outline: "#d9c2ff", glow: "#7c3aed" },
    { name: "Crimson", fill: "#ff3b4f", outline: "#ffb3bb", glow: "#ff1f3d" },
    { name: "Mint", fill: "#9dffd6", outline: "#ffffff", glow: "#4dffb8" },
    { name: "Lagoon", fill: "#2ee6c8", outline: "#b3fff3", glow: "#00bfa5" },
    { name: "Gold", fill: "#ffc83b", outline: "#fff0b3", glow: "#ffb000" },
    { name: "Chrome", fill: "#d6dde3", outline: "#ffffff", glow: "#9fb4c8" },
    { name: "Sunset", fill: "#ff8a3b", outline: "#ff4fc8", glow: "#ff5c7a" },
    { name: "Vapor", fill: "#ff4fc8", outline: "#3bd5ff", glow: "#9b5cff" },
    { name: "Lava", fill: "#ff5c00", outline: "#ffe600", glow: "#ff3b3b" },
  ];
  let designTheme = { ...DESIGN_THEME_DEFAULT };
  let designTab = "structures";
  let designPanelOpen = false;
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
  let shootNoShot = false;
  let shootOver = false;
  let sceneAutoResetTimer = null;
  const SCENE_AUTO_RESET_MS = 1500;
  let shootMode = "run";
  let shootPoint = null;
  let runPoint = null;
  let runPath = null;
  /** @type {{pid:number,fromPlayer:boolean,prevPath:object[]|null,prevPoint:object|null,lastPx:{x:number,y:number}|null}|null} */
  let shootRunDraw = null;
  const RUN_PATH_MIN_STEP_PX = 4;
  const RUN_PATH_MAX_POINTS = 400;
  /** Route index each running player is heading toward, so the overlay only draws what's left. */
  const runRouteProgress = new Map();
  let targetRunPoint = null;
  let runAnimationFrame = null;
  let lastRunStartPositions = null;
  /** @type {{setups:object[],setupIds:Set<string>,dots:object[],lastSpawnAt:Map<string,number>,startedAt:number,spawnMs:number,travelMs:number,spawning:boolean}|null} */
  let shootSceneDotAnim = null;
  let shootSceneSetups = [];
  let timelineScaleSec = 5;
  let timelineDrag = null;
  let suppressTimelineClick = false;
  let activeShootSetupId = null;
  let activePlacementTeam = "a";
  let teamPlacement = createDefaultTeamPlacement();
  /** @type {null|"box"|"line"} */
  let mirrorStep = null;
  /** Normalized 0–1 coordinates so the overlay survives canvas resizes */
  let mirrorBox = null;
  let mirrorDragStart = null;
  let mirrorLinePoints = [];
  let mirrorHoverPoint = null;
  let mirrorToastTimer = null;
  let sizerSyncing = false;
  let activeSizerEdit = null;
  let sizerUndoState = null;
  /** @type {{data:Uint8ClampedArray,w:number,h:number}|null} */
  let mapPixelCache = null;
  /** @type {{x:number,y:number,pid:number,handled:boolean}|null} */
  let structurePointer = null;
  let structureDrag = null;
  /** @type {{ left: number, top: number, width: number, height: number }|null} */
  let autoBox = null;
  /** @type {{ id: string, rgb: number[], x: number, y: number, ids: string[], bunkers: number }[]} */
  let autoPicks = [];
  /** Whiteout strokes; size is a fraction of the map width. Replaced (never mutated) on change. */
  /** @type {{ size: number, points: { x: number, y: number }[] }[]} */
  let autoWhiteout = [];
  let autoScanned = false;
  /** @type {object[]|null} */
  let autoScanBase = null;
  /** @type {object[]} */
  let autoHistory = [];
  let autoPointer = null;
  /** @type {{ x: number, y: number }|null} */
  let autoHover = null;
  /** @type {{ src: string, w: number, h: number, data: Uint8ClampedArray }|null} */
  let autoImageCache = null;
  /** @type {{ base: object, strokes: object[], w: number, h: number, data: Uint8ClampedArray }|null} */
  let autoScanCache = null;
  let fieldIntelReport = { name: "", bio: "" };
  let intelModalOpen = false;
  /** @type {ReturnType<typeof serializeFieldState>|null} */
  let pendingPackState = null;
  let pendingPackLoad = false;

  if (IS_COARSE && brushSizeInput) {
    brushSizeInput.value = "12";
  }

  const brushSizeValue = document.getElementById("brush-size-value");
  const brushSwatches = document.querySelectorAll(".fm-brush-swatch");

  function syncBrushSizeUi() {
    if (!brushSizeInput) return;
    const min = Number(brushSizeInput.min) || 0;
    const max = Number(brushSizeInput.max) || 1;
    const value = Number(brushSizeInput.value) || min;
    brushSizeInput.closest(".fm-throttle")?.style.setProperty("--fill", `${((value - min) / (max - min)) * 100}%`);
    if (brushSizeValue) brushSizeValue.textContent = `${value}px`;
  }

  function syncBrushColorUi() {
    const current = (brushColorInput?.value || "").toLowerCase();
    let matched = false;
    brushSwatches.forEach((swatch) => {
      const preset = swatch.dataset.brushColor;
      const on = Boolean(preset) && preset.toLowerCase() === current;
      if (on) matched = true;
      swatch.classList.toggle("is-active", on);
    });
    const custom = document.querySelector(".fm-brush-custom");
    if (custom) {
      custom.classList.toggle("is-active", !matched);
      custom.style.setProperty("--c", current || "#7cfc3b");
    }
  }

  brushSizeInput?.addEventListener("input", syncBrushSizeUi);
  brushColorInput?.addEventListener("input", syncBrushColorUi);
  brushSwatches.forEach((swatch) => {
    if (!swatch.dataset.brushColor) return;
    swatch.addEventListener("click", () => {
      if (!brushColorInput) return;
      brushColorInput.value = swatch.dataset.brushColor;
      syncBrushColorUi();
    });
  });
  syncBrushSizeUi();
  syncBrushColorUi();

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
      select: "Move — drag players, or tap green bunkers for Intel.",
      players: "Teams — choose Team 1 count, tap spawn, nudge with ghost arrows, then lock.",
      brush: "Brush — draw on the map. Use Move or Intel to tag bunkers.",
      structure: "Struct — drag to place. Tap existing bunkers for Intel.",
      auto: "Auto — drag a box, brush white over text and lines, then press Done.",
      vision: "Vision — tap a player for lines (stay on when you switch tools).",
      shoot: "Shoot — tap a runner, draw the run route, then set a shoot point or target.",
      sizer: "Sizer — drag a bunker to move it, or resize / use arrows.",
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
    if (duplicateStructureBtn) duplicateStructureBtn.disabled = !hasMap || !getSelectedStructure();
    if (deleteStructureBtn) deleteStructureBtn.disabled = !hasMap || !getSelectedStructure();
    if (openFullIntelBtn) openFullIntelBtn.disabled = !hasMap;
    if (saveMapPackBtn) saveMapPackBtn.disabled = !hasMap;
    if (saveMapPackMobileBtn) saveMapPackMobileBtn.disabled = !hasMap;
    if (mirrorLayoutBtn) mirrorLayoutBtn.disabled = !hasMap || !hasStructures;
    if (mirrorLayoutMobileBtn) mirrorLayoutMobileBtn.disabled = !hasMap || !hasStructures;
    if (designMapBtn) designMapBtn.disabled = !hasMap;
    if (designMapMobileBtn) designMapMobileBtn.disabled = !hasMap;
    if (autoUndoBtn) autoUndoBtn.disabled = !hasMap || !autoHistory.length;
    if (autoUndoAllBtn) autoUndoAllBtn.disabled = !hasMap || !autoHistory.length;
    if (autoClearBoxBtn) autoClearBoxBtn.disabled = !hasMap || !autoBox;
    if (autoEditWhiteoutBtn) autoEditWhiteoutBtn.disabled = !hasMap || !autoScanned;
    if (autoClearWhiteoutBtn) autoClearWhiteoutBtn.disabled = !hasMap || !autoWhiteout.length;
    if (autoWhiteoutDoneBtn) autoWhiteoutDoneBtn.disabled = !hasMap || !autoBox || autoScanned;
    updateTeamPlacementPanel();
    updateShootPanel();
  }

  function isDesignPanelShown() {
    return designPanelOpen && hasMap;
  }

  function isIntelPanelShown() {
    return hasMap && !isDesignPanelShown() && ["select", "brush", "vision"].includes(activeTool);
  }

  function syncToolPanels() {
    const design = isDesignPanelShown();
    if (structurePanel) structurePanel.hidden = design || activeTool !== "structure";
    if (autoPanel) autoPanel.hidden = design || activeTool !== "auto";
    if (sizerPanel) sizerPanel.hidden = design || activeTool !== "sizer";
    if (teamPanel) teamPanel.hidden = design || activeTool !== "players";
    if (shootPanel) shootPanel.hidden = design || activeTool !== "shoot";
    if (designPanel) designPanel.hidden = !design;
    if (intelSection) intelSection.hidden = !isIntelPanelShown();
  }

  function onDesignButton() {
    designPanelOpen = !designPanelOpen;
    renderDesignMap();
    if (isDesignPanelShown()) scrollMobilePanel(designPanel);
  }

  function setTool(tool) {
    if (mirrorStep) cancelMirrorFlow();
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
    stage.classList.toggle("tool-auto", activeTool === "auto");
    stage.classList.toggle("tool-players", activeTool === "players");
    stage.classList.toggle("tool-vision", activeTool === "vision");
    stage.classList.toggle("tool-shoot", activeTool === "shoot");
    stage.classList.toggle("tool-sizer", activeTool === "sizer");
    stage.classList.toggle("tool-intel", tool === "intel");
    workspace?.classList.toggle("tool-sizer-active", activeTool === "sizer");
    workspace?.classList.toggle("tool-structure-active", activeTool === "structure");
    workspace?.classList.toggle("tool-auto-active", activeTool === "auto");
    workspace?.classList.toggle("tool-players-active", activeTool === "players");
    workspace?.classList.toggle("tool-shoot-active", activeTool === "shoot");
    workspace?.classList.toggle("tool-intel-active", tool === "intel");

    syncBrushPanel();
    designPanelOpen = false;
    syncToolPanels();
    if (activeTool === "auto") renderAutoPanel();
    redrawAutoOverlay();

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
    if (activeTool === "auto") scrollMobilePanel(autoPanel);
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
        auto:
          "<strong>Auto</strong> — drag a box around the area to scan · brush white over text and lines · press Done to detect every color",
        vision:
          "<strong>Vision</strong> — click a player for <span style=\"color:#ff4fc8\">pink</span> lines · lines stay on when you switch tools",
        shoot:
          "<strong>Shoot</strong> — click a runner, <strong>drag</strong> to draw the run route, then set a shoot point or target",
        sizer:
          "<strong>Sizer</strong> — resize structures · <strong>drag</strong> or arrows to move · intel below map",
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
  }

  function syncBrushPanel() {
    if (!brushPanel) return;
    brushPanel.hidden = isMobileLayout()
      ? activeTool !== "brush"
      : ["structure", "auto", "players", "sizer", "shoot"].includes(activeTool);
  }

  const mobileMoves = [
    [brushPanel, mobileBrushSlot],
    [clearMapBtn, mobileActionsSlot],
    [resetPlayersBtn, mobileActionsSlot],
  ]
    .filter(([el, slot]) => el && slot)
    .map(([el, slot]) => {
      const home = document.createComment("");
      el.before(home);
      return { el, slot, home };
    });

  function placeMobileControls() {
    const mobile = isMobileLayout();
    mobileMoves.forEach(({ el, slot, home }) => {
      if (mobile) slot.append(el);
      else home.after(el);
    });
    syncBrushPanel();
  }

  window.matchMedia("(max-width: 900px)").addEventListener("change", placeMobileControls);
  placeMobileControls();

  const scrollDownBtn = document.getElementById("fm-scroll-down");
  const mapArea = document.querySelector(".fm-map-area");

  function scrollRemaining(el) {
    return el ? el.scrollHeight - el.clientHeight - el.scrollTop : 0;
  }

  function getScrollDownTarget() {
    const panels = document.querySelectorAll(".fm-map-tool-panel:not([hidden]), .fm-intel-section:not([hidden])");
    return [document.scrollingElement, mapArea, ...panels].find((el) => scrollRemaining(el) > 4) || null;
  }

  let scrollDownFrame = 0;
  function updateScrollDownBtn() {
    if (scrollDownFrame) return;
    scrollDownFrame = requestAnimationFrame(() => {
      scrollDownFrame = 0;
      scrollDownBtn?.classList.toggle("is-at-end", !getScrollDownTarget());
    });
  }

  scrollDownBtn?.addEventListener("click", () => {
    const target = getScrollDownTarget();
    if (!target) return;
    const top = Math.round(window.innerHeight * 0.6);
    if (target === document.scrollingElement) window.scrollBy({ top, behavior: "smooth" });
    else target.scrollBy({ top, behavior: "smooth" });
  });

  document.addEventListener("scroll", updateScrollDownBtn, { capture: true, passive: true });
  window.addEventListener("resize", updateScrollDownBtn);
  document.addEventListener("click", () => setTimeout(updateScrollDownBtn, 120), true);
  updateScrollDownBtn();

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
      runPath = null;
      shootNoShot = false;
      if (shootMode === "run") shootMode = "shoot";
    }
    updateShootPanel();
    redrawShootOverlay();
  });

  shootNoShotInput?.addEventListener("change", () => {
    shootNoShot = Boolean(shootNoShotInput.checked);
    if (shootNoShot) {
      shootStandStill = false;
      shootMode = "run";
    } else if (shootMode === "run" && !runPoint) {
      shootMode = "shoot";
    }
    updateShootPanel();
    redrawShootOverlay();
  });

  shootOverInput?.addEventListener("change", () => {
    shootOver = Boolean(shootOverInput.checked);
    updateShootPanel();
    redrawShootOverlay();
  });

  function getCanvasSize() {
    return {
      w: structureCanvas.clientWidth,
      h: structureCanvas.clientHeight,
    };
  }

  function drawDesignField(context, w, h) {
    const horizontal = w >= h;
    const short = Math.min(w, h);
    context.save();

    const theme = designTheme;
    const turf = context.createLinearGradient(0, 0, horizontal ? w : 0, horizontal ? 0 : h);
    turf.addColorStop(0, theme.turf);
    turf.addColorStop(0.5, theme.turfCenter);
    turf.addColorStop(1, theme.turf);
    context.fillStyle = turf;
    context.fillRect(0, 0, w, h);

    const stripes = 14;
    context.fillStyle = designRgba(theme.stripes, 0.035);
    for (let i = 0; i < stripes; i += 2) {
      if (horizontal) context.fillRect((i * w) / stripes, 0, w / stripes, h);
      else context.fillRect(0, (i * h) / stripes, w, h / stripes);
    }

    const cell = Math.max(10, short / 14);
    const gridW = Math.max(1.5, short * 0.003);
    context.strokeStyle = designRgba(theme.grid, 0.14);
    context.lineWidth = gridW;
    context.beginPath();
    for (let x = cell; x < w; x += cell) {
      context.moveTo(Math.round(x), 0);
      context.lineTo(Math.round(x), h);
    }
    for (let y = cell; y < h; y += cell) {
      context.moveTo(0, Math.round(y));
      context.lineTo(w, Math.round(y));
    }
    context.stroke();

    const inset = Math.max(6, short * 0.03);
    const lineW = Math.max(3, short * 0.009);
    context.strokeStyle = designRgba(theme.lines, 0.75);
    context.lineWidth = lineW;
    context.shadowColor = designRgba(theme.lines, 0.45);
    context.shadowBlur = lineW * 2;
    context.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
    context.shadowBlur = 0;

    const vignette = context.createRadialGradient(w / 2, h / 2, short * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
    vignette.addColorStop(0, designRgba(theme.vignette, 0));
    vignette.addColorStop(1, designRgba(theme.vignette, 0.38));
    context.fillStyle = vignette;
    context.fillRect(0, 0, w, h);
    context.restore();
  }

  function renderDesignMap() {
    const on = designMapOn && hasMap;
    stage.classList.toggle("is-design-map", on);
    const panelShown = isDesignPanelShown();
    [designMapBtn, designMapMobileBtn].forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle("is-active", on || panelShown);
      btn.setAttribute("aria-pressed", String(panelShown));
    });
    if (designSwitch) {
      designSwitch.setAttribute("aria-checked", String(on));
      designSwitch.classList.toggle("is-on", on);
    }
    designPanel?.classList.toggle("is-off", !on);
    syncToolPanels();
    updateDesignPanel();
    if (!designCanvas || !designCtx) return;
    designCanvas.hidden = !on;
    if (!on) return;
    const { w, h } = getCanvasSize();
    if (!w || !h) return;
    designCtx.clearRect(0, 0, w, h);
    drawDesignField(designCtx, w, h);
  }

  function setDesignMap(on) {
    designMapOn = Boolean(on);
    renderDesignMap();
    redrawStructures();
    persistFieldState();
  }

  function designRgba(hex, alpha) {
    const rgb = hexToRgb(hex) || [255, 255, 255];
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  function isDesignHex(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  }

  function normalizeDesignTheme(theme) {
    const out = { ...DESIGN_THEME_DEFAULT };
    if (theme && typeof theme === "object") {
      Object.keys(out).forEach((key) => {
        if (isDesignHex(theme[key])) out[key] = theme[key].toLowerCase();
      });
    }
    return out;
  }

  function getStructureLabel(shape) {
    const type = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
    const name = shape.name?.trim();
    return name ? `${name} · ${type}` : type;
  }

  function updateDesignPanel() {
    if (!designPanel || designPanel.hidden) return;
    designColorInputs.forEach((input) => {
      const value = designTheme[input.dataset.designKey];
      if (value && input.value !== value) input.value = value;
    });
    const shape = getSelectedStructure();
    if (designSelectedLabel) designSelectedLabel.textContent = shape ? getStructureLabel(shape) : "None";
    if (designSelectHint) designSelectHint.hidden = Boolean(shape);
    if (designSelectedRow) designSelectedRow.hidden = !shape;
    if (shape && designSelectedFill) {
      const value = shape.color || designTheme.fill;
      if (designSelectedFill.value !== value) designSelectedFill.value = value;
    }
    if (designSelectedReset) designSelectedReset.disabled = !shape?.color;
    if (designClearFillsBtn) designClearFillsBtn.disabled = !structures.some((s) => s.color);
    document.querySelectorAll(".fm-design-combo").forEach((btn, i) => {
      const combo = STRUCTURE_COMBOS[i];
      const match = combo && ["fill", "outline", "glow"].every((k) => combo[k] === designTheme[k]);
      btn.classList.toggle("is-active", Boolean(match));
    });
    designPresetsEl?.querySelectorAll(".fm-design-preset").forEach((btn, i) => {
      const theme = DESIGN_PRESETS[i]?.theme;
      const match = theme && Object.keys(DESIGN_THEME_DEFAULT).every((k) => theme[k] === designTheme[k]);
      btn.classList.toggle("is-active", Boolean(match));
    });
  }

  function setDesignTab(tab) {
    designTab = tab === "canvas" ? "canvas" : "structures";
    designPanel?.querySelectorAll(".fm-design-tab").forEach((btn) => {
      const on = btn.dataset.designTab === designTab;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
    });
    designPanel?.querySelectorAll(".fm-design-pane").forEach((pane) => {
      pane.hidden = pane.dataset.designPane !== designTab;
    });
  }

  function applyDesignTheme(theme) {
    designTheme = normalizeDesignTheme(theme);
    renderDesignMap();
    redrawStructures();
    persistFieldState();
  }

  function bindDesignPanel() {
    if (!designPanel) return;
    designPanel.querySelectorAll(".fm-design-tab").forEach((btn) => {
      btn.addEventListener("click", () => setDesignTab(btn.dataset.designTab));
    });
    designColorInputs.forEach((input) => {
      input.addEventListener("input", () => {
        designTheme = { ...designTheme, [input.dataset.designKey]: input.value.toLowerCase() };
        renderDesignMap();
        redrawStructures();
      });
      input.addEventListener("change", persistFieldState);
    });
    designSelectedFill?.addEventListener("input", () => {
      const shape = getSelectedStructure();
      if (!shape) return;
      shape.color = designSelectedFill.value.toLowerCase();
      redrawStructures();
      updateDesignPanel();
    });
    designSelectedFill?.addEventListener("change", persistFieldState);
    designSelectedReset?.addEventListener("click", () => {
      const shape = getSelectedStructure();
      if (!shape) return;
      delete shape.color;
      redrawStructures();
      updateDesignPanel();
      persistFieldState();
    });
    designClearFillsBtn?.addEventListener("click", () => {
      structures.forEach((s) => delete s.color);
      redrawStructures();
      updateDesignPanel();
      persistFieldState();
    });
    designResetThemeBtn?.addEventListener("click", () => applyDesignTheme(DESIGN_THEME_DEFAULT));
    if (designPresetsEl) {
      designPresetsEl.innerHTML = "";
      DESIGN_PRESETS.forEach((preset) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fm-design-preset";
        btn.style.setProperty("--p-turf", preset.theme.turfCenter);
        btn.style.setProperty("--p-fill", preset.theme.fill);
        btn.style.setProperty("--p-lines", preset.theme.lines);
        const chip = document.createElement("span");
        chip.className = "fm-design-preset-chip";
        chip.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = preset.name;
        btn.append(chip, label);
        btn.addEventListener("click", () => applyDesignTheme(preset.theme));
        designPresetsEl.append(btn);
      });
    }
    const combosEl = document.getElementById("fm-design-combos");
    if (combosEl) {
      combosEl.innerHTML = "";
      STRUCTURE_COMBOS.forEach((combo) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fm-design-combo";
        btn.style.setProperty("--c-fill", combo.fill);
        btn.style.setProperty("--c-outline", combo.outline);
        btn.style.setProperty("--c-glow", combo.glow);
        const chip = document.createElement("span");
        chip.className = "fm-design-combo-chip";
        chip.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = combo.name;
        btn.append(chip, label);
        btn.addEventListener("click", () =>
          applyDesignTheme({ ...designTheme, fill: combo.fill, outline: combo.outline, glow: combo.glow })
        );
        combosEl.append(btn);
      });
    }
    setDesignTab(designTab);
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

  function getTrianglePoints(left, top, width, height, flipped) {
    const right = left + width;
    const bottom = top + height;
    const midX = left + width / 2;
    return flipped
      ? [
          [midX, bottom],
          [left, top],
          [right, top],
        ]
      : [
          [midX, top],
          [right, bottom],
          [left, bottom],
        ];
  }

  function traceTrianglePath(context, left, top, width, height, flipped) {
    const pts = getTrianglePoints(left, top, width, height, flipped);
    context.beginPath();
    context.moveTo(pts[0][0], pts[0][1]);
    context.lineTo(pts[1][0], pts[1][1]);
    context.lineTo(pts[2][0], pts[2][1]);
    context.closePath();
  }

  function rayTriangleHitT(ox, oy, dx, dy, left, top, width, height, flipped) {
    const [a, b, c] = getTrianglePoints(left, top, width, height, flipped);
    const hits = [
      raySegmentHitT(ox, oy, dx, dy, a[0], a[1], b[0], b[1]),
      raySegmentHitT(ox, oy, dx, dy, b[0], b[1], c[0], c[1]),
      raySegmentHitT(ox, oy, dx, dy, c[0], c[1], a[0], a[1]),
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
      return rayTriangleHitT(ox, oy, dx, dy, left, top, width, height, Boolean(shape.flip));
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

  function clonePath(path) {
    if (!Array.isArray(path)) return null;
    const points = path
      .filter((p) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
      .map((p) => ({ x: Math.round(Number(p.x) * 10000) / 10000, y: Math.round(Number(p.y) * 10000) / 10000 }));
    return points.length ? points : null;
  }

  function getSetupRunRoute(setup) {
    if (setup.standStill || !setup.runPoint) return null;
    return setup.runPath?.length ? setup.runPath : [setup.runPoint];
  }

  function getShootSetupComplete(setup) {
    if (!setup?.playerKey) return false;
    if (setup.noShoot) return Boolean(setup.runPoint);
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
      noShoot: shootNoShot,
      shootOver,
      targetPlayerKey: shootUseTargetPlayer ? getPlayerKey(shootTargetPlayerEl) : "",
      shootPoint: shootUseTargetPlayer ? null : clonePoint(shootPoint),
      runPoint: shootStandStill ? null : clonePoint(runPoint),
      runPath: shootStandStill || !runPoint ? null : clonePath(runPath),
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
    shootMode = shootStandStill ? "shoot" : "run";
    updateShootPanel();
    redrawShootOverlay();
  }

  function getTeamPlayers(team) {
    return [...playersLayer.querySelectorAll(`.fm-player[data-team="${team}"]`)]
      .filter((el) => !isGhostPlayer(el))
      .sort((a, b) => Number(a.dataset.num) - Number(b.dataset.num));
  }

  function stepShootPlayer(step) {
    if (!shootPlayerEl) return;
    const teamPlayers = getTeamPlayers(shootPlayerEl.dataset.team);
    if (teamPlayers.length < 2) return;
    const index = teamPlayers.indexOf(shootPlayerEl);
    const next = teamPlayers[(index + step + teamPlayers.length) % teamPlayers.length];

    if (getCurrentShootSetup(false)) saveShootSetup();
    const saved = shootSceneSetups.find((s) => s.playerKey === getPlayerKey(next));
    if (saved) {
      loadShootSetup(saved.id);
    } else {
      newShootSetup();
      selectShootPlayer(next);
    }
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
    clearSceneAutoReset();
    if (runAnimationFrame) {
      cancelAnimationFrame(runAnimationFrame);
      runAnimationFrame = null;
    }
    clearShootSceneDots();
    setTimelinePlayhead(null);
    if (shootPlayerEl) shootPlayerEl.classList.remove("is-shoot-selected");
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootPlayerEl = null;
    shootTargetPlayerEl = null;
    shootUseTargetPlayer = false;
    shootStandStill = false;
    shootNoShot = false;
    shootOver = false;
    if (shootTargetPlayerInput) shootTargetPlayerInput.checked = false;
    if (shootStandStillInput) shootStandStillInput.checked = false;
    shootPoint = null;
    runPoint = null;
    runPath = null;
    shootRunDraw = null;
    targetRunPoint = null;
    lastRunStartPositions = null;
    runRouteProgress.clear();
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
    const teamPlayers = hasPlayer ? getTeamPlayers(shootPlayerEl.dataset.team) : [];
    const canStep = teamPlayers.length > 1;
    if (shootPrevPlayerBtn) shootPrevPlayerBtn.disabled = !canStep;
    if (shootNextPlayerBtn) shootNextPlayerBtn.disabled = !canStep;
    if (shootPlayerStep) {
      shootPlayerStep.textContent = hasPlayer ? `${teamPlayers.indexOf(shootPlayerEl) + 1} / ${teamPlayers.length}` : "";
    }
    if (shootStandStillInput) shootStandStillInput.checked = shootStandStill;
    if (shootNoShotInput) shootNoShotInput.checked = shootNoShot;
    if (shootOverInput) {
      shootOverInput.checked = shootOver;
      shootOverInput.disabled = shootNoShot;
    }
    if (shootTargetPlayerInput) shootTargetPlayerInput.disabled = shootNoShot;
    if (shootTargetStatus) {
      shootTargetStatus.hidden = !shootNoShot && !shootUseTargetPlayer;
      if (shootNoShot) {
        shootTargetStatus.textContent = "No shoot — draw a run route for this player.";
      } else if (!shootUseTargetPlayer) {
        shootTargetStatus.textContent = "";
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
    const canPlayScene = hasMap && shootSceneSetups.some(getShootSetupComplete);
    if (shootPlaySceneBtn) shootPlaySceneBtn.disabled = !canPlayScene;
    if (shootPlayWindowBtn) shootPlayWindowBtn.disabled = !canPlayScene;
    if (shootDownloadGifBtn) shootDownloadGifBtn.disabled = !canPlayScene;
    if (shootResetSceneBtn) shootResetSceneBtn.disabled = !lastRunStartPositions;
    if (shootClearSceneBtn) shootClearSceneBtn.disabled = shootSceneSetups.length === 0;
    if (shootSceneCount) {
      shootSceneCount.textContent = `${shootSceneSetups.length} saved`;
    }
    shootModeBtns.forEach((btn) => {
      const mode = btn.dataset.shootMode;
      const isRun = mode === "run";
      btn.disabled = isRun ? shootStandStill : shootNoShot;
      btn.classList.toggle("is-active", mode === shootMode);
      if (mode === "shoot") {
        btn.textContent = shootUseTargetPlayer ? "Pick target" : "Set shoot";
      }
    });
    renderShootSceneList();
  }

  function getShootSetupSummary(setup) {
    const targetLabel = setup.noShoot
      ? "no shoot"
      : `${
          setup.useTargetPlayer
            ? `shoots ${getPlayerLabelByKey(setup.targetPlayerKey)}`
            : "shoots map point"
        }${setup.shootOver ? " (over)" : ""}`;
    return setup.standStill
      ? `${targetLabel} · stands still`
      : `${targetLabel} · runs ${setup.timeSec || 3}s`;
  }

  function buildTimelineClip(setup, scaleSec) {
    const clip = document.createElement("span");
    clip.className = "fm-clip";
    if (setup.noShoot) clip.classList.add("is-run-only");
    else if (setup.standStill) clip.classList.add("is-hold");
    clip.style.setProperty("--clip-len", String(Math.min(1, getSetupDurationMs(setup) / 1000 / scaleSec)));

    if (!setup.noShoot) {
      const shot = document.createElement("span");
      shot.className = "fm-clip-seg fm-clip-shot";
      if (setup.useTargetPlayer) {
        shot.textContent = setup.targetPlayerKey ? getPlayerLabelByKey(setup.targetPlayerKey) : "Pick target";
      } else {
        shot.textContent = "Shoot";
      }
      if (setup.standStill) shot.textContent += ` · hold ${setup.timeSec || 3}s`;
      const hasShot = setup.useTargetPlayer ? setup.targetPlayerKey : setup.shootPoint;
      shot.classList.toggle("is-missing", !hasShot);
      clip.append(shot);
    }
    if (!setup.standStill) {
      const run = document.createElement("span");
      run.className = "fm-clip-seg fm-clip-run";
      run.classList.toggle("is-missing", !setup.runPoint);
      run.textContent = `Run ${setup.timeSec || 3}s`;
      clip.append(run);
    }
    if (setup.shootOver && !setup.noShoot) {
      const badge = document.createElement("span");
      badge.className = "fm-clip-badge";
      badge.textContent = "Over";
      clip.append(badge);
    }
    const handle = document.createElement("span");
    handle.className = "fm-clip-handle";
    handle.setAttribute("aria-hidden", "true");
    clip.append(handle);
    clip.title = "Drag to change run time";
    return clip;
  }

  function buildTimelineTrack(setup, scaleSec, options = {}) {
    const player = getPlayerByKey(setup.playerKey);
    const li = document.createElement("li");
    li.className = "fm-shoot-scene-item";
    li.dataset.team = player?.dataset.team || "";
    li.dataset.setupId = options.draft ? "draft" : setup.id;
    if (options.draft) li.classList.add("is-draft");
    if (timelineDrag?.moved && timelineDrag.id === li.dataset.setupId) li.classList.add("is-resizing");

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "fm-shoot-scene-load";
    if (setup.id === activeShootSetupId || options.draft) loadBtn.classList.add("is-active");

    const head = document.createElement("span");
    head.className = "fm-track-head";
    const name = document.createElement("span");
    name.className = "fm-shoot-scene-name";
    name.textContent = getPlayerLabelByKey(setup.playerKey);
    const short = document.createElement("span");
    short.className = "fm-track-short";
    if (player) short.textContent = `${player.dataset.team === "a" ? "A" : "B"}${player.dataset.num || ""}`;
    const meta = document.createElement("span");
    meta.className = "fm-shoot-scene-meta";
    meta.textContent = options.draft ? "Unsaved edit" : getShootSetupSummary(setup);
    head.append(name, short, meta);

    const lane = document.createElement("span");
    lane.className = "fm-track-lane";
    lane.append(buildTimelineClip(setup, scaleSec));

    loadBtn.append(head, lane);
    if (options.draft) loadBtn.setAttribute("aria-disabled", "true");
    else loadBtn.addEventListener("click", () => loadShootSetup(setup.id));
    li.append(loadBtn);

    if (!options.draft) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "fm-shoot-scene-remove";
      removeBtn.setAttribute("aria-label", `Remove ${getPlayerLabelByKey(setup.playerKey)} setup`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => removeShootSetup(setup.id));
      li.append(removeBtn);
    }
    return li;
  }

  function renderTimelineRuler(scaleSec) {
    if (!shootTimelineRuler) return;
    shootTimelineRuler.innerHTML = "";
    const step = scaleSec > 15 ? 5 : scaleSec > 8 ? 2 : 1;
    for (let sec = 0; sec <= scaleSec; sec += step) {
      const tick = document.createElement("span");
      tick.className = "fm-timeline-tick";
      tick.style.setProperty("--tick-pos", String(sec / scaleSec));
      tick.textContent = `${sec}s`;
      shootTimelineRuler.append(tick);
    }
  }

  function renderShootSceneList() {
    if (!shootSceneList) return;
    const draftSetup =
      shootPlayerEl && !activeShootSetupId ? getCurrentShootSetup(true) : null;
    const allSetups = draftSetup ? [...shootSceneSetups, draftSetup] : shootSceneSetups;
    const longestSec = Math.max(0, ...allSetups.map((setup) => getSetupDurationMs(setup) / 1000));
    const dragMinScale = timelineDrag?.moved ? timelineDrag.minScale : 0;
    timelineScaleSec = Math.max(5, Math.ceil(longestSec), dragMinScale);

    renderTimelineRuler(timelineScaleSec);
    shootTimeline?.classList.toggle("is-empty", allSetups.length === 0);
    shootTimeline?.style.setProperty("--timeline-sec", String(timelineScaleSec));
    shootSceneList.innerHTML = "";
    shootSceneSetups.forEach((setup) => {
      shootSceneList.append(buildTimelineTrack(setup, timelineScaleSec));
    });
    if (draftSetup) {
      shootSceneList.append(buildTimelineTrack(draftSetup, timelineScaleSec, { draft: true }));
    }
  }

  function setTimelinePlayhead(elapsedMs) {
    if (!shootTimelinePlayhead) return;
    if (elapsedMs == null) {
      shootTimelinePlayhead.hidden = true;
      return;
    }
    shootTimelinePlayhead.hidden = false;
    const progress = Math.min(1, elapsedMs / (timelineScaleSec * 1000));
    shootTimelinePlayhead.style.setProperty("--playhead", String(progress));
  }

  function getTimelineDragSec(clientX) {
    const rect = shootTimelineRuler?.getBoundingClientRect();
    if (!rect?.width || !timelineDrag) return null;
    const current = timelineDrag.sec ?? timelineDrag.startSec;
    if (clientX > rect.right) {
      const now = performance.now();
      if (now - timelineDrag.lastGrowAt < 120) return current;
      timelineDrag.lastGrowAt = now;
      return Math.min(30, Math.max(current, timelineScaleSec) + 0.5);
    }
    const sec = timelineDrag.startSec + (clientX - timelineDrag.startX) / timelineDrag.pxPerSec;
    return Math.max(0.5, Math.min(30, Math.round(sec * 2) / 2));
  }

  function setTimelineClipTime(id, sec) {
    if (id === "draft") {
      if (shootTimeInput) shootTimeInput.value = String(sec);
      return;
    }
    const setup = shootSceneSetups.find((s) => s.id === id);
    if (!setup) return;
    setup.timeSec = sec;
    if (id === activeShootSetupId && shootTimeInput) shootTimeInput.value = String(sec);
  }

  function onTimelineDragMove(e) {
    if (!timelineDrag || e.pointerId !== timelineDrag.pointerId) return;
    if (!timelineDrag.moved && Math.abs(e.clientX - timelineDrag.startX) < 4) return;
    if (!timelineDrag.moved) {
      timelineDrag.moved = true;
      shootTimeline?.classList.add("is-dragging");
    }
    e.preventDefault();
    const sec = getTimelineDragSec(e.clientX);
    if (sec == null || sec === timelineDrag.sec) return;
    timelineDrag.sec = sec;
    setTimelineClipTime(timelineDrag.id, sec);
    renderShootSceneList();
  }

  function endTimelineDrag(e) {
    if (!timelineDrag || e.pointerId !== timelineDrag.pointerId) return;
    const { moved } = timelineDrag;
    timelineDrag = null;
    shootTimeline?.classList.remove("is-dragging");
    window.removeEventListener("pointermove", onTimelineDragMove);
    window.removeEventListener("pointerup", endTimelineDrag);
    window.removeEventListener("pointercancel", endTimelineDrag);
    if (!moved) return;
    suppressTimelineClick = true;
    setTimeout(() => {
      suppressTimelineClick = false;
    }, 0);
    updateShootPanel();
  }

  function startTimelineDrag(e) {
    if (e.button !== 0 || timelineDrag) return;
    const item = e.target.closest(".fm-clip")?.closest(".fm-shoot-scene-item");
    const rulerWidth = shootTimelineRuler?.getBoundingClientRect().width;
    if (!item?.dataset.setupId || !rulerWidth) return;
    const id = item.dataset.setupId;
    const setup =
      id === "draft" ? getCurrentShootSetup(true) : shootSceneSetups.find((s) => s.id === id);
    if (!setup) return;
    timelineDrag = {
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startSec: getSetupDurationMs(setup) / 1000,
      pxPerSec: rulerWidth / timelineScaleSec,
      moved: false,
      sec: null,
      minScale: timelineScaleSec,
      lastGrowAt: 0,
    };
    window.addEventListener("pointermove", onTimelineDragMove);
    window.addEventListener("pointerup", endTimelineDrag);
    window.addEventListener("pointercancel", endTimelineDrag);
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
    shootNoShot = Boolean(setup.noShoot);
    shootOver = Boolean(setup.shootOver);
    shootStandStill = !shootNoShot && (Boolean(setup.standStill) || !setup.runPoint);
    if (shootTargetPlayerInput) shootTargetPlayerInput.checked = shootUseTargetPlayer;
    if (shootStandStillInput) shootStandStillInput.checked = shootStandStill;
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.remove("is-shoot-target");
    shootTargetPlayerEl = shootUseTargetPlayer ? getPlayerByKey(setup.targetPlayerKey) : null;
    if (shootTargetPlayerEl) shootTargetPlayerEl.classList.add("is-shoot-target");

    shootPoint = clonePoint(setup.shootPoint);
    runPoint = shootStandStill ? null : clonePoint(setup.runPoint);
    runPath = runPoint ? clonePath(setup.runPath) : null;
    targetRunPoint = clonePoint(setup.targetRunPoint);
    if (shootTimeInput) shootTimeInput.value = String(setup.timeSec || 3);
    shootMode = shootStandStill ? "shoot" : "run";

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
    runPath = null;
    targetRunPoint = null;
    shootUseTargetPlayer = false;
    shootStandStill = false;
    shootNoShot = false;
    shootOver = false;
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

  function drawPointMarker(context, point, color) {
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

  function strokeShootPath(context, points, color, width, dash) {
    if (points.length < 2) return;
    context.save();
    context.beginPath();
    context.setLineDash(dash || []);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.miterLimit = 2;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) context.lineTo(points[i].x, points[i].y);
    context.stroke();
    context.restore();
    context.beginPath();
  }

  function drawShootDot(context, point, color, radius, lineWidth = 2) {
    context.save();
    context.beginPath();
    context.setLineDash([]);
    context.fillStyle = color;
    context.strokeStyle = "#0f1210";
    context.lineWidth = lineWidth;
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
    context.beginPath();
  }

  function castSetupShot(setup, start, target, w, h) {
    if (setup.shootOver) return { end: target, blocked: false };
    return rayCastToPoint(start, target, w, h);
  }

  function getSetupShootLine(setup) {
    const { w, h } = getCanvasSize();
    const playerEl = getPlayerByKey(setup.playerKey);
    if (setup.noShoot || !playerEl || !w || !h) return null;

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
    const shot = castSetupShot(setup, start, target, w, h);
    return {
      start,
      end: shot.end,
      blocked: shot.blocked,
      color: shot.blocked ? SHOOT_BLOCKED_COLOR : SHOOT_DOT_COLOR,
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
        4.125,
        1.5
      );
    });
  }

  function drawShootSetupOverlay(setup, muted) {
    const { w, h } = getCanvasSize();
    const playerEl = getPlayerByKey(setup.playerKey);
    if (!playerEl || !w || !h) return;

    const player = getPlayerCenterPx(playerEl);
    const start = { x: player.x, y: player.y };
    const targetPlayerEl =
      setup.useTargetPlayer && !setup.noShoot ? getPlayerByKey(setup.targetPlayerKey) : null;
    const shootTarget = setup.noShoot
      ? null
      : setup.useTargetPlayer && targetPlayerEl
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

    if (setup.shootPoint && !setup.useTargetPlayer && !setup.noShoot) {
      drawPointMarker(shootCtx, setup.shootPoint, SHOOT_LINE_COLOR);
    }
    if (setup.runPoint) drawPointMarker(shootCtx, setup.runPoint, RUN_POINT_COLOR);
    if (setup.targetRunPoint) {
      drawPointMarker(shootCtx, setup.targetRunPoint, SHOOT_BLOCKED_COLOR);
    }

    if (shootTarget) {
      const target = { x: shootTarget.x, y: shootTarget.y };
      const shot = castSetupShot(setup, start, target, w, h);
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

    const runRoute = getSetupRunRoute(setup);
    if (runRoute) {
      const remaining = runRoute.slice(runRouteProgress.get(setup.playerKey) || 0);
      strokeShootPath(
        shootCtx,
        [start, ...remaining.map(denormalizePoint)],
        RUN_POINT_COLOR,
        muted ? 2 : 3,
        [8, 6]
      );
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
      startRunDraw(e, false);
      return;
    } else if (!shootUseTargetPlayer && !shootNoShot) {
      shootPoint = point;
    }
    updateShootPanel();
    redrawShootOverlay();
  }

  function startRunDraw(e, fromPlayer) {
    if (shootRunDraw) return;
    const px = getLayerPoint(e, shootCanvas);
    shootRunDraw = {
      pid: e.pointerId,
      fromPlayer,
      prevPath: runPath,
      prevPoint: runPoint,
      lastPx: fromPlayer ? null : px,
    };
    runRouteProgress.delete(getPlayerKey(shootPlayerEl));
    if (fromPlayer) {
      runPath = [];
      runPoint = null;
    } else {
      const point = normalizeLayerPoint(px);
      runPath = [point];
      runPoint = point;
    }
    setInteractionLock(true);
    try {
      shootCanvas.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    redrawShootOverlay();
  }

  function extendRunDraw(e) {
    if (!shootRunDraw || shootRunDraw.pid !== e.pointerId) return;
    e.preventDefault();
    const px = getLayerPoint(e, shootCanvas);
    const last = shootRunDraw.lastPx;
    if (last && Math.hypot(px.x - last.x, px.y - last.y) < RUN_PATH_MIN_STEP_PX) return;
    if (!last && shootPlayerEl) {
      const player = getPlayerCenterPx(shootPlayerEl);
      if (Math.hypot(px.x - player.x, px.y - player.y) < RUN_PATH_MIN_STEP_PX * 2) return;
    }
    const point = normalizeLayerPoint(px);
    if (!point) return;
    shootRunDraw.lastPx = px;
    runPath.push(point);
    runPoint = point;
    redrawShootOverlay();
  }

  function simplifyRunPath(path) {
    if (path.length <= RUN_PATH_MAX_POINTS) return path;
    const stride = path.length / RUN_PATH_MAX_POINTS;
    const out = [];
    for (let i = 0; i < RUN_PATH_MAX_POINTS - 1; i++) out.push(path[Math.floor(i * stride)]);
    out.push(path[path.length - 1]);
    return out;
  }

  function endRunDraw(e) {
    if (!shootRunDraw || shootRunDraw.pid !== e.pointerId) return;
    const draw = shootRunDraw;
    shootRunDraw = null;
    setInteractionLock(false);
    if (shootCanvas.hasPointerCapture?.(e.pointerId)) shootCanvas.releasePointerCapture(e.pointerId);

    if (!runPath?.length) {
      runPath = draw.prevPath;
      runPoint = draw.prevPoint;
      redrawShootOverlay();
      return;
    }
    runPath = simplifyRunPath(runPath);
    runPoint = runPath[runPath.length - 1];
    shootStandStill = false;
    if (shootStandStillInput) shootStandStillInput.checked = false;
    if (!shootNoShot && !shootPoint && !shootTargetPlayerEl) shootMode = "shoot";
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
    const route = getSetupRunRoute(setup);
    if (!route) return [];
    const playerEl = getPlayerByKey(setup.playerKey);
    if (!playerEl) return [];
    const runners = [
      {
        key: setup.playerKey,
        el: playerEl,
        route,
        duration: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000,
      },
    ];
    if (setup.useTargetPlayer && setup.targetPlayerKey && setup.targetRunPoint) {
      const targetEl = getPlayerByKey(setup.targetPlayerKey);
      if (targetEl) {
        runners.push({
          key: setup.targetPlayerKey,
          el: targetEl,
          route: [setup.targetRunPoint],
          duration: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000,
        });
      }
    }
    return runners;
  }

  /** Polyline in stage percent, with cumulative pixel lengths so speed is even on wide maps. */
  function buildRunnerTrack(start, route) {
    const { w, h } = getCanvasSize();
    const sx = w || 1;
    const sy = h || 1;
    const points = [{ x: start.x, y: start.y }, ...route.map((p) => ({ x: p.x * 100, y: p.y * 100 }))];
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
      const dx = ((points[i].x - points[i - 1].x) / 100) * sx;
      const dy = ((points[i].y - points[i - 1].y) / 100) * sy;
      lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
    }
    return { points, lengths, total: lengths[lengths.length - 1] };
  }

  function pointAlongTrack(track, fraction) {
    const { points, lengths, total } = track;
    if (total <= 0 || fraction >= 1) return { ...points[points.length - 1], segment: points.length - 1 };
    const target = Math.max(0, fraction) * total;
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < target) i++;
    const segLen = lengths[i] - lengths[i - 1] || 1;
    const t = (target - lengths[i - 1]) / segLen;
    return {
      x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
      y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      segment: i - 1,
    };
  }

  function getSetupDurationMs(setup) {
    return Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)) * 1000;
  }

  function clearSceneAutoReset() {
    clearTimeout(sceneAutoResetTimer);
    sceneAutoResetTimer = null;
  }

  function runShootSetups(setups, options = {}) {
    if (!setups.length) return false;
    clearSceneAutoReset();
    const runners = setups.flatMap(getSetupRunners);
    const useSceneDots = Boolean(options.sceneDots);
    const playDots = useSceneDots || setups.every((setup) => setup.standStill || !setup.runPoint);
    const holdMs = Math.max(0, ...setups.map(getSetupDurationMs));
    if (!runners.length && !playDots) return false;
    if (runAnimationFrame) cancelAnimationFrame(runAnimationFrame);

    if (playDots) startShootSceneDots(setups);
    else clearShootSceneDots();

    const startedAt = performance.now();
    const startByKey = new Map();
    runners.forEach(({ key, el }) => {
      if (!startByKey.has(key)) startByKey.set(key, { el, ...getPlayerPercentPosition(el) });
    });
    lastRunStartPositions = runners.length ? Array.from(startByKey.values()) : null;
    runRouteProgress.clear();
    runners.forEach((runner) => {
      const start = startByKey.get(runner.key);
      if (start) runner.track = buildRunnerTrack(start, runner.route);
    });
    updateShootPanel();

    const step = (now) => {
      let stillRunning = false;
      if (shootSceneDotAnim) updateShootSceneDots(now);
      setTimelinePlayhead(now - startedAt);

      if (runners.length) {
        runners.forEach(({ key, el, track, duration }) => {
          if (!track) return;
          const t = Math.min(1, (now - startedAt) / duration);
          if (t < 1) stillRunning = true;
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const pos = pointAlongTrack(track, eased);
          positionPlayer(el, pos.x, pos.y);
          runRouteProgress.set(key, pos.segment);
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
      setTimelinePlayhead(null);
      updateShootPanel();
      if (options.autoReset) {
        sceneAutoResetTimer = setTimeout(() => {
          sceneAutoResetTimer = null;
          resetShootRun();
        }, SCENE_AUTO_RESET_MS);
      }
      options.onDone?.();
    };

    runAnimationFrame = requestAnimationFrame(step);
    return true;
  }

  function runShootPlayer() {
    const setup = getCurrentShootSetup(false);
    if (!setup) return;
    if (lastRunStartPositions) resetShootRun();
    runShootSetups([setup], { autoReset: true });
  }

  function runShootScene(onDone) {
    const readySetups = shootSceneSetups.filter(getShootSetupComplete);
    if (!readySetups.length) return false;
    return runShootSetups(readySetups, { sceneDots: true, autoReset: true, onDone });
  }

  function resetShootRun() {
    clearSceneAutoReset();
    if (!lastRunStartPositions) return;
    if (runAnimationFrame) {
      cancelAnimationFrame(runAnimationFrame);
      runAnimationFrame = null;
    }
    clearShootSceneDots();
    setTimelinePlayhead(null);
    lastRunStartPositions.forEach(({ el, x, y }) => {
      if (!el?.isConnected) return;
      positionPlayer(el, x, y);
      if (visionPlayerEl === el) redrawVisionLines();
    });
    lastRunStartPositions = null;
    runRouteProgress.clear();
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

  function duplicateSelectedStructure() {
    const shape = getSelectedStructure();
    if (!shape) return;

    const bounds = getStructureBounds(shape);
    const offset = 0.03;
    let left = bounds.left + offset;
    let top = bounds.top + offset;
    left = Math.max(0, Math.min(1 - bounds.width, left));
    top = Math.max(0, Math.min(1 - bounds.height, top));
    if (left === bounds.left && top === bounds.top) {
      left = Math.max(0, bounds.left - offset);
      top = Math.max(0, bounds.top - offset);
    }

    const copy = {
      id: crypto.randomUUID(),
      type: shape.type,
      fill: normalizeStructureFill(shape.fill),
      flip: Boolean(shape.flip),
      ...(shape.color ? { color: shape.color } : {}),
      x1: left,
      y1: top,
      x2: left + bounds.width,
      y2: top + bounds.height,
      detected: false,
      name: "",
      bio: "",
    };

    structures.push(copy);
    selectedStructureId = copy.id;
    clearSizerUndo();
    persistFieldState();
    updateSizerPanel();
    updateControlStates();
    updateIntelReport();
    redrawStructures();
    redrawShootOverlay();
  }

  function deleteSelectedStructure() {
    const shape = getSelectedStructure();
    if (!shape) return;
    const index = structures.findIndex((s) => s.id === shape.id);
    if (index < 0) return;
    structures.splice(index, 1);
    selectedStructureId = structures.length ? structures[structures.length - 1].id : null;
    clearSizerUndo();
    persistFieldState();
    updateSizerPanel();
    updateControlStates();
    updateIntelReport();
    redrawStructures();
    redrawShootOverlay();
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
    const step = getSizerMoveStep() / 100;
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

  function getSizerMoveStep() {
    const n = Number(sizerStepInput?.value);
    return Number.isFinite(n) && n > 0 ? n : SIZER_MOVE_STEP;
  }

  function syncSizerStepUi() {
    if (!sizerStepInput) return;
    const min = Number(sizerStepInput.min) || 0;
    const max = Number(sizerStepInput.max) || 1;
    const step = getSizerMoveStep();
    sizerStepInput.closest(".fm-throttle")?.style.setProperty("--fill", `${((step - min) / (max - min)) * 100}%`);
    if (sizerStepValue) sizerStepValue.textContent = `${step}%`;
  }

  function initSizerStep() {
    if (!sizerStepInput) return;
    try {
      const saved = Number(localStorage.getItem(SIZER_STEP_KEY));
      if (saved > 0) sizerStepInput.value = String(saved);
    } catch {}
    syncSizerStepUi();
    sizerStepInput.addEventListener("input", () => {
      syncSizerStepUi();
      try {
        localStorage.setItem(SIZER_STEP_KEY, String(getSizerMoveStep()));
      } catch {}
    });
  }

  function updateSizerPanel() {
    updateDesignPanel();
    const shape = getSelectedStructure();
    const hasSelection = Boolean(shape);

    workspace?.classList.toggle("has-sizer-selection", hasSelection);
    if (sizerEmpty) sizerEmpty.hidden = hasSelection;
    if (sizerControls) sizerControls.hidden = !hasSelection;
    if (sizerTypeLabel) sizerTypeLabel.hidden = !hasSelection;
    if (duplicateStructureBtn) duplicateStructureBtn.disabled = !hasMap || !hasSelection;
    if (deleteStructureBtn) deleteStructureBtn.disabled = !hasMap || !hasSelection;

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
    if (duplicateStructureBtn) duplicateStructureBtn.disabled = !hasMap || !hasSelection;
    if (deleteStructureBtn) deleteStructureBtn.disabled = !hasMap || !hasSelection;
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

    initSizerStep();
    undoSizerBtn?.addEventListener("click", undoSizerChange);
    duplicateStructureBtn?.addEventListener("click", duplicateSelectedStructure);
    deleteStructureBtn?.addEventListener("click", deleteSelectedStructure);
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
        const [[ax, ay], [bx, by], [cx2, cy2]] = getTrianglePoints(
          left,
          top,
          b.width,
          b.height,
          Boolean(s.flip)
        );
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

  function hitTestStructureBounds(px, py, padPx) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return null;
    for (let i = structures.length - 1; i >= 0; i--) {
      const s = structures[i];
      const b = getStructureBounds(s);
      const left = b.left * w - padPx;
      const top = b.top * h - padPx;
      const right = (b.left + b.width) * w + padPx;
      const bottom = (b.top + b.height) * h + padPx;
      if (px >= left && px <= right && py >= top && py <= bottom) return s;
    }
    return null;
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

    intelSection.hidden = !isIntelPanelShown();
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
      traceTrianglePath(context, left, top, width, height, Boolean(shape.flip));
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
      if (designMapOn && !preview && !isTransparentWall) {
        const fillHex = shape.color || designTheme.fill;
        context.fillStyle = isBorderOnly ? designRgba(fillHex, 0.08) : fillHex;
        context.strokeStyle = isBorderOnly ? shape.color || designTheme.outline : designTheme.outline;
        context.shadowColor = designRgba(shape.color || designTheme.glow, 0.55);
        context.shadowBlur = 12;
      }
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
      traceTrianglePath(context, left, top, width, height, Boolean(shape.flip));
      if (shouldFill) context.fill();
      if (shouldStroke) context.stroke();
    }

    context.restore();
  }

  function serializeFieldState() {
    return {
      version: 1,
      designMap: designMapOn,
      designTheme: { ...designTheme },
      report: { name: fieldIntelReport.name || "", bio: fieldIntelReport.bio || "" },
      structures: structures.map((s) => ({
        type: s.type,
        x1: s.x1,
        y1: s.y1,
        x2: s.x2,
        y2: s.y2,
        fill: normalizeStructureFill(s.fill),
        flip: Boolean(s.flip),
        name: s.name || "",
        bio: s.bio || "",
        ...(s.color ? { color: s.color } : {}),
      })),
      shootScene: shootSceneSetups.map((setup) => ({
        playerKey: setup.playerKey,
        timeSec: setup.timeSec,
        useTargetPlayer: Boolean(setup.useTargetPlayer),
        standStill: Boolean(setup.standStill),
        noShoot: Boolean(setup.noShoot),
        shootOver: Boolean(setup.shootOver),
        targetPlayerKey: setup.targetPlayerKey || "",
        shootPoint: clonePoint(setup.shootPoint),
        runPoint: setup.standStill ? null : clonePoint(setup.runPoint),
        runPath: setup.standStill ? null : clonePath(setup.runPath),
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
    designMapOn = Boolean(state.designMap);
    designTheme = normalizeDesignTheme(state.designTheme);
    if (state.report) {
      fieldIntelReport = {
        name: state.report.name || "",
        bio: state.report.bio || "",
      };
    }
    shootSceneSetups = Array.isArray(state.shootScene)
      ? state.shootScene.map((setup) => {
          const noShoot = Boolean(setup.noShoot);
          const standStill = !noShoot && (Boolean(setup.standStill) || !setup.runPoint);
          return {
            id: crypto.randomUUID(),
            playerKey: setup.playerKey || "",
            timeSec: Math.max(0.5, Math.min(30, Number(setup.timeSec) || 3)),
            useTargetPlayer: Boolean(setup.useTargetPlayer),
            standStill,
            noShoot,
            shootOver: Boolean(setup.shootOver),
            targetPlayerKey: setup.targetPlayerKey || "",
            shootPoint: clonePoint(setup.shootPoint),
            runPoint: standStill ? null : clonePoint(setup.runPoint),
            runPath: standStill ? null : clonePath(setup.runPath),
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

    structures = state.structures
      .filter((s) => Math.abs(s.x2 - s.x1) > 0.002 && Math.abs(s.y2 - s.y1) > 0.002)
      .map((s) => ({
        id: crypto.randomUUID(),
        type: s.type || "rectangle",
        x1: s.x1,
        y1: s.y1,
        x2: s.x2,
        y2: s.y2,
        name: s.name || "",
        bio: s.bio || "",
        fill: normalizeStructureFill(s.fill),
        flip: Boolean(s.flip),
        detected: true,
        ...(isDesignHex(s.color) ? { color: s.color.toLowerCase() } : {}),
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

    pendingPackLoad = true;
    if (!loadMapImageFromFile(imageFile, packState)) {
      pendingPackLoad = false;
      window.alert("Could not load map.png from the map pack.");
    }
  }

  async function loadPresetMapPack(preset) {
    const fetchFile = async (name, type) => {
      const res = await fetch(`${preset.folder}/${name}`, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Missing ${name}`);
      return new File([await res.blob()], name, { type });
    };
    const [imageFile, jsonFile] = await Promise.all([
      fetchFile("map.png", "image/png"),
      fetchFile("intel.json", "application/json"),
    ]);
    await handleMapPackFiles([imageFile, jsonFile]);
  }

  function openPresetModal() {
    if (!presetModal || !presetList) return;
    presetList.innerHTML = "";
    MAP_PRESETS.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fm-preset-btn";
      btn.textContent = preset.name;
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Loading…";
        try {
          await loadPresetMapPack(preset);
          closePresetModal();
        } catch {
          window.alert(`Could not load the ${preset.name} preset.`);
          btn.disabled = false;
          btn.textContent = preset.name;
        }
      });
      presetList.append(btn);
    });
    presetModal.hidden = false;
    presetModal.setAttribute("aria-hidden", "false");
    body.classList.add("fm-intel-modal-open");
    presetList.querySelector("button")?.focus();
  }

  function closePresetModal() {
    if (!presetModal || presetModal.hidden) return;
    presetModal.hidden = true;
    presetModal.setAttribute("aria-hidden", "true");
    if (!intelModalOpen) body.classList.remove("fm-intel-modal-open");
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

    [canvas, structureCanvas, visionCanvas, shootCanvas, mirrorCanvas, designCanvas, autoCanvas].filter(Boolean).forEach((c) => {
      const isVisionLayer = c === visionCanvas;
      let snapshot = null;
      const cctx = c.getContext("2d");
      const shouldSnapshot =
        !isVisionLayer && c !== shootCanvas && c !== mirrorCanvas && c !== designCanvas && c !== autoCanvas;
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
    renderDesignMap();
    redrawStructures();
    redrawVisionLines();
    redrawShootOverlay();
    redrawMirrorOverlay();
    redrawAutoOverlay();
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

  const AUTO_COLOR = "#6c8cff";
  const AUTO_MAX_DIM = 900;
  const AUTO_FIT_MIN_IOU = 0.8;
  const AUTO_MAX_PIECES = 12;
  const AUTO_HISTORY_LIMIT = 60;
  const AUTO_DARK_MAX = 80;
  const AUTO_MAX_COLORS = 8;
  const AUTO_SEED_MIN_CHROMA = 40;
  const AUTO_CANDIDATES = [
    ["rectangle", false],
    ["circle", false],
    ["triangle", false],
    ["triangle", true],
  ];

  function getAutoTolerance() {
    const match = Number(autoSensitivityInput?.value) || 50;
    return 30 + match * 1.5;
  }

  function autoColorDistance(r1, g1, b1, r2, g2, b2) {
    const rm = (r1 + r2) / 2;
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  }

  function isAutoBackground(data, p) {
    const i = p * 4;
    if (data[i + 3] < 80) return true;
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    return min > 215 && max - min < 25;
  }

  function setAutoStatus(html) {
    if (autoStatus) autoStatus.innerHTML = html;
  }

  function syncAutoSensitivityUi() {
    if (!autoSensitivityInput) return;
    const min = Number(autoSensitivityInput.min) || 0;
    const max = Number(autoSensitivityInput.max) || 100;
    const value = Number(autoSensitivityInput.value) || min;
    autoSensitivityInput.closest(".fm-throttle")?.style.setProperty("--fill", `${((value - min) / (max - min)) * 100}%`);
    if (autoSensitivityValue) autoSensitivityValue.textContent = String(value);
  }

  function getAutoImageData() {
    if (autoImageCache && autoImageCache.src === image.currentSrc) return autoImageCache;
    const scale = Math.min(1, AUTO_MAX_DIM / Math.max(image.naturalWidth, image.naturalHeight, 1));
    const w = Math.max(1, Math.round(image.naturalWidth * scale));
    const h = Math.max(1, Math.round(image.naturalHeight * scale));
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(image, 0, 0, w, h);
    autoImageCache = { src: image.currentSrc, w, h, data: octx.getImageData(0, 0, w, h).data };
    return autoImageCache;
  }

  function traceAutoStroke(ctx, stroke, w, h) {
    const pts = stroke.points;
    const width = Math.max(1, stroke.size * w);
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x * w, pts[0].y * h, width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
    ctx.stroke();
  }

  function paintAutoWhiteout(ctx, strokes, w, h, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokes.forEach((stroke) => traceAutoStroke(ctx, stroke, w, h));
    ctx.restore();
  }

  function getAutoScanData() {
    const base = getAutoImageData();
    if (!autoWhiteout.length) return base;
    if (autoScanCache && autoScanCache.base === base && autoScanCache.strokes === autoWhiteout) return autoScanCache;
    const { w, h } = base;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.putImageData(new ImageData(new Uint8ClampedArray(base.data), w, h), 0, 0);
    paintAutoWhiteout(octx, autoWhiteout, w, h, "#ffffff");
    autoScanCache = { base, strokes: autoWhiteout, w, h, data: octx.getImageData(0, 0, w, h).data };
    return autoScanCache;
  }

  function isAutoDark(data, p) {
    const i = p * 4;
    return data[i + 3] >= 80 && Math.max(data[i], data[i + 1], data[i + 2]) < AUTO_DARK_MAX;
  }

  function isAutoDarkColor(rgb) {
    return Math.max(rgb[0], rgb[1], rgb[2]) < AUTO_DARK_MAX;
  }

  function pruneAutoMask(mask, w, h, region, minCount) {
    const labels = new Int32Array(mask.length);
    const stack = new Int32Array(mask.length);
    let id = 1;
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        if (!mask[p] || labels[p]) continue;
        const comp = floodAutoComponent(mask, w, h, p, labels, id++, stack);
        if (comp.count >= minCount) continue;
        for (let yy = comp.minY; yy <= comp.maxY; yy++) {
          for (let xx = comp.minX; xx <= comp.maxX; xx++) {
            const q = yy * w + xx;
            if (labels[q] === comp.id) mask[q] = 0;
          }
        }
      }
    }
    return mask;
  }

  function buildAutoColorMask(data, w, h, region, rgb, tolerance, shades) {
    const mask = new Uint8Array(w * h);
    const [r, g, b] = rgb;
    const cc = r * r + g * g + b * b || 1;
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        const i = p * 4;
        if (data[i + 3] < 80) continue;
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        if (autoColorDistance(pr, pg, pb, r, g, b) <= tolerance) {
          mask[p] = 1;
          continue;
        }
        if (!shades) continue;
        const k = (pr * r + pg * g + pb * b) / cc;
        if (k < 0.18 || k >= 1) continue;
        if (autoColorDistance(pr, pg, pb, k * r, k * g, k * b) <= tolerance * 0.8 * Math.max(k, 0.3)) mask[p] = 1;
      }
    }
    return mask;
  }

  function bridgeAutoDark(mask, data, w, region, steps) {
    const seen = new Uint8Array(mask.length);
    const dist = new Uint8Array(mask.length);
    const queue = new Int32Array(mask.length);
    let head = 0;
    let tail = 0;
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        if (!mask[p]) continue;
        seen[p] = 1;
        queue[tail++] = p;
      }
    }
    while (head < tail) {
      const p = queue[head++];
      if (dist[p] >= steps) continue;
      const x = p % w;
      const y = (p - x) / w;
      const next = [
        x > region.x0 ? p - 1 : -1,
        x < region.x1 - 1 ? p + 1 : -1,
        y > region.y0 ? p - w : -1,
        y < region.y1 - 1 ? p + w : -1,
      ];
      for (const q of next) {
        if (q < 0 || seen[q] || !isAutoDark(data, q)) continue;
        seen[q] = 1;
        dist[q] = dist[p] + 1;
        mask[q] = 1;
        queue[tail++] = q;
      }
    }
    return mask;
  }

  function sampleAutoColor(data, w, h, cx, cy) {
    const reach = 5;
    const rs = [];
    const gs = [];
    const bs = [];
    for (let dy = -reach; dy <= reach; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= h) continue;
      for (let dx = -reach; dx <= reach; dx++) {
        const x = cx + dx;
        if (x < 0 || x >= w || dx * dx + dy * dy > reach * reach) continue;
        const p = y * w + x;
        if (isAutoBackground(data, p) || isAutoDark(data, p)) continue;
        const i = p * 4;
        rs.push(data[i]);
        gs.push(data[i + 1]);
        bs.push(data[i + 2]);
      }
    }
    if (rs.length < 3) {
      const ci = (cy * w + cx) * 4;
      return [data[ci], data[ci + 1], data[ci + 2]];
    }
    const median = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
    return [median(rs), median(gs), median(bs)];
  }

  function morphAutoMask(mask, w, h, dilate) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = dilate ? 0 : 1;
        for (let dy = -1; dy <= 1 && v === (dilate ? 0 : 1); dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            const m = mask[yy * w + xx];
            if (dilate ? m : !m) {
              v = dilate ? 1 : 0;
              break;
            }
          }
        }
        out[y * w + x] = v;
      }
    }
    return out;
  }

  function closeAutoMask(mask, w, h) {
    return morphAutoMask(morphAutoMask(mask, w, h, true), w, h, false);
  }

  function floodAutoComponent(mask, w, h, start, labels, id, stack) {
    let sp = 0;
    stack[sp++] = start;
    labels[start] = id;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    let count = 0;
    while (sp) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p - x) / w;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const q = ny * w + nx;
          if (mask[q] && !labels[q]) {
            labels[q] = id;
            stack[sp++] = q;
          }
        }
      }
    }
    return { id, minX, minY, maxX, maxY, count };
  }

  function autoComponentMask(labels, w, comp, only) {
    const bw = comp.maxX - comp.minX + 1;
    const bh = comp.maxY - comp.minY + 1;
    const local = new Uint8Array(bw * bh);
    for (let y = 0; y < bh; y++) {
      const row = (comp.minY + y) * w + comp.minX;
      for (let x = 0; x < bw; x++) {
        if (labels[row + x] === comp.id && (!only || only[row + x])) local[y * bw + x] = 1;
      }
    }
    const outside = new Uint8Array(bw * bh);
    const stack = new Int32Array(bw * bh);
    let sp = 0;
    const seed = (x, y) => {
      const p = y * bw + x;
      if (!local[p] && !outside[p]) {
        outside[p] = 1;
        stack[sp++] = p;
      }
    };
    for (let x = 0; x < bw; x++) {
      seed(x, 0);
      seed(x, bh - 1);
    }
    for (let y = 0; y < bh; y++) {
      seed(0, y);
      seed(bw - 1, y);
    }
    while (sp) {
      const p = stack[--sp];
      const x = p % bw;
      const y = (p - x) / bw;
      if (x > 0) seed(x - 1, y);
      if (x < bw - 1) seed(x + 1, y);
      if (y > 0) seed(x, y - 1);
      if (y < bh - 1) seed(x, y + 1);
    }
    let area = 0;
    for (let p = 0; p < bw * bh; p++) {
      if (!outside[p]) {
        local[p] = 1;
        area++;
      }
    }
    return { local, bw, bh, area };
  }

  function autoCoreCount(local, bw, bh) {
    let core = 0;
    for (let y = 1; y < bh - 1; y++) {
      for (let x = 1; x < bw - 1; x++) {
        let solid = true;
        for (let dy = -1; dy <= 1 && solid; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!local[(y + dy) * bw + x + dx]) {
              solid = false;
              break;
            }
          }
        }
        if (solid) core++;
      }
    }
    return core;
  }

  function autoShapeContains(type, flip, x, y, bw, bh) {
    if (type === "rectangle") return true;
    const u = (x + 0.5) / bw;
    const v = (y + 0.5) / bh;
    if (type === "circle") {
      const dx = u - 0.5;
      const dy = v - 0.5;
      return dx * dx + dy * dy <= 0.25;
    }
    const t = flip ? 1 - v : v;
    return Math.abs(u - 0.5) <= t / 2;
  }

  function fitAutoShape(local, bw, bh, area) {
    let best = { type: "rectangle", flip: false, iou: 0 };
    AUTO_CANDIDATES.forEach(([type, flip]) => {
      let inter = 0;
      let shapeArea = 0;
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          if (!autoShapeContains(type, flip, x, y, bw, bh)) continue;
          shapeArea++;
          if (local[y * bw + x]) inter++;
        }
      }
      const union = area + shapeArea - inter;
      const iou = union ? inter / union : 0;
      if (iou > best.iou) best = { type, flip, iou };
    });
    return best;
  }

  function largestAutoRect(mask, bw, bh) {
    const heights = new Int32Array(bw);
    const stack = new Int32Array(bw + 1);
    let best = { area: 0, x: 0, y: 0, w: 0, h: 0 };
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) heights[x] = mask[y * bw + x] ? heights[x] + 1 : 0;
      let sp = 0;
      for (let x = 0; x <= bw; x++) {
        const current = x < bw ? heights[x] : 0;
        while (sp && heights[stack[sp - 1]] >= current) {
          const height = heights[stack[--sp]];
          const left = sp ? stack[sp - 1] + 1 : 0;
          const area = height * (x - left);
          if (area > best.area) best = { area, x: left, y: y - height + 1, w: x - left, h: height };
        }
        stack[sp++] = x;
      }
    }
    return best;
  }

  function splitAutoComponent(local, bw, bh, area) {
    const remaining = local.slice();
    const pieces = [];
    const minPiece = Math.max(8, area * 0.025);
    let covered = 0;
    while (pieces.length < AUTO_MAX_PIECES && covered < area * 0.92) {
      const r = largestAutoRect(remaining, bw, bh);
      if (r.area < minPiece || Math.min(r.w, r.h) < 2) break;
      pieces.push(r);
      covered += r.area;
      for (let y = r.y; y < r.y + r.h; y++) remaining.fill(0, y * bw + r.x, y * bw + r.x + r.w);
    }
    return pieces;
  }

  function autoMoments(local, bw, bh) {
    let n = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        if (!local[y * bw + x]) continue;
        n++;
        sx += x;
        sy += y;
        sxx += x * x;
        syy += y * y;
        sxy += x * y;
      }
    }
    if (!n) return { angle: 0, elongation: 1, thickness: 1 };
    const mx = sx / n;
    const my = sy / n;
    const cxx = sxx / n - mx * mx;
    const cyy = syy / n - my * my;
    const cxy = sxy / n - mx * my;
    const half = (cxx + cyy) / 2;
    const disc = Math.sqrt(Math.max(0, half * half - (cxx * cyy - cxy * cxy)));
    const major = half + disc;
    const minor = Math.max(1e-6, half - disc);
    return {
      angle: 0.5 * Math.atan2(2 * cxy, cxx - cyy),
      elongation: Math.sqrt(major / minor),
      thickness: Math.sqrt(12 * minor),
    };
  }

  function sliceAutoComponent(local, bw, bh, alongX, count) {
    const span = alongX ? bw : bh;
    const rects = [];
    for (let i = 0; i < count; i++) {
      const a = Math.round((i * span) / count);
      const b = Math.round(((i + 1) * span) / count);
      let minX = bw;
      let minY = bh;
      let maxX = -1;
      let maxY = -1;
      for (let y = alongX ? 0 : a; y < (alongX ? bh : b); y++) {
        for (let x = alongX ? a : 0; x < (alongX ? b : bw); x++) {
          if (!local[y * bw + x]) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (maxX >= 0) rects.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    }
    return rects;
  }

  function splitAutoDiagonal(local, bw, bh) {
    const m = autoMoments(local, bw, bh);
    const deg = Math.abs((m.angle * 180) / Math.PI) % 90;
    if (m.elongation < 3 || deg < 12 || deg > 78) return null;
    const alongX = Math.abs(Math.cos(m.angle)) >= Math.abs(Math.sin(m.angle));
    const span = alongX ? bw : bh;
    const count = Math.max(3, Math.min(AUTO_MAX_PIECES, Math.round(span / Math.max(2, m.thickness * 0.9))));
    return sliceAutoComponent(local, bw, bh, alongX, count);
  }

  function makeAutoStructure(x, y, pw, ph, w, h, type, flip) {
    const shape = {
      id: crypto.randomUUID(),
      type,
      x1: x / w,
      y1: y / h,
      x2: (x + pw) / w,
      y2: (y + ph) / h,
      fill: "filled",
      detected: true,
    };
    if (type === "triangle" && flip) shape.flip = true;
    return shape;
  }

  function clipAutoComponentToColor(labels, w, h, comp, colorMask, margin) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -1;
    let maxY = -1;
    for (let y = comp.minY; y <= comp.maxY; y++) {
      for (let x = comp.minX; x <= comp.maxX; x++) {
        const p = y * w + x;
        if (labels[p] !== comp.id || !colorMask[p]) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return comp;
    return {
      ...comp,
      minX: Math.max(comp.minX, minX - margin),
      minY: Math.max(comp.minY, minY - margin),
      maxX: Math.min(comp.maxX, maxX + margin),
      maxY: Math.min(comp.maxY, maxY + margin),
    };
  }

  function autoStructuresForComponent(labels, w, h, fullComp, split, strict, region, colorMask, margin) {
    const comp = colorMask ? clipAutoComponentToColor(labels, w, h, fullComp, colorMask, margin) : fullComp;
    const bw = comp.maxX - comp.minX + 1;
    const bh = comp.maxY - comp.minY + 1;
    if (strict) {
      const rw = region.x1 - region.x0;
      const rh = region.y1 - region.y0;
      const isFrame = bw > rw * 0.6 && bh > rh * 0.6 && comp.count < bw * bh * 0.35;
      const isLine = comp.count / Math.max(bw, bh) < 2.5 && Math.max(bw, bh) > 24;
      if (isFrame || isLine) return null;
    }
    const { local, area } = autoComponentMask(labels, w, comp);
    if (strict && autoCoreCount(local, bw, bh) < Math.max(3, area * 0.12)) return null;

    const fit = fitAutoShape(local, bw, bh, area);
    if (fit.iou < AUTO_FIT_MIN_IOU && colorMask) {
      const colorComp = clipAutoComponentToColor(labels, w, h, fullComp, colorMask, 0);
      const cw = colorComp.maxX - colorComp.minX + 1;
      const ch = colorComp.maxY - colorComp.minY + 1;
      const color = autoComponentMask(labels, w, colorComp, colorMask);
      const colorFit = fitAutoShape(color.local, cw, ch, color.area);
      if (colorFit.iou >= AUTO_FIT_MIN_IOU) {
        return {
          split: false,
          pieces: [makeAutoStructure(colorComp.minX, colorComp.minY, cw, ch, w, h, colorFit.type, colorFit.flip)],
        };
      }
    }
    if (fit.iou < AUTO_FIT_MIN_IOU && split) {
      const rects = splitAutoDiagonal(local, bw, bh) || splitAutoComponent(local, bw, bh, area);
      if (rects.length > 1) {
        return {
          split: true,
          pieces: rects.map((r) => makeAutoStructure(comp.minX + r.x, comp.minY + r.y, r.w, r.h, w, h, "rectangle", false)),
        };
      }
    }
    return {
      split: false,
      pieces: [makeAutoStructure(comp.minX, comp.minY, bw, bh, w, h, fit.type, fit.flip)],
    };
  }

  function plural(n, word) {
    return `${n} ${word}${n === 1 ? "" : "s"}`;
  }

  function autoSwatchHtml(rgb) {
    return `<span class="fm-auto-inline-swatch" style="--c: rgb(${rgb.join(",")})"></span>`;
  }

  function snapshotAuto() {
    return {
      structures: structures.map((s) => ({ ...s })),
      box: autoBox ? { ...autoBox } : null,
      picks: autoPicks.map((p) => ({ ...p, rgb: [...p.rgb], ids: [...p.ids] })),
      whiteout: autoWhiteout,
      scanned: autoScanned,
      scanBase: autoScanBase,
    };
  }

  function getAutoStage() {
    if (!autoBox) return "box";
    return autoScanned ? "colors" : "whiteout";
  }

  function pushAutoHistory() {
    autoHistory.push(snapshotAuto());
    if (autoHistory.length > AUTO_HISTORY_LIMIT) autoHistory.shift();
  }

  function refreshAfterAutoChange() {
    if (selectedStructureId && !structures.some((s) => s.id === selectedStructureId)) {
      selectedStructureId = null;
    }
    persistFieldState();
    updateSizerPanel();
    updateIntelReport();
    redrawStructures();
    redrawShootOverlay();
    renderAutoPanel();
    redrawAutoOverlay();
  }

  function restoreAuto(snap) {
    structures = snap.structures;
    autoBox = snap.box;
    autoPicks = snap.picks;
    autoWhiteout = snap.whiteout;
    autoScanned = snap.scanned;
    autoScanBase = snap.scanBase;
    refreshAfterAutoChange();
  }

  function resetAutoSession() {
    autoBox = null;
    autoPicks = [];
    autoWhiteout = [];
    autoScanned = false;
    autoScanBase = null;
    autoHistory = [];
    autoPointer = null;
    autoImageCache = null;
    autoScanCache = null;
    renderAutoPanel();
    redrawAutoOverlay();
    setAutoStatus("Drag a box on the map around the area you want to scan.");
  }

  function renderAutoPanel() {
    const stage = getAutoStage();
    autoStepBox?.classList.toggle("is-current", stage === "box");
    autoStepBox?.classList.toggle("is-done", stage !== "box");
    autoStepWhiteout?.classList.toggle("is-current", stage === "whiteout");
    autoStepWhiteout?.classList.toggle("is-done", stage === "colors");
    autoStepColors?.classList.toggle("is-current", stage === "colors");
    autoStepColors?.classList.toggle("is-done", stage === "colors" && autoPicks.length > 0);
    if (autoWhiteoutTools) autoWhiteoutTools.hidden = stage !== "whiteout";
    if (autoPickList) {
      autoPickList.innerHTML = "";
      if (!autoPicks.length) {
        const empty = document.createElement("p");
        empty.className = "fm-auto-empty";
        empty.textContent = {
          box: "Draw a box first.",
          whiteout: "Press Done to detect every bunker color in the box.",
          colors: "No colors yet. Tap a bunker inside the box to pick its color.",
        }[stage];
        autoPickList.append(empty);
      }
      autoPicks.forEach((pick) => {
        const chip = document.createElement("div");
        chip.className = "fm-auto-pick";
        chip.style.setProperty("--c", `rgb(${pick.rgb.join(",")})`);
        const swatch = document.createElement("span");
        swatch.className = "fm-auto-pick-swatch";
        swatch.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.className = "fm-auto-pick-label";
        label.textContent = plural(pick.bunkers, "bunker");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "fm-auto-pick-remove";
        remove.setAttribute("aria-label", "Remove this color and its bunkers");
        remove.textContent = "×";
        remove.addEventListener("click", () => removeAutoPick(pick.id));
        chip.append(swatch, label, remove);
        autoPickList.append(chip);
      });
    }
    updateControlStates();
  }

  function getAutoBoxRegion(w, h) {
    const b = autoBox;
    return {
      x0: Math.max(0, Math.floor(b.left * w)),
      y0: Math.max(0, Math.floor(b.top * h)),
      x1: Math.min(w, Math.ceil((b.left + b.width) * w)),
      y1: Math.min(h, Math.ceil((b.top + b.height) * h)),
    };
  }

  function isInAutoBox(shape) {
    if (!autoBox) return false;
    const b = getStructureBounds(shape);
    const mx = b.left + b.width / 2;
    const my = b.top + b.height / 2;
    return (
      mx >= autoBox.left && mx <= autoBox.left + autoBox.width && my >= autoBox.top && my <= autoBox.top + autoBox.height
    );
  }

  function findAutoStart(data, w, h, cx, cy) {
    if (!isAutoBackground(data, cy * w + cx)) return cy * w + cx;
    const reach = Math.round(Math.max(w, h) * (IS_COARSE ? 0.016 : 0.008)) + 2;
    let start = -1;
    let best = Infinity;
    for (let dy = -reach; dy <= reach; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= h) continue;
      for (let dx = -reach; dx <= reach; dx++) {
        const x = cx + dx;
        if (x < 0 || x >= w) continue;
        const dist = dx * dx + dy * dy;
        if (dist >= best || dist > reach * reach) continue;
        if (!isAutoBackground(data, y * w + x)) {
          start = y * w + x;
          best = dist;
        }
      }
    }
    return start;
  }

  function pickAutoColorAt(point) {
    if (!autoBox) {
      setAutoStatus("Drag a box around the area first, then tap bunker colors.");
      return;
    }
    if (!image.naturalWidth) return;
    const { w, h, data } = getAutoScanData();
    const cx = Math.max(0, Math.min(w - 1, Math.floor(point.x * w)));
    const cy = Math.max(0, Math.min(h - 1, Math.floor(point.y * h)));
    const region = getAutoBoxRegion(w, h);
    const start = findAutoStart(data, w, h, cx, cy);
    if (start < 0) {
      setAutoStatus("That spot is background. Tap right on a bunker.");
      return;
    }
    const sx = start % w;
    const sy = (start - sx) / w;
    if (sx < region.x0 || sx >= region.x1 || sy < region.y0 || sy >= region.y1) {
      setAutoStatus("Tap a bunker inside the box, or drag a new box.");
      return;
    }

    const rgb = sampleAutoColor(data, w, h, sx, sy);
    const { found, bunkers } = scanAutoColor(data, w, h, region, rgb, start);
    if (!found.length) {
      setAutoStatus(`No bunkers matched ${autoSwatchHtml(rgb)} in the box. Try raising <strong>Color match</strong>.`);
      return;
    }

    const fresh = found.filter((f) => !overlapsAutoPieces(f, structures));
    if (!fresh.length) {
      setAutoStatus(`Every ${autoSwatchHtml(rgb)} bunker in the box is already mapped.`);
      return;
    }

    pushAutoHistory();
    autoPicks.push({ id: crypto.randomUUID(), rgb, x: point.x, y: point.y, ids: fresh.map((f) => f.id), bunkers });
    structures = structures.concat(fresh);
    mergeIntelFromSavedState();
    refreshAfterAutoChange();

    const skipped = found.length - fresh.length;
    setAutoStatus(
      `${autoSwatchHtml(rgb)} Found <strong>${plural(bunkers, "bunker")}</strong> and placed <strong>${plural(fresh.length, "piece")}</strong>${
        skipped ? ` (skipped ${skipped} already mapped)` : ""
      }. Tap another color, or <strong>Undo</strong>.`
    );
  }

  function overlapsAutoPieces(piece, others) {
    const pb = getStructureBounds(piece);
    return others.some((s) => boundsIoU(getStructureBounds(s), pb) > 0.3);
  }

  function scanAutoColor(data, w, h, region, rgb, start) {
    const withDark = autoDarkInput?.checked !== false && !isAutoDarkColor(rgb);
    const minPixels = Math.max(12, Math.round(w * h * 0.00004));
    const bridgeSteps = Math.max(3, Math.round(Math.max(w, h) * 0.006));
    const outlineMargin = Math.max(2, Math.round(bridgeSteps / 2));
    const matched = buildAutoColorMask(data, w, h, region, rgb, getAutoTolerance(), withDark);
    let mask = matched.slice();
    let colorMask = null;
    if (withDark) {
      mask = pruneAutoMask(mask, w, h, region, Math.max(8, minPixels >> 1));
      colorMask = closeAutoMask(mask, w, h);
      mask = bridgeAutoDark(mask, data, w, region, bridgeSteps);
    }
    mask = closeAutoMask(mask, w, h);
    const labels = new Int32Array(w * h);
    const stack = new Int32Array(w * h);
    const split = autoSplitInput?.checked !== false;
    const found = [];
    let bunkers = 0;
    let nextId = 1;
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        if (!mask[p] || labels[p]) continue;
        const comp = floodAutoComponent(mask, w, h, p, labels, nextId++, stack);
        const tapped = start >= 0 && labels[start] === comp.id;
        if (!tapped && comp.count < minPixels) continue;
        const result = autoStructuresForComponent(labels, w, h, comp, split, !tapped, region, colorMask, outlineMargin);
        if (!result) continue;
        bunkers++;
        found.push(...result.pieces);
      }
    }
    return { found, bunkers, matched, minPixels };
  }

  function isAutoSeedPixel(data, p) {
    if (isAutoBackground(data, p) || isAutoDark(data, p)) return false;
    const i = p * 4;
    return Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) >= AUTO_SEED_MIN_CHROMA;
  }

  function findAutoSeedColor(data, w, region, used, hist) {
    hist.fill(0);
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        if (used[p] || !isAutoSeedPixel(data, p)) continue;
        const i = p * 4;
        hist[((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)]++;
      }
    }
    let bestBin = -1;
    let bestScore = 0;
    for (let bin = 0; bin < 4096; bin++) {
      if (!hist[bin]) continue;
      const r = bin >> 8;
      const g = (bin >> 4) & 15;
      const b = bin & 15;
      let score = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dg = -1; dg <= 1; dg++) {
          for (let db = -1; db <= 1; db++) {
            const rr = r + dr;
            const gg = g + dg;
            const bb = b + db;
            if (rr < 0 || gg < 0 || bb < 0 || rr > 15 || gg > 15 || bb > 15) continue;
            score += hist[(rr << 8) | (gg << 4) | bb];
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestBin = bin;
      }
    }
    if (bestBin < 0) return null;
    const br = bestBin >> 8;
    const bg = (bestBin >> 4) & 15;
    const bb = bestBin & 15;
    const rs = [];
    const gs = [];
    const bs = [];
    const seeds = [];
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const p = y * w + x;
        if (used[p] || !isAutoSeedPixel(data, p)) continue;
        const i = p * 4;
        if (Math.abs((data[i] >> 4) - br) > 1 || Math.abs((data[i + 1] >> 4) - bg) > 1 || Math.abs((data[i + 2] >> 4) - bb) > 1) continue;
        rs.push(data[i]);
        gs.push(data[i + 1]);
        bs.push(data[i + 2]);
        seeds.push(p);
      }
    }
    const median = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
    return { rgb: [median(rs), median(gs), median(bs)], seeds, score: bestScore };
  }

  function detectAllAutoColors() {
    if (!autoBox || autoScanned || !image.naturalWidth) return;
    const { w, h, data } = getAutoScanData();
    const region = getAutoBoxRegion(w, h);
    const minPixels = Math.max(12, Math.round(w * h * 0.00004));
    const used = new Uint8Array(w * h);
    const hist = new Int32Array(4096);
    const scanBase = structures;
    const base = autoReplaceInput?.checked ? structures.filter((s) => !isInAutoBox(s)) : structures;
    const replaced = structures.length - base.length;
    const placed = [];
    const picks = [];
    let bunkers = 0;
    for (let round = 0; round < AUTO_MAX_COLORS; round++) {
      const seed = findAutoSeedColor(data, w, region, used, hist);
      if (!seed || seed.score < minPixels) break;
      const result = scanAutoColor(data, w, h, region, seed.rgb, -1);
      const consumed = morphAutoMask(morphAutoMask(result.matched, w, h, true), w, h, true);
      for (let p = 0; p < consumed.length; p++) if (consumed[p]) used[p] = 1;
      seed.seeds.forEach((p) => {
        used[p] = 1;
      });
      const fresh = result.found.filter((f) => !overlapsAutoPieces(f, base) && !overlapsAutoPieces(f, placed));
      if (!fresh.length) continue;
      placed.push(...fresh);
      bunkers += result.bunkers;
      const fb = getStructureBounds(fresh[0]);
      picks.push({
        id: crypto.randomUUID(),
        rgb: seed.rgb,
        x: fb.left + fb.width / 2,
        y: fb.top + fb.height / 2,
        ids: fresh.map((f) => f.id),
        bunkers: result.bunkers,
      });
    }

    pushAutoHistory();
    autoScanBase = scanBase;
    autoScanned = true;
    autoPicks = picks;
    structures = base.concat(placed);
    mergeIntelFromSavedState();
    refreshAfterAutoChange();

    if (!picks.length) {
      setAutoStatus(
        "No bunker colors found in the box. Tap a bunker to pick its color, raise <strong>Color match</strong>, or <strong>Edit</strong> the whiteout."
      );
      return;
    }
    const swatches = picks.map((p) => autoSwatchHtml(p.rgb)).join("");
    setAutoStatus(
      `${swatches} Found <strong>${plural(picks.length, "color")}</strong>, <strong>${plural(bunkers, "bunker")}</strong>, and placed <strong>${plural(placed.length, "piece")}</strong>${
        replaced ? ` (replaced ${plural(replaced, "old piece")})` : ""
      }. Tap a bunker to add a missed color, or <strong>Undo</strong>.`
    );
  }

  function editAutoWhiteout() {
    if (!autoScanned) return;
    pushAutoHistory();
    structures = autoScanBase || structures;
    autoPicks = [];
    autoScanned = false;
    autoScanBase = null;
    refreshAfterAutoChange();
    setAutoStatus("Back to whiteout. Brush over anything else that isn't a bunker, then press <strong>Done</strong>.");
  }

  function clearAutoWhiteout() {
    if (!autoWhiteout.length) return;
    pushAutoHistory();
    autoWhiteout = [];
    refreshAfterAutoChange();
    setAutoStatus("Whiteout cleared.");
  }

  function getAutoWhiteoutSizePx() {
    return Number(autoWhiteoutSizeInput?.value) || 18;
  }

  function syncAutoWhiteoutSizeUi() {
    if (!autoWhiteoutSizeInput) return;
    const min = Number(autoWhiteoutSizeInput.min) || 0;
    const max = Number(autoWhiteoutSizeInput.max) || 100;
    const value = getAutoWhiteoutSizePx();
    autoWhiteoutSizeInput.closest(".fm-throttle")?.style.setProperty("--fill", `${((value - min) / (max - min)) * 100}%`);
    if (autoWhiteoutSizeValue) autoWhiteoutSizeValue.textContent = String(value);
  }

  function removeAutoPick(id) {
    const pick = autoPicks.find((p) => p.id === id);
    if (!pick) return;
    pushAutoHistory();
    const ids = new Set(pick.ids);
    structures = structures.filter((s) => !ids.has(s.id));
    autoPicks = autoPicks.filter((p) => p.id !== id);
    refreshAfterAutoChange();
    setAutoStatus(`Removed ${autoSwatchHtml(pick.rgb)} and its ${plural(pick.ids.length, "piece")}.`);
  }

  function setAutoBox(box) {
    pushAutoHistory();
    autoBox = box;
    autoPicks = [];
    autoScanned = false;
    autoScanBase = null;
    refreshAfterAutoChange();
    setAutoStatus(
      box
        ? "Box set. Brush white over anything that isn't a bunker (text, logos, lines), then press <strong>Done</strong>."
        : "Box cleared. Drag a new box on the map around the area you want to scan."
    );
  }

  function undoAuto() {
    const snap = autoHistory.pop();
    if (!snap) return;
    restoreAuto(snap);
    setAutoStatus("Undid the last step.");
  }

  function undoAllAuto() {
    if (!autoHistory.length) return;
    const snap = autoHistory[0];
    autoHistory = [];
    restoreAuto(snap);
    setAutoStatus("Back to how the map was before Auto. Drag a box to start again.");
  }

  function getAutoPoint(e) {
    const { w, h } = getCanvasSize();
    const p = getLayerPoint(e, structureCanvas);
    return {
      x: Math.max(0, Math.min(1, p.x / (w || 1))),
      y: Math.max(0, Math.min(1, p.y / (h || 1))),
    };
  }

  function autoBoxFromPoints(a, b) {
    return {
      left: Math.min(a.x, b.x),
      top: Math.min(a.y, b.y),
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
    };
  }

  function startAutoPointer(e) {
    const point = getAutoPoint(e);
    autoPointer = { pid: e.pointerId, cx: e.clientX, cy: e.clientY, start: point, current: point, moved: false, stroke: null };
    if (getAutoStage() === "whiteout") {
      const { w } = getCanvasSize();
      autoPointer.stroke = { size: getAutoWhiteoutSizePx() / (w || 1), points: [point] };
      autoHover = point;
      redrawAutoOverlay();
    }
    setInteractionLock(true);
    structureCanvas.setPointerCapture(e.pointerId);
  }

  function moveAutoPointer(e) {
    if (!autoPointer || autoPointer.pid !== e.pointerId) {
      if (autoPointer || activeTool !== "auto" || getAutoStage() !== "whiteout" || e.pointerType === "touch") return false;
      autoHover = getAutoPoint(e);
      redrawAutoOverlay();
      return true;
    }
    e.preventDefault();
    autoPointer.current = getAutoPoint(e);
    const { stroke } = autoPointer;
    if (stroke) {
      const { w, h } = getCanvasSize();
      const last = stroke.points[stroke.points.length - 1];
      const dx = (autoPointer.current.x - last.x) * w;
      const dy = (autoPointer.current.y - last.y) * h;
      if (dx * dx + dy * dy >= 2.25) stroke.points.push(autoPointer.current);
      autoHover = autoPointer.current;
      redrawAutoOverlay();
      return true;
    }
    const dx = e.clientX - autoPointer.cx;
    const dy = e.clientY - autoPointer.cy;
    if (!autoPointer.moved && dx * dx + dy * dy > 64) autoPointer.moved = true;
    if (autoPointer.moved) redrawAutoOverlay();
    return true;
  }

  function endAutoPointer(e, cancelled) {
    if (!autoPointer || autoPointer.pid !== e.pointerId) return;
    const { start, current, moved, stroke } = autoPointer;
    autoPointer = null;
    setInteractionLock(false);
    if (structureCanvas.hasPointerCapture(e.pointerId)) structureCanvas.releasePointerCapture(e.pointerId);
    if (e.pointerType === "touch") autoHover = null;
    if (cancelled) {
      redrawAutoOverlay();
      return;
    }
    if (stroke) {
      pushAutoHistory();
      autoWhiteout = autoWhiteout.concat([stroke]);
      refreshAfterAutoChange();
      setAutoStatus("Whited out. Keep brushing, or press <strong>Done</strong> to detect every bunker color.");
      return;
    }
    if (!moved) {
      if (getAutoStage() === "colors") pickAutoColorAt(start);
      else setAutoStatus("Drag a box around the area first.");
      return;
    }
    const box = autoBoxFromPoints(start, current);
    const { w, h } = getCanvasSize();
    if (box.width * w < 12 || box.height * h < 12) {
      redrawAutoOverlay();
      setAutoStatus("That box is too small. Drag a bigger box around the bunkers.");
      return;
    }
    setAutoBox(box);
  }

  function redrawAutoOverlay() {
    if (!autoCanvas) return;
    const actx = autoCanvas.getContext("2d");
    actx.save();
    actx.setTransform(1, 0, 0, 1, 0, 0);
    actx.clearRect(0, 0, autoCanvas.width, autoCanvas.height);
    actx.restore();
    const show = hasMap && activeTool === "auto";
    autoCanvas.hidden = !show;
    if (!show) return;
    const { w, h } = getCanvasSize();
    if (!w || !h) return;

    const dragging = autoPointer?.moved && !autoPointer.stroke;
    const box = dragging ? autoBoxFromPoints(autoPointer.start, autoPointer.current) : autoBox;
    if (!box) return;
    const left = box.left * w;
    const top = box.top * h;
    const width = box.width * w;
    const height = box.height * h;
    const stage = getAutoStage();

    const strokes = autoPointer?.stroke ? autoWhiteout.concat([autoPointer.stroke]) : autoWhiteout;
    if (strokes.length) {
      paintAutoWhiteout(actx, strokes, w, h, "#ffffff");
      if (stage === "whiteout") paintAutoWhiteout(actx, strokes, w, h, "rgba(108, 140, 255, 0.16)");
    }

    actx.save();
    actx.fillStyle = "rgba(8, 10, 9, 0.45)";
    actx.beginPath();
    actx.rect(0, 0, w, h);
    actx.rect(left, top, width, height);
    actx.fill("evenodd");
    actx.strokeStyle = AUTO_COLOR;
    actx.lineWidth = 2;
    actx.setLineDash([8, 5]);
    actx.strokeRect(left, top, width, height);
    actx.setLineDash([]);
    actx.fillStyle = AUTO_COLOR;
    [
      [left, top],
      [left + width, top],
      [left, top + height],
      [left + width, top + height],
    ].forEach(([x, y]) => actx.fillRect(x - 3.5, y - 3.5, 7, 7));

    if (!dragging) {
      autoPicks.forEach((pick) => {
        const x = pick.x * w;
        const y = pick.y * h;
        actx.beginPath();
        actx.arc(x, y, 7, 0, Math.PI * 2);
        actx.fillStyle = `rgb(${pick.rgb.join(",")})`;
        actx.fill();
        actx.lineWidth = 2;
        actx.strokeStyle = "#ffffff";
        actx.stroke();
        actx.beginPath();
        actx.arc(x, y, 8.5, 0, Math.PI * 2);
        actx.lineWidth = 1;
        actx.strokeStyle = "rgba(0, 0, 0, 0.55)";
        actx.stroke();
      });
    }
    if (stage === "whiteout" && autoHover) {
      const r = getAutoWhiteoutSizePx() / 2;
      const x = autoHover.x * w;
      const y = autoHover.y * h;
      actx.beginPath();
      actx.arc(x, y, r, 0, Math.PI * 2);
      actx.lineWidth = 3;
      actx.strokeStyle = "rgba(0, 0, 0, 0.45)";
      actx.stroke();
      actx.lineWidth = 1.5;
      actx.strokeStyle = "#ffffff";
      actx.stroke();
    }
    actx.restore();
  }

  autoSensitivityInput?.addEventListener("input", syncAutoSensitivityUi);
  syncAutoSensitivityUi();
  autoClearBoxBtn?.addEventListener("click", () => {
    if (autoBox) setAutoBox(null);
  });
  autoUndoBtn?.addEventListener("click", undoAuto);
  autoUndoAllBtn?.addEventListener("click", undoAllAuto);
  autoEditWhiteoutBtn?.addEventListener("click", editAutoWhiteout);
  autoClearWhiteoutBtn?.addEventListener("click", clearAutoWhiteout);
  autoWhiteoutDoneBtn?.addEventListener("click", () => {
    autoWhiteoutDoneBtn.disabled = true;
    setAutoStatus("Detecting bunker colors…");
    requestAnimationFrame(() => setTimeout(detectAllAutoColors, 0));
  });
  autoWhiteoutSizeInput?.addEventListener("input", () => {
    syncAutoWhiteoutSizeUi();
    redrawAutoOverlay();
  });
  syncAutoWhiteoutSizeUi();
  structureCanvas.addEventListener("pointerleave", () => {
    if (!autoHover || autoPointer) return;
    autoHover = null;
    redrawAutoOverlay();
  });

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
    const numEl = document.createElement("span");
    numEl.className = "fm-player-num";
    numEl.textContent = String(n);
    el.append(numEl);
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
      controls.dataset.side = state.spawn.x <= 50 ? "right" : "left";
      controls.style.left = `${state.spawn.x}%`;
      controls.style.top = `clamp(60px, ${state.spawn.y}%, calc(100% - 60px))`;

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
        if (shootUseTargetPlayer && !shootNoShot && shootPlayerEl && el !== shootPlayerEl) {
          selectShootTargetPlayer(el);
        } else if (el === shootPlayerEl && shootMode === "run" && !shootStandStill) {
          startRunDraw(e, true);
        } else if (
          isMobileLayout() &&
          shootPlayerEl &&
          el !== shootPlayerEl &&
          el.dataset.team === shootPlayerEl.dataset.team
        ) {
          setShootPointFromEvent(e);
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
  shootCanvas.addEventListener("pointermove", extendRunDraw);
  shootCanvas.addEventListener("pointerup", endRunDraw);
  shootCanvas.addEventListener("pointercancel", endRunDraw);
  window.addEventListener("pointerup", endRunDraw);
  window.addEventListener("pointercancel", endRunDraw);
  shootRunBtn?.addEventListener("click", runShootPlayer);
  shootResetRunBtn?.addEventListener("click", resetShootRun);
  shootClearBtn?.addEventListener("click", clearShootPlan);
  shootSaveSetupBtn?.addEventListener("click", saveShootSetup);
  shootPrevPlayerBtn?.addEventListener("click", () => stepShootPlayer(-1));
  shootNextPlayerBtn?.addEventListener("click", () => stepShootPlayer(1));
  shootNewSetupBtn?.addEventListener("click", newShootSetup);
  shootPlaySceneBtn?.addEventListener("click", () => runShootScene());
  shootResetSceneBtn?.addEventListener("click", resetShootRun);
  shootClearSceneBtn?.addEventListener("click", clearShootScene);
  shootTimeInput?.addEventListener("change", updateShootPanel);
  shootTimeInput?.addEventListener("input", renderShootSceneList);
  shootSceneList?.addEventListener("pointerdown", startTimelineDrag);
  shootSceneList?.addEventListener(
    "click",
    (e) => {
      if (!suppressTimelineClick) return;
      e.stopPropagation();
      e.preventDefault();
    },
    true
  );
  function normalizedShapeFromPoints(x1, y1, x2, y2) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return null;
    const nx1 = Math.max(0, Math.min(1, x1 / w));
    const ny1 = Math.max(0, Math.min(1, y1 / h));
    const nx2 = Math.max(0, Math.min(1, x2 / w));
    const ny2 = Math.max(0, Math.min(1, y2 / h));
    if (Math.abs(nx2 - nx1) * w < 8 || Math.abs(ny2 - ny1) * h < 8) return null;
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

    if (activeTool === "auto") {
      e.preventDefault();
      startAutoPointer(e);
      return;
    }

    const { x, y } = getLayerPoint(e, structureCanvas);
    const canDrag = activeTool === "sizer" || activeTool === "structure";
    const hit =
      hitTestStructure(x, y) ||
      (canDrag ? hitTestStructureBounds(x, y, IS_COARSE ? 14 : 8) : null);

    structurePointer = {
      x: e.clientX,
      y: e.clientY,
      pid: e.pointerId,
      handled: false,
    };

    if (hit) {
      e.preventDefault();
      structurePointer.handled = true;
      if (canDrag) {
        selectedStructureId = hit.id;
        updateSizerPanel();
        updateIntelReport();
        redrawStructures();
        const { w, h } = getCanvasSize();
        structureDrag = {
          id: hit.id,
          pid: e.pointerId,
          startX: x,
          startY: y,
          bounds: getStructureBounds(hit),
          w,
          h,
          moved: false,
        };
        setInteractionLock(true);
        structureCanvas.setPointerCapture(e.pointerId);
        return;
      }
      pickStructureAt(x, y, uiTool === "intel" || activeTool === "select");
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

  function moveStructureDrag(e) {
    if (!structureDrag || structureDrag.pid !== e.pointerId) return false;
    e.preventDefault();
    const shape = structures.find((s) => s.id === structureDrag.id);
    if (!shape) return true;
    const { x, y } = getLayerPoint(e, structureCanvas);
    const dxPx = x - structureDrag.startX;
    const dyPx = y - structureDrag.startY;
    if (!structureDrag.moved) {
      if (dxPx * dxPx + dyPx * dyPx < 16) return true;
      structureDrag.moved = true;
      endSizerEdit();
      rememberSizerUndo(shape);
    }
    const b = structureDrag.bounds;
    const left = Math.max(0, Math.min(1 - b.width, b.left + dxPx / (structureDrag.w || 1)));
    const top = Math.max(0, Math.min(1 - b.height, b.top + dyPx / (structureDrag.h || 1)));
    shape.x1 = left;
    shape.y1 = top;
    shape.x2 = left + b.width;
    shape.y2 = top + b.height;
    redrawStructures();
    return true;
  }

  function endStructureDrag(e) {
    if (!structureDrag || structureDrag.pid !== e.pointerId) return;
    const moved = structureDrag.moved;
    structureDrag = null;
    setInteractionLock(false);
    if (structureCanvas.hasPointerCapture(e.pointerId)) {
      structureCanvas.releasePointerCapture(e.pointerId);
    }
    if (moved) {
      persistFieldState();
      updateSizerPanel();
      updateIntelReport();
      redrawStructures();
    }
  }

  function moveStructurePlace(e) {
    if (moveStructureDrag(e)) return;
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
  structureCanvas.addEventListener("pointermove", (e) => {
    if (moveAutoPointer(e)) return;
    moveStructurePlace(e);
  });
  structureCanvas.addEventListener("pointerup", (e) => {
    endAutoPointer(e, false);
    endStructureDrag(e);
    endStructurePlace(e);
    endStructurePointer(e);
  });
  structureCanvas.addEventListener("pointercancel", (e) => {
    endAutoPointer(e, true);
    endStructureDrag(e);
    endStructurePlace(e);
    endStructurePointer(e);
  });

  function handleMapFile(file) {
    pendingPackLoad = false;
    loadMapImageFromFile(file, null);
  }

  function showMapUI() {
    hasMap = true;
    clearSizerUndo();
    resetAutoSession();
    clearShootPlan();
    const packToApply = pendingPackState;
    const fromPack = pendingPackLoad;
    pendingPackState = null;
    pendingPackLoad = false;
    designPanelOpen = false;
    if (!packToApply) {
      structures = [];
      shootSceneSetups = [];
      activeShootSetupId = null;
      designMapOn = false;
      designTheme = { ...DESIGN_THEME_DEFAULT };
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
      if (fromPack) {
        designMapOn = true;
        persistFieldState();
      }
      renderDesignMap();
      redrawStructures();
      setTool(structures.length ? "players" : "auto");
      updateControlStates();
      updateIntelReport();
      updateMobileTip(uiTool);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(finishMapSetup);
    });
  }

  function hideMapUI() {
    cancelMirrorFlow();
    closeMirrorConfirm();
    hasMap = false;
    mapPixelCache = null;
    fieldIntelReport = { name: "", bio: "" };
    closeIntelModal();
    structures = [];
    placePreview = null;
    selectedStructureId = null;
    clearSizerUndo();
    resetAutoSession();
    clearVisionLines();
    clearShootPlan();
    shootSceneSetups = [];
    activeShootSetupId = null;
    teamPlacement = createDefaultTeamPlacement();
    activePlacementTeam = "a";
    designMapOn = false;
    designPanelOpen = false;
    renderDesignMap();
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
  presetMapPackBtn?.addEventListener("click", openPresetModal);
  presetMapPackMobileBtn?.addEventListener("click", openPresetModal);
  presetCancelBtn?.addEventListener("click", closePresetModal);
  presetBackdrop?.addEventListener("click", closePresetModal);
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

  const GIF_MAX_WIDTH = 640;
  const GIF_FRAME_MS = 40;
  const GIF_END_HOLD_MS = 1200;
  const GIF_MAX_FRAMES = 1200;
  const GIF_FIXED_COLORS = [
    SHOOT_LINE_COLOR,
    SHOOT_BLOCKED_COLOR,
    SHOOT_DOT_COLOR,
    VISION_LINE_COLOR,
    "#ff5c00",
    "#3b9eff",
    "#ffffff",
    "#0f1210",
  ];

  let theaterOpen = false;
  let theaterFrame = null;
  let gifRecording = null;
  let gifEncoderModule = null;

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function drawSceneComposite(context, W, H) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, W, H);
    context.fillStyle = "#0f1210";
    context.fillRect(0, 0, W, H);
    if (designMapOn) drawDesignField(context, W, H);
    else if (image.naturalWidth) context.drawImage(image, 0, 0, W, H);
    [structureCanvas, canvas, visionCanvas, shootCanvas].forEach((layer) => {
      if (!layer.hidden && layer.width && layer.height) context.drawImage(layer, 0, 0, W, H);
    });

    const scale = W / (stage.clientWidth || W);
    playersLayer.querySelectorAll(".fm-player").forEach((el) => {
      if (isGhostPlayer(el)) return;
      const x = ((parseFloat(el.style.left) || 0) / 100) * W;
      const y = ((parseFloat(el.style.top) || 0) / 100) * H;
      const r = Math.max(3, (el.offsetWidth / 2) * scale);
      const style = getComputedStyle(el);

      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fillStyle = style.backgroundColor;
      context.fill();
      context.lineWidth = Math.max(1, scale);
      context.strokeStyle = "rgba(15, 18, 16, 0.85)";
      context.stroke();

      context.fillStyle = style.color;
      context.font = `${Math.max(7, Math.round(r * 1.15))}px "Bebas Neue", sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(el.dataset.num || "", x, y + r * 0.08);
    });
    context.restore();
  }

  function sizeTheaterCanvas() {
    const iw = image.naturalWidth || 16;
    const ih = image.naturalHeight || 9;
    const maxW = Math.min(window.innerWidth - 64, 1600);
    const maxH = window.innerHeight - 200;
    const s = Math.max(0.05, Math.min(maxW / iw, maxH / ih));
    const cssW = Math.max(200, Math.floor(iw * s));
    const cssH = Math.max(120, Math.floor(ih * s));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    theaterCanvas.style.width = `${cssW}px`;
    theaterCanvas.style.height = `${cssH}px`;
    theaterCanvas.width = Math.floor(cssW * dpr);
    theaterCanvas.height = Math.floor(cssH * dpr);
  }

  function setTheaterStatus(text) {
    if (theaterStatus) theaterStatus.textContent = text || "";
  }

  function theaterTick(now) {
    if (!theaterOpen) return;
    drawSceneComposite(theaterCanvas.getContext("2d"), theaterCanvas.width, theaterCanvas.height);
    if (gifRecording) captureGifFrame(now);
    theaterFrame = requestAnimationFrame(theaterTick);
  }

  function openTheater() {
    if (!theater || !theaterCanvas || !hasMap) return false;
    if (!theaterOpen) {
      theaterOpen = true;
      theater.hidden = false;
      theater.setAttribute("aria-hidden", "false");
      body.classList.add("fm-intel-modal-open");
      sizeTheaterCanvas();
      theaterFrame = requestAnimationFrame(theaterTick);
    }
    return true;
  }

  function closeTheater() {
    if (!theaterOpen) return;
    theaterOpen = false;
    gifRecording = null;
    if (theaterFrame) cancelAnimationFrame(theaterFrame);
    theaterFrame = null;
    theater.hidden = true;
    theater.setAttribute("aria-hidden", "true");
    if (!intelModalOpen) body.classList.remove("fm-intel-modal-open");
    setTheaterStatus("");
    updateTheaterButtons();
  }

  function updateTheaterButtons() {
    const busy = Boolean(gifRecording);
    if (theaterReplayBtn) theaterReplayBtn.disabled = busy;
    if (theaterGifBtn) theaterGifBtn.disabled = busy;
  }

  function playSceneInTheater(onDone) {
    if (!openTheater()) return false;
    if (lastRunStartPositions) resetShootRun();
    const started = runShootScene(onDone);
    if (!started) setTheaterStatus("Save at least one complete player setup to play the scene.");
    return started;
  }

  function playSceneWindow() {
    if (gifRecording) return;
    setTheaterStatus("");
    playSceneInTheater(() => setTheaterStatus("Scene finished — players reset to their start spots."));
  }

  async function loadGifEncoder() {
    if (!gifEncoderModule) {
      gifEncoderModule = await import(new URL("vendor/gifenc.esm.js", document.baseURI).href);
    }
    return gifEncoderModule;
  }

  function captureGifFrame(now) {
    const rec = gifRecording;
    if (!rec) return;
    if (rec.frames > 0 && now - rec.lastAt < GIF_FRAME_MS) return;
    rec.lastAt = rec.frames > 0 ? rec.lastAt + GIF_FRAME_MS : now;
    if (now - rec.lastAt > GIF_FRAME_MS) rec.lastAt = now;

    drawSceneComposite(rec.ctx, rec.w, rec.h);
    const { data } = rec.ctx.getImageData(0, 0, rec.w, rec.h);
    const { quantize, applyPalette } = rec.lib;
    if (!rec.palette) {
      const palette = quantize(data, 256 - GIF_FIXED_COLORS.length);
      GIF_FIXED_COLORS.forEach((hex) => {
        const rgb = hexToRgb(hex);
        if (rgb) palette.push(rgb);
      });
      rec.palette = palette.slice(0, 256);
    }
    const index = applyPalette(data, rec.palette);
    rec.gif.writeFrame(index, rec.w, rec.h, {
      palette: rec.frames === 0 ? rec.palette : undefined,
      delay: GIF_FRAME_MS,
    });
    rec.frames++;

    const finished = rec.endAt !== null && now >= rec.endAt;
    if (finished || rec.frames >= GIF_MAX_FRAMES) finishGifRecording();
    else setTheaterStatus(`Recording GIF… ${rec.frames} frames`);
  }

  function finishGifRecording() {
    const rec = gifRecording;
    if (!rec) return;
    gifRecording = null;
    rec.gif.finish();
    const blob = new Blob([rec.gif.bytes()], { type: "image/gif" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "paintballer-scene.gif";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setTheaterStatus(`GIF saved (${Math.max(1, Math.round(blob.size / 1024))} KB).`);
    updateTheaterButtons();
  }

  async function downloadSceneGif() {
    if (gifRecording || !hasMap) return;
    if (!openTheater()) return;
    setTheaterStatus("Preparing GIF…");
    let lib;
    try {
      lib = await loadGifEncoder();
    } catch {
      setTheaterStatus("Could not load the GIF encoder. Check your connection and try again.");
      return;
    }
    if (!theaterOpen) return;

    const iw = image.naturalWidth || 16;
    const ih = image.naturalHeight || 9;
    const w = Math.min(GIF_MAX_WIDTH, iw);
    const h = Math.max(1, Math.round((w * ih) / iw));
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;

    gifRecording = {
      lib,
      gif: lib.GIFEncoder(),
      ctx: off.getContext("2d", { willReadFrequently: true }),
      w,
      h,
      frames: 0,
      lastAt: 0,
      endAt: null,
      palette: null,
    };
    updateTheaterButtons();

    const started = playSceneInTheater(() => {
      if (gifRecording) gifRecording.endAt = performance.now() + GIF_END_HOLD_MS;
    });
    if (!started) {
      gifRecording = null;
      updateTheaterButtons();
      return;
    }
    setTheaterStatus("Recording GIF…");
  }

  shootPlayWindowBtn?.addEventListener("click", playSceneWindow);
  shootDownloadGifBtn?.addEventListener("click", () => downloadSceneGif());
  theaterReplayBtn?.addEventListener("click", playSceneWindow);
  theaterGifBtn?.addEventListener("click", () => downloadSceneGif());
  theaterCloseBtn?.addEventListener("click", closeTheater);
  theaterBackdrop?.addEventListener("click", () => {
    if (!gifRecording) closeTheater();
  });
  window.addEventListener("resize", () => {
    if (theaterOpen) sizeTheaterCanvas();
  });

  const MIRROR_COLOR = "#ff5c00";
  const MIRROR_SNAP_DEG = 8;
  const MIRROR_MIN_BOX_PX = 24;

  function openMirrorConfirm() {
    if (!hasMap || !structures.length || !mirrorConfirm) return;
    if (mirrorStep) cancelMirrorFlow();
    mirrorConfirm.hidden = false;
    mirrorConfirm.setAttribute("aria-hidden", "false");
    body.classList.add("fm-intel-modal-open");
    mirrorConfirmYes?.focus();
  }

  function closeMirrorConfirm() {
    if (!mirrorConfirm || mirrorConfirm.hidden) return;
    mirrorConfirm.hidden = true;
    mirrorConfirm.setAttribute("aria-hidden", "true");
    if (!intelModalOpen) body.classList.remove("fm-intel-modal-open");
  }

  function showMirrorPrompt(text, isToast) {
    if (!mirrorPrompt || !mirrorPromptText) return;
    clearTimeout(mirrorToastTimer);
    mirrorPromptText.textContent = text;
    mirrorPrompt.hidden = false;
    if (isToast) {
      mirrorToastTimer = setTimeout(() => {
        if (!mirrorStep) mirrorPrompt.hidden = true;
      }, 2200);
    }
  }

  function hideMirrorPrompt() {
    clearTimeout(mirrorToastTimer);
    if (mirrorPrompt) mirrorPrompt.hidden = true;
  }

  function startMirrorFlow() {
    closeMirrorConfirm();
    if (!hasMap) return;
    mirrorStep = "box";
    mirrorBox = null;
    mirrorDragStart = null;
    mirrorLinePoints = [];
    mirrorHoverPoint = null;
    stage.classList.add("is-mirroring");
    mirrorCanvas.hidden = false;
    if (mirrorCancelBtn) mirrorCancelBtn.hidden = false;
    showMirrorPrompt("Draw a box around the field");
    redrawMirrorOverlay();
    if (isMobileLayout()) stage.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function cancelMirrorFlow() {
    mirrorStep = null;
    mirrorBox = null;
    mirrorDragStart = null;
    mirrorLinePoints = [];
    mirrorHoverPoint = null;
    stage.classList.remove("is-mirroring");
    if (mirrorCanvas) mirrorCanvas.hidden = true;
    if (mirrorCancelBtn) mirrorCancelBtn.hidden = true;
    hideMirrorPrompt();
    redrawMirrorOverlay();
  }

  function getMirrorPoint(e) {
    const { w, h } = getCanvasSize();
    const p = getLayerPoint(e, mirrorCanvas);
    return {
      x: Math.max(0, Math.min(1, p.x / (w || 1))),
      y: Math.max(0, Math.min(1, p.y / (h || 1))),
    };
  }

  function snapMirrorLinePoint(start, point) {
    const { w, h } = getCanvasSize();
    const dx = (point.x - start.x) * w;
    const dy = (point.y - start.y) * h;
    if (Math.hypot(dx, dy) < 1) return point;
    const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
    if (angle < MIRROR_SNAP_DEG || angle > 180 - MIRROR_SNAP_DEG) {
      return { x: point.x, y: start.y };
    }
    if (Math.abs(angle - 90) < MIRROR_SNAP_DEG) {
      return { x: start.x, y: point.y };
    }
    return point;
  }

  function redrawMirrorOverlay() {
    if (!mirrorCanvas) return;
    const mctx = mirrorCanvas.getContext("2d");
    mctx.save();
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, mirrorCanvas.width, mirrorCanvas.height);
    mctx.restore();
    if (!mirrorStep) return;
    const { w, h } = getCanvasSize();
    if (!w || !h) return;

    mctx.save();
    if (mirrorBox) {
      const left = Math.min(mirrorBox.x1, mirrorBox.x2) * w;
      const top = Math.min(mirrorBox.y1, mirrorBox.y2) * h;
      const width = Math.abs(mirrorBox.x2 - mirrorBox.x1) * w;
      const height = Math.abs(mirrorBox.y2 - mirrorBox.y1) * h;

      mctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      mctx.beginPath();
      mctx.rect(0, 0, w, h);
      mctx.rect(left, top, width, height);
      mctx.fill("evenodd");

      mctx.strokeStyle = MIRROR_COLOR;
      mctx.lineWidth = 2.5;
      mctx.setLineDash([10, 6]);
      mctx.strokeRect(left, top, width, height);
      mctx.setLineDash([]);
    }

    if (mirrorStep === "line" && mirrorLinePoints.length) {
      const a = mirrorLinePoints[0];
      const b = mirrorLinePoints[1] || (mirrorHoverPoint && snapMirrorLinePoint(a, mirrorHoverPoint));
      mctx.strokeStyle = MIRROR_COLOR;
      mctx.lineWidth = 3;
      if (b) {
        if (!mirrorLinePoints[1]) mctx.setLineDash([8, 6]);
        mctx.beginPath();
        mctx.moveTo(a.x * w, a.y * h);
        mctx.lineTo(b.x * w, b.y * h);
        mctx.stroke();
        mctx.setLineDash([]);
      }
      [a, b].forEach((p) => {
        if (!p) return;
        mctx.beginPath();
        mctx.arc(p.x * w, p.y * h, 6, 0, Math.PI * 2);
        mctx.fillStyle = MIRROR_COLOR;
        mctx.fill();
        mctx.lineWidth = 2;
        mctx.strokeStyle = "#000";
        mctx.stroke();
      });
    }
    mctx.restore();
  }

  function boundsIoU(a, b) {
    const ix = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
    const iy = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
    const inter = ix * iy;
    const union = a.width * a.height + b.width * b.height - inter;
    return union > 0 ? inter / union : 0;
  }

  function mirrorStructuresAcrossLine(box, p1, p2) {
    const { w, h } = getCanvasSize();
    if (!w || !h) return { error: "Map is not ready" };

    const boxLeft = Math.min(box.x1, box.x2) * w;
    const boxRight = Math.max(box.x1, box.x2) * w;
    const boxTop = Math.min(box.y1, box.y2) * h;
    const boxBottom = Math.max(box.y1, box.y2) * h;

    const px = p1.x * w;
    const py = p1.y * h;
    let dx = (p2.x - p1.x) * w;
    let dy = (p2.y - p1.y) * h;
    const len = Math.hypot(dx, dy);
    if (len < 4) return { error: "The 50 line is too short — try again" };
    dx /= len;
    dy /= len;

    const sideOf = (cx, cy) => dx * (cy - py) - dy * (cx - px);
    const reflect = (cx, cy) => {
      const t = (cx - px) * dx + (cy - py) * dy;
      return { x: 2 * (px + dx * t) - cx, y: 2 * (py + dy * t) - cy };
    };

    const inBox = structures
      .map((s) => {
        const b = getStructureBounds(s);
        const cx = (b.left + b.width / 2) * w;
        const cy = (b.top + b.height / 2) * h;
        return { s, b, cx, cy, side: sideOf(cx, cy) };
      })
      .filter(
        (item) =>
          item.cx >= boxLeft &&
          item.cx <= boxRight &&
          item.cy >= boxTop &&
          item.cy <= boxBottom &&
          Math.abs(item.side) > 2
      );

    const positive = inBox.filter((item) => item.side > 0);
    const negative = inBox.filter((item) => item.side < 0);
    const source = positive.length >= negative.length ? positive : negative;
    if (!source.length) return { error: "No structures found inside the box" };

    const r00 = 2 * dx * dx - 1;
    const r01 = 2 * dx * dy;
    const r11 = 2 * dy * dy - 1;
    const flipsVertically = Math.abs(dx) > Math.abs(dy);

    let added = 0;
    let skipped = 0;
    source.forEach(({ s, b, cx, cy }) => {
      const hw = (b.width * w) / 2;
      const hh = (b.height * h) / 2;
      const newHw = Math.abs(r00) * hw + Math.abs(r01) * hh;
      const newHh = Math.abs(r01) * hw + Math.abs(r11) * hh;
      const c = reflect(cx, cy);

      let ncx = c.x;
      let ncy = c.y;
      if (boxRight - boxLeft >= newHw * 2) {
        ncx = Math.max(boxLeft + newHw, Math.min(boxRight - newHw, ncx));
      }
      if (boxBottom - boxTop >= newHh * 2) {
        ncy = Math.max(boxTop + newHh, Math.min(boxBottom - newHh, ncy));
      }

      const copyBounds = {
        left: (ncx - newHw) / w,
        top: (ncy - newHh) / h,
        width: (newHw * 2) / w,
        height: (newHh * 2) / h,
      };

      const overlapsExisting = structures.some(
        (other) => boundsIoU(getStructureBounds(other), copyBounds) >= 0.5
      );
      if (overlapsExisting) {
        skipped++;
        return;
      }

      structures.push({
        id: crypto.randomUUID(),
        type: s.type,
        fill: normalizeStructureFill(s.fill),
        flip: s.type === "triangle" && flipsVertically ? !s.flip : Boolean(s.flip),
        x1: copyBounds.left,
        y1: copyBounds.top,
        x2: copyBounds.left + copyBounds.width,
        y2: copyBounds.top + copyBounds.height,
        detected: false,
        name: "",
        bio: "",
      });
      added++;
    });

    return { added, skipped };
  }

  function finishMirror() {
    const box = mirrorBox;
    const [p1, p2] = mirrorLinePoints;
    const result = mirrorStructuresAcrossLine(box, p1, p2);
    cancelMirrorFlow();

    if (result.error) {
      showMirrorPrompt(result.error, true);
      return;
    }

    clearSizerUndo();
    persistFieldState();
    updateSizerPanel();
    updateControlStates();
    updateIntelReport();
    redrawStructures();
    redrawVisionLines();
    redrawShootOverlay();

    let message = `Mirrored ${result.added} structure${result.added === 1 ? "" : "s"}`;
    if (result.skipped) message += ` (${result.skipped} already there)`;
    showMirrorPrompt(message, true);
  }

  mirrorCanvas?.addEventListener("pointerdown", (e) => {
    if (!mirrorStep) return;
    e.preventDefault();
    const point = getMirrorPoint(e);

    if (mirrorStep === "box") {
      mirrorDragStart = point;
      mirrorBox = { x1: point.x, y1: point.y, x2: point.x, y2: point.y };
      mirrorCanvas.setPointerCapture?.(e.pointerId);
      hideMirrorPrompt();
      redrawMirrorOverlay();
      return;
    }

    if (mirrorStep === "line") {
      if (!mirrorLinePoints.length) {
        mirrorLinePoints = [point];
        mirrorHoverPoint = point;
        hideMirrorPrompt();
        redrawMirrorOverlay();
        return;
      }
      mirrorLinePoints = [mirrorLinePoints[0], snapMirrorLinePoint(mirrorLinePoints[0], point)];
      redrawMirrorOverlay();
      finishMirror();
    }
  });

  mirrorCanvas?.addEventListener("pointermove", (e) => {
    if (!mirrorStep) return;
    const point = getMirrorPoint(e);
    if (mirrorStep === "box" && mirrorDragStart) {
      mirrorBox = { x1: mirrorDragStart.x, y1: mirrorDragStart.y, x2: point.x, y2: point.y };
      redrawMirrorOverlay();
    } else if (mirrorStep === "line" && mirrorLinePoints.length === 1) {
      mirrorHoverPoint = point;
      redrawMirrorOverlay();
    }
  });

  function endMirrorBoxDrag(e) {
    if (mirrorStep !== "box" || !mirrorDragStart) return;
    if (e) {
      mirrorBox = { ...mirrorBox, x2: getMirrorPoint(e).x, y2: getMirrorPoint(e).y };
    }
    mirrorDragStart = null;
    const { w, h } = getCanvasSize();
    const boxW = Math.abs(mirrorBox.x2 - mirrorBox.x1) * w;
    const boxH = Math.abs(mirrorBox.y2 - mirrorBox.y1) * h;
    if (boxW < MIRROR_MIN_BOX_PX || boxH < MIRROR_MIN_BOX_PX) {
      mirrorBox = null;
      redrawMirrorOverlay();
      showMirrorPrompt("Draw a box around the field");
      return;
    }
    mirrorStep = "line";
    mirrorLinePoints = [];
    mirrorHoverPoint = null;
    redrawMirrorOverlay();
    showMirrorPrompt("Click two points to draw the 50 line");
  }

  mirrorCanvas?.addEventListener("pointerup", endMirrorBoxDrag);
  mirrorCanvas?.addEventListener("pointercancel", () => endMirrorBoxDrag(null));

  designMapBtn?.addEventListener("click", onDesignButton);
  designMapMobileBtn?.addEventListener("click", onDesignButton);
  designSwitch?.addEventListener("click", () => setDesignMap(!designMapOn));
  mirrorLayoutBtn?.addEventListener("click", openMirrorConfirm);
  mirrorLayoutMobileBtn?.addEventListener("click", () => {
    closeToolsPanel();
    openMirrorConfirm();
  });
  mirrorConfirmYes?.addEventListener("click", startMirrorFlow);
  mirrorConfirmNo?.addEventListener("click", closeMirrorConfirm);
  mirrorConfirmBackdrop?.addEventListener("click", closeMirrorConfirm);
  mirrorCancelBtn?.addEventListener("click", cancelMirrorFlow);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (theaterOpen) closeTheater();
    else if (presetModal && !presetModal.hidden) closePresetModal();
    else if (mirrorConfirm && !mirrorConfirm.hidden) closeMirrorConfirm();
    else if (mirrorStep) cancelMirrorFlow();
    else if (intelModalOpen) closeIntelModal();
  });

  bindSizerInputs();
  bindDesignPanel();
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
      if (isDrawing || isPlacingStructure || draggedPlayer || mirrorDragStart || structureDrag || autoPointer) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  setTool("select");
  updateControlStates();
})();
