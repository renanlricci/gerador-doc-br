# Submissão no AMO (addons.mozilla.org)

## Decisão prévia: listed vs unlisted

| | Unlisted | Listed |
|---|---|---|
| Distribuição | Você baixa o `.xpi` assinado e distribui por conta própria | Aparece na busca pública do AMO |
| Revisão | Automática (minutos) | Automática + possível revisão humana |
| Reversível? | Pode virar listed depois | **NÃO pode voltar a unlisted no mesmo ID** |
| Nome | — | Nome "Gerador Doc BR" fica reservado à conta |

**DECIDIDO (2026-07-15): canal unlisted.** Se um dia quiser publicar na loja, muda para listed (caminho unlisted → listed é permitido; o inverso não). ATENÇÃO: ao migrar para listed, REMOVER o `update_url` do manifest — AMO rejeita submissão listed com esse campo.

## Auto-update (unlisted via GitHub)

- `manifest.json` tem `update_url` apontando para `https://raw.githubusercontent.com/renanlricci/gerador-doc-br/main/updates.json`.
- `updates.json` (raiz do repo, fora do pacote) lista cada versão e o `update_link` do `.xpi` no GitHub Releases.
- Fluxo de cada release:
  1. Bump `version` no `manifest.json`;
  2. `npx web-ext build --overwrite-dest` e teste local;
  3. `npx web-ext sign --channel=unlisted ...` — gera o `.xpi` assinado;
  4. Criar Release `vX.Y.Z` no GitHub e anexar o `.xpi` com o nome EXATO usado no `update_link` (ex.: `gerador_doc_br-1.0.1.xpi`);
  5. Adicionar a entrada nova no `updates.json` e dar push na `main` (via PR, conforme regras de branch);
  6. Firefox dos usuários atualiza sozinho em até ~24h (ou via "Verificar atualizações").
- Repo precisa permanecer público para o raw.githubusercontent.com responder.

**ID fixo:** `gerador-doc-br@renan.dev`. Depois da primeira submissão, NUNCA mudar — mudança de ID = extensão nova, sem histórico de updates.

## Empacotamento

Rodar a partir da pasta do projeto. O build monta `dist/firefox` (core/ + firefox/ achatados); o `web-ext-config.mjs` aponta `sourceDir` para lá:

```bash
node build.mjs
npx web-ext build --overwrite-dest
```

Gera `web-ext-artifacts/gerador_doc_br-<versão>.zip`. (Chrome: ver `docs/chrome-web-store.md`.)

**Versão:** incrementar `version` no `manifest.json` a cada nova submissão — AMO rejeita versão repetida.

## Assinatura unlisted (via CLI)

Credenciais de API: https://addons.mozilla.org/developers/addon/api/key/

```bash
npx web-ext sign --channel=unlisted --api-key=SUA_KEY --api-secret=SEU_SECRET
```

O `.xpi` assinado sai em `web-ext-artifacts/`. Instalar: Menu > Extensões > engrenagem > "Instalar extensão de um arquivo".

## Textos prontos para listagem (necessários só se LISTED)

**Summary EN (limite 250 caracteres):**

> Firefox add-on that generates valid-format Brazilian test document numbers (CPF, CNPJ — including the new alphanumeric format, CNH, PIS/PASEP, RENAVAM, RG, voter ID) via right-click menu. Copy to clipboard or fill the clicked field. For testing only.

**Summary pt-BR:**

> Gera números de documentos brasileiros de teste (CPF, CNPJ — inclusive o novo formato alfanumérico, CNH, PIS/PASEP, RENAVAM, RG, Título de Eleitor) pelo menu do botão direito. Copie ou preencha o campo clicado. Apenas para desenvolvimento e testes.

**Outros itens exigidos no modo listed:**

- Categoria sugerida: *Web Development / Other*
- Licença do código: MIT (arquivo `LICENSE` na raiz; selecionar "MIT License" no formulário do AMO)
- Ícone de listagem 128×128 em PNG (o AMO não aceita SVG no upload da listagem; converter `icon.svg`)
- Screenshots (opcional, recomendado: menu de contexto aberto + popup)

## Notes to Reviewer (colar no campo da submissão)

> This extension adds a context menu that generates randomly-created, valid-format Brazilian test documents (CPF, CNPJ — including the new alphanumeric CNPJ format, CNH, PIS/PASEP, RENAVAM, RG, voter registration number) so developers can fill forms in test environments.
>
> Permissions: the extension uses `activeTab` with on-demand injection (`tabs.executeScript`) triggered exclusively by the user's context-menu click — no host permissions and no persistent content scripts. The injected script writes the generated value into the exact input the user right-clicked (via `browser.menus.getTargetElement`), dispatching `input`/`change` events for framework compatibility, or copies it to the clipboard and shows a small confirmation toast.
>
> The extension reads nothing from pages, collects no data, stores only one local boolean preference (mask on/off), and makes zero network requests. All numbers are generated locally using publicly documented check-digit algorithms (mod 11). Code is plain unminified JavaScript — no bundler, no remote code.

## Checklist antes de cada envio

- [ ] `node test/generator.test.js` verde
- [ ] `npx web-ext lint` sem erros
- [ ] `version` incrementada no manifest
- [ ] `npx web-ext build --overwrite-dest` e conferir conteúdo do zip
- [ ] Notes to Reviewer preenchido (texto acima)

## Conformidade com Add-on Policies (auditado 2026-07-15)

Referência: https://extensionworkshop.com/documentation/publish/add-on-policies/

- **No Surprises**: descrição do manifest e summary cobrem todas as funções (8 documentos, copiar/preencher, popup com doação). Nada oculto.
- **Conteúdo**: números aleatórios de formato válido, enquadrados como "teste" em toda comunicação. Precedente: extensões equivalentes já listadas no AMO. Doação é opcional (não é "pagamento obrigatório", dispensa disclosure especial).
- **Código**: JS puro sem minificação/ofuscação — dispensa envio de código-fonte. Zero bibliotecas embarcadas (QR é SVG estático gerado offline).
- **Self-contained**: nenhuma chamada de rede, nenhum remote code, CSP padrão intacta.
- **Permissões**: `menus`, `clipboardWrite`, `storage`, `activeTab` — sem host permissions; content script injetado sob demanda (`tabs.executeScript`) apenas no clique do menu, no frame clicado. Sem aviso "acessar seus dados em todos os sites" na instalação. Limitação conhecida: `activeTab` não alcança iframe cross-origin — nesse caso o preenchimento avisa para usar Copiar (que segue funcionando via background).
- **Coleta/transmissão de dados**: ZERO. Única gravação local é o boolean da máscara (`storage.local`), nunca transmitido. `data_collection_permissions: none` declarado (taxonomia Firefox 140+) — dispensa diálogo de consentimento.
- **Private browsing**: nada de dados de navegação é lido ou armazenado.
- **Monetização**: sem ads injetados, sem miner, sem afiliados. Pix fica dentro da UI da própria extensão — permitido.

## Pontos já resolvidos

- `data_collection_permissions: { required: ["none"] }` declarado no manifest (exigência nova do AMO).
- Código JS puro, sem minificação — dispensa envio de código-fonte separado.
- Ícone é design original com cores nacionais — sem brasão/bandeira, sem risco na política de conteúdo.
