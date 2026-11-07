// Crisla Souza | Corretora de Imóveis RJ — script compartilhado
(function () {
  "use strict";

  // Atualiza o ano no rodapé
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Visitas da equipe: abrir o site uma vez com ?sem_rastreio=1 marca o aparelho e
  // desliga as medições extras (rolagem e gravação de tela) neste navegador.
  var semRastreio = false;
  try {
    if (new URLSearchParams(window.location.search).get("sem_rastreio") === "1") {
      localStorage.setItem("sem_rastreio", "1");
    }
    semRastreio = localStorage.getItem("sem_rastreio") === "1";
  } catch (e) { /* sem localStorage: segue normal */ }

  // Rolagem: eventos por nome (rolagem_25/50/75/90) para ler direto em Relatórios > Eventos do GA4.
  if (!semRastreio) {
    var marcos = [25, 50, 75, 90], enviados = {}, aguardando = false;
    var medirRolagem = function () {
      aguardando = false;
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      var pct = (window.pageYOffset / total) * 100;
      marcos.forEach(function (m) {
        if (pct >= m && !enviados[m]) {
          enviados[m] = true;
          if (typeof gtag === "function") {
            gtag("event", "rolagem_" + m, { event_category: "engajamento", page_path: window.location.pathname });
          }
        }
      });
    };
    window.addEventListener("scroll", function () {
      if (!aguardando) { aguardando = true; setTimeout(medirRolagem, 150); }
    }, { passive: true });
  }

  // Microsoft Clarity (mapas de calor e gravações). Fica desligado enquanto o ID estiver vazio.
  // Não carrega se o navegador sinaliza "não rastrear" e só começa depois da página pronta,
  // para não pesar no carregamento.
  var CLARITY_ID = "z8jsfcwh5j";
  try {
    var naoRastrear = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
    if (CLARITY_ID && !naoRastrear && !semRastreio) {
      var iniciarClarity = function () {
        (function (c, l, a, r, i, t, y) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", CLARITY_ID);
      };
      if (document.readyState === "complete") setTimeout(iniciarClarity, 1500);
      else window.addEventListener("load", function () { setTimeout(iniciarClarity, 1500); });
    }
  } catch (e) { /* sem Clarity: segue normal */ }

  // Dispara evento de conversão (GA4 / Google Ads) em todo clique de WhatsApp.
  document.querySelectorAll("[data-wa-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      var label = link.getAttribute("data-wa-cta") || "whatsapp_click";
      if (typeof gtag === "function") {
        gtag("event", "contato_whatsapp", {
          event_category: "lead",
          event_label: label,
          page_path: window.location.pathname,
        });
        // Conversão Google Ads: "Clique no WhatsApp - Site" (ação primária, criada em 02/11/2026)
        gtag("event", "conversion", {
          send_to: "AW-17392436920/mNgkCOHTr7AdELiNruVA",
        });
      }
    });
  });

  // Landing: toque em planta/foto amplia a imagem (planta traz botão de WhatsApp).
  var lb = document.querySelector("[data-lp-lb]");
  if (lb) {
    var lbImg = lb.querySelector("[data-lp-lb-img]");
    var lbWa = lb.querySelector("[data-lp-lb-wa]");
    var fechaLb = function () { lb.hidden = true; document.body.style.overflow = ""; };
    document.querySelectorAll(".galeria-item img, .lp-planta-img, .lp-faixa img").forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        var msg = img.getAttribute("data-lb-wa");
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        if (msg) { lbWa.href = "https://wa.me/5521980541705?text=" + msg; lbWa.hidden = false; }
        else { lbWa.hidden = true; }
        lb.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg && !lbWa.contains(e.target)) fechaLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) fechaLb(); });
  }

  // Mede quem sai da landing para os outros lançamentos (indecisos).
  document.querySelectorAll("[data-lp-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (typeof gtag === "function") {
        gtag("event", "ver_outros_lancamentos", {
          event_category: "navegacao",
          event_label: link.getAttribute("data-lp-link"),
          page_path: window.location.pathname,
        });
      }
    });
  });

  // Filtro por região / tipo na lista de empreendimentos da home.
  var botoes = document.querySelectorAll("[data-filtro-btn]");
  botoes.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filtro-btn");
      botoes.forEach(function (x) { x.classList.toggle("is-on", x === b); });
      document.querySelectorAll("#grid-emp .emp-card").forEach(function (c) {
        var tags = (c.getAttribute("data-filtro") || "").split(" ");
        c.hidden = !(f === "todos" || tags.indexOf(f) > -1);
      });
      if (typeof gtag === "function") {
        gtag("event", "filtro_empreendimentos", { event_category: "navegacao", event_label: f });
      }
    });
  });
})();
