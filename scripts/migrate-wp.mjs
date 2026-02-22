import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WP_ROOT = path.resolve(__dirname, '../../migration_from_wp');
const XML_PATH = path.join(WP_ROOT, 'limitistlaboratory.wordpress.2026-02-22.xml');
const UPLOADS_ROOT = path.join(WP_ROOT, 'wp-content/uploads');
const TARGET_BLOG_ROOT = path.resolve(__dirname, '../src/data/blog');

const WP_URL_PATTERN = /https?:\/\/limitist\.cafe24\.com\/wp-content\/uploads\/([0-9]{4})\/([0-9]{2})\/([^"'\s)<>]+)/gi;

function escapeYamlString(value) {
  return JSON.stringify(value ?? '');
}

function getExistingSlugSet() {
  const entries = readdirSync(TARGET_BLOG_ROOT, { withFileTypes: true });
  const slugs = new Set();
  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.add(entry.name);
    }
  }
  return slugs;
}

function decodeHtmlEntities(input) {
  if (!input) {
    return '';
  }

  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
}

function stripCdata(input) {
  if (!input) {
    return '';
  }
  const match = input.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return match ? match[1] : input;
}

function toSlugSegment(input) {
  const normalized = decodeURIComponentSafe((input || '').trim())
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}

function decodeURIComponentSafe(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function pickTagValues(categoryNodes) {
  const values = [];
  const seen = new Set();

  for (const node of categoryNodes) {
    const domain = node.attrs.domain || '';
    if (domain !== 'post_tag' && domain !== 'category') {
      continue;
    }

    const raw = (node.content || '').trim();
    if (!raw) {
      continue;
    }

    const tag = decodeHtmlEntities(stripCdata(raw)).trim();
    if (!tag || tag.toLowerCase() === 'uncategorized') {
      continue;
    }

    if (!seen.has(tag)) {
      seen.add(tag);
      values.push(tag);
    }
  }

  return values;
}

function parseWxr(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const raw = itemMatch[1];

    const getTag = (name) => {
      const m = raw.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, 'i'));
      return m ? decodeHtmlEntities(stripCdata(m[1]).trim()) : '';
    };

    const categories = [];
    const categoryRegex = /<category\s+([^>]*?)>([\s\S]*?)<\/category>/gi;
    let c;
    while ((c = categoryRegex.exec(raw)) !== null) {
      const attrsRaw = c[1] || '';
      const content = c[2] || '';
      const attrs = {};
      for (const attr of attrsRaw.matchAll(/([a-zA-Z0-9:_-]+)="([^"]*)"/g)) {
        attrs[attr[1]] = decodeHtmlEntities(attr[2]);
      }
      categories.push({ attrs, content });
    }

    items.push({
      title: getTag('title'),
      postId: getTag('wp:post_id'),
      postType: getTag('wp:post_type'),
      status: getTag('wp:status'),
      slug: getTag('wp:post_name'),
      postDate: getTag('wp:post_date'),
      postDateGmt: getTag('wp:post_date_gmt'),
      body: getTag('content:encoded'),
      categories,
    });
  }

  return items;
}

function toIsoDate(postDate, postDateGmt) {
  const useGmt = postDateGmt && postDateGmt !== '0000-00-00 00:00:00' ? postDateGmt : postDate;
  const safe = useGmt && useGmt !== '0000-00-00 00:00:00' ? useGmt : '1970-01-01 00:00:00';
  return `${safe.replace(' ', 'T')}+00:00`;
}

function buildUniqueSlug(datePrefix, baseSlug, existing) {
  const root = `${datePrefix}-${baseSlug}`;
  let candidate = root;
  let n = 2;
  while (existing.has(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  existing.add(candidate);
  return candidate;
}

function transformBodyAndCopyImages(body, targetDir, report) {
  let nextBody = body || '';
  const copied = new Set();
  const fileNameUsage = new Map();
  const sourceToLocalName = new Map();
  const localNameToSource = new Map();

  nextBody = nextBody.replace(WP_URL_PATTERN, (full, year, month, fileNameRaw) => {
    const sourcePath = path.join(UPLOADS_ROOT, year, month, fileNameRaw);

    if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      report.missingImages.push(sourcePath);
      return full;
    }

    const cached = sourceToLocalName.get(sourcePath);
    let localName = cached;

    if (!localName) {
      const parsed = path.parse(fileNameRaw);
      const sourceUsingName = localNameToSource.get(fileNameRaw);

      if (!sourceUsingName || sourceUsingName === sourcePath) {
        localName = fileNameRaw;
      } else {
        const current = fileNameUsage.get(fileNameRaw) || 1;
        let nextIndex = current + 1;
        let candidate = `${parsed.name}-${nextIndex}${parsed.ext}`;
        while (localNameToSource.has(candidate)) {
          nextIndex += 1;
          candidate = `${parsed.name}-${nextIndex}${parsed.ext}`;
        }
        fileNameUsage.set(fileNameRaw, nextIndex);
        localName = candidate;
      }

      sourceToLocalName.set(sourcePath, localName);
      localNameToSource.set(localName, sourcePath);
      if (!fileNameUsage.has(fileNameRaw)) {
        fileNameUsage.set(fileNameRaw, 1);
      }
    }

    const destPath = path.join(targetDir, localName);
    const key = `${sourcePath}=>${destPath}`;
    if (!copied.has(key)) {
      copyFileSync(sourcePath, destPath);
      copied.add(key);
      report.imagesCopied += 1;
    }

    return `./${localName}`;
  });

  nextBody = convertLocalHtmlImagesToMarkdown(nextBody);

  return nextBody.trim();
}

function parseHtmlAttr(tagSource, attrName) {
  const match = tagSource.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match ? decodeHtmlEntities(match[1]) : '';
}

function toMarkdownImage(src, alt) {
  const safeAlt = (alt || '').replace(/\]/g, '\\]');
  return `![${safeAlt}](${src})`;
}

function convertLocalHtmlImagesToMarkdown(input) {
  let next = input;

  next = next.replace(/<a\b[^>]*>\s*(<img\b[^>]*>)\s*<\/a>/gi, (full, imgTag) => {
    const src = parseHtmlAttr(imgTag, 'src');
    if (!src || !src.startsWith('./')) {
      return full;
    }
    const alt = parseHtmlAttr(imgTag, 'alt') || parseHtmlAttr(imgTag, 'title') || 'image';
    return `\n\n${toMarkdownImage(src, alt)}\n\n`;
  });

  next = next.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const src = parseHtmlAttr(imgTag, 'src');
    if (!src || !src.startsWith('./')) {
      return imgTag;
    }
    const alt = parseHtmlAttr(imgTag, 'alt') || parseHtmlAttr(imgTag, 'title') || 'image';
    return `\n\n${toMarkdownImage(src, alt)}\n\n`;
  });

  next = next.replace(/\n{3,}/g, '\n\n');

  return next;
}

function migrate() {
  if (!existsSync(XML_PATH)) {
    throw new Error(`WP XML not found: ${XML_PATH}`);
  }
  if (!existsSync(UPLOADS_ROOT)) {
    throw new Error(`WP uploads path not found: ${UPLOADS_ROOT}`);
  }

  const xml = readFileSync(XML_PATH, 'utf8');
  const items = parseWxr(xml);
  const posts = items.filter((item) => item.postType === 'post' && item.status === 'publish');

  const existingSlugs = getExistingSlugSet();
  const report = {
    postsTotal: posts.length,
    postsMigrated: 0,
    imagesCopied: 0,
    missingImages: [],
  };

  for (const post of posts) {
    const isoDate = toIsoDate(post.postDate, post.postDateGmt);
    const datePrefix = isoDate.slice(0, 10);

    const sourceSlug = toSlugSegment(post.slug);
    const titleSlug = toSlugSegment(post.title);
    const base = sourceSlug || titleSlug || `post-${post.postId || 'unknown'}`;
    const uniqueSlug = buildUniqueSlug(datePrefix, base, existingSlugs);

    const targetDir = path.join(TARGET_BLOG_ROOT, uniqueSlug);
    mkdirSync(targetDir, { recursive: true });

    const tags = pickTagValues(post.categories);
    const transformedBody = transformBodyAndCopyImages(post.body, targetDir, report);

    const frontmatter = [
      '---',
      `date: ${isoDate}`,
      'draft: false',
      `tags: [${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`,
      `title: ${escapeYamlString(post.title || uniqueSlug)}`,
      '---',
      '',
    ].join('\n');

    const output = `${frontmatter}${transformedBody}\n`;
    writeFileSync(path.join(targetDir, 'index.md'), output, 'utf8');
    report.postsMigrated += 1;
  }

  console.log('WP migration completed');
  console.log(`- Published posts found: ${report.postsTotal}`);
  console.log(`- Posts migrated: ${report.postsMigrated}`);
  console.log(`- Images copied: ${report.imagesCopied}`);
  console.log(`- Missing image refs: ${report.missingImages.length}`);

  if (report.missingImages.length > 0) {
    const uniqueMissing = [...new Set(report.missingImages)];
    for (const missing of uniqueMissing) {
      console.error(`  missing: ${missing}`);
    }
    process.exitCode = 1;
  }
}

migrate();
