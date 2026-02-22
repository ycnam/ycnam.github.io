import fs from 'fs';
import path from 'path';

interface InlineImage {
  src: string;
  caption: string;
}

interface WorkEntry {
  slug: string;
  title: string;
  category: string;
  descriptionHtml: string;
  inlineImages: InlineImage[];
  galleryImages: string[];
  vimeoIds: string[];
  order: number;
}

// Processing (p5.js) interactive sketches — all others default to false
const P5_SLUGS = new Set<string>([
  'balloon-blow',
  'i-hear-you',
  'demonstration-of-number-ofbirds',
]);

const WORKS_DIR = path.join('src', 'data', 'works');

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ');
}

function extractAttr(tag: string, name: string): string | null {
  let m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  if (m) return m[1];
  m = tag.match(new RegExp(`${name}='([^']*)'`, 'i'));
  if (m) return m[1];
  return null;
}

function isVimeoLinkParagraph(innerHtml: string): boolean {
  const text = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // Matches "Video Title from Nam on Vimeo." — the scraped credit line pattern
  return text.length <= 300 && /\bfrom\b.+\bon\s+Vimeo\.?\s*$/i.test(text);
}

function extractYear(descriptionHtml: string): string | undefined {
  // Pattern 1: standalone "YYYY." just before <br> or </p> (not "YYYY.MM.DD")
  const re1 = /\b((?:20|19)\d{2})\.(?!\d)\s*(?=<br|<\/p>)/gi;
  // Pattern 2: "YYYY-YYYY" range at end of paragraph (may omit period)
  const re2 = /\b((?:20|19)\d{2}[-\u2013](?:20|19)\d{2})\.?\s*(?=<\/p>)/gi;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re1.exec(descriptionHtml)) !== null) found.push(m[1]);
  while ((m = re2.exec(descriptionHtml)) !== null) found.push(m[1]);
  return found.length > 0 ? found[found.length - 1] : undefined;
}

function convertParagraph(
  innerHtml: string,
  slug: string,
  missingImages: string[],
): string {
  let s = innerHtml;

  // 1. Convert <img> to markdown image ref or remove when file is absent
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = extractAttr(tag, 'src');
    if (!src) return '';
    const filename = path.basename(src.split('?')[0]);
    const localPath = path.join(WORKS_DIR, slug, filename);
    const alt = extractAttr(tag, 'alt') ?? '';
    if (fs.existsSync(localPath)) {
      return `![${alt}](./${filename})`;
    }
    missingImages.push(`${slug}/${filename}`);
    return '';
  });

  // 2. Convert <br> variants to newline
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/br>/gi, '\n');

  // 3. Convert <a href="...">...</a> to [text](url)
  s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (match, content) => {
    const hrefMatch = match.match(/href=['"]([^'"]+)['"]/i);
    if (!hrefMatch) {
      return content.replace(/<[^>]+>/g, '').replace(/[\n\r]+/g, ' ').trim();
    }
    const href = hrefMatch[1];
    const text = content
      .replace(/<[^>]+>/g, '')
      .replace(/[\n\r]+/g, ' ')
      .trim();
    if (!text) return '';
    return `[${text}](${href})`;
  });

  // 4. Strip remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // 5. Decode HTML entities
  s = decodeHtmlEntities(s);

  // 6. Normalise whitespace
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n[ \t]+/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();

  return s;
}

function htmlToMarkdown(
  descriptionHtml: string,
  slug: string,
  missingImages: string[],
): string {
  const paragraphs: string[] = [];
  const paraRe = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = paraRe.exec(descriptionHtml)) !== null) {
    const attrs = match[1];
    const inner = match[2];

    // Skip navigation UI artefacts from the original Indexhibit site
    if (/class=['"]nav['"]/.test(attrs)) continue;

    const plainText = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, '')
      .trim();
    if (!plainText) continue;

    // Skip Vimeo credit lines — video IDs are already in vimeoIds frontmatter
    if (isVimeoLinkParagraph(inner)) continue;

    const converted = convertParagraph(inner, slug, missingImages);
    if (converted.trim()) {
      paragraphs.push(converted.trim());
    }
  }

  return paragraphs.join('\n\n');
}

function buildFrontmatter(entry: WorkEntry, year: string | undefined): string {
  const lines: string[] = [];

  // YAML double-quoted string: escape backslashes then double-quotes
  const safeTitle = entry.title
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  lines.push(`title: "${safeTitle}"`);

  lines.push(`category: "${entry.category}"`);
  lines.push(`order: ${entry.order}`);

  if (year !== undefined) {
    lines.push(`year: "${year}"`);
  }

  if (entry.vimeoIds.length > 0) {
    lines.push('vimeoIds:');
    for (const id of entry.vimeoIds) {
      lines.push(`  - "${id}"`);
    }
  } else {
    lines.push('vimeoIds: []');
  }

  lines.push(`hasP5Sketch: ${P5_SLUGS.has(entry.slug)}`);

  if (entry.galleryImages.length > 0) {
    lines.push('galleryImages:');
    for (const img of entry.galleryImages) {
      lines.push(`  - "${img}"`);
    }
  } else {
    lines.push('galleryImages: []');
  }

  return lines.join('\n');
}

function buildBody(entry: WorkEntry, missingImages: string[]): string {
  const parts: string[] = [];

  const htmlBody = htmlToMarkdown(entry.descriptionHtml, entry.slug, missingImages);
  if (htmlBody.trim()) parts.push(htmlBody.trim());

  for (const id of entry.vimeoIds) {
    parts.push(
      `<iframe src="https://player.vimeo.com/video/${id}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
    );
  }

  const alreadyReferenced = new Set<string>(
    (htmlBody.match(/!\[[^\]]*\]\(\.\/([^)]+)\)/g) ?? []).map(
      (ref) => ref.match(/\(\.\/([^)]+)\)/)?.[1] ?? '',
    ),
  );
  for (const img of entry.inlineImages) {
    if (alreadyReferenced.has(img.src)) continue;
    const localPath = path.join(WORKS_DIR, entry.slug, img.src);
    if (fs.existsSync(localPath)) {
      parts.push(`![${img.caption}](./${img.src})`);
    }
  }

  return parts.join('\n\n');
}

function main(): void {
  const entries: WorkEntry[] = JSON.parse(
    fs.readFileSync('scripts/output/works-data.json', 'utf-8'),
  );

  const allMissingImages: string[] = [];
  let count = 0;

  for (const entry of entries) {
    const dir = path.join(WORKS_DIR, entry.slug);
    fs.mkdirSync(dir, { recursive: true });

    const year = extractYear(entry.descriptionHtml);
    const missingImages: string[] = [];
    const frontmatter = buildFrontmatter(entry, year);
    const body = buildBody(entry, missingImages);
    allMissingImages.push(...missingImages);

    const content = `---\n${frontmatter}\n---\n\n${body}\n`;
    fs.writeFileSync(path.join(dir, 'index.md'), content, 'utf-8');
    count++;

    const p5Flag = P5_SLUGS.has(entry.slug) ? ' [p5]' : '';
    const yearFlag = year ? ` [${year}]` : '';
    const warnFlag =
      missingImages.length > 0
        ? ` (${missingImages.length} missing img refs skipped)`
        : '';
    console.log(`✓ src/data/works/${entry.slug}/index.md${p5Flag}${yearFlag}${warnFlag}`);
  }

  console.log(`\n✅ Generated ${count} markdown files`);

  if (allMissingImages.length > 0) {
    console.warn('\n⚠️  Missing image refs (skipped from markdown output):');
    for (const m of allMissingImages) {
      console.warn(`   - ${m}`);
    }
  } else {
    console.log('✅ No missing image refs');
  }
}

main();
