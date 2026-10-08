// 一键换菜：npm run use -- <name>，把 storyboards/<name>.json 拷成根目录 storyboard.json（渲染入口）
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const dir = new URL("../storyboards/", import.meta.url);
const available = readdirSync(dir).filter((f) => f.endsWith(".json"));

if (process.argv.length < 3) {
  console.log("用法: npm run use -- <name>（不含 .json）\n可用:");
  for (const f of available) console.log("  -", f.replace(/\.json$/, ""));
  process.exit(0);
}

const name = process.argv[2].replace(/\.json$/, "");
const src = new URL(`${name}.json`, dir);
if (!existsSync(src)) {
  console.error(`没有 storyboards/${name}.json，可用: ${available.map((f) => f.replace(/\.json$/, "")).join(", ")}`);
  process.exit(1);
}
writeFileSync(new URL("../storyboard.json", import.meta.url), readFileSync(src)); // cpSync 覆盖在 Windows 报 unlink 错，改读写
console.log(`已切换: storyboards/${name}.json → storyboard.json`);
