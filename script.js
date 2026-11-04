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
      if (!aguardando) { aguardando = true; window.requestAnimationFrame(medirRolagem); }
    }, { passive: true });
  }

  // Microsoft Clarity (mapas de calor e gravações). Fica desligado enquanto o ID estiver vazio.
  // Não carrega se o navegador sinaliza "não rastrear" e só começa depois da página pronta,
  // para não pesar no carregamento.
  var CLARITY_ID = "";
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

  // Origem do visitante: quando vem de anúncio (utm_source ou gclid), a mensagem pré-preenchida
  // do WhatsApp leva "(via google/campanha)" para a Crisla saber de onde o lead chegou.
  try {
    var qs = new URLSearchParams(window.location.search);
    var origem = qs.get("utm_source") || (qs.get("gclid") ? "google" : "");
    if (origem) {
      var camp = qs.get("utm_campaign");
      var tag = " (via " + origem + (camp ? "/" + camp : "") + ")";
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        var u = new URL(a.href);
        var t = u.searchParams.get("text");
        if (t) {
          u.searchParams.set("text", t + tag);
          a.href = u.toString();
        }
      });
    }
  } catch (e) { /* sem origem: segue normal */ }

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
