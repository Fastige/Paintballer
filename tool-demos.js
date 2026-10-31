(() => {
  const roots = [...document.querySelectorAll("[data-tool-demo]")];
  const G = window.PaintballerGame;
  if (!roots.length || !G) return;

  const W = G.W;
  const H = G.H;
  const FADE_MS = 300;
  const PR = 4.6;
  const GREEN = G.GREEN;
  const FIELD = G.FIELD;
  const ALL = G.BUNKERS;
  const find = (x, y) => ALL.find((b) => b.x === x && b.y === y);
  const rgba = G.rgba;
  let S = 1;
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k * k * (3 - 2 * k);
  const prog = (t, a, b) => clamp01((t - a) / ((b - a) || 1));

  function pathLengths(pts) {
    const lengths = [0];
    for (let i = 1; i < pts.length; i += 1) {
      lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return lengths;
  }

  /** Points of the path from its start up to fraction k of its length. */
  function pathSlice(pts, k) {
    const lengths = pathLengths(pts);
    const dist = clamp01(k) * lengths[lengths.length - 1];
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i += 1) {
      if (dist >= lengths[i]) {
        out.push(pts[i]);
        continue;
      }
      const seg = lengths[i] - lengths[i - 1] || 1;
      const f = (dist - lengths[i - 1]) / seg;
      out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
      break;
    }
    return out;
  }

  /** Points of the path from fraction k of its length to the end. */
  function pathRest(pts, k) {
    const head = pathSlice(pts, k);
    return [head[head.length - 1], ...pts.slice(head.length - 1 + (k >= 1 ? 1 : 0))];
  }

  const pathTip = (pts, k) => {
    const s = pathSlice(pts, k);
    return { x: s[s.length - 1][0], y: s[s.length - 1][1] };
  };

  /** Keyframes {t, x, y, down}; `down` holds the button for the move to the next key. */
  function track(keys, t) {
    if (t <= keys[0].t) return { ...keys[0] };
    for (let i = 1; i < keys.length; i += 1) {
      const a = keys[i - 1];
      const b = keys[i];
      if (t <= b.t) {
        const k = ease((t - a.t) / (b.t - a.t || 1));
        return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), down: Boolean(a.down) };
      }
    }
    return { ...keys[keys.length - 1], down: false };
  }

  const stackPos = (team, i) => ({ x: team === "a" ? 16 : W - 16, y: 86 + i * 12 });

  function strokePath(ctx, pts) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const drawField = (ctx, theme = FIELD) => G.drawField(ctx, theme, S);

  function drawStaticTeams(ctx, hide = {}) {
    for (let i = 0; i < 5; i += 1) {
      if (!hide[`a${i + 1}`]) {
        const p = stackPos("a", i);
        drawPlayer(ctx, p.x, p.y, "a", String(i + 1));
      }
      if (!hide[`b${i + 1}`]) {
        const p = stackPos("b", i);
        drawPlayer(ctx, p.x, p.y, "b", String(i + 1));
      }
    }
  }

  let vegasImg = null;
  let vegasBunkers = [];
  const vegasReady = [];
  const notifyVegas = () => vegasReady.forEach((fn) => fn());
  const vegasPhoto = new Image();
  vegasPhoto.onload = () => {
    vegasImg = vegasPhoto;
    notifyVegas();
  };
  vegasPhoto.src = "presets/las-vegas-major-2024/print.webp";
  fetch("presets/las-vegas-major-2024/intel.json")
    .then((res) => res.json())
    .then((data) => {
      vegasBunkers = (data.structures || []).map((s) => ({
        type: s.type === "circle" ? "circle" : s.type === "triangle" ? "tri" : "rect",
        x: ((s.x1 + s.x2) / 2) * W,
        y: ((s.y1 + s.y2) / 2) * H,
        w: Math.max(2, Math.abs(s.x2 - s.x1) * W),
        h: Math.max(2, Math.abs(s.y2 - s.y1) * H),
        rot: s.rotation || 0,
      }));
      notifyVegas();
    })
    .catch(() => {});

  function drawVegasSheet(ctx) {
    if (vegasImg) {
      ctx.drawImage(vegasImg, 0, 0, W, H);
      return;
    }
    drawPrintedField(ctx);
  }

  function drawPrintedField(ctx) {
    ctx.fillStyle = "#eef1ec";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(40, 46, 40, 0.08)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let x = H / 14; x < W; x += H / 14) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    ctx.stroke();
    ctx.strokeStyle = "#2b312b";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(6.5, 6.5, W - 13, H - 13);
  }

  const drawBunker = (ctx, b, colors = GREEN, opts = {}) => G.drawBunker(ctx, b, colors, { ...opts, scale: S });
  const drawBunkers = (ctx, list, colors) => G.drawBunkers(ctx, list, colors, { scale: S });
  const drawPlayer = (ctx, x, y, team, num, opts = {}) => G.drawPlayer(ctx, x, y, team, num, { ...opts, scale: S, r: PR });

  function drawCursor(ctx, c, color) {
    if (!c) return;
    ctx.save();
    if (c.down) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.25);
      ctx.fill();
      ctx.strokeStyle = rgba(color, 0.85);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.translate(c.x, c.y);
    ctx.scale(0.6, 0.6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(4, 11.5);
    ctx.lineTo(7, 17.5);
    ctx.lineTo(9.6, 16.3);
    ctx.lineTo(6.8, 10.5);
    ctx.lineTo(11.5, 10.5);
    ctx.closePath();
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 3 * S;
    ctx.shadowOffsetY = 1 * S;
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#0b0d0c";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  function drawSelection(ctx, b, color, t, rot = 0) {
    ctx.save();
    ctx.translate(b.x, b.y);
    if (rot) ctx.rotate((rot * Math.PI) / 180);
    ctx.setLineDash([3, 2]);
    ctx.lineDashOffset = -t / 60;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4 * S;
    ctx.strokeRect(-b.w / 2 - 3, -b.h / 2 - 3, b.w + 6, b.h + 6);
    ctx.restore();
  }

  function drawPill(ctx, x, y, text, color, opts = {}) {
    const { alpha = 1, size = 7 } = opts;
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `700 ${size}px "Outfit", sans-serif`;
    const w = ctx.measureText(text).width + 14;
    const h = size + 7;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = "rgba(11, 13, 12, 0.82)";
    ctx.fill();
    ctx.strokeStyle = rgba(color, 0.7);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 6.5, y + h / 2, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#e8efe4";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 10, y + h / 2 + 0.3);
    ctx.restore();
  }

  function drawCard(ctx, anchor, title, note, color, k, typed) {
    if (k <= 0) return;
    const w = 112;
    const h = 34;
    const x = Math.min(W - w - 10, Math.max(10, anchor.x + 14));
    const y = Math.min(H - h - 10, Math.max(10, anchor.y - h - 6)) + (1 - k) * 4;
    ctx.save();
    ctx.globalAlpha *= k;
    roundRect(ctx, x, y, w, h, 5);
    ctx.fillStyle = "rgba(11, 13, 12, 0.92)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 8 * S;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 6, 2, h - 12);
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.font = `10px "Bebas Neue", sans-serif`;
    ctx.fillText(title.slice(0, Math.ceil(title.length * clamp01(typed * 2))), x + 8, y + 6);
    ctx.fillStyle = "#c9d4c4";
    ctx.font = `600 6.6px "Outfit", sans-serif`;
    ctx.fillText(note.slice(0, Math.floor(note.length * clamp01(typed * 2 - 1))), x + 8, y + 20);
    ctx.restore();
  }

  const bunkerHitT = (b, ox, oy, dx, dy) => G.bunkerHitT(b, ox, oy, dx, dy);
  const castShot = (start, target) => G.castShot(start, target, ALL);

  function visionRing(ox, oy) {
    const pts = [];
    for (let deg = 0; deg < 360; deg += 1) {
      const a = (deg * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const tx = ux > 0 ? (W - ox) / ux : ux < 0 ? -ox / ux : Infinity;
      const ty = uy > 0 ? (H - oy) / uy : uy < 0 ? -oy / uy : Infinity;
      const reach = Math.min(tx, ty);
      let best = 1;
      let blocked = false;
      ALL.forEach((b) => {
        const t = bunkerHitT(b, ox, oy, ux * reach, uy * reach);
        if (t !== null && t > 0.001 && t < best) {
          best = t;
          blocked = true;
        }
      });
      pts.push({ x: ox + ux * reach * best, y: oy + uy * reach * best, dist: reach * best, blocked });
    }
    return pts;
  }

  function drawVision(ctx, ox, oy, color, alpha) {
    if (alpha <= 0) return;
    const pts = visionRing(ox, oy);
    const reach = Math.max(1, ...pts.map((p) => p.dist));
    ctx.save();
    ctx.globalAlpha *= alpha;
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, reach);
    glow.addColorStop(0, rgba(color, 0.4));
    glow.addColorStop(0.35, rgba(color, 0.2));
    glow.addColorStop(1, rgba(color, 0.05));
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    let open = false;
    for (let i = 1; i <= pts.length; i += 1) {
      const prev = pts[i - 1];
      const p = pts[i % pts.length];
      if (!(prev.blocked && p.blocked && Math.abs(p.dist - prev.dist) < Math.max(3, Math.min(p.dist, prev.dist) * 0.08))) {
        open = false;
        continue;
      }
      if (!open) {
        ctx.moveTo(prev.x, prev.y);
        open = true;
      }
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 5 * S;
    ctx.stroke();
    ctx.restore();
  }

  function dot(ctx, x, y, color, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#0f1210";
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  function drawSwatches(ctx, colors, active, x, y) {
    colors.forEach((c, i) => {
      const cx = x + i * 11;
      ctx.beginPath();
      ctx.arc(cx, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
      if (i === active) {
        ctx.beginPath();
        ctx.arc(cx, y, 5.4, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  const DESIGN_THEMES = [
    { name: "Photo", photo: true },
    { name: "Pro Turf", turf: "#0c2416", turfCenter: "#17472a", stripes: "#d9ffe6", grid: "#ffffff", lines: "#ffffff", vignette: "#020a05", fill: "#ff3045", outline: "#ffd0d5", glow: "#ff3045" },
    { name: "Vegas Strip", turf: "#140a1c", turfCenter: "#2d1240", stripes: "#ffcc66", grid: "#ffcc66", lines: "#ffcc66", vignette: "#05020a", fill: "#ff2e63", outline: "#ffe0a3", glow: "#ff2e63" },
    { name: "Arctic", turf: "#c4d4e0", turfCenter: "#eaf2f8", stripes: "#6c8ba3", grid: "#4f6f88", lines: "#1d3a52", vignette: "#6f8aa0", fill: "#1aa6ff", outline: "#0b3d66", glow: "#1aa6ff" },
    { name: "Classic Grass", turf: "#2c5a1c", turfCenter: "#467d2a", stripes: "#ffffff", grid: "#ffffff", lines: "#ffffff", vignette: "#0d1f07", fill: "#1b1f24", outline: "#ffffff", glow: "#000000" },
  ];

  function drawTheme(ctx, theme) {
    if (theme.photo) {
      drawPrintedField(ctx);
      ALL.forEach((b) => drawBunker(ctx, b, GREEN, { printed: b.border ? "rgba(34, 214, 120, 0.35)" : "#22d678" }));
      return;
    }
    drawField(ctx, theme);
    drawBunkers(ctx, ALL, theme);
  }

  const DEMOS = {
    move: {
      color: "#7cfc3b",
      dur: 6400,
      captions: [[0, "Drag a player into position"], [3000, "Tap a bunker to see its intel"]],
      draw(ctx, t) {
        drawField(ctx);
        drawBunkers(ctx, ALL);
        const from = stackPos("a", 1);
        const to = { x: 52, y: 72 };
        const k = ease(prog(t, 900, 2300));
        const sel = find(118, 60);
        drawStaticTeams(ctx, { a2: true });
        if (t > 3500) drawSelection(ctx, sel, this.color, t);
        drawPlayer(ctx, lerp(from.x, to.x, k), lerp(from.y, to.y, k), "a", "2", { lift: t > 750 && t < 2450 ? 1 : 0 });
        drawCard(ctx, sel, "Top rect", "Watch the dorito side", this.color, prog(t, 3500, 3800), prog(t, 3600, 4800));
        drawCursor(
          ctx,
          track(
            [
              { t: 0, x: 130, y: 170 },
              { t: 750, x: from.x, y: from.y, down: true },
              { t: 900, x: from.x, y: from.y, down: true },
              { t: 2300, x: to.x, y: to.y },
              { t: 2600, x: to.x, y: to.y },
              { t: 3300, x: sel.x, y: sel.y, down: true },
              { t: 3500, x: sel.x, y: sel.y },
              { t: 4200, x: sel.x - 20, y: sel.y + 40 },
            ],
            t
          ),
          this.color
        );
      },
    },

    players: {
      color: "#ff7a1a",
      dur: 6800,
      captions: [[0, "Tap a spawn point"], [1000, "Nudge the stack, then lock it"], [2700, "Place Team 2 the same way"]],
      draw(ctx, t) {
        drawField(ctx);
        drawBunkers(ctx, ALL);
        const color = this.color;
        const team = (side, spawn, appearAt, nudgeAt, lockAt) => {
          if (t < appearAt) return;
          const nudge = nudgeAt ? -12 * ease(prog(t, nudgeAt, nudgeAt + 250)) : 0;
          const cy = spawn.y + nudge;
          const locked = t >= lockAt;
          const pop = locked ? 1 - prog(t, lockAt, lockAt + 260) : 0;
          for (let i = 0; i < 5; i += 1) {
            const y = cy + 12 * (i - 2);
            drawPlayer(ctx, spawn.x, y, side, String(i + 1), { ghost: !locked, lift: pop, alpha: locked ? 1 : prog(t, appearAt, appearAt + 200) });
          }
          if (locked) return;
          const px = spawn.x + (side === "a" ? 30 : -30);
          ctx.save();
          ctx.globalAlpha = prog(t, appearAt, appearAt + 200);
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.beginPath();
          ctx.moveTo(spawn.x + (side === "a" ? 8 : -8), cy);
          ctx.lineTo(px + (side === "a" ? -14 : 14), cy);
          ctx.stroke();
          ctx.setLineDash([]);
          [[0, -11, "↑"], [-11, 0, "←"], [11, 0, "→"], [0, 11, "↓"], [0, 0, "✓"]].forEach(([dx, dy, label]) => {
            const check = label === "✓";
            ctx.beginPath();
            ctx.arc(px + dx, cy + dy, 5, 0, Math.PI * 2);
            ctx.fillStyle = check ? "rgba(124, 252, 59, 0.85)" : "rgba(15, 18, 16, 0.7)";
            ctx.fill();
            ctx.strokeStyle = check ? "#7cfc3b" : "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 0.7;
            ctx.stroke();
            ctx.fillStyle = check ? "#0f1210" : "#ffffff";
            ctx.font = `700 6px "Outfit", sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, px + dx, cy + dy + 0.3);
          });
          ctx.restore();
          return { px, cy };
        };
        const spawnA = { x: 22, y: 112 };
        const spawnB = { x: 298, y: 104 };
        team("a", spawnA, 700, 1350, 2050);
        team("b", spawnB, 3450, 0, 4550);
        const padA = { x: spawnA.x + 30, y: spawnA.y };
        const padB = { x: spawnB.x - 30, y: spawnB.y };
        drawCursor(
          ctx,
          track(
            [
              { t: 0, x: 150, y: 180 },
              { t: 550, x: spawnA.x, y: spawnA.y, down: true },
              { t: 700, x: spawnA.x, y: spawnA.y },
              { t: 1200, x: padA.x, y: padA.y - 11, down: true },
              { t: 1350, x: padA.x, y: padA.y - 11 },
              { t: 1850, x: padA.x, y: padA.y - 12, down: true },
              { t: 2050, x: padA.x, y: padA.y - 12 },
              { t: 3300, x: spawnB.x, y: spawnB.y, down: true },
              { t: 3450, x: spawnB.x, y: spawnB.y },
              { t: 4350, x: padB.x, y: padB.y, down: true },
              { t: 4550, x: padB.x, y: padB.y },
              { t: 5300, x: 230, y: 170 },
            ],
            t
          ),
          color
        );
      },
    },

    brush: {
      color: "#ffd43b",
      dur: 6600,
      captions: [[0, "Drag to sketch a route"], [2300, "Switch colors for each call"], [4200, "Circle the bunker that matters"]],
      draw(ctx, t) {
        drawField(ctx);
        drawBunkers(ctx, ALL);
        const strokes = [
          { color: "#ffd43b", a: 400, b: 1900, pts: [[24, 98], [40, 90], [62, 84], [86, 82], [110, 86], [132, 90]] },
          { color: "#ff7a1a", a: 2500, b: 3900, pts: [[24, 124], [34, 150], [50, 178], [76, 196], [104, 200]], arrow: true },
          {
            color: "#ff4fc8",
            a: 4400,
            b: 5300,
            pts: Array.from({ length: 41 }, (_, i) => {
              const ang = -Math.PI / 2 + (i / 40) * Math.PI * 2.1;
              return [160 + Math.cos(ang) * 21, 112 + Math.sin(ang) * 19];
            }),
          },
        ];
        let active = 0;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        strokes.forEach((s, i) => {
          const k = prog(t, s.a, s.b);
          if (t >= s.a - 300) active = i;
          if (k <= 0) return;
          const pts = pathSlice(s.pts, k);
          strokePath(ctx, pts);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2.6;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 4 * S;
          ctx.stroke();
          if (s.arrow && k >= 1) {
            const [ax, ay] = s.pts[s.pts.length - 2];
            const [bx, by] = s.pts[s.pts.length - 1];
            const ang = Math.atan2(by - ay, bx - ax);
            ctx.beginPath();
            ctx.moveTo(bx + Math.cos(ang - 2.5) * 7, by + Math.sin(ang - 2.5) * 7);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + Math.cos(ang + 2.5) * 7, by + Math.sin(ang + 2.5) * 7);
            ctx.stroke();
          }
        });
        ctx.restore();
        drawSwatches(ctx, strokes.map((s) => s.color), active, 22, 22);
        let cursor;
        const live = strokes.find((s) => t >= s.a && t <= s.b);
        if (live) cursor = { ...pathTip(live.pts, prog(t, live.a, live.b)), down: true };
        else {
          const keys = [{ t: 0, x: 150, y: 170 }];
          strokes.forEach((s) => {
            keys.push({ t: s.a, x: s.pts[0][0], y: s.pts[0][1] });
            keys.push({ t: s.b, x: s.pts[s.pts.length - 1][0], y: s.pts[s.pts.length - 1][1] });
          });
          cursor = track(keys, t);
        }
        drawCursor(ctx, cursor, strokes[active].color);
      },
    },

    structure: {
      color: "#00ff9d",
      dur: 6800,
      captions: [[0, "Pick a shape"], [600, "Drag on the map to draw it to size"], [5000, "Add whatever the map missed"]],
      draw(ctx, t) {
        drawField(ctx);
        const placed = [
          { b: { type: "rect", x: 160, y: 112, w: 24, h: 24 }, a: 600, z: 1500, icon: 0 },
          { b: { type: "circle", x: 230, y: 160, w: 16, h: 16 }, a: 2300, z: 3100, icon: 1 },
          { b: { type: "tri", x: 226, y: 72, w: 18, h: 14 }, a: 4000, z: 4800, icon: 2 },
        ];
        const skip = new Set(["160,112", "228,166", "224,70"]);
        drawBunkers(ctx, ALL.filter((b) => !skip.has(`${b.x},${b.y}`)));
        let shape = 0;
        placed.forEach((p) => {
          if (t >= p.a - 500) shape = p.icon;
          const k = ease(prog(t, p.a, p.z));
          if (t < p.a) return;
          if (t < p.z) {
            const l = p.b.x - p.b.w / 2;
            const top = p.b.y - p.b.h / 2;
            const w = Math.max(1, p.b.w * k);
            const h = Math.max(1, p.b.h * k);
            drawBunker(ctx, { ...p.b, x: l + w / 2, y: top + h / 2, w, h }, GREEN, { preview: true });
          } else {
            drawBunker(ctx, p.b, GREEN, { pop: 1 - prog(t, p.z, p.z + 240) });
          }
        });
        ["rect", "circle", "tri"].forEach((type, i) => {
          const x = 20 + i * 15;
          const y = 22;
          ctx.save();
          roundRect(ctx, x - 6, y - 6, 12, 12, 3);
          ctx.fillStyle = i === shape ? rgba(this.color, 0.22) : "rgba(11, 13, 12, 0.7)";
          ctx.fill();
          ctx.strokeStyle = i === shape ? this.color : "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
          drawBunker(ctx, { type, x, y, w: 6, h: 6 }, GREEN, { printed: i === shape ? this.color : "rgba(255, 255, 255, 0.55)" });
        });
        const corner = (p, end) => ({ x: p.b.x + (end ? 1 : -1) * (p.b.w / 2), y: p.b.y + (end ? 1 : -1) * (p.b.h / 2) });
        const keys = [{ t: 0, x: 120, y: 180 }];
        placed.forEach((p) => {
          keys.push({ t: p.a - 300, x: 20 + p.icon * 15, y: 22, down: true });
          keys.push({ t: p.a - 200, x: 20 + p.icon * 15, y: 22 });
          keys.push({ t: p.a, ...corner(p, false), down: true });
          keys.push({ t: p.z, ...corner(p, true) });
        });
        drawCursor(ctx, track(keys, t), this.color);
      },
    },

    auto: {
      color: "#6c8cff",
      dur: 7200,
      captions: [[0, "Drag a box around the area to scan"], [1700, "White out text and logos"], [2900, "Every bunker color turns into a structure"]],
      draw(ctx, t) {
        drawVegasSheet(ctx);
        const found = vegasBunkers.length ? vegasBunkers : ALL;
        const scanX = lerp(8, 312, prog(t, 2900, 4300));
        if (t > 2900) {
          found.forEach((b) => {
            if (b.x < scanX) drawBunker(ctx, b, GREEN, { alpha: prog(scanX - b.x, 0, 16), rot: b.rot || 0 });
          });
        }
        const whites = [
          { a: 1800, b: 2300, pts: [[16, 16], [304, 16]], width: 24 },
          { a: 2140, b: 2500, pts: [[308, 48], [308, 176]], width: 16 },
          { a: 2360, b: 2600, pts: [[276, 204], [312, 204]], width: 14 },
        ];
        whites.forEach((s) => {
          const k = prog(t, s.a, s.b);
          if (k <= 0) return;
          ctx.save();
          ctx.lineCap = "round";
          strokePath(ctx, pathSlice(s.pts, k));
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = s.width;
          ctx.stroke();
          ctx.restore();
        });
        const bk = ease(prog(t, 300, 1400));
        if (t > 300) {
          ctx.save();
          const x2 = lerp(10, 310, bk);
          const y2 = lerp(8, 212, bk);
          ctx.fillStyle = rgba(this.color, t > 4300 ? 0.04 : 0.1);
          ctx.fillRect(10, 8, x2 - 10, y2 - 8);
          ctx.setLineDash([4, 3]);
          ctx.lineDashOffset = -t / 50;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(10, 8, x2 - 10, y2 - 8);
          ctx.restore();
        }
        if (t > 2900 && t < 4400) {
          ctx.save();
          const g = ctx.createLinearGradient(scanX - 18, 0, scanX, 0);
          g.addColorStop(0, rgba(this.color, 0));
          g.addColorStop(1, rgba(this.color, 0.35));
          ctx.fillStyle = g;
          ctx.fillRect(scanX - 18, 8, 18, 204);
          ctx.fillStyle = this.color;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8 * S;
          ctx.fillRect(scanX - 0.8, 8, 1.6, 204);
          ctx.restore();
        }
        if (t > 4400) {
          drawPill(ctx, 20, 186, "Red", "#e0393e", { alpha: prog(t, 4400, 4700) });
          drawPill(ctx, 56, 186, "Blue", "#2f6fe0", { alpha: prog(t, 4550, 4850) });
          drawPill(ctx, 95, 186, "Black", "#8d968c", { alpha: prog(t, 4700, 5000) });
        }
        const live = whites.find((s) => t >= s.a && t <= s.b);
        drawCursor(
          ctx,
          live
            ? { ...pathTip(live.pts, prog(t, live.a, live.b)), down: true }
            : track(
                [
                  { t: 0, x: 160, y: 120 },
                  { t: 300, x: 10, y: 8, down: true },
                  { t: 1400, x: 310, y: 212 },
                  { t: 1800, x: 16, y: 16 },
                  { t: 2600, x: 312, y: 204 },
                  { t: 3200, x: 250, y: 120 },
                ],
                t
              ),
          this.color
        );
      },
    },

    shoot: {
      color: "#ff3b3b",
      dur: 7000,
      captions: [[0, "Tap a player, then draw the run"], [1700, "Set the shoot point"], [2500, "Play the scene"]],
      draw(ctx, t) {
        drawField(ctx);
        drawBunkers(ctx, ALL);
        drawStaticTeams(ctx, { a3: true, b4: true });
        const start = stackPos("a", 2);
        const route = [[start.x, start.y], [40, 98], [68, 90], [96, 82]];
        const target = { x: 196, y: 44 };
        const runA = 2500;
        const runZ = 4300;
        const bShooter = stackPos("b", 3);
        const bPoint = { x: 88, y: 168 };
        const rk = prog(t, runA, runZ);
        const pos = t >= runA ? pathTip(route, rk) : { x: start.x, y: start.y };
        const drawK = prog(t, 400, 1500);
        if (drawK > 0) {
          ctx.save();
          ctx.setLineDash([5, 3.8]);
          ctx.strokeStyle = "#7cfc3b";
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          const pts = pathSlice(route, drawK);
          strokePath(ctx, t >= runA ? pathRest(route, rk) : pts);
          ctx.stroke();
          ctx.restore();
          if (drawK >= 1) dot(ctx, route[3][0], route[3][1], "#7cfc3b", 2.6);
        }
        if (t > 2000) dot(ctx, target.x, target.y, "#ffd43b", 2.8);
        const shots = [];
        if (t > 2000) shots.push({ from: pos, to: target });
        if (t > runA) shots.push({ from: bShooter, to: bPoint });
        shots.forEach((s) => {
          const shot = castShot(s.from, s.to);
          ctx.save();
          ctx.strokeStyle = shot.blocked ? "#ff4f4f" : "#ffd43b";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.from.x, s.from.y);
          ctx.lineTo(shot.end.x, shot.end.y);
          ctx.stroke();
          ctx.restore();
          if (shot.blocked) dot(ctx, shot.end.x, shot.end.y, "#ff4f4f", 2.4);
          if (t > runA && t < runZ + 1400) {
            for (let born = runA; born <= Math.min(t, runZ + 600); born += 200) {
              const p = (t - born) / 700;
              if (p < 0 || p > 1) continue;
              const eased = p * (2 - p);
              dot(ctx, lerp(s.from.x, shot.end.x, eased), lerp(s.from.y, shot.end.y, eased), shot.blocked ? "#ff4f4f" : "#7cfc3b", 1.6);
            }
          }
        });
        drawPlayer(ctx, pos.x, pos.y, "a", "3", { ring: "#ffdc5a" });
        const bHold = stackPos("b", 3);
        drawPlayer(ctx, bHold.x, bHold.y, "b", "4", { ring: t > runA ? "rgba(255, 220, 90, 0.6)" : null });
        const live = t >= 400 && t <= 1500;
        drawCursor(
          ctx,
          live
            ? { ...pathTip(route, drawK), down: true }
            : track(
                [
                  { t: 0, x: 120, y: 170 },
                  { t: 250, x: start.x, y: start.y, down: true },
                  { t: 400, x: start.x, y: start.y },
                  { t: 1500, x: 96, y: 82 },
                  { t: 1850, x: target.x, y: target.y, down: true },
                  { t: 2000, x: target.x, y: target.y },
                  { t: 2600, x: 210, y: 150 },
                ],
                t
              ),
          this.color
        );
      },
    },

    vision: {
      color: "#ff4fc8",
      dur: 7400,
      captions: [[0, "Tap a player"], [1300, "Sight stops at every bunker"], [4000, "Pick any color"]],
      draw(ctx, t) {
        drawField(ctx);
        const palette = ["#ff4fc8", "#3bd5ff", "#7cfc3b", "#ffd43b"];
        const active = t >= 4400 ? 1 : 0;
        const from = stackPos("a", 1);
        const path = [[from.x, from.y], [30, 84], [46, 74], [54, 72]];
        const pos = pathTip(path, ease(prog(t, 1500, 3400)));
        drawVision(ctx, pos.x, pos.y, palette[active], prog(t, 650, 950));
        drawBunkers(ctx, ALL);
        drawStaticTeams(ctx, { a2: true });
        drawPlayer(ctx, pos.x, pos.y, "a", "2", { ring: t > 650 ? palette[active] : null });
        drawSwatches(ctx, palette, active, 22, 22);
        drawCursor(
          ctx,
          track(
            [
              { t: 0, x: 120, y: 170 },
              { t: 500, x: from.x, y: from.y, down: true },
              { t: 650, x: from.x, y: from.y },
              { t: 1300, x: 110, y: 170 },
              { t: 3900, x: 110, y: 170 },
              { t: 4250, x: 33, y: 22, down: true },
              { t: 4400, x: 33, y: 22 },
              { t: 5200, x: 90, y: 160 },
            ],
            t
          ),
          this.color
        );
      },
    },

    sizer: {
      color: "#3bd5ff",
      dur: 7400,
      captions: [[0, "Select a bunker"], [900, "Set the exact size"], [2400, "Spin it to any angle"], [4100, "Nudge it into place"]],
      draw(ctx, t) {
        drawField(ctx);
        const base = find(82, 98);
        drawBunkers(ctx, ALL.filter((b) => b !== base));
        const w = lerp(10, 26, ease(prog(t, 1100, 2100)));
        const rot = Math.round(lerp(0, 30, ease(prog(t, 2700, 3800))));
        const steps = [4400, 4700, 5000, 5300].reduce((n, at) => n + ease(prog(t, at, at + 160)), 0);
        const b = { ...base, w, x: base.x + steps * 3 };
        const selected = t > 450;
        drawBunker(ctx, b, GREEN, { rot });
        if (selected) {
          drawSelection(ctx, b, this.color, t, rot);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate((rot * Math.PI) / 180);
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
            ctx.fillStyle = "#0b0d0c";
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 0.9;
            ctx.fillRect(sx * (b.w / 2 + 3) - 1.8, sy * (b.h / 2 + 3) - 1.8, 3.6, 3.6);
            ctx.strokeRect(sx * (b.w / 2 + 3) - 1.8, sy * (b.h / 2 + 3) - 1.8, 3.6, 3.6);
          });
          ctx.restore();
          drawPill(ctx, 18, 16, `W ${((w / W) * 100).toFixed(1)}%  ·  H ${((b.h / H) * 100).toFixed(1)}%  ·  ${rot}°`, this.color);
        }

        const wheel = { x: 286, y: 184 };
        const arrow = { x: 258, y: 184 };
        if (t > 2300) {
          const a = prog(t, 2300, 2500);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(wheel.x, wheel.y, 13, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(11, 13, 12, 0.85)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          const ang = ((rot - 90) * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(wheel.x, wheel.y);
          ctx.lineTo(wheel.x + Math.cos(ang) * 9, wheel.y + Math.sin(ang) * 9);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(wheel.x + Math.cos(ang) * 9, wheel.y + Math.sin(ang) * 9, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          roundRect(ctx, arrow.x - 8, arrow.y - 8, 16, 16, 4);
          ctx.fillStyle = "rgba(11, 13, 12, 0.85)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.stroke();
          ctx.fillStyle = this.color;
          ctx.font = `700 9px "Outfit", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("→", arrow.x, arrow.y + 0.5);
          ctx.restore();
        }
        const knob = (deg) => {
          const ang = ((deg - 90) * Math.PI) / 180;
          return { x: wheel.x + Math.cos(ang) * 9, y: wheel.y + Math.sin(ang) * 9 };
        };
        let cursor;
        if (t >= 2700 && t <= 3800) cursor = { ...knob(rot), down: true };
        else {
          cursor = track(
            [
              { t: 0, x: 140, y: 170 },
              { t: 300, x: base.x, y: base.y, down: true },
              { t: 450, x: base.x, y: base.y },
              { t: 1100, x: base.x + 8, y: base.y, down: true },
              { t: 2100, x: base.x + 16, y: base.y },
              { t: 2700, ...knob(0) },
              { t: 3800, ...knob(30) },
              { t: 4300, x: arrow.x, y: arrow.y, down: true },
              { t: 5500, x: arrow.x, y: arrow.y },
              { t: 6200, x: 200, y: 150 },
            ],
            t
          );
          if (t > 4300 && t < 5500) cursor.down = [4400, 4700, 5000, 5300].some((at) => t >= at && t < at + 140);
        }
        drawCursor(ctx, cursor, this.color);
      },
    },

    mirror: {
      color: "#b18cff",
      dur: 7200,
      captions: [[0, "Box the half you mapped"], [1600, "Click two points on the 50"], [2700, "Bunkers copy across the line"]],
      draw(ctx, t) {
        drawField(ctx);
        const color = this.color;
        drawBunkers(ctx, ALL.filter((b) => !b.mirrored));
        ALL.filter((b) => b.mirrored).forEach((b, i) => {
          const s = 2800 + i * 70;
          const k = ease(prog(t, s, s + 520));
          if (k <= 0) return;
          drawBunker(ctx, { ...b, x: lerp(160, b.x, k) }, GREEN, { alpha: k });
        });
        const bk = ease(prog(t, 300, 1300));
        if (t > 300 && t < 2900) {
          ctx.save();
          ctx.globalAlpha = 1 - prog(t, 2500, 2900);
          ctx.fillStyle = rgba(color, 0.08);
          ctx.fillRect(12, 12, lerp(0, 150, bk), lerp(0, 196, bk));
          ctx.setLineDash([4, 3]);
          ctx.lineDashOffset = -t / 50;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(12, 12, lerp(0, 150, bk), lerp(0, 196, bk));
          ctx.restore();
        }
        const p1 = { x: 160, y: 12 };
        const p2 = { x: 160, y: 208 };
        if (t > 1800) dot(ctx, p1.x, p1.y, color, 2.6);
        if (t > 2300) {
          ctx.save();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.3;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6 * S;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p1.x, lerp(p1.y, p2.y, ease(prog(t, 2300, 2600))));
          ctx.stroke();
          ctx.restore();
          dot(ctx, p2.x, p2.y, color, 2.6);
        }
        drawCursor(
          ctx,
          track(
            [
              { t: 0, x: 90, y: 180 },
              { t: 300, x: 12, y: 12, down: true },
              { t: 1300, x: 162, y: 208 },
              { t: 1650, x: p1.x, y: p1.y, down: true },
              { t: 1800, x: p1.x, y: p1.y },
              { t: 2150, x: p2.x, y: p2.y, down: true },
              { t: 2300, x: p2.x, y: p2.y },
              { t: 3000, x: 210, y: 160 },
            ],
            t
          ),
          color
        );
      },
    },

    design: {
      color: "#2ee6c8",
      dur: 7800,
      captions: [[0, "Flip the photo to a design map"], [2400, "Pick one of 15 field themes"]],
      draw(ctx, t) {
        const swaps = [900, 2500, 4000, 5500];
        let current = 0;
        swaps.forEach((at, i) => {
          if (t >= at + 500) current = i + 1;
        });
        drawTheme(ctx, DESIGN_THEMES[current]);
        const wiping = swaps.findIndex((at) => t >= at && t < at + 500);
        if (wiping >= 0) {
          const x = W * ease(prog(t, swaps[wiping], swaps[wiping] + 500));
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, x, H);
          ctx.clip();
          drawTheme(ctx, DESIGN_THEMES[wiping + 1]);
          ctx.restore();
          ctx.save();
          ctx.fillStyle = this.color;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 10 * S;
          ctx.fillRect(x - 1, 0, 2, H);
          ctx.restore();
        }
        const shown = wiping >= 0 && prog(t, swaps[wiping], swaps[wiping] + 500) > 0.5 ? wiping + 1 : current;
        drawPill(ctx, 18, 16, DESIGN_THEMES[shown].name, DESIGN_THEMES[shown].fill || "#22d678");
      },
    },

    intel: {
      color: "#ff5c00",
      dur: 7200,
      captions: [[0, "Tap a bunker"], [800, "Name it and add notes"], [3500, "Every bunker gets its callout"]],
      draw(ctx, t) {
        drawField(ctx);
        drawBunkers(ctx, ALL);
        const first = find(160, 112);
        const second = find(160, 192);
        const onSecond = t >= 3700;
        const target = onSecond ? second : first;
        if (t > 600) drawSelection(ctx, target, this.color, t);
        if (!onSecond) drawCard(ctx, first, "Center can", "Hold the 50 · watch the snake", this.color, prog(t, 600, 900), prog(t, 800, 2600));
        else drawCard(ctx, { x: 186, y: 176 }, "Snake 50", "Wire runs left to right", this.color, prog(t, 3700, 4000), prog(t, 3900, 5600));
        drawCursor(
          ctx,
          track(
            [
              { t: 0, x: 120, y: 60 },
              { t: 450, x: first.x, y: first.y, down: true },
              { t: 600, x: first.x, y: first.y },
              { t: 1200, x: 130, y: 150 },
              { t: 3300, x: 130, y: 150 },
              { t: 3550, x: 186, y: 192, down: true },
              { t: 3700, x: 186, y: 192 },
              { t: 4400, x: 230, y: 130 },
            ],
            t
          ),
          this.color
        );
      },
    },
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createDemo(root, index) {
    const demo = DEMOS[root.dataset.toolDemo];
    const canvas = root.querySelector("canvas");
    if (!demo || !canvas) return;
    const ctx = canvas.getContext("2d");
    const captionEl = root.querySelector("[data-demo-caption]");
    let scale = 1;
    let startedAt = performance.now() - index * 650;
    let frame = 0;
    let visible = false;
    let caption = "";

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!cssW || !cssH) return;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      scale = canvas.width / W;
    }

    function render(now) {
      S = scale;
      const t = (now - startedAt) % demo.dur;
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      try {
        demo.draw(ctx, t);
      } catch (err) {
        console.error("tool demo draw", root.dataset.toolDemo, err);
      }
      ctx.restore();
      const fade = reduceMotion.matches ? 0 : Math.max(0, 1 - t / FADE_MS, 1 - (demo.dur - t) / FADE_MS);
      if (fade > 0) {
        ctx.fillStyle = `rgba(15, 18, 16, ${Math.min(1, fade)})`;
        ctx.fillRect(0, 0, W, H);
      }
      const next = demo.captions.reduce((text, [at, label]) => (t >= at ? label : text), "");
      if (captionEl && next !== caption) {
        caption = next;
        captionEl.textContent = next;
      }
    }

    function tick(now) {
      frame = 0;
      render(now);
      schedule();
    }

    function schedule() {
      if (frame || !visible || document.hidden || reduceMotion.matches) return;
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      resize();
      if (reduceMotion.matches) {
        const now = performance.now();
        startedAt = now - demo.dur * 0.62;
        render(now);
      } else render(performance.now());
      schedule();
    }

    new ResizeObserver(refresh).observe(canvas);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      schedule();
    });
    io.observe(canvas);
    const box = canvas.getBoundingClientRect();
    if (box.width && box.bottom > 0 && box.top < window.innerHeight) visible = true;
    document.addEventListener("visibilitychange", schedule);
    reduceMotion.addEventListener?.("change", refresh);
    document.fonts?.ready.then(refresh);
    vegasReady.push(refresh);
    refresh();
  }

  roots.forEach((root, i) => {
    try {
      createDemo(root, i);
    } catch (err) {
      console.error("tool demo failed", root.dataset.toolDemo, err);
    }
  });
})();
