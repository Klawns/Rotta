import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const INCLUDED_ROOTS = [
  path.join(ROOT_DIR, "apps", "api", "src"),
  path.join(ROOT_DIR, "apps", "api", "test"),
  path.join(ROOT_DIR, "apps", "web"),
];
const INCLUDED_EXTENSIONS = new Set([".ts", ".tsx", ".md"]);
const IGNORED_SEGMENTS = new Set([
  "coverage",
  "dist",
  "node_modules",
  ".next",
  "public",
  "assets",
]);
const IGNORED_FILES = new Set([
  path.join(ROOT_DIR, "apps", "web", "lib", "pt-br.ts"),
]);
const MOJIBAKE_PATTERNS = [/Ã/, /�/, /Ãƒ/, /Â(?=\S)/];
const LEGACY_PATTERNS = [
  {
    label: "legacy session message",
    pattern: /Sessao expirada\. Faca login novamente\./,
  },
  {
    label: "legacy permission message",
    pattern: /Voce nao tem permissao para realizar esta acao\./,
  },
  {
    label: "legacy plan support message",
    pattern: /Seu plano nao foi encontrado\. Entre em contato com o suporte\./,
  },
  {
    label: "legacy rides history fallback",
    pattern: /Nao foi possivel carregar o historico agora\./,
  },
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (IGNORED_SEGMENTS.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }

    if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    if (IGNORED_FILES.has(entryPath)) {
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

async function ensureDirectoryExists(directory) {
  const metadata = await stat(directory);

  if (!metadata.isDirectory()) {
    throw new Error(`Expected a directory: ${directory}`);
  }
}

function isTestFile(filePath) {
  return filePath.endsWith(".test.ts") || filePath.endsWith(".spec.ts");
}

async function main() {
  const files = (
    await Promise.all(
      INCLUDED_ROOTS.map(async (directory) => {
        await ensureDirectoryExists(directory);
        return collectFiles(directory);
      }),
    )
  ).flat();

  const violations = [];

  for (const filePath of files) {
    const contents = await readFile(filePath, "utf8");
    const relativePath = path.relative(ROOT_DIR, filePath);

    for (const pattern of MOJIBAKE_PATTERNS) {
      const match = contents.match(pattern);

      if (match) {
        violations.push(`${relativePath}: mojibake -> ${match[0]}`);
        break;
      }
    }

    if (isTestFile(filePath)) {
      continue;
    }

    for (const { label, pattern } of LEGACY_PATTERNS) {
      const match = contents.match(pattern);

      if (!match) {
        continue;
      }

      violations.push(`${relativePath}: ${label} -> ${match[0]}`);
    }
  }

  if (violations.length === 0) {
    console.log("pt-BR text check passed.");
    return;
  }

  console.error("pt-BR text check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
}

void main();
