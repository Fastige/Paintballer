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
    {
      id: "move", name: "Move", color: "#7cfc3b",
      lead: "Your everyday pointer for fine-tuning a setup once the teams are locked.",
      steps: ["Drag any locked player to a new spot.", "Tap a bunker to open Field intel under the map.", "Stagger players behind different bunkers."],
    },
    {
      id: "players", name: "Players", color: "#ff7a1a",
      lead: "Drop a whole team onto the field at once, then lock it in.",
      steps: ["Pick 1 to 10 players, then tap a spawn point.", "Nudge with the arrow pad, then tap ✓ to lock.", "Team 2 unlocks once Team 1 is locked."],
    },
    {
      id: "brush", name: "Brush", color: "#ffd43b",
      lead: "Sketch routes, lanes, and callouts freehand on top of the map.",
      steps: ["Drag on the map to draw.", "Size 2–40. Lime, orange, blue, yellow, pink, or any color.", "Clear drawings wipes strokes — bunkers stay."],
    },
    {
      id: "structure", name: "Structure", color: "#00ff9d",
      lead: "Add any bunkers the map missed, or build a layout from scratch.",
      steps: ["Pick Rectangle, Circle, or Triangle.", "Filled, Border only, or Transparent wall — all block shots.", "Drag to size. Undo removes the last one."],
    },
    {
      id: "auto", name: "Auto", color: "#6c8cff",
      lead: "Turn a printed field layout into structures in one pass.",
      steps: ["Drag a box around the area to scan.", "White out text, logos, and lines.", "Every bunker color becomes a structure."],
    },
    {
      id: "shoot", name: "Shoot", color: "#ff3b3b", ms: 2400,
      lead: "Plan each player's move: where they run and what they shoot at.",
      steps: [
        "Tap a player, then draw the exact route they run.",
        "Set shoot on a spot or an opposing player.",
        "Yellow turns red where a bunker blocks it.",
        "Stand still, No shoot, or Shoot over. Then Play scene.",
      ],
    },
    {
      id: "vision", name: "Vision", color: "#ff4fc8",
      lead: "See exactly what a player can see from where they stand.",
      steps: ["Tap a player to cast pink sight lines around them.", "Each line stops at the first bunker it hits.", "Lines follow the player during a run."],
    },
    {
      id: "sizer", name: "Sizer", color: "#3bd5ff",
      lead: "Fine-tune any bunker's size, position, and style.",
      steps: ["Set exact Width and Height with sliders.", "Spin it to any angle, then nudge it into place.", "Duplicate, Delete, or Undo the last edit."],
    },
    {
      id: "mirror", name: "50 Mirror", color: "#b18cff",
      lead: "Map one half of the field, then copy it to the other side.",
      steps: ["Box the half you mapped, then click two points on the 50.", "Triangles flip to face the right way.", "Occupied spots are skipped, so nothing doubles up."],
    },
    {
      id: "design", name: "Design", color: "#2ee6c8",
      lead: "Swap the photo for a clean, custom-colored field drawn from your bunkers.",
      steps: ["15 structure color combos, plus custom fill, outline, and glow.", "15 field themes for turf, stripes, and lines.", "Saved with your map pack."],
    },
    {
      id: "intel", name: "Field intel", color: "#ff5c00",
      lead: "Name every bunker and keep your team's notes in one place.",
      steps: ["Tap a bunker, then add a name and notes.", "Open the Full report for the whole field.", "Intel is saved in the map pack for the whole team."],
    },
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

  function pathRest(pts, k) {
    const tip = pathTip(pts, k);
    const sliced = pathSlice(pts, k);
    return [[tip.x, tip.y], ...pts.slice(sliced.length)];
  }

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

  function visionRing(ox, oy) {
    const pts = [];
    for (let deg = 0; deg < 360; deg += 4) {
      const a = (deg * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const tx = ux > 0 ? (FW - ox) / ux : ux < 0 ? -ox / ux : Infinity;
      const ty = uy > 0 ? (FH - oy) / uy : uy < 0 ? -oy / uy : Infinity;
      const reach = Math.min(tx, ty, 420);
      const shot = G.castShot({ x: ox, y: oy }, { x: ox + ux * reach, y: oy + uy * reach });
      pts.push({
        x: shot.end.x,
        y: shot.end.y,
        dist: Math.hypot(shot.end.x - ox, shot.end.y - oy),
        blocked: shot.blocked,
      });
    }
    return pts;
  }

  function drawVision(c, ox, oy, color, alpha) {
    if (alpha <= 0) return;
    const pts = visionRing(ox, oy);
    const reach = Math.max(1, ...pts.map((p) => p.dist));
    c.save();
    c.globalAlpha *= alpha;
    const glow = c.createRadialGradient(ox, oy, 0, ox, oy, reach);
    glow.addColorStop(0, rgba(color, 0.4));
    glow.addColorStop(0.35, rgba(color, 0.2));
    glow.addColorStop(1, rgba(color, 0.05));
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.closePath();
    c.fillStyle = glow;
    c.fill();
    c.beginPath();
    let open = false;
    for (let i = 1; i <= pts.length; i += 1) {
      const prev = pts[i - 1];
      const p = pts[i % pts.length];
      if (!(prev.blocked && p.blocked && Math.abs(p.dist - prev.dist) < Math.max(3, Math.min(p.dist, prev.dist) * 0.08))) {
        open = false;
        continue;
      }
      if (!open) {
        c.moveTo(prev.x, prev.y);
        open = true;
      }
      c.lineTo(p.x, p.y);
    }
    c.strokeStyle = color;
    c.lineWidth = 1.4;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.shadowColor = color;
    c.shadowBlur = 5;
    c.stroke();
    c.restore();
  }

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
      const box = ease(prog(k, 0.05, 0.35));
      c.save();
      c.setLineDash([4, 3]);
      c.strokeStyle = "#6c8cff";
      c.lineWidth = 1.3;
      c.strokeRect(10, 8, lerp(20, 300, box), lerp(20, 204, box));
      c.restore();
      const wk = ease(prog(k, 0.32, 0.52));
      if (wk > 0) {
        c.save();
        c.lineCap = "round";
        c.strokeStyle = "#ffffff";
        c.lineWidth = 18;
        c.beginPath();
        c.moveTo(18, 16);
        c.lineTo(lerp(18, 302, wk), 16);
        c.stroke();
        c.restore();
      }
      if (k > 0.5) {
        const scanX = lerp(12, 308, ease(prog(k, 0.5, 1)));
        c.save();
        const g = c.createLinearGradient(scanX - 22, 0, scanX, 0);
        g.addColorStop(0, "rgba(108,140,255,0)");
        g.addColorStop(1, "rgba(108,140,255,0.4)");
        c.fillStyle = g;
        c.fillRect(scanX - 22, 8, 22, 204);
        c.fillStyle = "#6c8cff";
        c.fillRect(scanX - 1, 8, 2, 204);
        c.restore();
      }
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
      const p = ease(clamp01((k - 0.08) / 0.5));
      const x = lerp(from.x, to.x, p);
      const y = lerp(from.y, to.y, p);
      const sel = ALL.find((b) => b.x === 118 && b.y === 60);
      if (k > 0.62 && sel) {
        c.save();
        c.setLineDash([3, 2]);
        c.strokeStyle = "#7cfc3b";
        c.strokeRect(sel.x - sel.w / 2 - 4, sel.y - sel.h / 2 - 4, sel.w + 8, sel.h + 8);
        c.restore();
        const card = ease(prog(k, 0.64, 0.8));
        c.save();
        c.globalAlpha = card;
        roundRect(c, sel.x + 10, sel.y - 38, 108, 32, 5);
        c.fillStyle = "rgba(11,13,12,0.92)";
        c.fill();
        c.strokeStyle = "#7cfc3b";
        c.stroke();
        c.fillStyle = "#7cfc3b";
        c.font = '11px "Bebas Neue", sans-serif';
        c.fillText("TOP RECT", sel.x + 18, sel.y - 22);
        c.fillStyle = "#c9d4c4";
        c.font = '600 7px "Outfit", sans-serif';
        c.fillText("Watch the dorito side", sel.x + 18, sel.y - 10);
        c.restore();
      }
      G.drawPlayer(c, x, y, "a", "2", { r: 4.6, lift: p > 0 && p < 1 ? 1 : 0 });
      drawCursor(c, k > 0.62 && sel ? sel.x : x + 6, k > 0.62 && sel ? sel.y : y + 4, k > 0.1 && k < 0.82);
      return;
    }

    if (id === "players") {
      const spawn = { x: 24, y: 110 };
      const locked = k >= 0.72;
      for (let i = 0; i < 5; i += 1) {
        const appear = ease(prog(k, 0.04 * i, 0.04 * i + 0.22));
        G.drawPlayer(c, spawn.x, spawn.y + 12 * (i - 2), "a", String(i + 1), { r: 4.8, ghost: !locked, alpha: appear, lift: locked ? 1 - prog(k, 0.72, 0.9) : 0 });
      }
      if (!locked) {
        const px = spawn.x + 32;
        c.save();
        c.globalAlpha = ease(prog(k, 0.15, 0.3));
        [[0, -11, "↑"], [-11, 0, "←"], [11, 0, "→"], [0, 11, "↓"], [0, 0, "✓"]].forEach(([dx, dy, label]) => {
          c.beginPath();
          c.arc(px + dx, spawn.y + dy, 5, 0, Math.PI * 2);
          c.fillStyle = label === "✓" ? "rgba(124,252,59,0.85)" : "rgba(15,18,16,0.7)";
          c.fill();
          c.fillStyle = "#fff";
          c.font = '700 6px "Outfit", sans-serif';
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(label, px + dx, spawn.y + dy + 0.3);
        });
        c.restore();
        drawCursor(c, k < 0.55 ? spawn.x : spawn.x + 32, spawn.y, k < 0.72);
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
      drawStaticTeams(c, { a3: true, b4: true });
      const start = stackPos("a", 2);
      const route = [[start.x, start.y], [40, 98], [68, 90], [96, 82]];
      const target = { x: 196, y: 44 };
      const drawK = ease(prog(k, 0.08, 0.38));
      const runK = ease(prog(k, 0.52, 0.92));
      const pos = k >= 0.52 ? pathTip(route, runK) : { x: start.x, y: start.y };
      const phase = k < 0.1 ? 0 : k < 0.38 ? 1 : k < 0.52 ? 2 : 3;
      const labels = ["Tap player", "Draw run", "Set shoot", "Play scene"];
      labels.forEach((label, i) => {
        const x = 8 + i * 78;
        roundRect(c, x, 6, 74, 16, 4);
        c.fillStyle = i === phase ? "rgba(255,59,59,0.92)" : "rgba(11,13,12,0.78)";
        c.fill();
        c.fillStyle = "#fff";
        c.font = '700 7px "Outfit", sans-serif';
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(label, x + 37, 14);
      });
      c.textAlign = "left";
      c.textBaseline = "alphabetic";
      if (drawK > 0) {
        const rest = k >= 0.52 ? pathRest(route, runK) : pathSlice(route, drawK);
        c.save();
        c.setLineDash([5, 3.5]);
        c.strokeStyle = "#7cfc3b";
        c.lineWidth = 1.7;
        c.lineCap = "round";
        strokePts(c, rest);
        c.stroke();
        c.restore();
        if (drawK >= 1) {
          c.beginPath();
          c.arc(route[3][0], route[3][1], 2.6, 0, Math.PI * 2);
          c.fillStyle = "#7cfc3b";
          c.fill();
        }
      }
      const bHold = stackPos("b", 3);
      const bPoint = { x: 88, y: 168 };
      const shots = [];
      if (k > 0.4) shots.push({ from: pos, to: target });
      if (k > 0.52) shots.push({ from: bHold, to: bPoint });
      if (k > 0.4) {
        c.beginPath();
        c.arc(target.x, target.y, 2.8, 0, Math.PI * 2);
        c.fillStyle = "#ffd43b";
        c.fill();
      }
      shots.forEach((s) => {
        const shot = G.castShot(s.from, s.to);
        c.beginPath();
        c.moveTo(s.from.x, s.from.y);
        c.lineTo(shot.end.x, shot.end.y);
        c.strokeStyle = shot.blocked ? "#ff4f4f" : "#ffd43b";
        c.lineWidth = 1.6;
        c.stroke();
        if (shot.blocked) {
          c.beginPath();
          c.arc(shot.end.x, shot.end.y, 2.4, 0, Math.PI * 2);
          c.fillStyle = "#ff4f4f";
          c.fill();
        }
        if (k > 0.52) {
          for (let born = 0.52; born < k; born += 0.07) {
            const p = (k - born) / 0.22;
            if (p < 0 || p > 1) continue;
            const e = p * (2 - p);
            c.beginPath();
            c.arc(lerp(s.from.x, shot.end.x, e), lerp(s.from.y, shot.end.y, e), 1.7, 0, Math.PI * 2);
            c.fillStyle = shot.blocked ? "#ff4f4f" : "#7cfc3b";
            c.fill();
          }
        }
      });
      roundRect(c, 10, 198, 300, 16, 4);
      c.fillStyle = "rgba(11,13,12,0.82)";
      c.fill();
      const play = clamp01((k - 0.52) / 0.4);
      c.fillStyle = "#ff5c00";
      roundRect(c, 16, 202, 118 * play, 8, 2);
      c.fill();
      c.fillStyle = "#3b9eff";
      roundRect(c, 148, 202, 90 * play, 8, 2);
      c.fill();
      c.fillStyle = "#fff";
      c.fillRect(16 + 118 * play - 1, 200, 2, 12);
      c.font = '600 7px "Outfit", sans-serif';
      c.fillStyle = "#c9d4c4";
      c.fillText("A3 run", 18, 196);
      c.fillText("B4 shoot", 148, 196);
      G.drawPlayer(c, pos.x, pos.y, "a", "3", { r: 4.6, ring: "#ffdc5a" });
      G.drawPlayer(c, bHold.x, bHold.y, "b", "4", { r: 4.6, ring: k > 0.52 ? "rgba(255,220,90,0.7)" : null });
      const tip = k < 0.38 ? pathTip(route, drawK) : k < 0.52 ? target : pos;
      drawCursor(c, tip.x + 4, tip.y + 3, k < 0.52);
      return;
    }

    if (id === "vision") {
      const from = stackPos("a", 1);
      const path = [[from.x, from.y], [30, 84], [46, 74], [54, 72]];
      const pos = pathTip(path, ease(k));
      drawVision(c, pos.x, pos.y, "#ff4fc8", ease(prog(k, 0.08, 0.28)));
      G.drawBunkers(c, ALL, GREEN, { scale: 1 });
      drawStaticTeams(c, { a2: true });
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
      c.setLineDash([]);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
        c.fillStyle = "#0b0d0c";
        c.strokeStyle = "#3bd5ff";
        c.lineWidth = 0.9;
        c.fillRect(sx * (b.w / 2 + 3) - 1.8, sy * (b.h / 2 + 3) - 1.8, 3.6, 3.6);
        c.strokeRect(sx * (b.w / 2 + 3) - 1.8, sy * (b.h / 2 + 3) - 1.8, 3.6, 3.6);
      });
      c.restore();
      roundRect(c, 14, 12, 148, 16, 4);
      c.fillStyle = "rgba(11,13,12,0.85)";
      c.fill();
      c.fillStyle = "#3bd5ff";
      c.font = '700 8px "Outfit", sans-serif';
      c.fillText(`W ${(b.w / FW * 100).toFixed(1)}%  ·  H ${(b.h / FH * 100).toFixed(1)}%  ·  ${Math.round(rot)}°`, 20, 23);
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
    const { title = "Field Mapper", live = true, accent = "#ff5c00", k = 1, caption } = opts;
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
    c.fillStyle = accent;
    c.font = '700 12px "Outfit", sans-serif';
    c.textAlign = "right";
    if (live) {
      c.fillText("PLAYING", x + w - 28, y + 27);
      c.beginPath();
      c.arc(x + w - 108, y + 27, 5, 0, Math.PI * 2);
      c.fill();
    } else if (caption) {
      c.fillText(caption, x + w - 28, y + 27);
    }
    c.textAlign = "left";

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

  function bounceAt(ms) {
    const p = (ms % 1150) / 1150;
    const keys = [
      { p: 0, y: 0, sx: 1.14, sy: 0.84 },
      { p: 0.14, y: -2, sx: 0.93, sy: 1.08 },
      { p: 0.5, y: -9, sx: 1, sy: 1 },
      { p: 0.92, y: -1, sx: 0.94, sy: 1.07 },
      { p: 1, y: 0, sx: 1.14, sy: 0.84 },
    ];
    for (let i = 1; i < keys.length; i += 1) {
      if (p <= keys[i].p) {
        const a = keys[i - 1];
        const b = keys[i];
        const k = (p - a.p) / (b.p - a.p || 1);
        return { y: lerp(a.y, b.y, k), sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) };
      }
    }
    return keys[0];
  }

  function drawPaintball(c, x, y, r, ms, alpha = 1) {
    const bounce = bounceAt(ms);
    const lift = (r / 30) * bounce.y;
    c.save();
    c.globalAlpha *= alpha;
    c.translate(x, y + lift);
    c.scale(bounce.sx, bounce.sy);
    c.shadowColor = "rgba(255, 92, 0, 0.55)";
    c.shadowBlur = r * 0.7;
    const ball = c.createRadialGradient(-r * 0.28, -r * 0.38, r * 0.04, 0, 0, r);
    ball.addColorStop(0, "#ffb36a");
    ball.addColorStop(0.28, "#ff5c00");
    ball.addColorStop(0.68, "#d24800");
    ball.addColorStop(1, "#7a2600");
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fillStyle = ball;
    c.fill();
    c.shadowBlur = 0;
    const shine = c.createRadialGradient(-r * 0.32, -r * 0.42, 0, -r * 0.32, -r * 0.42, r * 0.55);
    shine.addColorStop(0, "rgba(255,255,255,0.95)");
    shine.addColorStop(0.45, "rgba(255,255,255,0.35)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.beginPath();
    c.ellipse(-r * 0.22, -r * 0.32, r * 0.38, r * 0.24, -0.5, 0, Math.PI * 2);
    c.fillStyle = shine;
    c.fill();
    const twinkle = 0.55 + 0.45 * Math.abs(Math.sin((ms / 1150) * Math.PI * 2));
    c.beginPath();
    c.arc(r * 0.28, -r * 0.08, r * 0.07 * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
    c.fillStyle = `rgba(255,255,255,${0.45 + twinkle * 0.4})`;
    c.shadowColor = "#fff";
    c.shadowBlur = 6;
    c.fill();
    c.restore();
  }

  function leftCopy(c, alpha, kicker, title, sub, color, steps) {
    c.save();
    c.globalAlpha *= alpha;
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    c.fillStyle = color || "#7cfc3b";
    c.font = '700 16px "Outfit", sans-serif';
    c.fillText(kicker.toUpperCase(), 96, 168);
    c.fillStyle = "#e8efe4";
    const lines = title.split("\n");
    const big = lines.length > 1 ? 88 : 76;
    c.font = `${big}px "Bebas Neue", sans-serif`;
    lines.forEach((line, i) => c.fillText(line, 90, 258 + i * (big - 6)));
    let y = 258 + lines.length * (big - 6) + 28;
    if (sub) {
      c.fillStyle = "#c9d4c4";
      c.font = '600 20px "Outfit", sans-serif';
      y = wrapText(c, sub, 96, y, 700, 30) + 36;
    }
    if (steps?.length) {
      c.font = '600 19px "Outfit", sans-serif';
      steps.forEach((step) => {
        c.fillStyle = color || "#7cfc3b";
        c.beginPath();
        c.arc(108, y - 6, 4.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#e8efe4";
        y = wrapText(c, step, 128, y, 660, 28) + 20;
      });
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
    return yy;
  }

  const TOOL_START = 6400;
  const TOOL_EACH = 870;

  function render(now) {
    const t = startedAt == null ? 0 : Math.min(DURATION, now - startedAt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, t);
    const gameT = loop.time(now);

    const intro = fade(t, 0, 400, 1900, 400);
    if (intro > 0) {
      drawPaintball(ctx, 960, 400, 54, t, intro);
      drawWordmark(ctx, 960, 560, 120, intro, "center");
      ctx.save();
      ctx.globalAlpha = intro;
      ctx.fillStyle = "#9aab94";
      ctx.font = '600 28px "Outfit", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("FIELD MAPPER", 960, 640);
      ctx.restore();
    }

    const hero = fade(t, 1900, 400, 4700, 320);
    if (hero > 0) {
      leftCopy(ctx, hero, "Field Mapper", "MAP IT.\nPLAN IT.", "Turn a picture of your field into a planning board.", "#ff5c00", [
        "Load a layout, drop both teams, and plan every lane.",
        "10 map tools. Shoot & run scenes. GIF export.",
      ]);
      drawApp(ctx, 860, 120, 980, 820, {
        k: hero,
        accent: "#ff5c00",
        draw: (c) => G.drawGame(c, loop.scene, gameT, { scale: 2 }),
      });
    }

    const about = fade(t, 4600, 300, 6300, 260);
    if (about > 0) {
      leftCopy(ctx, about, "What it is", "LOAD THE\nFIELD.", "Upload a picture, open a map pack, or pick a preset.", "#7cfc3b", [
        "Place Team 1, then Team 2, and lock them in.",
        "Draw routes, check vision, and build a shoot scene.",
      ]);
      drawApp(ctx, 860, 120, 980, 820, {
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

    let toolAt = TOOL_START;
    TOOLS.forEach((tool, i) => {
      const dur = tool.ms || TOOL_EACH;
      const start = toolAt;
      toolAt += dur;
      const a = fade(t, start, 120, start + dur, 140);
      if (a <= 0) return;
      const local = clamp01((t - start) / dur);
      leftCopy(ctx, a, `Tool  ${String(i + 1).padStart(2, "0")} / 11`, tool.name.toUpperCase(), tool.lead, tool.color, tool.steps);
      const shootCap = local < 0.1 ? "Tap a player" : local < 0.38 ? "Draw the run" : local < 0.52 ? "Set the shoot point" : "Play the scene";
      drawApp(ctx, 860, 120, 980, 820, {
        k: a,
        accent: tool.color,
        title: tool.name,
        live: tool.id === "shoot" && local > 0.52,
        caption: tool.id === "shoot" ? shootCap : tool.steps[0],
        draw: (c) => drawToolField(c, tool.id, local),
      });
    });

    const payoff = fade(t, 17500, 300, 21200, 350);
    if (payoff > 0) {
      leftCopy(ctx, payoff, "Shoot & run", "PLAY THE\nSCENE.", "Save a setup for each player, then hit Play scene to run them all at once.", "#ff3b3b", [
        "Green paint dots fly down every shoot line.",
        "Stand still, No shoot, or Shoot over bunkers.",
        "Play in a window, or download a looping GIF.",
      ]);
      drawApp(ctx, 860, 120, 980, 820, {
        k: payoff,
        accent: "#ff3b3b",
        title: loop.scene?.name || "Breakout",
        draw: (c) => G.drawGame(c, loop.scene, gameT, { scale: 2 }),
      });
    }

    const close = fade(t, 21150, 400, 25000, 1);
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
      drawPaintball(ctx, 960, 250, 48, t, 1);
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
  window.__adSeek = (ms) => {
    if (startedAt == null) startedAt = performance.now();
    startedAt = performance.now() - ms;
    cancelAnimationFrame(frame);
    render(performance.now());
  };
  document.fonts?.ready.then(start);
  if (!document.fonts) start();
})();
