# Gerador Doc BR

Extensão de navegador que gera números de documentos brasileiros **de teste** direto pelo menu do botão direito — sem abrir site de gerador toda vez que um formulário pedir CPF.

> **Aviso**: os números são aleatórios, apenas com formato e dígitos verificadores válidos. Não correspondem a documentos reais. Uso exclusivo para desenvolvimento e testes de software.

## Documentos suportados

| Documento | Algoritmo | Máscara |
|---|---|---|
| CPF | 9 dígitos + 2 DVs módulo 11 | `000.000.000-00` |
| CNPJ | Raiz aleatória + filial `0001` + 2 DVs módulo 11 | `00.000.000/0000-00` |
| CNPJ alfanumérico | Novo formato da Receita Federal (valor do caractere = ASCII − 48, DVs numéricos). Validado contra o exemplo oficial `12.ABC.345/01DE-35` | `XX.XXX.XXX/XXXX-00` |
| CNH | 9 dígitos + 2 DVs (algoritmo DENATRAN) | — |
| PIS/PASEP | 10 dígitos + 1 DV módulo 11 (pesos 3,2,9…2) | `000.00000.00-0` |
| RENAVAM | 10 dígitos + 1 DV módulo 11 sobre dígitos invertidos | — |
| RG | Padrão SSP-SP (não há padrão nacional); DV pode ser `X` | `00.000.000-0` |
| Título de Eleitor | 8 dígitos + UF (01–28) + 2 DVs, exceção SP/MG | `0000 0000 0000` |

## Como usar

1. Clique com o **botão direito** em qualquer página (ou direto num campo de formulário).
2. `Gerar documento` → escolha o documento → **Copiar** ou **Preencher campo**.
3. `Preencher campo` só aparece quando o clique foi sobre um campo editável; o valor é inserido com eventos `input`/`change`, compatível com React, Angular e Vue.
4. Checkbox **Com máscara** alterna pontuação (preferência salva).
5. O ícone da barra abre o popup com informações, changelog e doação.

Interface em **pt-BR** e **inglês** (segue o idioma do navegador).

## Instalação

### Firefox

Baixe o `.xpi` assinado da [página de Releases](https://github.com/renanlricci/gerador-doc-br/releases) e instale em **Menu > Extensões > engrenagem > Instalar extensão de um arquivo**. Atualizações chegam automaticamente (auto-update via `updates.json` deste repositório).

### Chrome

Publicação na Chrome Web Store em andamento. Enquanto isso, para testar: `chrome://extensions` → ativar **Developer mode** → **Load unpacked** → pasta `dist/chrome` (após rodar o build, veja abaixo).

## Como funciona cada versão

O código é um só; cada navegador leva uma casca fina por cima do núcleo compartilhado.

| | Firefox | Chrome |
|---|---|---|
| Manifest | V2 (`firefox/manifest.json`) | V3 (`chrome/manifest.json`) |
| Background | Página persistente (`firefox/background.js`) | Service worker (`chrome/background.js`) |
| Injeção do content script | `tabs.executeScript`, sob demanda no clique do menu | `chrome.scripting.executeScript`, idem |
| Alvo do "Preencher campo" | Elemento exato clicado (`menus.getTargetElement`, API exclusiva do Firefox) | Campo focado (`document.activeElement` — botão direito foca o campo na prática) |
| Cópia em página restrita | Fallback via background (MV2 tem DOM) | Sem fallback (service worker não tem DOM) — toast avisa |
| Ícones | SVG | PNG 16/32/48/128 (Chrome não aceita SVG no manifest) |
| Permissões | `menus`, `clipboardWrite`, `storage`, `activeTab` | + `scripting` (exigência do MV3) |
| Updates | Auto-update self-hosted (`updates.json` + GitHub Releases) | Chrome Web Store |

Sem host permissions em nenhuma das versões: o content script só é injetado na aba ativa quando você usa o menu (`activeTab`). Limitação conhecida: preencher campo dentro de iframe de outra origem não é possível — a extensão avisa e a opção Copiar continua funcionando.

## Estrutura do projeto

```
core/       Código compartilhado: geradores, i18n, content script, menus, popup, assets
firefox/    Específico do Firefox: manifest MV2 + background (cola)
chrome/     Específico do Chrome: manifest MV3 + service worker + ícones PNG
build.mjs   Monta dist/firefox e dist/chrome (achata core/ + <alvo>/ na raiz do pacote)
test/       Testes dos algoritmos (Node puro, sem dependências)
docs/       Documentação de submissão/release
```

`build.mjs` falha se um arquivo tiver o mesmo nome em `core/` e na pasta de um alvo — proteção contra sobrescrita silenciosa no flatten.

## Desenvolvimento

Requisitos: Node.js 20+.

```bash
# testes dos algoritmos (vetores calculados à mão + 1000 gerações revalidadas por tipo)
node test/generator.test.js

# monta dist/firefox e dist/chrome
node build.mjs

# lint do alvo Firefox (config em web-ext-config.mjs)
npx web-ext lint

# carregar para teste manual
# Firefox: about:debugging#/runtime/this-firefox > Carregar extensão temporária > dist/firefox/manifest.json
# Chrome:  chrome://extensions > Developer mode > Load unpacked > dist/chrome
```

Toda string visível ao usuário vive em `core/i18n.js`, sempre em pt-BR **e** inglês — inclusive as notas de changelog (`I18N_CHANGELOG`).

## Privacidade

Zero coleta, zero transmissão, zero requisição de rede. A única gravação local é a preferência da máscara (`storage.local`). O QR Code da doação é um SVG estático empacotado.

## Release

Fluxo documentado em [`docs/amo-submission.md`](docs/amo-submission.md): bump de versão nos dois manifests → testes/lint/build → assinatura AMO (Firefox) e upload na CWS (Chrome) → GitHub Release com o `.xpi` → atualização do `updates.json`.

## Doação

Gostou? O popup da extensão tem um Pix — doe um café ao dev.

## Licença

[MIT](LICENSE) © Renan Lucas Ricci
