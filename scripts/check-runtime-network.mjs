import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const forbidden = [
  /\bfetch\s*\(/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /navigator\.mediaDevices/,
];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat().filter((file) => /\.(ts|tsx|js|mjs)$/.test(file) && !file.endsWith(".test.ts"));
}

const files = (await Promise.all([filesIn("app"), filesIn("src")])).flat();
const violations = [];
for (const file of files) {
  const contents = await readFile(file, "utf8");
  for (const pattern of forbidden) if (pattern.test(contents)) violations.push(`${file}: ${pattern}`);
}

if (violations.length) {
  console.error("외부 런타임 또는 브라우저 영구 저장 사용이 발견되었습니다.");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("외부 런타임 요청과 브라우저 영구 저장 사용이 없습니다.");
