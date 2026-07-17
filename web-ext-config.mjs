// Config do web-ext (build/sign/lint/run) — alvo Firefox.
// Rodar `node build.mjs` antes; comandos web-ext a partir desta pasta.
export default {
  sourceDir: "dist/firefox",
  artifactsDir: "web-ext-artifacts",
  // Canal unlisted/self-hosted: update_url no manifest é permitido.
  // Se migrar para listed, remover update_url do manifest e esta opção.
  lint: {
    selfHosted: true,
  },
};
