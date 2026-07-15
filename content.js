"use strict";

// Injetado sob demanda via tabs.executeScript — pode ser avaliado mais de uma
// vez no mesmo frame. "var" sem inicializador preserva o valor entre injeções.
var gdbrListenerReady;

if (!gdbrListenerReady) {
  gdbrListenerReady = true;
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "toast") {
      showToast(message.text, message.isError === true);
      return;
    }
    if (message.action === "copy") {
      return handleCopy(message);
    }
    if (message.action === "fill") {
      return handleFill(message);
    }
  });
}

async function handleCopy(message) {
  try {
    await navigator.clipboard.writeText(message.value);
  } catch (err) {
    if (!legacyCopy(message.value)) {
      showToast(t("toastCopyError"), true);
      return;
    }
  }
  showToast(message.docLabel + " " + message.value + " — " + t("toastCopied"));
}

async function handleFill(message) {
  let el = null;
  if (browser.menus && browser.menus.getTargetElement && message.targetElementId !== undefined) {
    el = browser.menus.getTargetElement(message.targetElementId);
  }
  const target = resolveEditable(el) || resolveEditable(document.activeElement);
  if (!target) {
    showToast(t("toastNotEditable"), true);
    return;
  }
  setFieldValue(target, message.value);
  showToast(message.docLabel + " " + t("toastFilled") + ": " + message.value);
}

function resolveEditable(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  const tag = el.tagName;
  if (tag === "TEXTAREA") {
    return el;
  }
  if (tag === "INPUT") {
    const blocked = [
      "checkbox", "radio", "button", "submit", "reset",
      "file", "image", "range", "color", "hidden",
    ];
    return blocked.includes(el.type) ? null : el;
  }
  if (el.isContentEditable) {
    let host = el;
    while (host.parentElement && host.parentElement.isContentEditable) {
      host = host.parentElement;
    }
    return host;
  }
  return null;
}

function setFieldValue(el, value) {
  el.focus();
  if (el.isContentEditable) {
    el.textContent = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
    return;
  }
  // Setter nativo do prototype: frameworks (React etc.) detectam a mudança
  // ao receber o evento input logo em seguida.
  const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function legacyCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  (document.body || document.documentElement).appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  ta.remove();
  return ok;
}

var toastEl;
var toastTimer;

function showToast(text, isError) {
  if (!toastEl || !document.documentElement.contains(toastEl)) {
    toastEl = document.createElement("div");
    toastEl.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "right:16px",
      "bottom:16px",
      "max-width:340px",
      "padding:10px 14px",
      "border-radius:6px",
      "font:13px/1.4 system-ui,sans-serif",
      "color:#fff",
      "box-shadow:0 2px 10px rgba(0,0,0,.35)",
      "pointer-events:none",
      "white-space:pre-wrap",
      "word-break:break-all",
    ].join(";");
    (document.body || document.documentElement).appendChild(toastEl);
  }
  toastEl.style.background = isError ? "#b00020" : "#1b5e20";
  toastEl.textContent = text;
  toastEl.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.display = "none";
  }, 2600);
}
