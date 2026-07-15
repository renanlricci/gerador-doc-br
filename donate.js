"use strict";

// Código Pix "copia e cola" (EMV) — CRC16 validado.
const PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX01363e407fdd-1e0e-4b64-a438-fdaad2e69da05204000053039865802BR5917Renan Lucas Ricci6009SAO PAULO62140510nvV3rB5h3y6304B3D9";

document.addEventListener("DOMContentLoaded", () => {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.getAttribute("data-i18n"));
  }

  const version = document.getElementById("version");
  if (version) {
    version.textContent = "v" + browser.runtime.getManifest().version;
  }

  const entries = document.getElementById("changelog-entries");
  if (entries && typeof I18N_CHANGELOG !== "undefined") {
    const lang = i18nLang();
    for (const entry of I18N_CHANGELOG) {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      title.textContent = entry.version + " ";
      const date = document.createElement("small");
      date.textContent = "— " + entry.date;
      title.appendChild(date);
      const list = document.createElement("ul");
      for (const note of entry.notes[lang] || entry.notes.en) {
        const item = document.createElement("li");
        item.textContent = note;
        list.appendChild(item);
      }
      article.appendChild(title);
      article.appendChild(list);
      entries.appendChild(article);
    }
  }

  const btn = document.getElementById("copy-pix");
  if (btn) {
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(PIX_CODE);
      btn.textContent = t("popupCopied");
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = t("popupCopyPix");
        btn.classList.remove("copied");
      }, 1800);
    });
  }
});
