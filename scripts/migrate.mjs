import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_POSTS_DIR = path.resolve(__dirname, '../migration_from_tumblr/posts');
const SOURCE_IMAGES_ROOT = path.join(SOURCE_POSTS_DIR, 'tumblr_img');
const SOURCE_AVATAR = path.resolve(__dirname, '../migration_from_tumblr/assets/avatar.png');

const TARGET_BLOG_ROOT = path.resolve(__dirname, '../src/data/blog');
const TARGET_AVATAR = path.resolve(__dirname, '../src/assets/avatar.png');

const IMAGE_REF_REGEX = /!\[[^\]]*\]\(\.\/tumblr_img\/([^/\s)]+)\/([^\s)]+)\)/g;
const EXTERNAL_IMAGE_REGEX = /!\[[^\]]*\]\(https?:\/\/[^)]+\)/g;

function splitFrontmatter(markdown, fileName) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid frontmatter in ${fileName}`);
  }
  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function normalizeFrontmatter(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  return lines
    .map((line) => {
      if (/^tags:\s*(["'])\1\s*$/.test(line)) {
        return 'tags: []';
      }

      const titleMatch = line.match(/^title:\s*(.*)$/);
      if (titleMatch) {
        const rawTitle = unwrapYamlQuotedScalar(titleMatch[1]);
        return `title: ${JSON.stringify(rawTitle)}`;
      }

      return line;
    })
    .join('\n');
}

function unwrapYamlQuotedScalar(value) {
  const trimmed = value.trim();

  if (trimmed.length >= 2 && trimmed[0] === "'" && trimmed[trimmed.length - 1] === "'") {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function listPostFiles() {
  return readdirSync(SOURCE_POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
}

function copyReferencedImages(body, targetDir, errors) {
  const matches = [...body.matchAll(IMAGE_REF_REGEX)];
  const copiedDestinations = new Set();

  for (const match of matches) {
    const slugDir = match[1];
    const imageName = match[2];
    const sourcePath = path.join(SOURCE_IMAGES_ROOT, slugDir, imageName);
    const destinationPath = path.join(targetDir, imageName);

    if (!statSafe(sourcePath)) {
      errors.push(`Missing image source: ${sourcePath}`);
      continue;
    }

    if (copiedDestinations.has(destinationPath)) {
      continue;
    }

    copyFileSync(sourcePath, destinationPath);
    copiedDestinations.add(destinationPath);
  }

  return copiedDestinations.size;
}

function statSafe(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function transformBody(body) {
  let next = body;
  next = next.replace(EXTERNAL_IMAGE_REGEX, '');
  next = next.replace(/\)(?=!\[)/g, ')\n\n');
  next = next.replace(/\(\.\/tumblr_img\/[^/\s)]+\/([^\s)]+)\)/g, '(./$1)');
  return next;
}

function ensureTargetRoots() {
  rmSync(TARGET_BLOG_ROOT, { recursive: true, force: true });
  mkdirSync(TARGET_BLOG_ROOT, { recursive: true });
  mkdirSync(path.dirname(TARGET_AVATAR), { recursive: true });
}

function migrate() {
  ensureTargetRoots();

  const files = listPostFiles();
  let postsProcessed = 0;
  let imagesCopied = 0;
  const errors = [];

  for (const fileName of files) {
    const slug = fileName.replace(/\.md$/, '');
    const sourceFile = path.join(SOURCE_POSTS_DIR, fileName);
    const destinationDir = path.join(TARGET_BLOG_ROOT, slug);
    const destinationMarkdown = path.join(destinationDir, 'index.md');

    try {
      const sourceContent = readFileSync(sourceFile, 'utf8');
      const { frontmatter, body } = splitFrontmatter(sourceContent, fileName);
      const normalizedFrontmatter = normalizeFrontmatter(frontmatter);

      mkdirSync(destinationDir, { recursive: true });
      imagesCopied += copyReferencedImages(body, destinationDir, errors);

      const transformedBody = transformBody(body);
      const output = `---\n${normalizedFrontmatter}\n---\n${transformedBody}`;

      writeFileSync(destinationMarkdown, output, 'utf8');
      postsProcessed += 1;
      console.log(`[${postsProcessed}/${files.length}] migrated ${fileName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Failed post ${fileName}: ${message}`);
      console.error(`Error migrating ${fileName}: ${message}`);
    }
  }

  try {
    copyFileSync(SOURCE_AVATAR, TARGET_AVATAR);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Failed avatar copy: ${message}`);
  }

  console.log('');
  console.log('Migration summary');
  console.log(`Posts processed: ${postsProcessed}`);
  console.log(`Images copied: ${imagesCopied}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    for (const entry of errors) {
      console.error(`- ${entry}`);
    }
    process.exitCode = 1;
  }
}

migrate();
