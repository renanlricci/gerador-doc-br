"use strict";

/*
 * Service worker específico do Chrome (Manifest V3).
 * A lógica principal fica em menus.js (core); aqui só o que é do browser:
 * injeção via chrome.scripting e ciclo de vida do service worker.
 * Sem DOM no service worker: não há fallback de cópia via background.
 */

importScripts("browser-shim.js", "i18n.js", "generator.js", "doc-types.js", "menus.js");

async function injectAndSend(tabId, frameId, message) {
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: ["browser-shim.js", "i18n.js", "content.js"],
  });
  return chrome.tabs.sendMessage(tabId, message, { frameId });
}

// Menus persistem no Chrome; recria na instalação/atualização e no boot
// do browser para alinhar o checkbox de máscara com o storage.
chrome.runtime.onInstalled.addListener(() => {
  gdbrInitMenus(chrome.contextMenus);
});
chrome.runtime.onStartup.addListener(() => {
  gdbrInitMenus(chrome.contextMenus);
});

chrome.contextMenus.onClicked.addListener((info, tab) =>
  gdbrHandleMenuClick(info, tab, { injectAndSend, copyFallback: null })
);
