// Config do web-ext (build/sign/lint/run). Rodar comandos a partir desta pasta.
export default {
  // Canal unlisted/self-hosted: update_url no manifest é permitido.
  // Se migrar para listed, remover update_url e esta opção.
  lint: {
    selfHosted: true,
  },
  ignoreFiles: [
    "test",
    "test/**",
    "docs",
    "docs/**",
    "README.md",
    "CLAUDE.md",
    "web-ext-config.mjs",
    "updates.json",
  ],
};
