# Gerador Doc BR

Extensão de navegador (Firefox MV2 + Chrome MV3) que gera números de documentos brasileiros **de teste** pelo menu de contexto: CPF, CNPJ, CNPJ alfanumérico (formato Receita/SERPRO), CNH, PIS/PASEP, RENAVAM, RG (SSP-SP) e Título de Eleitor. Ações: copiar ou preencher o campo clicado. Popup na toolbar com doação Pix e changelog interno.

## Arquitetura

```
core/       compartilhado — generator.js (algoritmos), i18n.js (traduções + I18N_CHANGELOG),
            doc-types.js (tabela DOC_TYPES), menus.js (lógica principal dos menus),
            content.js, donate.js, browser-shim.js, popup/changelog/style/assets
firefox/    manifest.json MV2 + background.js (cola: tabs.executeScript + fallback de cópia DOM)
chrome/     manifest.json MV3 + background.js (service worker, chrome.scripting) + icon-*.png
build.mjs   monta dist/firefox e dist/chrome achatando core/ + <alvo>/ (manifest precisa da raiz)
test/       generator.test.js — testável via Node puro
updates.json  manifesto de auto-update do Firefox (fica no repo, NUNCA dentro do pacote)
```

A cola de cada browser fornece `deps` para `gdbrHandleMenuClick` (core/menus.js): `injectAndSend` e `copyFallback` (null no Chrome — service worker não tem DOM).

## Regras invioláveis

1. **ID do add-on Firefox `gerador-doc-br@renan.dev` NUNCA muda** — já submetido ao AMO.
2. **Firefox = canal unlisted** com `update_url`. Se migrar para listed: remover `update_url` do manifest E `lint.selfHosted` do `web-ext-config.mjs`.
3. **Scripts injetados (`browser-shim.js`, `i18n.js`, `content.js`) são reavaliados a cada clique**: só `var` em top-level (nunca `const`/`let`) e manter a guarda `gdbrListenerReady`. `const` quebra a segunda injeção.
4. **Sem host permissions** — só `activeTab` (+ `scripting` no Chrome, exigência MV3). Não adicionar `<all_urls>`.
5. **Zero rede, zero CDN, zero código remoto** — política de ambas as lojas. QR do Pix é SVG estático (validar CRC16 se o código Pix mudar).
6. **Nomes de arquivo não podem colidir entre `core/` e `firefox/`|`chrome/`** — o build achata tudo na raiz do pacote e falha se houver conflito.
7. **Chrome**: ícones do manifest só PNG (SVG proibido); `description` ≤ 132 caracteres; service worker sem DOM — nada de `document`/`navigator.clipboard` no background; estado de módulo se perde quando o SW dorme (ler `storage` a cada evento, nunca guardar em variável).
8. **Preencher campo**: Firefox usa `menus.getTargetElement` (exclusivo); Chrome cai no `document.activeElement` — o guard já existe em `content.js`, não "simplificar".
9. **Ícone**: design original com cores nacionais. NUNCA bandeira oficial ou Brasão (Lei 5.700/1971).
10. **Enquadramento "de teste"** em todo texto (manifests, listagens, README).

## Checklist para TODA alteração

1. **Teste primeiro**: função nova de documento → vetor calculado à mão em `test/generator.test.js` (exemplo oficial quando existir) + loop de 1000 gerações.
2. `node test/generator.test.js` — 100% verde.
3. **Strings visíveis** sempre em `core/i18n.js`, nos DOIS idiomas (pt_BR e en). Nova versão → nova entrada em `I18N_CHANGELOG` nos dois idiomas.
4. `node build.mjs` — remonta dist/ (obrigatório antes de lint e de teste manual).
5. `npx web-ext lint --no-input` (raiz do projeto) — 0 erros. Warning aceito: `KEY_FIREFOX_ANDROID_UNSUPPORTED...`.
6. **Teste manual nos DOIS browsers**:
   - Firefox: `about:debugging#/runtime/this-firefox` → carregar `dist/firefox/manifest.json`;
   - Chrome: `chrome://extensions` → Developer mode → Load unpacked → `dist/chrome`;
   - validar: Preencher campo, Copiar, popup, changelog. i18n via `intl.locale.requested = en-US` (FF) quando mexer em traduções.
7. Validação é local — **nunca** submeter a loja como forma de testar.

## Release (só quando o usuário pedir)

Fluxo completo em `docs/amo-submission.md`. Resumo: bump `version` nos DOIS manifests (mantê-los iguais) → testes/lint/build → Firefox: `npx web-ext sign --channel=unlisted` (usuário roda com as chaves dele) + GitHub Release `vX.Y.Z` com o `.xpi` (nome exato do `update_link`) + entrada nova no `updates.json` → Chrome: zip de `dist/chrome` e upload no dashboard da Chrome Web Store.
