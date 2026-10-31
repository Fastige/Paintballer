(() => {
  const roots = [...document.querySelectorAll("[data-field-player]")];
  if (!roots.length || !window.PaintballerGame) return;

  const G = window.PaintballerGame;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createPlayer(root, index) {
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const playhead = root.querySelector(".hero-playhead");
    const timeline = root.querySelector(".hero-app-timeline");
    const sceneName = root.querySelector("[data-scene-name]");
    let scale = 1;
    let frame = 0;
    let visible = true;

    const loop = G.createLoop(index, (scene) => {
      if (sceneName) sceneName.textContent = scene.name;
      if (timeline) {
        timeline.querySelectorAll(".hero-track").forEach((el) => el.remove());
        timeline.insertAdjacentHTML("afterbegin", G.timelineTracks(scene).map(G.clipHtml).join(""));
      }
    });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!cssW || !cssH) return;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      scale = canvas.width / G.W;
    }

    function render(t) {
      ctx.setTransform(canvas.width / G.W, 0, 0, canvas.height / G.H, 0, 0);
      ctx.clearRect(0, 0, G.W, G.H);
      G.drawGame(ctx, loop.scene, t, { scale });
      if (playhead) playhead.style.left = `${t < G.RESET_MS ? Math.min(1, t / G.SCENE_MS) * 100 : 0}%`;
    }

    function tick(now) {
      frame = 0;
      render(loop.time(now));
      schedule();
    }

    function schedule() {
      if (frame || !visible || document.hidden || reduceMotion.matches) return;
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      resize();
      if (reduceMotion.matches) render(1800);
      else render(loop.time(performance.now()));
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
  }

  roots.forEach(createPlayer);
})();
