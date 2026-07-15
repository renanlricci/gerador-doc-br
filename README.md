# Gerador Doc BR — extensão Firefox

Gera documentos brasileiros **de teste** (formato válido, dados fictícios) direto pelo menu de contexto (botão direito), sem precisar abrir sites como o 4devs.

## Recursos

- **CPF** — 11 dígitos com dígitos verificadores válidos (módulo 11).
- **CNPJ** — 14 dígitos, raiz aleatória + filial `0001`, DVs válidos.
- **CNPJ alfanumérico** — novo formato da Receita Federal (raiz com letras e números, valor do caractere = ASCII − 48, DVs numéricos por módulo 11). Validado contra o exemplo oficial `12.ABC.345/01DE-35`.
- **CNH** — 9 dígitos + 2 DVs módulo 11 (algoritmo DENATRAN). Sem máscara oficial.
- **PIS/PASEP** — 10 dígitos + 1 DV módulo 11 (pesos 3,2,9,8,7,6,5,4,3,2). Máscara `000.00000.00-0`.
- **RENAVAM** — 10 dígitos + 1 DV módulo 11 sobre os dígitos invertidos. Sem máscara oficial.
- **RG** — padrão SSP-SP (não existe padrão nacional): 8 dígitos + 1 DV módulo 11, DV pode ser `X`. Máscara `00.000.000-0`.
- **Título de Eleitor** — 8 dígitos + 2 de UF (01–28) + 2 DVs módulo 11, com exceção de SP/MG (resto 0 vira DV 1). Máscara `0000 0000 0000`.
- **Copiar** — envia o documento para a área de transferência.
- **Preencher campo** — aparece só quando o botão direito é clicado sobre um campo editável (input, textarea, contenteditable); preenche o próprio campo clicado e dispara eventos `input`/`change` (compatível com React/Angular/Vue).
- **Com máscara** — checkbox no menu; alterna entre `111.444.777-35` e `11144477735`. Preferência salva.
- **Tradução** — arquivo único (`i18n.js`) com pt-BR e en; segue o idioma da interface do Firefox.
- **Popup** — clique no ícone da barra mostra autor, versão, doação via Pix (QR + copia e cola) e link para o changelog interno (`changelog.html`).

## Estrutura

| Arquivo | Papel |
|---|---|
| `manifest.json` | Manifest V2, permissões `menus`, `clipboardWrite`, `storage`, `activeTab` (sem host permissions) |
| `generator.js` | Funções puras de geração/DV (testáveis via Node) |
| `background.js` | Cria menus de contexto, trata cliques e injeta o content script sob demanda |
| `content.js` | Injetado no clique (activeTab): preenche campo / copia / mostra toast |
| `i18n.js` | Traduções pt-BR + en (arquivo único) |
| `popup.html` / `donate.js` / `style.css` | Popup do ícone da barra (autor, Pix, changelog) |
| `changelog.html` | Página de changelog interna |
| `pix-qr.svg` | QR Code estático do Pix (gerado offline, CRC validado) |
| `test/generator.test.js` | Testes com vetores conhecidos + 1000 gerações revalidadas |

## Testes

```bash
node test/generator.test.js
```

## Instalação temporária (desenvolvimento)

1. Abrir `about:debugging#/runtime/this-firefox` no Firefox.
2. **Carregar extensão temporária...** e escolher o `manifest.json` desta pasta.
3. Some ao fechar o Firefox — recarregar quando precisar.

## Instalação permanente

Firefox exige assinatura da Mozilla. Opções:

- **Assinar (gratuito, recomendado):** criar conta em https://addons.mozilla.org, gerar credenciais de API em https://addons.mozilla.org/developers/addon/api/key/ e rodar:

  ```bash
  npx web-ext sign --channel=unlisted --api-key=SUA_KEY --api-secret=SEU_SECRET
  ```

  Gera um `.xpi` assinado (distribuição própria, não aparece na loja). Instalar pelo Firefox em Menu > Extensões > engrenagem > *Instalar extensão de um arquivo*.

- **Sem assinatura:** Firefox Developer Edition/Nightly/ESR permitem `xpinstall.signatures.required = false` em `about:config`. Versão estável do Firefox não permite.

## Aviso

Documentos gerados são fictícios, apenas com formato/dígitos verificadores válidos. Uso exclusivo para desenvolvimento e testes.
