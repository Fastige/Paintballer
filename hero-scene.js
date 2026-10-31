(() => {
  const canvas = document.getElementById("hero-scene");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const playhead = document.querySelector(".hero-playhead");

  const W = 320;
  const H = 220;
  const SCENE_MS = 3600;
  const RESET_MS = SCENE_MS + 700;
  const LOOP_MS = 5600;
  const DOT_SPAWN_MS = 200;
  const DOT_TRAVEL_MS = 700;
  const PLAYER_R = 4.2;

  const SHOOT_LINE = "#ffd43b";
  const SHOOT_BLOCKED = "#ff4f4f";
  const RUN_COLOR = "#7cfc3b";
  const DOT_COLOR = "#7cfc3b";
  const EDGE = "#0f1210";
  const BUNKER_FILL = "#00ff9d";
  const BUNKER_OUTLINE = "#00cc7a";

  const leftBunkers = [
    { type: "tri", x: 50, y: 38, w: 12, h: 10 },
    { type: "tri", x: 76, y: 38, w: 12, h: 10 },
    { type: "tri", x: 102, y: 38, w: 12, h: 10 },
    { type: "circle", x: 160, y: 38, w: 22, h: 14, border: true },
    { type: "rect", x: 62, y: 62, w: 8, h: 8 },
    { type: "rect", x: 118, y: 60, w: 10, h: 8 },
    { type: "tri", x: 96, y: 70, w: 12, h: 10 },
    { type: "rect", x: 140, y: 86, w: 8, h: 16 },
    { type: "rect", x: 82, y: 98, w: 10, h: 10 },
    { type: "rect", x: 160, y: 112, w: 24, h: 24, border: true },
    { type: "rect", x: 46, y: 140, w: 8, h: 8 },
    { type: "rect", x: 110, y: 126, w: 8, h: 12 },
    { type: "circle", x: 128, y: 152, w: 10, h: 10 },
    { type: "circle", x: 146, y: 170, w: 9, h: 9 },
    { type: "circle", x: 92, y: 166, w: 8, h: 8 },
    { type: "rect", x: 160, y: 152, w: 10, h: 12 },
    { type: "rect", x: 62, y: 184, w: 8, h: 12 },
    { type: "rect", x: 160, y: 192, w: 120, h: 8, border: true },
  ];
  const bunkers = leftBunkers.flatMap((b) => (b.x === 160 ? [b] : [b, { ...b, x: W - b.x }]));

  const players = {};
  ["a", "b"].forEach((team) => {
    for (let i = 0; i < 5; i += 1) {
      players[`${team}${i + 1}`] = { team, num: i + 1, x: team === "a" ? 14 : W - 14, y: 94 + i * 8 };
    }
  });

  const setups = [
    { key: "a1", time: 2.0, route: [[20, 80], [26, 66], [34, 56], [44, 51], [52, 51]], point: [266, 56] },
    { key: "a2", point: [296, 152], active: true },
    { key: "a3", time: 2.6, route: [[22, 128], [28, 148], [38, 164], [50, 172], [56, 174]], point: [242, 188] },
    { key: "a4", point: [300, 206] },
    { key: "a5", time: 1.2, route: [[24, 134], [32, 142], [38, 142]] },
    { key: "b1", time: 1.8, route: [[300, 80], [294, 66], [286, 56], [276, 51], [268, 51]], target: "a1" },
    { key: "b2", point: [20, 152] },
    { key: "b3", time: 1.4, route: [[298, 122], [288, 130], [276, 131]], point: [128, 146] },
    { key: "b4", time: 2.4, route: [[300, 134], [294, 152], [284, 166], [270, 174], [264, 175]], point: [86, 188] },
  ];

  setups.forEach((setup) => {
    const p = players[setup.key];
    if (!setup.route) return;
    const pts = [[p.x, p.y], ...setup.route];
    const lengths = [0];
    for (let i = 1; i < pts.length; i += 1) {
      lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    setup.track = { pts, lengths, total: lengths[lengths.length - 1] };
  });

  function runProgress(setup, t) {
    if (!setup.track || t >= RESET_MS) return 0;
    return Math.min(1, t / (setup.time * 1000));
  }

  function alongTrack(track, fraction) {
    const dist = fraction * track.total;
    for (let i = 1; i < track.pts.length; i += 1) {
      if (dist <= track.lengths[i] || i === track.pts.length - 1) {
        const segLen = track.lengths[i] - track.lengths[i - 1] || 1;
        const k = Math.min(1, Math.max(0, (dist - track.lengths[i - 1]) / segLen));
        const [ax, ay] = track.pts[i - 1];
        const [bx, by] = track.pts[i];
        return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, segment: i };
      }
    }
    return { x: track.pts[0][0], y: track.pts[0][1], segment: 1 };
  }

  function playerPos(key, t) {
    const setup = setups.find((s) => s.key === key);
    const p = players[key];
    if (!setup?.track) return { x: p.x, y: p.y, segment: 1 };
    return alongTrack(setup.track, runProgress(setup, t));
  }

  function segmentHitT(ox, oy, dx, dy, ax, ay, bx, by) {
    const ex = bx - ax;
    const ey = by - ay;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-9) return null;
    const t = ((ax - ox) * ey - (ay - oy) * ex) / denom;
    const u = ((ax - ox) * dy - (ay - oy) * dx) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
  }

  function bunkerPolygon(b) {
    const l = b.x - b.w / 2;
    const r = b.x + b.w / 2;
    const top = b.y - b.h / 2;
    const bottom = b.y + b.h / 2;
    if (b.type === "tri") return [[b.x, top], [r, bottom], [l, bottom]];
    return [[l, top], [r, top], [r, bottom], [l, bottom]];
  }

  function bunkerHitT(b, ox, oy, dx, dy) {
    if (b.type === "circle") {
      const rx = b.w / 2;
      const ry = b.h / 2;
      const px = (ox - b.x) / rx;
      const py = (oy - b.y) / ry;
      const qx = dx / rx;
      const qy = dy / ry;
      const a = qx * qx + qy * qy;
      const bb = 2 * (px * qx + py * qy);
      const c = px * px + py * py - 1;
      const disc = bb * bb - 4 * a * c;
      if (disc < 0) return null;
      const t = (-bb - Math.sqrt(disc)) / (2 * a);
      return t >= 0 && t <= 1 ? t : null;
    }
    const poly = bunkerPolygon(b);
    let best = null;
    poly.forEach((pt, i) => {
      const next = poly[(i + 1) % poly.length];
      const t = segmentHitT(ox, oy, dx, dy, pt[0], pt[1], next[0], next[1]);
      if (t !== null && (best === null || t < best)) best = t;
    });
    return best;
  }

  function castShot(start, target) {
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    let best = null;
    bunkers.forEach((b) => {
      const t = bunkerHitT(b, start.x, start.y, dx, dy);
      if (t !== null && t > 0.01 && (best === null || t < best)) best = t;
    });
    if (best === null) return { end: target, blocked: false };
    return { end: { x: start.x + dx * best, y: start.y + dy * best }, blocked: true };
  }

  function shotFor(setup, t) {
    if (!setup.point && !setup.target) return null;
    const start = playerPos(setup.key, t);
    const target = setup.target ? playerPos(setup.target, t) : { x: setup.point[0], y: setup.point[1] };
    return { start, ...castShot(start, target) };
  }

  function drawField() {
    const turf = ctx.createLinearGradient(0, 0, W, 0);
    turf.addColorStop(0, "#132018");
    turf.addColorStop(0.5, "#1b2d1f");
    turf.addColorStop(1, "#132018");
    ctx.fillStyle = turf;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    for (let i = 0; i < 14; i += 2) ctx.fillRect((i * W) / 14, 0, W / 14, H);

    const cell = H / 14;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let x = cell; x < W; x += cell) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = cell; y < H; y += cell) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    const inset = 6.5;
    ctx.save();
    ctx.strokeStyle = "rgba(232, 239, 228, 0.75)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(232, 239, 228, 0.45)";
    ctx.shadowBlur = 4 * scale;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
    ctx.restore();

    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, W * 0.75);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.38)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function traceBunker(b) {
    ctx.beginPath();
    if (b.type === "circle") {
      ctx.ellipse(b.x, b.y, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
    } else {
      const poly = bunkerPolygon(b);
      ctx.moveTo(poly[0][0], poly[0][1]);
      poly.slice(1).forEach((pt) => ctx.lineTo(pt[0], pt[1]));
      ctx.closePath();
    }
  }

  function drawBunkers() {
    bunkers.forEach((b) => {
      ctx.save();
      ctx.shadowColor = "rgba(0, 255, 157, 0.55)";
      ctx.shadowBlur = 6 * scale;
      traceBunker(b);
      if (b.border) {
        ctx.fillStyle = "rgba(0, 255, 157, 0.08)";
        ctx.fill();
        ctx.setLineDash([4, 2.6]);
        ctx.strokeStyle = BUNKER_FILL;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      } else {
        ctx.fillStyle = BUNKER_FILL;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = BUNKER_OUTLINE;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function marker(x, y, color, r) {
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawOverlay(t) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setups.forEach((setup) => {
      const muted = !setup.active;
      ctx.save();
      ctx.globalAlpha = muted ? 0.55 : 1;
      const width = muted ? 1.3 : 2;

      if (setup.point) marker(setup.point[0], setup.point[1], SHOOT_LINE, 3.2);
      if (setup.track) {
        const end = setup.track.pts[setup.track.pts.length - 1];
        marker(end[0], end[1], RUN_COLOR, 3.2);
      }

      const shot = shotFor(setup, t);
      if (shot) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = shot.blocked ? SHOOT_BLOCKED : SHOOT_LINE;
        ctx.lineWidth = width;
        ctx.moveTo(shot.start.x, shot.start.y);
        ctx.lineTo(shot.end.x, shot.end.y);
        ctx.stroke();
        if (shot.blocked) marker(shot.end.x, shot.end.y, SHOOT_BLOCKED, muted ? 2.2 : 2.8);
      }

      if (setup.track) {
        const pos = playerPos(setup.key, t);
        const rest = setup.track.pts.slice(pos.segment);
        if (rest.length) {
          ctx.beginPath();
          ctx.setLineDash([5, 3.8]);
          ctx.strokeStyle = RUN_COLOR;
          ctx.lineWidth = width;
          ctx.moveTo(pos.x, pos.y);
          rest.forEach((pt) => ctx.lineTo(pt[0], pt[1]));
          ctx.stroke();
        }
      }
      ctx.restore();
    });
  }

  function drawDots(t) {
    if (t >= RESET_MS) return;
    const first = Math.max(0, Math.ceil((t - DOT_TRAVEL_MS) / DOT_SPAWN_MS));
    for (let k = first; k * DOT_SPAWN_MS <= Math.min(t, SCENE_MS); k += 1) {
      const born = k * DOT_SPAWN_MS;
      const p = Math.min(1, (t - born) / DOT_TRAVEL_MS);
      const eased = p * (2 - p);
      setups.forEach((setup) => {
        const shot = shotFor(setup, born);
        if (!shot) return;
        marker(
          shot.start.x + (shot.end.x - shot.start.x) * eased,
          shot.start.y + (shot.end.y - shot.start.y) * eased,
          shot.blocked ? SHOOT_BLOCKED : DOT_COLOR,
          2
        );
      });
    }
  }

  function drawPlayers(t) {
    ctx.font = `700 ${PLAYER_R * 1.15}px "Outfit", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    Object.entries(players).forEach(([key, p]) => {
      const pos = playerPos(key, t);
      if (key === "a2") {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, PLAYER_R + 1.9, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffdc5a";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 2 * scale;
      ctx.shadowOffsetY = 0.6 * scale;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PLAYER_R, 0, Math.PI * 2);
      ctx.fillStyle = p.team === "a" ? "#ff5c00" : "#3b9eff";
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillText(String(p.num), pos.x, pos.y + 0.3);
    });
  }

  let scale = 1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    scale = canvas.width / W;
  }

  function render(t) {
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawField();
    drawBunkers();
    drawOverlay(t);
    drawDots(t);
    drawPlayers(t);
    if (playhead) playhead.style.left = `${t < RESET_MS ? Math.min(1, t / SCENE_MS) * 100 : 0}%`;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let startedAt = performance.now();
  let frame = 0;
  let visible = true;

  function tick(now) {
    frame = 0;
    render((now - startedAt) % LOOP_MS);
    schedule();
  }

  function schedule() {
    if (frame || !visible || document.hidden || reduceMotion.matches) return;
    frame = requestAnimationFrame(tick);
  }

  function refresh() {
    resize();
    if (reduceMotion.matches) render(1800);
    else render((performance.now() - startedAt) % LOOP_MS);
    schedule();
  }

  new ResizeObserver(refresh).observe(canvas);
  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    schedule();
  }).observe(canvas);
  document.addEventListener("visibilitychange", schedule);
  reduceMotion.addEventListener?.("change", refresh);
  document.fonts?.ready.then(refresh);
  refresh();
})();
