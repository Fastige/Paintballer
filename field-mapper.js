(function () {
  const TEAM_A = "#ff5c00";
  const TEAM_B = "#3b9eff";
  const PLAYERS_PER_TEAM = 5;
  const IS_COARSE = window.matchMedia("(pointer: coarse)").matches;

  const body = document.body;
  const stage = document.getElementById("fm-stage");
  const stageWrap = document.getElementById("fm-stage-wrap");
  const image = document.getElementById("fm-image");
  const canvas = document.getElementById("fm-canvas");
  const playersLayer = document.getElementById("fm-players");
  const mapUpload = document.getElementById("map-upload");
  const mapUploadPrompt = document.getElementById("map-upload-prompt");
  const mapUploadMobile = document.getElementById("map-upload-mobile");
  const clearMapBtn = document.getElementById("clear-map");
  const clearDrawingsBtn = document.getElementById("clear-drawings");
  const resetPlayersBtn = document.getElementById("reset-players");
  const resetPlayersMobile = document.getElementById("reset-players-mobile");
  const brushSizeInput = document.getElementById("brush-size");
  const brushColorInput = document.getElementById("brush-color");
  const toolBtns = document.querySelectorAll(".fm-tool-btn[data-tool]");
  const mobileToolBtns = document.querySelectorAll(".fm-mobile-btn[data-tool]");
  const toggleToolsBtn = document.getElementById("toggle-tools");
  const sidebar = document.getElementById("fm-sidebar");
  const hint = document.getElementById("fm-hint");

  if (!stage || !canvas) return;

  const ctx = canvas.getContext("2d");
  let activeTool = "select";
  let isDrawing = false;
  let hasMap = false;
  let draggedPlayer = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  if (IS_COARSE && brushSizeInput) {
    brushSizeInput.value = "12";
  }

  const defaultPositions = {
    a: [
      { x: 8, y: 12 },
      { x: 8, y: 30 },
      { x: 8, y: 50 },
      { x: 8, y: 70 },
      { x: 8, y: 88 },
    ],
    b: [
      { x: 92, y: 12 },
      { x: 92, y: 30 },
      { x: 92, y: 50 },
      { x: 92, y: 70 },
      { x: 92, y: 88 },
    ],
  };

  document.documentElement.style.setProperty("--team-a", TEAM_A);
  document.documentElement.style.setProperty("--team-b", TEAM_B);

  function setInteractionLock(on) {
    body.classList.toggle("fm-drawing", on);
  }

  function updateMobileControls() {
    if (resetPlayersMobile) resetPlayersMobile.disabled = !hasMap;
    if (resetPlayersBtn) resetPlayersBtn.disabled = !hasMap;
    if (clearMapBtn) clearMapBtn.disabled = !hasMap;
    if (clearDrawingsBtn) clearDrawingsBtn.disabled = !hasMap;
  }

  function setTool(tool) {
    activeTool = tool;
    toolBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tool === tool);
    });
    mobileToolBtns.forEach((btn) => {
      const isActive = btn.dataset.tool === tool;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    stage.classList.toggle("tool-brush", tool === "brush");
    if (hint) {
      hint.innerHTML =
        tool === "brush"
          ? "<strong>Brush</strong> active — draw on the map · switch to <strong>Move</strong> to drag players"
          : "<strong>Move</strong> active — drag players 1–5 · switch to <strong>Brush</strong> to draw on the map";
    }
  }

  function closeToolsPanel() {
    sidebar?.classList.remove("is-open");
    body.classList.remove("fm-tools-open");
    if (toggleToolsBtn) {
      toggleToolsBtn.setAttribute("aria-expanded", "false");
    }
  }

  function openToolsPanel() {
    sidebar?.classList.add("is-open");
    body.classList.add("fm-tools-open");
    if (toggleToolsBtn) {
      toggleToolsBtn.setAttribute("aria-expanded", "true");
    }
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

  toggleToolsBtn?.addEventListener("click", () => {
    if (sidebar?.classList.contains("is-open")) {
      closeToolsPanel();
    } else {
      openToolsPanel();
    }
  });

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
  }

  function bindPlayerDrag(el) {
    el.addEventListener("pointerdown", (e) => {
      if (activeTool !== "select" || !hasMap) return;
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
    });

    const endDrag = (e) => {
      if (draggedPlayer !== el) return;
      el.classList.remove("is-dragging");
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      draggedPlayer = null;
      setInteractionLock(false);
    };

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
  }

  function resizeCanvas() {
    if (!hasMap || !image.naturalWidth) return;

    const w = image.offsetWidth;
    const h = image.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newW = Math.floor(w * dpr);
    const newH = Math.floor(h * dpr);

    let snapshot = null;
    if (canvas.width > 0 && canvas.height > 0) {
      snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d").drawImage(canvas, 0, 0);
    }

    canvas.width = newW;
    canvas.height = newH;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (snapshot) {
      ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, w, h);
    }
  }

  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDraw(e) {
    if (activeTool !== "brush" || !hasMap) return;
    e.preventDefault();
    isDrawing = true;
    setInteractionLock(true);
    const { x, y } = getCanvasPoint(e);
    ctx.strokeStyle = brushColorInput?.value || "#7cfc3b";
    ctx.lineWidth = Number(brushSizeInput?.value) || 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasPoint(e);
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
    if (clearDrawingsBtn) clearDrawingsBtn.disabled = false;
  }

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);

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
    stage.classList.add("has-map");
    stageWrap?.classList.add("has-map");
    image.hidden = false;
    canvas.hidden = false;
    playersLayer.hidden = false;
    createPlayers();
    resetPlayerPositions();
    updateMobileControls();
    requestAnimationFrame(resizeCanvas);
  }

  function hideMapUI() {
    hasMap = false;
    stage.classList.remove("has-map");
    stageWrap?.classList.remove("has-map");
    image.hidden = true;
    image.removeAttribute("src");
    canvas.hidden = true;
    playersLayer.hidden = true;
    playersLayer.innerHTML = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mapUpload) mapUpload.value = "";
    if (mapUploadPrompt) mapUploadPrompt.value = "";
    if (mapUploadMobile) mapUploadMobile.value = "";
    updateMobileControls();
    setInteractionLock(false);
  }

  mapUpload?.addEventListener("change", (e) => {
    handleMapFile(e.target.files?.[0]);
  });

  mapUploadPrompt?.addEventListener("change", (e) => {
    handleMapFile(e.target.files?.[0]);
  });

  mapUploadMobile?.addEventListener("change", (e) => {
    handleMapFile(e.target.files?.[0]);
    e.target.value = "";
  });

  clearMapBtn?.addEventListener("click", () => {
    if (confirm("Remove the map and clear all drawings and player positions?")) {
      hideMapUI();
    }
  });

  clearDrawingsBtn?.addEventListener("click", () => {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearDrawingsBtn.disabled = true;
  });

  resetPlayersBtn?.addEventListener("click", resetPlayerPositions);
  resetPlayersMobile?.addEventListener("click", resetPlayerPositions);

  image.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", () => {
    setTimeout(resizeCanvas, 150);
  });

  const resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(stage);

  document.addEventListener(
    "touchmove",
    (e) => {
      if (isDrawing || draggedPlayer) e.preventDefault();
    },
    { passive: false }
  );

  setTool("select");
  updateMobileControls();
})();
