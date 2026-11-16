/* Akoma · reveals, parallax e contadores dos números já existentes na copy */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function reduced() { return reduce.matches; }

  var hero = document.querySelector(".hero");
  var shapes = document.querySelectorAll(".hero .shape");
  var ticking = false;

  function parallax() {
    if (reduced() || !hero || !shapes.length) return;
    var rect = hero.getBoundingClientRect();
    var view = window.innerHeight || 1;
    if (rect.bottom < 0 || rect.top > view) return;
    var y = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].style.setProperty("--py", ((y * (i + 1) * 10)).toFixed(1) + "px");
    }
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      parallax();
      ticking = false;
    });
  }, { passive: true });
  parallax();

  if (reduced()) return;

  var revealSel = [
    ".problema .tag", ".problema h2", ".problema-texto", ".dores", ".dados", ".fecho", ".problema .proximo",
    ".dor", ".dado",
    ".ai-first .tag", ".ai-first h2", ".ai-first .lead",
    ".parte", ".faixa", ".ia-col", ".ai-first .proximo",
    ".servicos .tag", ".servicos h2", ".servicos .lead",
    ".pilar", ".servicos-nota",
    ".sobre .tag", ".sobre h2", ".sobre-intro", ".sobre-foto", ".sobre-texto",
    ".ebooks .tag", ".ebooks h2", ".ebooks .lead",
    ".ebook", "#form-ebook",
    ".faq .tag", ".faq h2",
    ".faq-item",
    ".diagnostico .tag", ".diagnostico h2", ".diagnostico .lead", ".diagnostico-texto",
    ".passos-titulo", ".passos-diag", ".checks", ".selo-linha", ".diagnostico-grid",
    ".footer-grid > *", ".footer-base"
  ].join(",");

  var nodes = document.querySelectorAll(revealSel);
  var byParent = {};
  for (var n = 0; n < nodes.length; n++) {
    var el = nodes[n];
    if (el.classList.contains("reveal") || el.classList.contains("reveal-clip") || el.classList.contains("reveal-left")) continue;
    var kind = "reveal";
    if (el.classList.contains("faixa")) kind = "reveal-clip";
    else if (el.classList.contains("sobre-foto")) kind = "reveal-left";
    el.classList.add(kind);
    var parent = el.parentElement;
    var key = parent ? (parent.id || parent.className || "p") : "p";
    if (!byParent[key]) byParent[key] = 0;
    var delay = Math.min(byParent[key] * 0.08, 0.32);
    byParent[key] += 1;
    el.style.setProperty("--reveal-delay", delay.toFixed(2) + "s");
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      if (entry.target.classList.contains("dado")) countDado(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: "80px 0px -5% 0px", threshold: 0.01 });

  document.querySelectorAll(".reveal, .reveal-clip, .reveal-left").forEach(function (el) {
    io.observe(el);
  });

  /* Conta só os números que já estão na copy: "5 a 25x." e "Quase 7x." */
  function countDado(card) {
    var num = card.querySelector(".dado-num");
    if (!num || num.dataset.counted) return;
    var final = (num.textContent || "").trim();
    num.dataset.counted = "1";
    num.classList.add("is-in");
    var end = null;
    var prefix = "";
    var suffix = "";
    if (final === "5 a 25x.") {
      end = 25; prefix = "5 a "; suffix = "x.";
    } else if (final === "Quase 7x.") {
      end = 7; prefix = "Quase "; suffix = "x.";
    } else {
      return;
    }
    var startAt = performance.now();
    var dur = 800;
    function tick(now) {
      var t = Math.min(1, (now - startAt) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(end * eased);
      if (value < 1) value = 1;
      num.textContent = prefix + value + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else num.textContent = final;
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", function () {
    var paused = document.hidden;
    document.querySelectorAll(".shape-choque, .shape-limao, .shape-ultramar, .marquee-track").forEach(function (el) {
      el.style.animationPlayState = paused ? "paused" : "";
    });
  });
})();
