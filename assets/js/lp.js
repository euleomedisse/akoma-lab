/* Akoma · Landing pages dos e-books · efeitos e formulário (vanilla, sem dependências) */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* 1. Título com entrada palavra a palavra */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var palavras = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = palavras.map(function (p, i) {
      return '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + i + '">' + p + '</span></span>';
    }).join(' ');
    el.classList.add('split');
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      doc.classList.add('is-ready');
      document.querySelectorAll('.split').forEach(function (el) { el.classList.add('is-in'); });
    });
  });

  /* 2. Reveal no scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 3. Formas com parallax (scroll + mouse) */
  var formas = Array.prototype.slice.call(document.querySelectorAll('.forma[data-depth]'));
  if (formas.length && !reduz) {
    var mx = 0, my = 0, tick = false;
    var aplicar = function () {
      tick = false;
      var sy = window.scrollY;
      formas.forEach(function (f) {
        var d = parseFloat(f.dataset.depth) || 0.1;
        f.style.transform = 'translate3d(' + (mx * d * 40).toFixed(1) + 'px,' + (-sy * d + my * d * 40).toFixed(1) + 'px,0)';
      });
    };
    var pedir = function () { if (!tick) { tick = true; requestAnimationFrame(aplicar); } };
    window.addEventListener('scroll', pedir, { passive: true });
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5);
        my = (e.clientY / window.innerHeight - 0.5);
        pedir();
      }, { passive: true });
    }
    aplicar();
  }

  /* 4. Mockup 3D com tilt no mouse */
  var palco = document.querySelector('.palco');
  var livro = document.querySelector('.livro');
  if (palco && livro && !reduz && finePointer) {
    palco.addEventListener('pointermove', function (e) {
      var r = palco.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      livro.classList.add('is-tilting');
      livro.style.setProperty('--ry', (-14 + x * 26).toFixed(2) + 'deg');
      livro.style.setProperty('--rx', (6 - y * 18).toFixed(2) + 'deg');
      livro.style.setProperty('--brilho', (x * 120).toFixed(0) + '%');
    });
    palco.addEventListener('pointerleave', function () {
      livro.classList.remove('is-tilting');
      livro.style.removeProperty('--ry');
      livro.style.removeProperty('--rx');
      livro.style.removeProperty('--brilho');
    });
  }

  /* 5. Formulário de captura */
  var form = document.querySelector('form[data-origem]');
  if (!form) return;
  var painel = form.closest('.painel');
  var obrigado = document.getElementById('obrigado');

  var MSG = {
    nome: { valueMissing: 'Conta pra gente o seu nome.' },
    email: { valueMissing: 'Precisamos do seu e-mail pra enviar o e-book.', typeMismatch: 'Esse e-mail parece incompleto. Confere?' },
    whatsapp: { patternMismatch: 'Use só números, com DDD. Ex.: (21) 99999-9999.' },
    empresa: { valueMissing: 'Qual é a sua empresa ou atividade?' },
    consentimento: { valueMissing: 'Pra enviar o e-book, precisamos do seu aceite.' }
  };
  function mensagem(input) {
    var v = input.validity, m = MSG[input.name] || {};
    if (v.valid) return '';
    for (var k in m) { if (v[k]) return m[k]; }
    return input.validationMessage;
  }
  function mostrarErro(input) {
    var caixa = input.closest('.campo, .aceite');
    var alvo = document.getElementById(input.getAttribute('aria-describedby'));
    var txt = mensagem(input);
    if (alvo) alvo.textContent = txt;
    if (caixa) caixa.classList.toggle('tem-erro', !!txt);
    input.setAttribute('aria-invalid', txt ? 'true' : 'false');
    return !txt;
  }
  var campos = Array.prototype.slice.call(form.querySelectorAll('input[name]:not([name="website"])'));
  campos.forEach(function (input) {
    input.addEventListener('invalid', function (e) { e.preventDefault(); mostrarErro(input); });
    input.addEventListener('blur', function () { if (input.value || input.type === 'checkbox') mostrarErro(input); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') mostrarErro(input); });
    input.addEventListener('change', function () { if (input.type === 'checkbox') mostrarErro(input); });
  });

  function utm(nome) {
    try { return new URLSearchParams(window.location.search).get(nome) || ''; } catch (e) { return ''; }
  }

  function confete(alvo) {
    if (reduz) return;
    var cores = ['#2D2BFF', '#FF2E88', '#D4FF3A', '#2D2BFF', '#FF2E88'];
    var box = document.createElement('div');
    box.className = 'confete';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      var ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 220;
      if (i % 6 === 0) p.className = 'estrela';
      p.style.setProperty('--c', cores[i % cores.length]);
      p.style.setProperty('--s', (6 + Math.random() * 8).toFixed(0) + 'px');
      p.style.setProperty('--r', i % 3 === 0 ? '2px' : '50%');
      p.style.setProperty('--x', (Math.cos(ang) * dist).toFixed(0) + 'px');
      p.style.setProperty('--y', (Math.sin(ang) * dist * 0.7 - 40).toFixed(0) + 'px');
      p.style.setProperty('--rot', (Math.random() * 540 - 270).toFixed(0) + 'deg');
      p.style.setProperty('--dl', (Math.random() * 120).toFixed(0) + 'ms');
      box.appendChild(p);
    }
    alvo.appendChild(box);
    setTimeout(function () { box.remove(); }, 1800);
  }

  function mostrarObrigado() {
    var h0 = painel.offsetHeight;
    var trocar = function () {
      form.hidden = true;
      obrigado.hidden = false;
      if (!reduz) {
        var h1 = painel.offsetHeight;
        painel.style.height = h0 + 'px';
        painel.offsetHeight; /* reflow */
        painel.style.height = h1 + 'px';
        setTimeout(function () { painel.style.height = ''; }, 650);
      }
      var titulo = obrigado.querySelector('h2');
      if (titulo) titulo.focus({ preventScroll: true });
      var topo = painel.getBoundingClientRect().top;
      if (topo < 70 || topo > window.innerHeight * 0.6) {
        painel.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
      }
      confete(painel);
    };
    if (reduz) { trocar(); return; }
    form.classList.add('is-saindo');
    setTimeout(trocar, 420);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, primeiro = null;
    campos.forEach(function (input) {
      if (!mostrarErro(input)) { ok = false; if (!primeiro) primeiro = input; }
    });
    if (!ok) { primeiro.focus(); return; }

    var botao = form.querySelector('button[type="submit"]');
    if (botao) botao.disabled = true;

    var robo = form.querySelector('[name="website"]');
    if (robo && robo.value) { mostrarObrigado(); return; } /* honeypot: não envia */

    var consent = form.querySelector('[name="consentimento"]');
    var dados = new URLSearchParams();
    dados.append('origem', form.dataset.origem);
    dados.append('nome', form.nome.value.trim());
    dados.append('email', form.email.value.trim());
    dados.append('whatsapp', form.whatsapp.value.trim());
    dados.append('empresa', form.empresa.value.trim());
    dados.append('consentimento', consent && consent.checked ? 'sim' : 'nao');
    dados.append('pagina', window.location.href);
    dados.append('utm_source', utm('utm_source'));
    dados.append('utm_medium', utm('utm_medium'));
    dados.append('utm_campaign', utm('utm_campaign'));

    var url = (typeof LEADS_ENDPOINT === 'string') ? LEADS_ENDPOINT.trim() : '';
    if (url) {
      try {
        fetch(url, { method: 'POST', mode: 'no-cors', body: dados, keepalive: true }).catch(function () {});
      } catch (err) { /* segue para o obrigado mesmo assim */ }
    } else {
      console.warn('[Akoma] LEADS_ENDPOINT vazio em assets/js/config.js: lead não enviado (origem: ' + form.dataset.origem + ').');
    }
    mostrarObrigado();
  });
})();
