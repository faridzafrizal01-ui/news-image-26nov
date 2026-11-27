// news-image-20261126 — entry program.
// The front page is already rendered as entry.png (1024x1024, built in the
// scratch folder). This program only has to deliver that exact file into the
// grader's output directory, unchanged, so the two runs are byte-identical.
import { copyFileSync, existsSync, mkdirSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  throw new Error("MAKEFUN_OUTPUT_DIR is not set");
}

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
if (!existsSync(src)) {
  throw new Error("entry.png not found next to main.ts");
}
const srcSize = statSync(src).size;
if (srcSize > 1024 * 1024) {
  throw new Error(`entry.png is ${srcSize} bytes, over the 1 MiB limit`);
}
// The gate only accepts PNG (or JPEG) magic bytes — refuse early if the
// file is not a real PNG instead of shipping a corrupt output.
const fd = openSync(src, "r");
const header = Buffer.alloc(8);
readSync(fd, header, 0, 8, 0);
closeSync(fd);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!header.equals(pngMagic)) {
  throw new Error("entry.png does not start with PNG magic bytes");
}

mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);
const destSize = statSync(dest).size;
console.log(`copied entry.png (${srcSize} bytes) -> ${dest} (${destSize} bytes)`);
