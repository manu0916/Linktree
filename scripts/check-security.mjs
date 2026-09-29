import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const forbiddenPatterns = [
  /ADMIN_PASSWORD/i,
  /PASSWORD_HASH/i,
  /BEGIN (?:RSA |EC )?PRIVATE KEY/i,
  /api[_-]?key\s*[:=]\s*["'][^"']+/i,
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

const files = await walk(publicRoot);
for (const file of files) {
  if (![".html", ".js", ".css", ".json"].includes(extname(file))) continue;
  const content = await readFile(file, "utf8");
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      throw new Error(`Possível segredo encontrado em arquivo público: ${file}`);
    }
  }
}

console.log("Verificação de segurança do bundle público concluída.");
