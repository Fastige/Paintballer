(() => {
  const G = window.PaintballerGame;
  if (!G) return;

  const canvas = document.getElementById("ad");
  const replay = document.getElementById("ad-replay");
  const ctx = canvas.getContext("2d");
  const recording = new URLSearchParams(location.search).has("record");
  const DURATION = 25000;
  const FW = G.W;
  const FH = G.H;
  const W = 1920;
  const H = 1080;
  const TEAM = G.TEAM;
  const GREEN = G.GREEN;
  const FIELD = G.FIELD;
  const ALL = G.BUNKERS;
  const rgba = G.rgba;

  const TOOLS = [
    { id: "move", name: "Move", line: "Drag players. Tap bunkers.", color: "#7cfc3b" },
    { id: "players", name: "Players", line: "Drop a whole team at once.", color: "#ff7a1a" },
    { id: "brush", name: "Brush", line: "Sketch routes and callouts.", color: "#ffd43b" },
    { id: "structure", name: "Structure", line: "Build any bunker by hand.", color: "#00ff9d" },
    { id: "auto", name: "Auto", line: "Scan a printed layout in one pass.", color: "#6c8cff" },
    { id: "shoot", name: "Shoot", line: "Draw the run. Set the shot.", color: "#ff3b3b" },
    { id: "vision", name: "Vision", line: "See every lane a player can see.", color: "#ff4fc8" },
    { id: "sizer", name: "Sizer", line: "Size, spin, and nudge bunkers.", color: "#3bd5ff" },
    { id: "mirror", name: "50 Mirror", line: "Map one half. Copy the rest.", color: "#b18cff" },
    { id: "design", name: "Design", line: "Swap the photo for a custom field.", color: "#2ee6c8" },
    { id: "intel", name: "Field intel", line: "Name every bunker. Keep the notes.", color: "#ff5c00" },
  ];

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k * k * (3 - 2 * k);
  const prog = (t, a, b) => clamp01((t - a) / ((b - a) || 1));
  const fade = (t, inAt, inMs, outAt, outMs) => {
    const a = ease(prog(t, inAt, inAt + inMs));
    const b = 1 - ease(prog(t, outAt, outAt + outMs));
    return Math.min(a, b);
  };

  const stackPos = (team, i) => ({ x: team === "a" ? 16 : FW - 16, y: 86 + i * 12 });

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function strokePts(c, pts) {
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  }

  function pathSlice(pts, k) {
    const lengths = [0];
    for (let i = 1; i < pts.length; i += 1) {
      lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
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

  const pathTip = (pts, k) => {
    const s = pathSlice(pts, k);
    return { x: s[s.length - 1][0], y: s[s.length - 1][1] };
  };

  function drawCursor(c, x, y, down) {
    c.save();
    if (down) {
      c.beginPath();
      c.arc(x, y, 7, 0, Math.PI * 2);
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.fill();
    }
    c.translate(x, y);
    c.scale(0.7, 0.7);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, 16);
    c.lineTo(4.2, 12);
    c.lineTo(7.4, 18.5);
    c.lineTo(10, 17.2);
    c.lineTo(7, 11);
    c.lineTo(12, 11);
    c.closePath();
    c.fillStyle = "#fff";
    c.strokeStyle = "#0b0d0c";
    c.lineWidth = 1.4;
    c.fill();
    c.stroke();
    c.restore();
  }

  let vegasImg = null;
  const vegasPhoto = new Image();
  vegasPhoto.onload = () => {
    vegasImg = vegasPhoto;
  };
  vegasPhoto.src = "presets/las-vegas-major-2024/print.webp";

  const loop = G.createLoop(0, null, { sequential: true });

  function drawStaticTeams(c, hide = {}) {
    for (let i = 0; i < 5; i += 1) {
      if (!hide[`a${i + 1}`]) {
        const p = stackPos("a", i);
        G.drawPlayer(c, p.x, p.y, "a", String(i + 1), { r: 4.6 });
      }
      if (!hide[`b${i + 1}`]) {
        const p = stackPos("b", i);
        G.drawPlayer(c, p.x, p.y, "b", String(i + 1), { r: 4.6 });
      }
    }
  }

  function drawToolField(c, id, k) {
    if (id === "auto") {
      if (vegasImg) c.drawImage(vegasImg, 0, 0, FW, FH);
      else G.drawField(c, FIELD, 1);
      const scanX = lerp(12, 308, ease(k));
      c.save();
      const g = c.createLinearGradient(scanX - 22, 0, scanX, 0);
      g.addColorStop(0, "rgba(108,140,255,0)");
      g.addColorStop(1, "rgba(108,140,255,0.4)");
      c.fillStyle = g;
      c.fillRect(scanX - 22, 8, 22, 204);
      c.fillStyle = "#6c8cff";
      c.fillRect(scanX - 1, 8, 2, 204);
      c.restore();
      return;
    }

    if (id === "design") {
      const themes = [
        FIELD,
        { turf: "#140a1c", turfCenter: "#2d1240", stripes: "#ffcc66", grid: "#ffcc66", lines: "#ffcc66", vignette: "#05020a", fill: "#ff2e63", outline: "#ffe0a3", glow: "#ff2e63" },
        { turf: "#0c2416", turfCenter: "#17472a", stripes: "#d9ffe6", grid: "#ffffff", lines: "#ffffff", vignette: "#020a05", fill: "#ff3045", outline: "#ffd0d5", glow: "#ff3045" },
      ];
      const i = k < 0.5 ? 0 : 1;
      const next = themes[i + 1];
      G.drawField(c, themes[i], 1);
      G.drawBunkers(c, ALL, themes[i].fill ? themes[i] : GREEN, { scale: 1 });
      const x = FW * ease((k % 0.5) / 0.5);
      c.save();
      c.beginPath();
      c.rect(0, 0, x, FH);
      c.clip();
      G.drawField(c, next, 1);
      G.drawBunkers(c, ALL, next, { scale: 1 });
      c.restore();
      c.fillStyle = "#2ee6c8";
      c.fillRect(x - 1.5, 0, 3, FH);
      return;
    }

    G.drawField(c, FIELD, 1);
    G.drawBunkers(c, ALL, GREEN, { scale: 1 });

    if (id === "move") {
      drawStaticTeams(c, { a2: true });
      const from = stackPos("a", 1);
      const to = { x: 54, y: 72 };
      const p = ease(clamp01((k - 0.1) / 0.7));
      const x = lerp(from.x, to.x, p);
      const y = lerp(from.y, to.y, p);
      G.drawPlayer(c, x, y, "a", "2", { r: 4.6, lift: p > 0 && p < 1 ? 1 : 0 });
      drawCursor(c, x + 6, y + 4, k > 0.12 && k < 0.78);
      return;
    }

    if (id === "players") {
      for (let i = 0; i < 5; i += 1) {
        const appear = ease(prog(k, 0.05 * i, 0.05 * i + 0.25));
        G.drawPlayer(c, 24, 70 + i * 16, "a", String(i + 1), { r: 4.8, ghost: k < 0.7, alpha: appear });
      }
      return;
    }

    if (id === "brush") {
      const pts = [[24, 98], [62, 84], [110, 86], [150, 100]];
      const drawn = pathSlice(pts, ease(k));
      c.save();
      c.lineCap = "round";
      c.lineJoin = "round";
      strokePts(c, drawn);
      c.strokeStyle = "#ffd43b";
      c.lineWidth = 3;
      c.shadowColor = "#ffd43b";
      c.shadowBlur = 6;
      c.stroke();
      c.restore();
      const tip = pathTip(pts, ease(k));
      drawCursor(c, tip.x, tip.y, true);
      return;
    }

    if (id === "structure") {
      const b = { type: "rect", x: 160, y: 112, w: lerp(4, 28, ease(k)), h: lerp(4, 24, ease(k)) };
      G.drawBunker(c, b, GREEN, { preview: k < 0.85, pop: k > 0.85 ? 1 - prog(k, 0.85, 1) : 0 });
      drawCursor(c, b.x + b.w / 2, b.y + b.h / 2, k < 0.85);
      return;
    }

    if (id === "shoot") {
      drawStaticTeams(c, { a3: true });
      const start = stackPos("a", 2);
      const route = [[start.x, start.y], [48, 96], [96, 82]];
      const pos = pathTip(route, ease(k));
      c.save();
      c.setLineDash([5, 3.5]);
      c.strokeStyle = "#7cfc3b";
      c.lineWidth = 1.6;
      strokePts(c, route);
      c.stroke();
      c.restore();
      const shot = G.castShot(pos, { x: 210, y: 48 });
      c.beginPath();
      c.moveTo(pos.x, pos.y);
      c.lineTo(shot.end.x, shot.end.y);
      c.strokeStyle = shot.blocked ? "#ff4f4f" : "#ffd43b";
      c.lineWidth = 1.5;
      c.stroke();
      G.drawPlayer(c, pos.x, pos.y, "a", "3", { r: 4.6, ring: "#ffdc5a" });
      return;
    }

    if (id === "vision") {
      const from = stackPos("a", 1);
      const pos = { x: lerp(from.x, 54, ease(k)), y: lerp(from.y, 72, ease(k)) };
      c.save();
      c.globalAlpha = 0.85;
      const glow = c.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 90);
      glow.addColorStop(0, "rgba(255,79,200,0.45)");
      glow.addColorStop(1, "rgba(255,79,200,0.02)");
      c.beginPath();
      c.moveTo(pos.x, pos.y);
      for (let deg = -50; deg <= 50; deg += 4) {
        const a = ((deg - 12) * Math.PI) / 180;
        c.lineTo(pos.x + Math.cos(a) * 110, pos.y + Math.sin(a) * 110);
      }
      c.closePath();
      c.fillStyle = glow;
      c.fill();
      c.restore();
      G.drawBunkers(c, ALL, GREEN, { scale: 1 });
      G.drawPlayer(c, pos.x, pos.y, "a", "2", { r: 4.6, ring: "#ff4fc8" });
      return;
    }

    if (id === "sizer") {
      const b = { type: "rect", x: 82 + k * 8, y: 98, w: lerp(10, 24, ease(k)), h: 10 };
      const rot = lerp(0, 28, ease(k));
      G.drawBunker(c, b, GREEN, { rot });
      c.save();
      c.translate(b.x, b.y);
      c.rotate((rot * Math.PI) / 180);
      c.strokeStyle = "#3bd5ff";
      c.setLineDash([3, 2]);
      c.strokeRect(-b.w / 2 - 4, -b.h / 2 - 4, b.w + 8, b.h + 8);
      c.restore();
      return;
    }

    if (id === "mirror") {
      G.drawBunkers(c, ALL.filter((b) => !b.mirrored), GREEN, { scale: 1 });
      ALL.filter((b) => b.mirrored).forEach((b, i) => {
        const kk = ease(clamp01((k - i * 0.04) / 0.45));
        if (kk <= 0) return;
        G.drawBunker(c, { ...b, x: lerp(160, b.x, kk) }, GREEN, { alpha: kk });
      });
      c.save();
      c.setLineDash([6, 4]);
      c.strokeStyle = "#b18cff";
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(160, 12);
      c.lineTo(160, 208);
      c.stroke();
      c.restore();
      return;
    }

    if (id === "intel") {
      const b = ALL.find((x) => x.x === 160 && x.y === 112) || ALL[8];
      c.save();
      c.setLineDash([3, 2]);
      c.strokeStyle = "#ff5c00";
      c.strokeRect(b.x - b.w / 2 - 4, b.y - b.h / 2 - 4, b.w + 8, b.h + 8);
      c.restore();
      const alpha = ease(clamp01((k - 0.15) / 0.3));
      if (alpha > 0) {
        c.save();
        c.globalAlpha = alpha;
        roundRect(c, 178, 78, 118, 40, 6);
        c.fillStyle = "rgba(11,13,12,0.92)";
        c.fill();
        c.strokeStyle = "#ff5c00";
        c.stroke();
        c.fillStyle = "#ff5c00";
        c.font = '12px "Bebas Neue", sans-serif';
        c.fillText("CENTER CAN".slice(0, Math.ceil(10 * k * 2)), 188, 96);
        c.fillStyle = "#c9d4c4";
        c.font = '600 8px "Outfit", sans-serif';
        c.fillText("Hold the 50 · watch the snake".slice(0, Math.floor(28 * k)), 188, 110);
        c.restore();
      }
    }
  }

  function drawApp(c, x, y, w, h, opts = {}) {
    const { title = "Field Mapper", live = true, accent = "#ff5c00", k = 1 } = opts;
    c.save();
    c.globalAlpha *= k;
    roundRect(c, x, y, w, h, 22);
    c.fillStyle = "#141814";
    c.shadowColor = "rgba(0,0,0,0.55)";
    c.shadowBlur = 40;
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = rgba(accent, 0.35);
    c.lineWidth = 2;
    c.stroke();

    c.fillStyle = "#1c221c";
    roundRect(c, x, y, w, 52, 22);
    c.fill();
    c.fillRect(x, y + 26, w, 26);

    for (let i = 0; i < 3; i += 1) {
      c.beginPath();
      c.arc(x + 28 + i * 16, y + 26, 5, 0, Math.PI * 2);
      c.fillStyle = ["#ff5c5c", "#ffd43b", "#7cfc3b"][i];
      c.fill();
    }
    c.fillStyle = "#e8efe4";
    c.font = '700 18px "Outfit", sans-serif';
    c.textBaseline = "middle";
    c.fillText(title, x + 86, y + 27);
    if (live) {
      c.fillStyle = accent;
      c.font = '700 12px "Outfit", sans-serif';
      c.textAlign = "right";
      c.fillText("PLAYING", x + w - 28, y + 27);
      c.textAlign = "left";
      c.beginPath();
      c.arc(x + w - 108, y + 27, 5, 0, Math.PI * 2);
      c.fill();
    }

    const pad = 18;
    const innerX = x + pad;
    const innerY = y + 62;
    const innerW = w - pad * 2;
    const innerH = h - 80;
    roundRect(c, innerX, innerY, innerW, innerH, 12);
    c.save();
    c.clip();
    c.translate(innerX, innerY);
    c.scale(innerW / FW, innerH / FH);
    opts.draw?.(c);
    c.restore();
    c.restore();
  }

  function drawBg(c, t) {
    c.fillStyle = "#070907";
    c.fillRect(0, 0, W, H);
    const blob = (x, y, r, color, a) => {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(color, a));
      g.addColorStop(1, rgba(color, 0));
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    };
    blob(220, 180, 420, "#ff5c00", 0.16);
    blob(1680, 860, 480, "#00ff9d", 0.1);
    blob(980, 120, 340, "#3b9eff", 0.07);
    c.fillStyle = "rgba(255,255,255,0.025)";
    for (let i = 0; i < 14; i += 2) c.fillRect((i * W) / 14, 0, W / 14, H);
    void t;
  }

  function drawProgress(c, t) {
    c.fillStyle = "rgba(255,255,255,0.08)";
    c.fillRect(0, H - 6, W, 6);
    c.fillStyle = "#ff5c00";
    c.fillRect(0, H - 6, W * clamp01(t / DURATION), 6);
  }

  function drawWordmark(c, x, y, size, alpha = 1, align = "left") {
    c.save();
    c.globalAlpha *= alpha;
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.font = `${size}px "Bebas Neue", sans-serif`;
    const paintW = c.measureText("PAINT").width;
    const total = paintW + c.measureText("BALLER").width;
    const ox = align === "center" ? x - total / 2 : x;
    c.fillStyle = "#ff5c00";
    c.fillText("PAINT", ox, y);
    c.fillStyle = "#e8efe4";
    c.fillText("BALLER", ox + paintW, y);
    c.restore();
  }

  function drawMark(c, x, y, r, alpha = 1) {
    c.save();
    c.globalAlpha *= alpha;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = "#ff5c00";
    c.fill();
    c.beginPath();
    c.arc(x, y, r * 0.56, 0, Math.PI * 2);
    c.fillStyle = "#1a1f14";
    c.fill();
    c.restore();
  }

  function leftCopy(c, alpha, kicker, title, sub, color) {
    c.save();
    c.globalAlpha *= alpha;
    c.fillStyle = color || "#7cfc3b";
    c.font = '700 18px "Outfit", sans-serif';
    c.fillText(kicker.toUpperCase(), 96, 250);
    c.fillStyle = "#e8efe4";
    c.font = '120px "Bebas Neue", sans-serif';
    const lines = title.split("\n");
    lines.forEach((line, i) => c.fillText(line, 90, 370 + i * 118));
    if (sub) {
      c.fillStyle = "#9aab94";
      c.font = '600 28px "Outfit", sans-serif';
      wrapText(c, sub, 96, 370 + lines.length * 118 + 24, 620, 40);
    }
    c.restore();
  }

  function wrapText(c, text, x, y, maxW, lineH) {
    const words = text.split(" ");
    let line = "";
    let yy = y;
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (c.measureText(test).width > maxW && line) {
        c.fillText(line, x, yy);
        line = word;
        yy += lineH;
      } else line = test;
    });
    if (line) c.fillText(line, x, yy);
  }

  const TOOL_START = 7200;
  const TOOL_EACH = 1000;

  function render(now) {
    const t = startedAt == null ? 0 : Math.min(DURATION, now - startedAt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, t);
    const gameT = loop.time(now);

    const intro = fade(t, 0, 400, 1900, 400);
    if (intro > 0) {
      drawMark(ctx, 960, 430, 54, intro);
      drawWordmark(ctx, 960, 560, 120, intro, "center");
      ctx.save();
      ctx.globalAlpha = intro;
      ctx.fillStyle = "#9aab94";
      ctx.font = '600 28px "Outfit", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("FIELD MAPPER", 960, 640);
      ctx.restore();
    }

    const hero = fade(t, 2000, 500, 5200, 400);
    if (hero > 0) {
      leftCopy(ctx, hero, "Field Mapper", "MAP IT.\nPLAN IT.", "Turn a picture of your field into a planning board.", "#ff5c00");
      drawApp(ctx, 860, 140, 960, 780, {
        k: hero,
        accent: "#ff5c00",
        draw: (c) => G.drawGame(c, loop.scene, gameT, { scale: 2 }),
      });
    }

    const about = fade(t, 5400, 350, 7000, 280);
    if (about > 0) {
      leftCopy(ctx, about, "What it is", "LOAD THE\nFIELD.", "Place both teams. Plan every lane, shoot, and run.", "#7cfc3b");
      drawApp(ctx, 860, 140, 960, 780, {
        k: about,
        accent: "#7cfc3b",
        title: "Upload · Teams · Scene",
        draw: (c) => {
          if (vegasImg && t < 6400) {
            c.drawImage(vegasImg, 0, 0, FW, FH);
            return;
          }
          G.drawGame(c, loop.scene, gameT, { scale: 2 });
        },
      });
    }

    TOOLS.forEach((tool, i) => {
      const start = TOOL_START + i * TOOL_EACH;
      const a = fade(t, start, 140, start + TOOL_EACH, 160);
      if (a <= 0) return;
      const local = clamp01((t - start) / TOOL_EACH);
      leftCopy(ctx, a, `Tool  ${String(i + 1).padStart(2, "0")} / 11`, tool.name.toUpperCase(), tool.line, tool.color);
      drawApp(ctx, 860, 140, 960, 780, {
        k: a,
        accent: tool.color,
        title: tool.name,
        draw: (c) => drawToolField(c, tool.id, local),
      });
    });

    const payoff = fade(t, 18200, 350, 21000, 400);
    if (payoff > 0) {
      leftCopy(ctx, payoff, "Shoot & run", "PLAY THE\nSCENE.", "Watch the breakout, then download it as a GIF.", "#ff3b3b");
      drawApp(ctx, 860, 140, 960, 780, {
        k: payoff,
        accent: "#ff3b3b",
        title: loop.scene?.name || "Breakout",
        draw: (c) => G.drawGame(c, loop.scene, gameT, { scale: 2 }),
      });
    }

    const close = fade(t, 21100, 450, 25000, 1);
    if (close > 0) {
      ctx.save();
      ctx.globalAlpha = close;
      ctx.fillStyle = "#070907";
      ctx.fillRect(0, 0, W, H);
      const blob = (x, y, r, color, a) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(color, a));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };
      blob(960, 200, 420, "#ff5c00", 0.18);
      blob(960, 900, 380, "#00ff9d", 0.08);
      drawMark(ctx, 960, 250, 42, 1);
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#e8efe4";
      ctx.font = '92px "Bebas Neue", sans-serif';
      ctx.fillText("BUILT FOR PLAYERS,", 960, 400);
      ctx.fillStyle = "#ff5c00";
      ctx.fillText("BY PLAYERS.", 960, 500);
      ctx.fillStyle = "#9aab94";
      ctx.font = '600 26px "Outfit", sans-serif';
      ctx.fillText("No sign-up. Map your field. Plan the play.", 960, 580);
      drawWordmark(ctx, 960, 690, 72, 1, "center");
      ctx.fillStyle = "#7cfc3b";
      ctx.font = '700 22px "Outfit", sans-serif';
      ctx.fillText("fastige.github.io/Paintballer", 960, 780);
      ctx.restore();
    }

    drawProgress(ctx, t);
    if (t >= DURATION) {
      if (replay && !recording) replay.hidden = false;
      return true;
    }
    return false;
  }

  let startedAt = null;
  let frame = 0;

  function tick(now) {
    frame = 0;
    const done = render(now);
    if (!done) frame = requestAnimationFrame(tick);
  }

  function start() {
    if (replay) replay.hidden = true;
    startedAt = performance.now();
    if (!frame) frame = requestAnimationFrame(tick);
  }

  replay?.addEventListener("click", start);
  document.fonts?.ready.then(start);
  if (!document.fonts) start();
})();
