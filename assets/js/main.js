/* Akoma · menu, modal, cookies e validação (front-end apenas) */
(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("menu");

  function setOpen(open) {
    if (!header || !toggle) return;
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (header && toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("menu-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Modal de privacidade */
  const modal = document.getElementById("privacidade");
  const closeBtns = modal ? modal.querySelectorAll("[data-close-modal]") : [];

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var focus = modal.querySelector(".modal-card h2, .modal-card button, .modal-card");
    if (focus) focus.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    if (!header || !header.classList.contains("menu-open")) {
      document.body.style.overflow = "";
    }
    if (location.hash === "#privacidade") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  document.querySelectorAll('a[href="#privacidade"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(false);
      openModal();
    });
  });
  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });
  if (location.hash === "#privacidade") openModal();
  window.addEventListener("hashchange", function () {
    if (location.hash === "#privacidade") openModal();
  });

  /* Cookies */
  const cookie = document.getElementById("cookie-bar");
  if (cookie) {
    var hidden = false;
    try { hidden = localStorage.getItem("akoma-cookies") === "1"; } catch (e) {}
    if (!hidden) {
      cookie.classList.add("is-on");
      document.body.classList.add("has-cookie");
    }
    cookie.querySelectorAll("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem("akoma-cookies", "1"); } catch (e) {}
        cookie.classList.remove("is-on");
        document.body.classList.remove("has-cookie");
      });
    });
  }

  /* Esconde o botão flutuante no hero, no Sobre (citação) e no diagnóstico */
  const flutua = document.querySelector(".flutua-diag");
  const hero = document.getElementById("inicio");
  const sobre = document.getElementById("sobre");
  const diag = document.getElementById("diagnostico");
  function sectionInView(el, topPad, bottomPad) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight - (bottomPad || 80) && r.bottom > (topPad || 80);
  }
  function updateFloat() {
    if (!flutua) return;
    var hide = false;
    if (hero) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 120) hide = true;
    }
    var quote = sobre ? sobre.querySelector(".citacao") : null;
    if (sectionInView(quote, 80, 96) || sectionInView(sobre, 80, 96) || sectionInView(diag, 80, 80)) hide = true;
    flutua.style.display = hide ? "none" : "";
  }
  updateFloat();
  window.addEventListener("scroll", updateFloat, { passive: true });
  window.addEventListener("resize", updateFloat);

  function emailOk(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setErro(campo, on) {
    campo.classList.toggle("is-erro", on);
    var input = campo.querySelector("input, select, textarea");
    if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
  }

  function validar(form) {
    var ok = true;
    form.querySelectorAll("[data-required]").forEach(function (campo) {
      var escolha = campo.querySelectorAll("input[type='radio']");
      if (escolha.length) {
        var marcado = Array.prototype.some.call(escolha, function (r) { return r.checked; });
        setErro(campo, !marcado);
        if (!marcado) ok = false;
        return;
      }
      var input = campo.querySelector("input, select, textarea");
      if (!input) return;
      var vazio = input.type === "checkbox" ? !input.checked : !String(input.value || "").trim();
      var invalido = input.type === "email" && !vazio && !emailOk(input.value.trim());
      var erro = vazio || invalido;
      setErro(campo, erro);
      if (erro) ok = false;
    });
    return ok;
  }

  document.querySelectorAll("form.js-form").forEach(function (form) {
    form.addEventListener("input", function (event) {
      var campo = event.target.closest(".campo");
      if (campo && campo.classList.contains("is-erro")) validar(form);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var envio = form.querySelector(".form-envio");
      if (envio) envio.classList.remove("is-on");
      if (!validar(form)) return;
      var btn = form.querySelector("[type='submit']");
      if (btn) btn.textContent = "Enviando...";
      /* TODO: conectar o envio (CRM, e-mail ou serviço). Front-end apenas, action="#". */
      window.setTimeout(function () {
        form.classList.add("is-sucesso");
        var sucesso = form.querySelector(".form-sucesso-bloco");
        if (sucesso) {
          sucesso.setAttribute("tabindex", "-1");
          sucesso.focus();
        }
        if (form.id === "form-ebook") {
          var escolhidoInput = form.querySelector("input[name='ebook']:checked");
          var escolhido = escolhidoInput ? escolhidoInput.value : "";
          var downloads = form.querySelectorAll("[data-ebook]");
          if (downloads.length) {
            downloads.forEach(function (el) {
              var tipo = el.getAttribute("data-ebook");
              var show = escolhido === "ambos" || tipo === escolhido;
              el.hidden = !show;
            });
          }
        }
      }, 400);
    });
  });
})();
