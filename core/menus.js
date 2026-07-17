"use strict";

/*
 * Lógica principal dos menus de contexto, compartilhada entre Firefox e Chrome.
 * O background de cada browser fornece:
 *   - menusApi: browser.menus (Firefox) ou chrome.contextMenus (Chrome);
 *   - deps.injectAndSend(tabId, frameId, message): injeta o content script no
 *     frame e envia a mensagem;
 *   - deps.copyFallback(text) ou null: cópia via background quando a página
 *     não é acessível (só existe no Firefox MV2, que tem DOM no background).
 */

var GDBR_PAGE_CONTEXTS = ["page", "frame", "selection", "link", "image", "editable"];

// Restringe o menu a páginas web. Sem isto, o menu aparece em about:/chrome://
// e lojas de add-on, onde a injeção falha e nem o toast de aviso é possível.
// Cobre http/https; file:// fica de fora (injeção exige permissão extra).
var GDBR_URL_PATTERNS = ["*://*/*"];

// removeAll é promise no Firefox e, dependendo da versão, callback no Chrome.
function gdbrRemoveAllMenus(menusApi) {
  try {
    const result = menusApi.removeAll();
    if (result && typeof result.then === "function") {
      return result;
    }
  } catch (e) {
    // cai para a forma com callback
  }
  return new Promise((resolve) => menusApi.removeAll(resolve));
}

async function gdbrInitMenus(menusApi) {
  const stored = await browser.storage.local.get({ maskEnabled: true });
  await gdbrRemoveAllMenus(menusApi);

  menusApi.create({
    id: "root",
    title: t("menuRoot"),
    contexts: GDBR_PAGE_CONTEXTS,
    documentUrlPatterns: GDBR_URL_PATTERNS,
  });

  for (const [docId, doc] of Object.entries(DOC_TYPES)) {
    menusApi.create({
      id: "doc:" + docId,
      parentId: "root",
      title: t(doc.labelKey),
      contexts: GDBR_PAGE_CONTEXTS,
      documentUrlPatterns: GDBR_URL_PATTERNS,
    });
    menusApi.create({
      id: docId + ":copy",
      parentId: "doc:" + docId,
      title: t("menuCopy"),
      contexts: GDBR_PAGE_CONTEXTS,
      documentUrlPatterns: GDBR_URL_PATTERNS,
    });
    // "Preencher campo" só aparece quando o clique foi em um campo editável.
    menusApi.create({
      id: docId + ":fill",
      parentId: "doc:" + docId,
      title: t("menuFill"),
      contexts: ["editable"],
      documentUrlPatterns: GDBR_URL_PATTERNS,
    });
  }

  menusApi.create({
    id: "sep",
    parentId: "root",
    type: "separator",
    contexts: GDBR_PAGE_CONTEXTS,
    documentUrlPatterns: GDBR_URL_PATTERNS,
  });
  menusApi.create({
    id: "mask",
    parentId: "root",
    type: "checkbox",
    checked: stored.maskEnabled,
    title: t("menuMask"),
    contexts: GDBR_PAGE_CONTEXTS,
    documentUrlPatterns: GDBR_URL_PATTERNS,
  });
}

async function gdbrHandleMenuClick(info, tab, deps) {
  if (info.menuItemId === "mask") {
    await browser.storage.local.set({ maskEnabled: info.checked });
    return;
  }

  const [docId, action] = String(info.menuItemId).split(":");
  const doc = DOC_TYPES[docId];
  if (!doc || !tab || tab.id === undefined) {
    return;
  }

  // Lê a preferência a cada clique: o service worker do Chrome dorme e
  // perde estado de módulo, então não dá para manter em variável.
  const stored = await browser.storage.local.get({ maskEnabled: true });
  const raw = doc.generate();
  const value = stored.maskEnabled ? doc.mask(raw) : raw;
  const frameId = info.frameId || 0;

  try {
    await deps.injectAndSend(tab.id, frameId, {
      action,
      value,
      docLabel: t(doc.labelKey),
      targetElementId: info.targetElementId,
    });
    return;
  } catch (err) {
    // Sem acesso ao frame: iframe cross-origin (activeTab só cobre a origem
    // principal) ou página privilegiada (about:, chrome://, lojas de add-ons).
  }

  let fallbackText;
  let fallbackIsError;
  if (action === "copy" && deps.copyFallback) {
    await deps.copyFallback(value);
    fallbackText = t(doc.labelKey) + " " + value + " — " + t("toastCopied");
    fallbackIsError = false;
  } else if (action === "copy") {
    fallbackText = t("toastCopyError");
    fallbackIsError = true;
  } else {
    fallbackText = t("toastNoAccess");
    fallbackIsError = true;
  }

  // Best-effort: avisa pelo frame principal o resultado do fallback.
  try {
    await deps.injectAndSend(tab.id, 0, {
      action: "toast",
      text: fallbackText,
      isError: fallbackIsError,
    });
  } catch (err) {
    // Página totalmente privilegiada: sem como exibir feedback.
  }
}
