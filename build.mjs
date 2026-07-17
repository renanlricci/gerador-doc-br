import { cpSync, rmSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Monta os pacotes de cada browser em dist/<alvo>/, achatando
 * core/ + <alvo>/ na raiz (extensão exige manifest.json na raiz do pacote).
 * Zero dependências. Uso: node build.mjs
 */

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const TARGETS = ["firefox", "chrome"];

const coreFiles = readdirSync(join(ROOT, "core"));

for (const target of TARGETS) {
  const targetDir = join(ROOT, target);
  if (!existsSync(targetDir)) {
    throw new Error(`Pasta do alvo não existe: ${target}/`);
  }

  // Guarda contra colisão: arquivo com mesmo nome em core/ e no alvo
  // seria sobrescrito silenciosamente no flatten.
  const clash = readdirSync(targetDir).filter((f) => coreFiles.includes(f));
  if (clash.length > 0) {
    throw new Error(`Conflito de nome entre core/ e ${target}/: ${clash.join(", ")}`);
  }

  const dist = join(ROOT, "dist", target);
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(ROOT, "core"), dist, { recursive: true });
  cpSync(targetDir, dist, { recursive: true });
  console.log(`dist/${target}: ${readdirSync(dist).length} arquivos`);
}
