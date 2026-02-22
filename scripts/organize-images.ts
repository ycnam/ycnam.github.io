import fs from "fs";
import path from "path";

interface WorkData {
  slug: string;
  descriptionHtml: string;
  inlineImages: Array<{ src: string }>;
  galleryImages: string[];
}

const BACKUP_ROOT = "/Users/limitist/projects/migration_from_indexhibit/portfolio/files";
const GIMGS_DIR = path.join(BACKUP_ROOT, "gimgs");
const WORKS_DATA_PATH = "./scripts/output/works-data.json";
const OUTPUT_BASE = "./src/data/works";

// Filters
const isExcludedPrefix = (filename: string): boolean => {
  return filename.startsWith("th-") || filename.startsWith("sys-");
};

const isExcludedSuffix = (filename: string): boolean => {
  return filename.endsWith("_background.png");
};

const isOriginalImage = (filename: string): boolean => {
  return !isExcludedPrefix(filename) && !isExcludedSuffix(filename);
};

const extractFilenameFromSrc = (src: string): string | null => {
  const trimmed = src.trim().replace(/&amp;/g, "&");
  if (!trimmed) return null;

  let pathname = trimmed;
  try {
    pathname = new URL(trimmed, "https://example.com").pathname;
  } catch {
    pathname = trimmed.split(/[?#]/, 1)[0];
  }

  const filename = path.basename(pathname);
  if (!filename) return null;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
};

const extractDescriptionImageFilenames = (descriptionHtml: string): string[] => {
  const filenames = new Set<string>();
  const imgSrcRe = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi;
  let match: RegExpExecArray | null;

  while ((match = imgSrcRe.exec(descriptionHtml)) !== null) {
    const filename = extractFilenameFromSrc(match[2]);
    if (filename && isOriginalImage(filename)) {
      filenames.add(filename);
    }
  }

  return [...filenames];
};

async function main() {
  console.log("📦 Image Organization Script\n");

  // Load works data
  let worksData: WorkData[] = [];
  try {
    const content = fs.readFileSync(WORKS_DATA_PATH, "utf-8");
    worksData = JSON.parse(content);
    console.log(`✅ Loaded ${worksData.length} projects from works-data.json\n`);
  } catch (error) {
    console.error("❌ Failed to load works-data.json:", error);
    process.exit(1);
  }

  // Collect all image filenames to copy
  const imagesToCopy = new Map<string, Set<string>>();

  for (const work of worksData) {
    const images = new Set<string>();

    // Collect inline images
    for (const img of work.inlineImages) {
      if (isOriginalImage(img.src)) {
        images.add(img.src);
      }
    }

    // Collect gallery images
    for (const img of work.galleryImages) {
      if (isOriginalImage(img)) {
        images.add(img);
      }
    }

    for (const filename of extractDescriptionImageFilenames(work.descriptionHtml)) {
      images.add(filename);
    }

    if (images.size > 0) {
      imagesToCopy.set(work.slug, images);
    }
  }

  // Process each project
  let totalCopied = 0;
  let totalMissing = 0;
  const missingFiles: Array<{ slug: string; filename: string }> = [];

  for (const [slug, images] of imagesToCopy) {
    const slugDir = path.join(OUTPUT_BASE, slug);

    // Create slug directory
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }

    // Copy each image
    for (const filename of images) {
      const srcPath = path.join(GIMGS_DIR, filename);
      const destPath = path.join(slugDir, filename);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        totalCopied++;
      } else {
        totalMissing++;
        missingFiles.push({ slug, filename });
        console.warn(`⚠️  Missing: ${filename} (for ${slug})`);
      }
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log(`  Projects processed: ${imagesToCopy.size}`);
  console.log(`  Images copied: ${totalCopied}`);
  console.log(`  Missing files: ${totalMissing}`);

  if (missingFiles.length > 0) {
    console.log("\n❌ Missing files:");
    for (const { slug, filename } of missingFiles) {
      console.log(`  - ${filename} (${slug})`);
    }
  }

  console.log("\n✅ Image organization complete!");
}

main().catch(console.error);
