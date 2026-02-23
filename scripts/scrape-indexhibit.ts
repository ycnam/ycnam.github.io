import { mkdir, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

type NavProject = {
  category: string;
  name: string;
  url: string;
  slug: string;
  order: number;
};

type InlineImage = {
  src: string;
  caption: string;
};

type WorkData = {
  slug: string;
  title: string;
  category: string;
  descriptionHtml: string;
  inlineImages: InlineImage[];
  galleryImages: string[];
  vimeoIds: string[];
  order: number;
};

const BASE_URL = 'https://limitist.cafe24.com/portfolio/';
const OUTPUT_PATH = 'scripts/output/works-data.json';
const REQUEST_DELAY_MS = 1000;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizeUrl(rawUrl: string, base: string = BASE_URL): string {
  const withProtocol = rawUrl.replace(/^http:\/\//i, 'https://');
  return new URL(withProtocol, base).toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractIdBlock(html: string, id: string): string {
  const idPattern = new RegExp(`<([a-z0-9]+)[^>]*\\bid=["']${id}["'][^>]*>`, 'i');
  const startMatch = idPattern.exec(html);
  if (!startMatch) return '';

  const tagName = startMatch[1];
  const startIndex = startMatch.index;
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startIndex;

  let depth = 0;
  let endIndex = html.length;
  let token = tokenPattern.exec(html);

  while (token) {
    const tokenValue = token[0];
    const isClosing = tokenValue.startsWith('</');
    const selfClosing = tokenValue.endsWith('/>');

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        endIndex = tokenPattern.lastIndex;
        break;
      }
    } else if (!selfClosing) {
      depth += 1;
    }

    token = tokenPattern.exec(html);
  }

  return html.slice(startIndex, endIndex);
}

function extractClassBlock(html: string, className: string): string {
  const classPattern = new RegExp(
    `<([a-z0-9]+)[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`,
    'i'
  );
  const classMatch = classPattern.exec(html);
  if (!classMatch) return '';

  const tagName = classMatch[1];
  const startIndex = classMatch.index;
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startIndex;

  let depth = 0;
  let endIndex = html.length;
  let token = tokenPattern.exec(html);

  while (token) {
    const tokenValue = token[0];
    const isClosing = tokenValue.startsWith('</');
    const selfClosing = tokenValue.endsWith('/>');

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        endIndex = tokenPattern.lastIndex;
        break;
      }
    } else if (!selfClosing) {
      depth += 1;
    }

    token = tokenPattern.exec(html);
  }

  return html.slice(startIndex, endIndex);
}

function getAttr(tagHtml: string, attr: string): string {
  const match = new RegExp(`\\b${attr}=(['"])(.*?)\\1`, 'i').exec(tagHtml);
  return match?.[2] ?? '';
}

function deriveSlugFromUrl(rawUrl: string): string {
  const normalized = normalizeUrl(rawUrl);
  const url = new URL(normalized);

  const searchPath = url.search.startsWith('?/') ? url.search.slice(2) : '';
  const pathnamePath = url.pathname
    .replace(/\/index\.php$/i, '')
    .replace(/^\/+portfolio\//i, '')
    .replace(/^\/+|\/+$/g, '');

  const route = (searchPath || pathnamePath)
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  if (route.length === 0) {
    throw new Error(`Could not derive slug from URL: ${rawUrl}`);
  }

  let candidate = route[route.length - 1];
  if (/^\d+$/.test(candidate) && route.length >= 3) {
    candidate = route[route.length - 2];
  }

  if (candidate === 'index.php') {
    throw new Error(`Could not derive slug from URL: ${rawUrl}`);
  }

  return candidate;
}

function parseNavigation(indexHtml: string): NavProject[] {
  const menuBlock = extractIdBlock(indexHtml, 'menu');
  const container = extractClassBlock(menuBlock, 'container');
  const ulMatches = Array.from(container.matchAll(/<ul\b[^>]*>[\s\S]*?<\/ul>/gi)).map(match => match[0]);

  const projects: NavProject[] = [];

  for (const ulHtml of ulMatches) {
    const liMatches = Array.from(ulHtml.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)).map(match => match[0]);

    let category = '';
    let order = 0;

    for (const liHtml of liMatches) {
      if (/\bsection-title\b/i.test(liHtml)) {
        category = stripTags(liHtml);
        order = 0;
        continue;
      }

      const linkMatch = /<a\b[^>]*>[\s\S]*?<\/a>/i.exec(liHtml);
      if (!linkMatch || category.length === 0) continue;

      const href = getAttr(linkMatch[0], 'href');
      if (!href) continue;

      const absoluteUrl = normalizeUrl(href);
      const slug = deriveSlugFromUrl(absoluteUrl);

      if (slug === 'about-this-site') continue;

      order += 1;
      projects.push({
        category,
        name: stripTags(linkMatch[0]),
        url: absoluteUrl,
        slug,
        order,
      });
    }
  }

  return projects;
}

function parseTitle(contentContainerHtml: string, fallback: string): string {
  const h1s = Array.from(contentContainerHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)).map(match =>
    stripTags(match[1])
  );
  const uniqueTitles = Array.from(new Set(h1s.filter(Boolean)));
  if (uniqueTitles.length === 0) return fallback;
  return uniqueTitles[0];
}

function parseDescriptionHtml(contentContainerHtml: string): string {
  const paragraphs = Array.from(contentContainerHtml.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)).map(match =>
    match[0].trim()
  );
  return paragraphs.join('');
}

function parseInlineImages(contentContainerHtml: string): InlineImage[] {
  const imgContainer = extractIdBlock(contentContainerHtml, 'img-container');
  const source = imgContainer.length > 0 ? contentContainerHtml.replace(imgContainer, '') : contentContainerHtml;

  const paragraphMatches = Array.from(source.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)).map(match => match[0]);
  const images: InlineImage[] = [];

  const imgMatches = Array.from(source.matchAll(/<img\b[^>]*>/gi));
  for (const imgMatch of imgMatches) {
    const imgTag = imgMatch[0];
    const rawSrc = getAttr(imgTag, 'src');
    if (!rawSrc) continue;

    const normalizedSrc = normalizeUrl(rawSrc);
    const fileName = basename(new URL(normalizedSrc).pathname);

    let caption = '';
    const inParagraph = paragraphMatches.find(paragraph => paragraph.includes(imgTag));
    if (inParagraph) {
      caption = stripTags(inParagraph.replace(imgTag, ''));
    } else {
      const rest = source.slice(imgMatch.index + imgTag.length);
      const rawCaption = rest.split('<', 1)[0] ?? '';
      caption = stripTags(rawCaption);
    }

    images.push({ src: fileName, caption });
  }

  return images;
}

function parseGalleryImages(contentHtml: string): string[] {
  const galleryBlock = extractIdBlock(contentHtml, 'img-container');
  if (!galleryBlock) return [];

  const links = Array.from(
    galleryBlock.matchAll(/<a\b[^>]*\bclass=(['"])[^'"]*\bthickbox\b[^'"]*\1[^>]*>/gi)
  ).map(match => match[0]);

  if (links.length > 0) {
    return links
      .map(link => getAttr(link, 'href'))
      .filter(Boolean)
      .map(href => normalizeUrl(href))
      .map(url => basename(new URL(url).pathname));
  }

  const images = Array.from(galleryBlock.matchAll(/<img\b[^>]*>/gi)).map(match => match[0]);
  const seen = new Set<string>();

  for (const image of images) {
    const src = getAttr(image, 'src');
    if (!src) continue;
    const fileName = basename(new URL(normalizeUrl(src)).pathname);
    if (fileName.length === 0) continue;
    seen.add(fileName);
  }

  return Array.from(seen);
}

function parseVimeoIds(contentHtml: string): string[] {
  const iframes = Array.from(contentHtml.matchAll(/<iframe\b[^>]*>/gi)).map(match => match[0]);
  const ids = new Set<string>();

  for (const iframe of iframes) {
    const src = decodeHtmlEntities(getAttr(iframe, 'src'));
    if (!src || !/vimeo/i.test(src)) continue;

    const normalizedSrc = normalizeUrl(src);
    const match = /player\.vimeo\.com\/video\/(\d+)/i.exec(normalizedSrc);
    if (match) ids.add(match[1]);
  }

  return Array.from(ids);
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ycn-portfolio-scraper/1.0; +https://ycnam.github.io)',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
}

async function run(): Promise<void> {
  console.log('Fetching index page...');
  const indexHtml = await fetchHtml(BASE_URL);
  const navProjects = parseNavigation(indexHtml);

  const uniqueProjects = navProjects.filter(
    (project, index, array) => array.findIndex(other => other.slug === project.slug) === index
  );

  console.log(`Discovered ${uniqueProjects.length} project links from sidebar.`);

  const results: WorkData[] = [];

  for (let index = 0; index < uniqueProjects.length; index += 1) {
    const project = uniqueProjects[index];
    console.log(`[${index + 1}/${uniqueProjects.length}] Scraping ${project.slug}`);

    try {
      const html = await fetchHtml(project.url);
      const contentBlock = extractIdBlock(html, 'content');
      const container = extractClassBlock(contentBlock, 'container');

      if (!container) {
        throw new Error(`Missing #content .container for ${project.slug}`);
      }

      const entry: WorkData = {
        slug: project.slug,
        title: parseTitle(container, project.name),
        category: project.category,
        descriptionHtml: parseDescriptionHtml(container),
        inlineImages: parseInlineImages(container),
        galleryImages: parseGalleryImages(contentBlock),
        vimeoIds: parseVimeoIds(contentBlock),
        order: project.order,
      };

      results.push(entry);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to parse ${project.slug}: ${message}`);
    }

    if (index < uniqueProjects.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  if (results.length !== 26) {
    throw new Error(`Expected 26 projects, but scraped ${results.length}.`);
  }

  await mkdir('scripts/output', { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

  console.log(`Saved ${results.length} entries to ${OUTPUT_PATH}`);
}

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
