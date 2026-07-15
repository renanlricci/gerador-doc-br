"use strict";

const menus = browser.menus || browser.contextMenus;

const DOC_TYPES = {
  cpf: { labelKey: "menuCpf", generate: generateCpf, mask: maskCpf },
  cnpj: { labelKey: "menuCnpj", generate: generateCnpj, mask: maskCnpj },
  cnpjAlpha: { labelKey: "menuCnpjAlpha", generate: generateCnpjAlpha, mask: maskCnpj },
  cnh: { labelKey: "menuCnh", generate: generateCnh, mask: maskNone },
  pis: { labelKey: "menuPis", generate: generatePis, mask: maskPis },
  renavam: { labelKey: "menuRenavam", generate: generateRenavam, mask: maskNone },
  rg: { labelKey: "menuRg", generate: generateRg, mask: maskRg },
  titulo: { labelKey: "menuTitulo", generate: generateTitulo, mask: maskTitulo },
};

// Somente contextos de página web — nada de toolbar/aba.
const PAGE_CONTEXTS = ["page", "frame", "selection", "link", "image", "editable"];

let maskEnabled = true;

async function loadMaskPref() {
  const stored = await browser.storage.local.get({ maskEnabled: true });
  maskEnabled = stored.maskEnabled;
}

function buildMenus() {
  menus.create({ id: "root", title: t("menuRoot"), contexts: PAGE_CONTEXTS });

  for (const [docId, doc] of Object.entries(DOC_TYPES)) {
    menus.create({
      id: "doc:" + docId,
      parentId: "root",
      title: t(doc.labelKey),
      contexts: PAGE_CONTEXTS,
    });
    menus.create({
      id: docId + ":copy",
      parentId: "doc:" + docId,
      title: t("menuCopy"),
      contexts: PAGE_CONTEXTS,
    });
    // "Preencher campo" só aparece quando o clique foi em um campo editável.
    menus.create({
      id: docId + ":fill",
      parentId: "doc:" + docId,
      title: t("menuFill"),
      contexts: ["editable"],
    });
  }

  menus.create({ id: "sep", parentId: "root", type: "separator", contexts: PAGE_CONTEXTS });
  menus.create({
    id: "mask",
    parentId: "root",
    type: "checkbox",
    checked: maskEnabled,
    title: t("menuMask"),
    contexts: PAGE_CONTEXTS,
  });
}

menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "mask") {
    maskEnabled = info.checked;
    await browser.storage.local.set({ maskEnabled });
    return;
  }

  const [docId, action] = String(info.menuItemId).split(":");
  const doc = DOC_TYPES[docId];
  if (!doc || !tab || tab.id === undefined) {
    return;
  }

  const raw = doc.generate();
  const value = maskEnabled ? doc.mask(raw) : raw;
  const frameId = info.frameId || 0;

  try {
    await sendToFrame(tab.id, frameId, {
      action,
      value,
      docLabel: t(doc.labelKey),
      targetElementId: info.targetElementId,
    });
    return;
  } catch (err) {
    // Sem acesso ao frame: iframe cross-origin (activeTab só cobre a origem
    // principal) ou página privilegiada (about:, addons.mozilla.org etc.).
  }

  let fallbackText;
  let fallbackIsError;
  if (action === "copy") {
    await copyFromBackground(value);
    fallbackText = t(doc.labelKey) + " " + value + " — " + t("toastCopied");
    fallbackIsError = false;
  } else {
    fallbackText = t("toastNoAccess");
    fallbackIsError = true;
  }

  try {
    await sendToFrame(tab.id, 0, { action: "toast", text: fallbackText, isError: fallbackIsError });
  } catch (err) {
    // Página totalmente privilegiada: sem como exibir toast. Cópia já foi feita.
  }
});

// Injeta o content script sob demanda (activeTab) e envia a mensagem.
// i18n.js e content.js toleram reinjeção (var + guarda de listener).
async function sendToFrame(tabId, frameId, message) {
  await browser.tabs.executeScript(tabId, { file: "i18n.js", frameId, runAt: "document_idle" });
  await browser.tabs.executeScript(tabId, { file: "content.js", frameId, runAt: "document_idle" });
  return browser.tabs.sendMessage(tabId, message, { frameId });
}

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

loadMaskPref().then(buildMenus);
