"use strict";

// Tabela de documentos expostos no menu. Depende de generator.js (carregado antes).
var DOC_TYPES = {
  cpf: { labelKey: "menuCpf", generate: generateCpf, mask: maskCpf },
  cnpj: { labelKey: "menuCnpj", generate: generateCnpj, mask: maskCnpj },
  cnpjAlpha: { labelKey: "menuCnpjAlpha", generate: generateCnpjAlpha, mask: maskCnpj },
  cnh: { labelKey: "menuCnh", generate: generateCnh, mask: maskNone },
  pis: { labelKey: "menuPis", generate: generatePis, mask: maskPis },
  renavam: { labelKey: "menuRenavam", generate: generateRenavam, mask: maskNone },
  rg: { labelKey: "menuRg", generate: generateRg, mask: maskRg },
  titulo: { labelKey: "menuTitulo", generate: generateTitulo, mask: maskTitulo },
};
