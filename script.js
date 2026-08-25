// Crisla Souza | Corretora de Imóveis RJ — script compartilhado
(function () {
  "use strict";

  // Atualiza o ano no rodapé
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Dispara evento de conversão (GA4 / Google Ads) em todo clique de WhatsApp.
  document.querySelectorAll("[data-wa-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      var label = link.getAttribute("data-wa-cta") || "whatsapp_click";
      if (typeof gtag === "function") {
        gtag("event", "contato_whatsapp", {
          event_category: "lead",
          event_label: label,
        });
        // Conversão Google Ads: "Contato WhatsApp - site" (ação primária)
        gtag("event", "conversion", {
          send_to: "AW-17392436920/AjEoCPq4zeccELiNruVA",
        });
      }
    });
  });
})();
