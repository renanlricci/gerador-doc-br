"use strict";

// Chrome não expõe o namespace "browser"; Firefox expõe os dois.
// Carregado antes de qualquer outro script em todos os contextos.
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = globalThis.chrome;
}
