// 渲当前 active 菜谱，成片按 videoId 命名：npm run render / npm run render -- v
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const meta = JSON.parse(readFileSync(new URL("../storyboard.json", import.meta.url), "utf8")).meta;
const id = meta.videoId || "video";
const orient = process.argv[2] === "v" ? ["preview-v", `${id}-v.mp4`] : ["preview-h", `${id}-h.mp4`];
console.log(`渲染: ${meta.title} → out/${orient[1]}`);
execSync(`npx remotion render src/index.ts ${orient[0]} out/${orient[1]} --overwrite`, { stdio: "inherit" });
