"use strict";

/*
 * Cola específica do Firefox (Manifest V2, background persistente).
 * A lógica principal fica em menus.js (core); aqui só o que é do browser:
 * injeção via tabs.executeScript e fallback de cópia com DOM.
 */

const menusApi = browser.menus || browser.contextMenus;

async function injectAndSend(tabId, frameId, message) {
  await browser.tabs.executeScript(tabId, { file: "browser-shim.js", frameId, runAt: "document_idle" });
  await browser.tabs.executeScript(tabId, { file: "i18n.js", frameId, runAt: "document_idle" });
  await browser.tabs.executeScript(tabId, { file: "content.js", frameId, runAt: "document_idle" });
  return browser.tabs.sendMessage(tabId, message, { frameId });
}

// Página sem content script (ex.: about:, addons.mozilla.org): copia direto
// do background — MV2 tem DOM disponível.
function copyFromBackground(text) {
  return navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  });
}

gdbrInitMenus(menusApi);
menusApi.onClicked.addListener((info, tab) =>
  gdbrHandleMenuClick(info, tab, { injectAndSend, copyFallback: copyFromBackground })
);
