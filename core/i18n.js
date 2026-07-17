"use strict";

/*
 * Arquivo único de tradução (pt-BR e en).
 * Idioma escolhido pelo idioma da interface do Firefox: pt* => pt_BR, resto => en.
 * Carregado tanto no background quanto no content script.
 */

// "var" (e não const): este arquivo é reinjetado via tabs.executeScript e
// redeclaração de const quebraria a segunda injeção.
var I18N_MESSAGES = {
  pt_BR: {
    menuRoot: "Gerar documento",
    menuCpf: "CPF",
    menuCnpj: "CNPJ",
    menuCnpjAlpha: "CNPJ alfanumérico",
    menuCnh: "CNH",
    menuPis: "PIS/PASEP",
    menuRenavam: "RENAVAM",
    menuRg: "RG (SSP-SP)",
    menuTitulo: "Título de Eleitor",
    menuCopy: "Copiar",
    menuFill: "Preencher campo",
    menuMask: "Com máscara (pontuação)",
    toastCopied: "copiado para a área de transferência",
    toastFilled: "preenchido",
    toastNotEditable: "O elemento clicado não é um campo editável",
    toastCopyError: "Não foi possível copiar para a área de transferência",
    toastNoAccess: "Sem acesso a este quadro (iframe). Use a opção Copiar.",
    popupDevBy: "Desenvolvido por",
    popupDonate: "Gostou? Doe um café ao dev via Pix:",
    popupCopyPix: "Copiar Pix copia e cola",
    popupCopied: "Copiado!",
    popupChangelog: "Changelog",
  },
  en: {
    menuRoot: "Generate document",
    menuCpf: "CPF",
    menuCnpj: "CNPJ",
    menuCnpjAlpha: "Alphanumeric CNPJ",
    menuCnh: "CNH (driver's license)",
    menuPis: "PIS/PASEP",
    menuRenavam: "RENAVAM",
    menuRg: "RG (SSP-SP)",
    menuTitulo: "Voter ID (Título de Eleitor)",
    menuCopy: "Copy",
    menuFill: "Fill field",
    menuMask: "With mask (punctuation)",
    toastCopied: "copied to clipboard",
    toastFilled: "filled",
    toastNotEditable: "The clicked element is not an editable field",
    toastCopyError: "Could not copy to clipboard",
    toastNoAccess: "Cannot access this frame (iframe). Use the Copy option instead.",
    popupDevBy: "Developed by",
    popupDonate: "Enjoying it? Buy the dev a coffee via Pix:",
    popupCopyPix: "Copy Pix code",
    popupCopied: "Copied!",
    popupChangelog: "Changelog",
  },
};

// Conteúdo do changelog por versão, também traduzido (renderizado em changelog.html).
var I18N_CHANGELOG = [
  {
    version: "1.1.0",
    date: "2026-07-17",
    notes: {
      pt_BR: [
        "Versão para Google Chrome (Manifest V3), com o mesmo núcleo de geração do Firefox.",
        "No Chrome, \"Preencher campo\" usa o campo em foco (a API de elemento clicado é exclusiva do Firefox).",
        "QR Code da doação maior no popup e no changelog.",
      ],
      en: [
        "Google Chrome version (Manifest V3), sharing the same generation core as Firefox.",
        "On Chrome, \"Fill field\" targets the focused field (the clicked-element API is Firefox-only).",
        "Bigger donation QR Code in the popup and changelog.",
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-07-15",
    notes: {
      pt_BR: [
        "Geração de documentos de teste pelo menu de contexto (botão direito): CPF, CNPJ, CNPJ alfanumérico (novo formato da Receita Federal), CNH, PIS/PASEP, RENAVAM, RG (padrão SSP-SP) e Título de Eleitor — todos com dígitos verificadores válidos.",
        "Ações por documento: copiar para a área de transferência ou preencher o campo clicado (compatível com React/Angular/Vue).",
        "Máscara de pontuação opcional (checkbox no menu, preferência salva).",
        "Traduções pt-BR e inglês, seguindo o idioma do Firefox.",
        "Popup com informações da extensão e doação via Pix.",
      ],
      en: [
        "Test document generation via the right-click context menu: CPF, CNPJ, alphanumeric CNPJ (new Receita Federal format), CNH, PIS/PASEP, RENAVAM, RG (SSP-SP standard) and voter ID — all with valid check digits.",
        "Per-document actions: copy to clipboard or fill the right-clicked field (React/Angular/Vue compatible).",
        "Optional punctuation mask (menu checkbox, saved preference).",
        "pt-BR and English translations, following the Firefox UI language.",
        "Toolbar popup with extension info and Pix donation.",
      ],
    },
  },
];

function i18nLang() {
  try {
    const ui = (browser.i18n.getUILanguage() || "en").toLowerCase();
    return ui.startsWith("pt") ? "pt_BR" : "en";
  } catch (e) {
    return "en";
  }
}

function t(key) {
  const lang = i18nLang();
  return (
    (I18N_MESSAGES[lang] && I18N_MESSAGES[lang][key]) ||
    I18N_MESSAGES.en[key] ||
    key
  );
}
