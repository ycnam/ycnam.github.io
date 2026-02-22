import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const WORKS_DIR = path.resolve("src/data/works");
const SIZE_THRESHOLD_BYTES = 2 * 1024 * 1024;
const WIDTH_THRESHOLD_PX = 4000;
const RESIZE_TARGET_WIDTH = 2000;
const JPEG_QUALITY = 85;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

interface ImageInfo {
  filePath: string;
  sizeBefore: number;
  sizeAfter: number;
  widthBefore: number;
  action: "resize" | "compress" | "resize+compress" | "skipped";
}

function collectImages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath));
    } else if (
      entry.isFile() &&
      IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function getPixelWidth(filePath: string): number {
  try {
    const out = execSync(`sips -g pixelWidth "${filePath}" 2>/dev/null`, {
      encoding: "utf8",
    });
    const m = out.match(/pixelWidth:\s+(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0;
  }
}

function isJpeg(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".jpg" || ext === ".jpeg";
}

function resizeImage(filePath: string, targetWidth: number): void {
  execSync(`sips --resampleWidth ${targetWidth} "${filePath}" 2>/dev/null`);
}

function compressJpeg(filePath: string, quality: number): void {
  // sips requires explicit format flag when using formatOptions
  execSync(
    `sips -s format jpeg -s formatOptions ${quality} "${filePath}" --out "${filePath}" 2>/dev/null`
  );
}

function main() {
  console.log(`Scanning: ${WORKS_DIR}`);
  const images = collectImages(WORKS_DIR);
  console.log(`Found ${images.length} image(s)\n`);

  const results: ImageInfo[] = [];
  let totalBytesSaved = 0;
  let changedCount = 0;

  for (const imgPath of images.sort()) {
    const sizeBefore = fs.statSync(imgPath).size;
    const widthBefore = getPixelWidth(imgPath);
    const relPath = path.relative(process.cwd(), imgPath);

    const needsResize = widthBefore > WIDTH_THRESHOLD_PX;
    const needsCompress =
      sizeBefore > SIZE_THRESHOLD_BYTES && isJpeg(imgPath);

    if (!needsResize && !needsCompress) {
      console.log(
        `  SKIP  ${relPath}  (${(sizeBefore / 1024).toFixed(0)} KB, ${widthBefore}px)`
      );
      results.push({
        filePath: relPath,
        sizeBefore,
        sizeAfter: sizeBefore,
        widthBefore,
        action: "skipped",
      });
      continue;
    }

    const action: ImageInfo["action"] =
      needsResize && needsCompress
        ? "resize+compress"
        : needsResize
        ? "resize"
        : "compress";

    if (needsResize) {
      resizeImage(imgPath, RESIZE_TARGET_WIDTH);
    }

    if (needsCompress && isJpeg(imgPath)) {
      compressJpeg(imgPath, JPEG_QUALITY);
    }

    const sizeAfter = fs.statSync(imgPath).size;
    const saved = sizeBefore - sizeAfter;
    totalBytesSaved += saved;
    changedCount++;

    console.log(
      `  ${action.toUpperCase().padEnd(14)} ${relPath}` +
        `  ${(sizeBefore / 1024).toFixed(0)} KB → ${(sizeAfter / 1024).toFixed(0)} KB` +
        `  (saved ${(saved / 1024).toFixed(0)} KB)`
    );

    results.push({ filePath: relPath, sizeBefore, sizeAfter, widthBefore, action });
  }

  console.log("\n── Summary ─────────────────────────────────────────────────");
  console.log(`  Total images scanned : ${images.length}`);
  console.log(`  Files modified       : ${changedCount}`);
  console.log(`  Files skipped        : ${images.length - changedCount}`);
  console.log(
    `  Total bytes saved    : ${totalBytesSaved.toLocaleString()} bytes` +
      ` (${(totalBytesSaved / 1024).toFixed(1)} KB)`
  );
  console.log("────────────────────────────────────────────────────────────\n");

  console.log(
    `RESULT: changed=${changedCount} skipped=${images.length - changedCount} saved_bytes=${totalBytesSaved}`
  );
}

main();
