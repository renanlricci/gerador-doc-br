# Listagem pública no AMO (Firefox Add-ons) — canal listed

Dados espelhados da listagem já publicada na Chrome Web Store, para manter a extensão consistente entre as duas lojas.

## Pré-requisitos

- Conta de desenvolvedor no AMO (https://addons.mozilla.org/developers/).
- Build atualizado: `node build.mjs` → pacote em `dist/firefox`.
- Versão **1.1.1** (a 1.0.0 e 1.1.0 já foram consumidas no canal unlisted; número de versão não se repete no AMO).

## Empacotamento

```bash
node build.mjs
npx web-ext build --overwrite-dest
```

Gera `web-ext-artifacts/gerador_doc_br-1.1.1.zip` a partir de `dist/firefox`.

## Submissão (canal listed)

1. Developer Hub → o add-on existente `gerador-doc-br@renan.dev` → **Upload New Version**.
2. Escolher o canal **"On this site" (listed)** e enviar o zip.
3. Preencher os campos da listagem abaixo.
4. Revisão automática + possível revisão humana (pode levar dias).

## Campos da listagem

**Nome**
```
Gerador Doc BR
```

**Resumo / Summary** (≤250 caracteres)
```
Gera números de documentos brasileiros DE TESTE (CPF, CNPJ, CNH, PIS, RENAVAM, RG e mais) pelo menu do botão direito.
```

**Categoria**: Other (ou Developer / Web Development, conforme disponível no AMO)

**Idioma principal**: Português (Brasil)

**Descrição completa**
```
Gerador Doc BR cria números de documentos brasileiros de teste direto pelo menu do botão direito do navegador, de forma rápida e sem sair da página em que você está.

Feito para desenvolvedores, QAs e analistas que precisam preencher formulários em ambientes de desenvolvimento, homologação e testes.

DOCUMENTOS SUPORTADOS
- CPF
- CNPJ (numérico)
- CNPJ alfanumérico (novo formato da Receita Federal)
- CNH
- PIS/PASEP
- RENAVAM
- RG (padrão SSP-SP)
- Título de Eleitor

Todos gerados no formato correto e com dígitos verificadores válidos.

COMO USAR
1. Clique com o botão direito em qualquer página, ou direto em um campo de formulário.
2. Escolha "Gerar documento" e o tipo desejado.
3. Selecione "Copiar" para enviar o valor à área de transferência, ou "Preencher campo" para inserir direto no campo clicado.
4. A opção "Com máscara" alterna entre o valor pontuado (000.000.000-00) e apenas os dígitos.

Interface em português e inglês, seguindo o idioma do navegador.

PRIVACIDADE
A extensão não coleta nenhum dado, não faz requisições de rede e não acompanha sua navegação. A única informação salva é a sua preferência de máscara, armazenada apenas no seu navegador.

AVISO
Os números são aleatórios e servem exclusivamente para desenvolvimento e testes. Não correspondem a documentos reais de nenhuma pessoa e não devem ser usados para qualquer finalidade fraudulenta.
```

**Screenshot**: `web-ext-artifacts/chrome_store_screenshot_1280x800.png` (serve no AMO).

**Ícone**: `core/icon.svg` (o AMO aceita SVG).

**Política de privacidade**: não é necessária (extensão não coleta dados). Já declarado `data_collection_permissions: none` no manifest.

**Notas da versão 1.1.1**: "Publicação na loja oficial do Firefox."

## Migração dos usuários unlisted

Quem instalou o `.xpi` self-hosted (1.0.0 / 1.1.0) tem `update_url` apontando para o GitHub e NÃO migra automaticamente para o canal da loja. Orientar reinstalação a partir da página do AMO quando a versão listed for aprovada. O `updates.json` no repositório é legado dessas versões e não recebe mais entradas.
