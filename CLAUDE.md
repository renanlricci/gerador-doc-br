# Gerador Doc BR

Extensão Firefox (Manifest V2) que gera números de documentos brasileiros **de teste** pelo menu de contexto: CPF, CNPJ, CNPJ alfanumérico (novo formato Receita/SERPRO), CNH, PIS/PASEP, RENAVAM, RG (padrão SSP-SP) e Título de Eleitor. Ações: copiar ou preencher o campo clicado. Popup na toolbar com doação Pix e changelog interno.

## Arquitetura

| Arquivo | Papel |
|---|---|
| `generator.js` | Funções puras de geração/dígito verificador — únicas testáveis via Node |
| `background.js` | Menus de contexto + injeção sob demanda (`tabs.executeScript`) + fallback de cópia |
| `content.js` | Injetado no clique: preenche campo (`menus.getTargetElement`) / copia / toast |
| `i18n.js` | ÚNICO arquivo de tradução (pt_BR + en) + `I18N_CHANGELOG` |
| `popup.html` / `changelog.html` / `donate.js` / `style.css` | UI do ícone da toolbar |
| `updates.json` | Manifesto de auto-update (fica no repo, NUNCA dentro do pacote) |
| `test/generator.test.js` | Vetores calculados à mão + 1000 gerações revalidadas por tipo |

## Regras invioláveis

1. **ID do add-on `gerador-doc-br@renan.dev` NUNCA muda** — já submetido ao AMO; mudar = extensão nova sem histórico.
2. **Canal unlisted** com `update_url` no manifest. Se migrar para listed: remover `update_url` do manifest E `lint.selfHosted` do `web-ext-config.mjs` (AMO rejeita listed com update_url).
3. **`i18n.js` e `content.js` são reinjetados** via `tabs.executeScript` a cada clique de menu: usar `var` (nunca `const`/`let` em top-level) e manter a guarda `gdbrListenerReady`. `const` quebra a segunda injeção com erro de redeclaração.
4. **Sem host permissions** — só `activeTab`. Não adicionar `<all_urls>` de volta. Limitação conhecida e aceita: preencher campo em iframe cross-origin não funciona (toast orienta usar Copiar).
5. **Zero rede, zero CDN, zero código remoto** — política do AMO. QR do Pix é SVG estático gerado offline (validar CRC16 se o código Pix mudar).
6. **Ícone**: design original com cores nacionais. NUNCA usar bandeira oficial ou Brasão de Armas (Lei 5.700/1971 — brasão é reservado a órgãos públicos).
7. **Enquadramento "de teste"** em todo texto (manifest, listagem, README) — números aleatórios com DV válido, nunca apresentar como documentos reais.

## Checklist para TODA alteração

1. **Teste primeiro**: nova função de documento → adicionar vetor calculado à mão em `test/generator.test.js` (usar exemplo oficial quando existir, ex.: CNPJ alfanumérico `12.ABC.345/01DE-35`) + loop de 1000 gerações revalidadas.
2. Rodar `node test/generator.test.js` — precisa passar 100%.
3. **Toda string visível ao usuário** vai para `i18n.js`, SEMPRE nos dois idiomas (pt_BR e en). Nova versão → nova entrada em `I18N_CHANGELOG` nos dois idiomas.
4. Rodar `npx web-ext lint --no-input` (na raiz do projeto; config já aplica modo self-hosted) — exigir 0 erros. Único warning aceito: `KEY_FIREFOX_ANDROID_UNSUPPORTED...` (Android não tem menu de contexto).
5. Rodar `npx web-ext build --overwrite-dest` e conferir que o zip só tem arquivos de runtime (sem test/, docs/, README, CLAUDE.md, updates.json).
6. **Teste manual** no `about:debugging#/runtime/this-firefox`: Preencher campo, Copiar, popup e changelog. Testar inglês via `intl.locale.requested = en-US` quando mexer em i18n.
7. Validação é local (testes + about:debugging) — **nunca** assinar/submeter ao AMO como forma de testar.

## Release (só quando o usuário pedir)

Fluxo completo em `docs/amo-submission.md`. Resumo: bump `version` no manifest (AMO rejeita versão repetida) → build → `web-ext sign --channel=unlisted` (usuário roda com as chaves dele) → anexar `.xpi` no GitHub Release `vX.Y.Z` com o nome exato do `update_link` → adicionar entrada no `updates.json` → push na `main` via PR.
