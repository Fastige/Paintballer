(() => {
  const W = 320;
  const H = 220;
  const SCENE_MS = 3600;
  const RESET_MS = SCENE_MS + 700;
  const LOOP_MS = 5600;
  const DOT_SPAWN_MS = 200;
  const DOT_TRAVEL_MS = 700;
  const RUN_SPEED = 55;
  const TEAM = { a: "#ff5c00", b: "#3b9eff" };
  const GREEN = { fill: "#00ff9d", outline: "#00cc7a", glow: "#00ff9d" };
  const FIELD = { turf: "#132018", turfCenter: "#1b2d1f", stripes: "#ffffff", grid: "#ffffff", lines: "#e8efe4", vignette: "#000000" };
  const SHOOT_LINE = "#ffd43b";
  const SHOOT_BLOCKED = "#ff4f4f";
  const RUN_COLOR = "#7cfc3b";
  const DOT_COLOR = "#7cfc3b";

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
  const BUNKERS = leftBunkers.flatMap((b) => (b.x === 160 ? [b] : [b, { ...b, x: W - b.x, mirrored: true }]));

  const RUNS = {
    dorito1: [[20, 80], [28, 64], [38, 54], [50, 50]],
    dorito2: [[22, 82], [34, 64], [52, 55], [76, 50]],
    dorito3: [[22, 82], [40, 66], [70, 56], [102, 50]],
    topRect: [[22, 84], [36, 70], [54, 64]],
    mt: [[24, 86], [50, 80], [84, 84], [104, 77], [110, 64]],
    midTri: [[24, 92], [50, 88], [80, 85], [96, 82]],
    homeRect: [[26, 100], [50, 102], [74, 100]],
    temple: [[26, 98], [60, 90], [100, 88], [132, 90]],
    snakeSide: [[26, 124], [60, 130], [102, 128]],
    cake: [[24, 132], [34, 140], [40, 142]],
    can1: [[24, 134], [44, 152], [70, 166], [86, 168]],
    can2: [[26, 130], [60, 146], [100, 154], [121, 156]],
    can3: [[26, 134], [60, 150], [104, 162], [139, 172]],
    snakeCorner: [[22, 128], [28, 148], [38, 164], [50, 172], [56, 174]],
    snake: [[22, 130], [30, 160], [50, 196], [80, 204], [104, 204]],
    center: [[26, 110], [70, 116], [120, 140], [150, 154]],
  };

  const LANES = {
    topTape: [300, 28],
    dorito: [250, 52],
    mt: [214, 64],
    center: [212, 112],
    midLow: [270, 150],
    snake: [240, 200],
    snakeDeep: [292, 204],
  };

  const BREAKOUTS = [
    { name: "Snake rush", active: "a3", a: [["dorito1", 1], [null, "snake"], ["snake", 4], [null, "snakeDeep"], ["cake", null]], b: [["dorito1", 1], [null, "center"], ["temple", null], ["snakeCorner", 3], ["can1", null]] },
    { name: "Dorito push", active: "a1", a: [["dorito3", 2], ["dorito2", null], [null, "dorito"], ["topRect", null], [null, "snake"]], b: [["dorito1", null], [null, "dorito"], ["mt", 1], ["cake", null], ["snakeCorner", null]] },
    { name: "Center lane", active: "a2", a: [["homeRect", null], ["center", 3], [null, "center"], ["can2", null], ["snakeCorner", null]], b: [["topRect", null], [null, "center"], ["temple", 2], ["can1", null], ["snake", null]] },
    { name: "Wide-wide", active: "a5", a: [["dorito1", null], [null, "topTape"], [null, "center"], [null, "snakeDeep"], ["snake", 4]], b: [["dorito2", null], [null, "topTape"], ["homeRect", null], ["snake", 5], ["cake", null]] },
    { name: "Double snake", active: "a4", a: [[null, "dorito"], ["cake", null], ["snakeCorner", null], ["snake", 3], [null, "snake"]], b: [["dorito1", 1], ["snakeCorner", null], [null, "snake"], ["snake", 4], ["can1", null]] },
    { name: "Mid stack", active: "a2", a: [["mt", null], ["temple", 3], ["midTri", null], ["snakeSide", null], [null, "snake"]], b: [["midTri", 2], ["mt", null], [null, "dorito"], ["can2", null], ["snakeCorner", null]] },
    { name: "Can crawl", active: "a3", a: [["topRect", null], [null, "midLow"], ["can3", 4], ["can1", null], ["cake", null]], b: [["dorito1", null], [null, "snake"], ["can2", 3], ["can1", null], ["snakeCorner", null]] },
    { name: "Lane wall", active: "a2", a: [[null, "dorito"], [null, "center"], [null, "snake"], ["cake", null], ["homeRect", null]], b: [["dorito2", 1], ["dorito1", null], ["temple", null], ["snake", 2], ["can2", null]] },
    { name: "Top corner", active: "a2", a: [["dorito1", null], ["topRect", 1], [null, "snake"], ["snakeSide", null], ["snakeCorner", null]], b: [["dorito3", null], ["dorito2", 1], ["mt", null], [null, "snakeDeep"], ["snake", null]] },
    { name: "Temple trap", active: "a3", a: [["dorito2", null], [null, "mt"], ["temple", 2], ["homeRect", null], ["can1", null]], b: [["topRect", null], ["temple", 3], [null, "center"], ["cake", null], ["snake", 5]] },
  ];

  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (hex, a) => `rgba(${rgb(hex).join(", ")}, ${a})`;
  const shade = (hex, t) => `rgb(${rgb(hex).map((c) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t))).join(", ")})`;

  const startPos = (key) => {
    const i = Number(key[1]) - 1;
    return { x: key[0] === "a" ? 14 : W - 14, y: 94 + i * 8 };
  };

  function buildTrack(start, route) {
    const pts = [[start.x, start.y], ...route];
    const lengths = [0];
    for (let i = 1; i < pts.length; i += 1) {
      lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts, lengths, total: lengths[lengths.length - 1] };
  }

  const scenes = BREAKOUTS.map((def) => {
    const setups = [];
    ["a", "b"].forEach((team) => {
      const mirror = (x) => (team === "b" ? W - x : x);
      def[team].forEach(([run, shot], i) => {
        const key = `${team}${i + 1}`;
        const setup = { key, active: key === def.active };
        if (run) {
          setup.track = buildTrack(startPos(key), RUNS[run].map(([x, y]) => [mirror(x), y]));
          setup.time = Math.min(3.2, Math.max(0.8, Math.round((setup.track.total / RUN_SPEED) * 10) / 10));
        }
        if (typeof shot === "number") setup.target = `${team === "a" ? "b" : "a"}${shot}`;
        else if (shot) setup.point = [mirror(LANES[shot][0]), LANES[shot][1]];
        setups.push(setup);
      });
    });
    return { name: def.name, setups };
  });

  const showing = new Set();

  function pickScene(previous) {
    const options = scenes.map((_, i) => i).filter((i) => i !== previous && !showing.has(i));
    const pool = options.length ? options : scenes.map((_, i) => i).filter((i) => i !== previous);
    return pool[Math.floor(Math.random() * pool.length)] ?? 0;
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
      const hit = segmentHitT(ox, oy, dx, dy, pt[0], pt[1], next[0], next[1]);
      if (hit !== null && (best === null || hit < best)) best = hit;
    });
    return best;
  }

  function castShot(start, target, list = BUNKERS) {
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    let best = null;
    list.forEach((b) => {
      const t = bunkerHitT(b, start.x, start.y, dx, dy);
      if (t !== null && t > 0.01 && (best === null || t < best)) best = t;
    });
    if (best === null) return { end: target, blocked: false };
    return { end: { x: start.x + dx * best, y: start.y + dy * best }, blocked: true };
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

  function playerPos(scene, key, t) {
    const setup = scene.setups.find((s) => s.key === key);
    if (!setup?.track) return { ...startPos(key), segment: 1 };
    const progress = t >= RESET_MS ? 0 : Math.min(1, t / (setup.time * 1000));
    return alongTrack(setup.track, progress);
  }

  function shotFor(scene, setup, t) {
    if (!setup.point && !setup.target) return null;
    const start = playerPos(scene, setup.key, t);
    const target = setup.target ? playerPos(scene, setup.target, t) : { x: setup.point[0], y: setup.point[1] };
    return { start, ...castShot(start, target) };
  }

  function timelineTracks(scene) {
    const active = scene.setups.find((s) => s.active);
    const teamA = scene.setups.find((s) => s.key[0] === "a" && !s.active && s.track);
    const teamB = scene.setups.find((s) => s.key[0] === "b" && s.track && s.target) || scene.setups.find((s) => s.key[0] === "b" && s.track);
    return [active, teamA, teamB].filter(Boolean).sort((x, y) => x.key.localeCompare(y.key));
  }

  function clipHtml(setup) {
    const team = setup.key[0] === "a" ? "team-a" : "team-b";
    const name = setup.key.toUpperCase();
    if (!setup.track) {
      return `<div class="hero-track"><span class="hero-track-name">${name}</span><span class="hero-clip ${team} is-shot" style="--clip-w: 100%">Shoot · hold</span></div>`;
    }
    const width = Math.round(((setup.time * 1000) / SCENE_MS) * 100);
    const label = setup.point || setup.target ? `Run ${setup.time}s · shoot` : `Run ${setup.time}s`;
    return `<div class="hero-track"><span class="hero-track-name">${name}</span><span class="hero-clip ${team}" style="--clip-w: ${width}%">${label}</span></div>`;
  }

  function drawField(ctx, theme = FIELD, scale = 1) {
    const turf = ctx.createLinearGradient(0, 0, W, 0);
    turf.addColorStop(0, theme.turf);
    turf.addColorStop(0.5, theme.turfCenter);
    turf.addColorStop(1, theme.turf);
    ctx.fillStyle = turf;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = rgba(theme.stripes, 0.04);
    for (let i = 0; i < 14; i += 2) ctx.fillRect((i * W) / 14, 0, W / 14, H);

    const cell = H / 14;
    ctx.strokeStyle = rgba(theme.grid, 0.12);
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

    ctx.save();
    ctx.strokeStyle = rgba(theme.lines, 0.75);
    ctx.lineWidth = 2;
    ctx.shadowColor = rgba(theme.lines, 0.45);
    ctx.shadowBlur = 4 * scale;
    ctx.strokeRect(6.5, 6.5, W - 13, H - 13);
    ctx.restore();

    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, W * 0.75);
    vignette.addColorStop(0, rgba(theme.vignette, 0));
    vignette.addColorStop(1, rgba(theme.vignette, 0.38));
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function bunkerPath(ctx, b) {
    ctx.beginPath();
    if (b.type === "circle") {
      ctx.ellipse(b.x, b.y, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
      return;
    }
    const poly = bunkerPolygon(b);
    ctx.moveTo(poly[0][0], poly[0][1]);
    poly.slice(1).forEach((pt) => ctx.lineTo(pt[0], pt[1]));
    ctx.closePath();
  }

  function drawBunker(ctx, b, colors = GREEN, opts = {}) {
    const { alpha = 1, preview = false, printed = null, rot = 0, pop = 0, scale = 1 } = opts;
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (rot || pop) {
      ctx.translate(b.x, b.y);
      if (rot) ctx.rotate((rot * Math.PI) / 180);
      if (pop) ctx.scale(1 + pop * 0.18, 1 + pop * 0.18);
      ctx.translate(-b.x, -b.y);
    }
    bunkerPath(ctx, b);
    if (printed) {
      ctx.fillStyle = printed;
      ctx.fill();
    } else if (preview) {
      ctx.fillStyle = rgba(colors.fill, 0.16);
      ctx.fill();
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = colors.fill;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    } else if (b.border) {
      ctx.shadowColor = rgba(colors.glow, 0.55);
      ctx.shadowBlur = 6 * scale;
      ctx.fillStyle = rgba(colors.fill, 0.08);
      ctx.fill();
      ctx.setLineDash([4, 2.6]);
      ctx.strokeStyle = colors.fill;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    } else {
      ctx.shadowColor = rgba(colors.glow, 0.55);
      ctx.shadowBlur = 6 * scale;
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBunkers(ctx, list = BUNKERS, colors = GREEN, opts = {}) {
    list.forEach((b) => drawBunker(ctx, b, colors, opts));
  }

  function drawPlayer(ctx, x, y, team, num, opts = {}) {
    const { ghost = false, ring = null, lift = 0, alpha = 1, scale = 1, r = 4.6 } = opts;
    if (alpha <= 0) return;
    const color = TEAM[team] || team;
    const size = r * (1 + lift * 0.25);
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (ring) {
      ctx.beginPath();
      ctx.arc(x, y, size + 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1.3;
      ctx.shadowColor = ring;
      ctx.shadowBlur = 6 * scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.font = `${(size * 1.5).toFixed(2)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (ghost) {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.35);
      ctx.fill();
      ctx.setLineDash([2, 1.6]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(num, x, y + size * 0.1);
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, size + 1.1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = rgba(color, 0.75);
    ctx.shadowBlur = (6 + lift * 6) * scale;
    ctx.fill();
    ctx.shadowBlur = 0;

    const ball = ctx.createRadialGradient(x - size * 0.1, y - size * 0.24, size * 0.05, x, y, size);
    ball.addColorStop(0, shade(color, 0.28));
    ball.addColorStop(0.46, color);
    ball.addColorStop(1, shade(color, -0.5));
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = ball;
    ctx.fill();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "#0b0d0c";
    ctx.stroke();

    const shine = ctx.createRadialGradient(x - size * 0.36, y - size * 0.48, 0, x - size * 0.36, y - size * 0.48, size * 0.6);
    shine.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    shine.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 1.2 * scale;
    ctx.fillText(num, x, y + size * 0.1);
    ctx.restore();
  }

  function marker(ctx, x, y, color, r) {
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#0f1210";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawGameOverlay(ctx, scene, t, opts = {}) {
    const { mutedAlpha = 0.55, scale = 1 } = opts;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    scene.setups.forEach((setup) => {
      const muted = !setup.active;
      ctx.save();
      ctx.globalAlpha = muted ? mutedAlpha : 1;
      const width = muted ? 1.3 : 2;
      if (setup.point) marker(ctx, setup.point[0], setup.point[1], SHOOT_LINE, 3.2);
      if (setup.track) {
        const end = setup.track.pts[setup.track.pts.length - 1];
        marker(ctx, end[0], end[1], RUN_COLOR, 3.2);
      }
      const shot = shotFor(scene, setup, t);
      if (shot) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = shot.blocked ? SHOOT_BLOCKED : SHOOT_LINE;
        ctx.lineWidth = width;
        ctx.moveTo(shot.start.x, shot.start.y);
        ctx.lineTo(shot.end.x, shot.end.y);
        ctx.stroke();
        if (shot.blocked) marker(ctx, shot.end.x, shot.end.y, SHOOT_BLOCKED, muted ? 2.2 : 2.8);
      }
      if (setup.track) {
        const pos = playerPos(scene, setup.key, t);
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
    void scale;
  }

  function drawGameDots(ctx, scene, t) {
    if (t >= RESET_MS) return;
    const first = Math.max(0, Math.ceil((t - DOT_TRAVEL_MS) / DOT_SPAWN_MS));
    for (let k = first; k * DOT_SPAWN_MS <= Math.min(t, SCENE_MS); k += 1) {
      const born = k * DOT_SPAWN_MS;
      const p = Math.min(1, (t - born) / DOT_TRAVEL_MS);
      const eased = p * (2 - p);
      scene.setups.forEach((setup) => {
        const shot = shotFor(scene, setup, born);
        if (!shot) return;
        marker(
          ctx,
          shot.start.x + (shot.end.x - shot.start.x) * eased,
          shot.start.y + (shot.end.y - shot.start.y) * eased,
          shot.blocked ? SHOOT_BLOCKED : DOT_COLOR,
          2
        );
      });
    }
  }

  function drawGamePlayers(ctx, scene, t, opts = {}) {
    const { hide = {}, extra = {}, scale = 1, r = 4.6 } = opts;
    scene.setups.forEach((setup) => {
      if (hide[setup.key]) return;
      const pos = extra[setup.key]?.pos || playerPos(scene, setup.key, t);
      const ring = extra[setup.key]?.ring ?? (setup.active ? "#ffdc5a" : null);
      drawPlayer(ctx, pos.x, pos.y, setup.key[0], setup.key[1], { ring, scale, r, ...extra[setup.key] });
    });
  }

  function drawGame(ctx, scene, t, opts = {}) {
    const { theme = FIELD, bunkers = BUNKERS, bunkerColors = GREEN, scale = 1, hide = {}, extra = {}, overlay = true, players = true, field = true } = opts;
    if (field) drawField(ctx, theme, scale);
    drawBunkers(ctx, bunkers, bunkerColors, { scale });
    if (overlay) {
      drawGameOverlay(ctx, scene, t, { mutedAlpha: opts.mutedAlpha ?? 0.55, scale });
      drawGameDots(ctx, scene, t);
    }
    if (players) drawGamePlayers(ctx, scene, t, { hide, extra, scale, r: opts.r });
  }

  function createLoop(index, onScene) {
    let sceneIndex = -1;
    let scene = null;
    let startedAt = performance.now() - index * 1400;

    function useScene(i) {
      if (sceneIndex >= 0) showing.delete(sceneIndex);
      sceneIndex = i;
      showing.add(i);
      scene = scenes[i];
      onScene?.(scene);
    }

    useScene(pickScene(-1));

    return {
      get scene() {
        return scene;
      },
      time(now) {
        if (now - startedAt >= LOOP_MS) {
          startedAt = now - ((now - startedAt) % LOOP_MS);
          useScene(pickScene(sceneIndex));
        }
        return Math.max(0, now - startedAt);
      },
    };
  }

  window.PaintballerGame = {
    W,
    H,
    SCENE_MS,
    RESET_MS,
    LOOP_MS,
    TEAM,
    GREEN,
    FIELD,
    BUNKERS,
    SHOOT_LINE,
    SHOOT_BLOCKED,
    RUN_COLOR,
    rgb,
    rgba,
    shade,
    startPos,
    pickScene,
    bunkerPolygon,
    bunkerHitT,
    castShot,
    alongTrack,
    playerPos,
    shotFor,
    timelineTracks,
    clipHtml,
    drawField,
    drawBunker,
    drawBunkers,
    drawPlayer,
    drawGame,
    drawGameOverlay,
    drawGameDots,
    drawGamePlayers,
    createLoop,
  };
})();
