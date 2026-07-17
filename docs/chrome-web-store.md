# Submissão na Chrome Web Store

## Pré-requisitos

- Conta Google com registro de developer da CWS ativo (taxa única de US$ 5): https://chrome.google.com/webstore/devconsole
- Build atualizado: `node build.mjs`

## Empacotamento

```powershell
node build.mjs
Compress-Archive -Path dist\chrome\* -DestinationPath web-ext-artifacts\gerador_doc_br-chrome-1.0.0.zip -Force
```

O zip precisa ter o `manifest.json` na raiz (por isso o `dist\chrome\*`, não a pasta).

## Cadastro do item (primeira vez)

1. Dashboard → **New item** → upload do zip.
2. **Store listing**:
   - Nome: Gerador Doc BR
   - Descrição: reutilizar os summaries prontos de `amo-submission.md` (pt-BR e en)
   - Categoria: Developer Tools
   - Ícone da listagem: `chrome/icon-128.png`
   - **Pelo menos 1 screenshot** 1280×800 ou 640×400 (obrigatório — menu de contexto aberto + popup)
3. **Privacy practices** (obrigatório):
   - Single purpose: "Generates random valid-format Brazilian test document numbers for developers filling forms in test environments."
   - Justificativas por permissão:
     - `activeTab`: "Grants temporary access to the active tab only when the user clicks the extension's context menu, so the generated number can be inserted into the field the user right-clicked."
     - `contextMenus`: "The extension's entire UI is a right-click context menu."
     - `scripting`: "Injects the content script on demand (only after the user's context-menu click) to fill the clicked field or copy the value."
     - `storage`: "Stores a single local boolean preference (punctuation mask on/off)."
     - `clipboardWrite`: "Copies the generated document number to the clipboard when the user chooses Copy."
   - Data usage: marcar que **não coleta nenhum dado** (certificação de não-coleta).
4. **Distribution**: visibilidade Public ou Unlisted (na CWS dá para alternar depois, diferente do AMO) e países.
5. Submit for review — típico: horas a ~2 dias úteis.

## Updates

Bump `version` nos DOIS manifests (firefox e chrome, manter iguais) → build → zip novo → dashboard → **Package > Upload new package** → submit. A store distribui aos usuários automaticamente.

## Diferenças vs Firefox (para não esquecer)

- Sem `update_url`/`updates.json` — a CWS cuida dos updates.
- Ícones PNG obrigatórios no manifest; `description` ≤ 132 caracteres.
- Preencher campo usa `document.activeElement` (não existe `menus.getTargetElement` no Chrome).
- Sem fallback de cópia via background (service worker não tem DOM).
