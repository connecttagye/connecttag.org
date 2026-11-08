/**
 * Connect Tag - Automated SEO, RSS 2.0 Feed, Image Sitemap & GEO (LLMs-Full) Generator
 * Compliant with Google Search Central (2026), Google Discover, W3C RSS 2.0, and llmstxt.org.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../');
const configPath = path.join(__dirname, 'version.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const TODAY = config.last_updated || '2026-11-08';

function xmlEscape(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function stripTags(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function toRfc822Date(isoDate, indexOffset = 0) {
    const d = new Date(`${isoDate || TODAY}T09:00:00+03:00`);
    if (isNaN(d.getTime())) {
        return 'Sun, 08 Nov 2026 09:00:00 +0300';
    }
    // Subtract a few minutes per index so feed items on the same day have strictly descending timestamps
    d.setMinutes(d.getMinutes() - (indexOffset % 50));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = n => String(n).padStart(2, '0');
    // Convert to UTC+3 components
    const utcMs = d.getTime() + (d.getTimezoneOffset() * 60000);
    const local = new Date(utcMs + (3 * 3600000));
    return `${days[local.getDay()]}, ${pad(local.getDate())} ${months[local.getMonth()]} ${local.getFullYear()} ${pad(local.getHours())}:${pad(local.getMinutes())}:00 +0300`;
}

// 1. Parse blog/index.html to get the canonical order of all blog articles
const blogIndexPath = path.join(ROOT_DIR, 'blog', 'index.html');
const blogIndexContent = fs.readFileSync(blogIndexPath, 'utf8');
const cardSlugRegex = /href="https:\/\/connecttag\.org\/blog\/([a-z0-9-]+)"/g;
const orderedSlugs = [];
let m;
while ((m = cardSlugRegex.exec(blogIndexContent)) !== null) {
    const slug = m[1];
    if (slug && slug !== 'authors' && !orderedSlugs.includes(slug)) {
        orderedSlugs.push(slug);
    }
}

// Also pick up any blog/*.html files not yet in orderedSlugs
const blogDir = path.join(ROOT_DIR, 'blog');
fs.readdirSync(blogDir).forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html') {
        const slug = file.replace(/\.html$/, '');
        if (!orderedSlugs.includes(slug)) {
            orderedSlugs.push(slug);
        }
    }
});

// 2. Extract metadata from each blog article & ensure Google Discover / RSS meta tags are present
const ROBOTS_META = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';
const RSS_LINK_TAG = '<link rel="alternate" type="application/rss+xml" title="مدونة كونكت تاق التقنية (RSS)" href="https://connecttag.org/feed.xml">';

function ensureHeadSeoTags(filePath, includeRssLink = true) {
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (!/meta\s+name=["']robots["']/i.test(html)) {
        html = html.replace(/(<link\s+rel=["']canonical["'][^>]*>)/i, `$1\n  ${ROBOTS_META}`);
        modified = true;
    }
    if (includeRssLink && !/application\/rss\+xml/i.test(html)) {
        html = html.replace(/(<link\s+rel=["']canonical["'][^>]*>)/i, `$1\n  ${RSS_LINK_TAG}`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, html, 'utf8');
    }
}

ensureHeadSeoTags(path.join(ROOT_DIR, 'index.html'), true);
ensureHeadSeoTags(blogIndexPath, true);
ensureHeadSeoTags(path.join(ROOT_DIR, 'tools', 'index.html'), true);
ensureHeadSeoTags(path.join(ROOT_DIR, 'company', 'projects', 'apps', 'index.html'), true);
ensureHeadSeoTags(path.join(ROOT_DIR, 'company', 'projects', 'libraries', 'index.html'), true);

const articles = [];

orderedSlugs.forEach((slug, idx) => {
    const filePath = path.join(blogDir, `${slug}.html`);
    if (!fs.existsSync(filePath)) return;

    ensureHeadSeoTags(filePath, true);
    const html = fs.readFileSync(filePath, 'utf8');

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) || html.match(/"author"\s*:\s*\{\s*"@type"\s*:\s*"(?:Person|Organization)"\s*,\s*"name"\s*:\s*"([^"]+)"/);
    const pubMatch = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    const modMatch = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    const catMatch = html.match(/<site-article-meta[\s\S]*?category="([^"]+)"/);
    const subcatMatch = html.match(/<site-article-meta[\s\S]*?subcategory="([^"]+)"/);

    const title = h1Match ? stripTags(h1Match[1]) : (titleMatch ? titleMatch[1].trim() : slug);
    const description = descMatch ? descMatch[1].trim() : title;
    const rawImage = imgMatch ? imgMatch[1].trim() : '';
    const cleanImage = rawImage.split('?')[0];
    const author = authorMatch ? authorMatch[1].trim() : 'فريق كونكت تاق';
    const datePublished = pubMatch ? pubMatch[1] : TODAY;
    const dateModified = modMatch ? modMatch[1] : datePublished;
    const category = catMatch ? catMatch[1].trim() : 'برمجة وتطوير';
    const subcategory = subcatMatch ? subcatMatch[1].trim() : '';

    // Get image size in bytes for RSS <enclosure>
    let imageBytes = 45000;
    if (cleanImage.startsWith('https://connecttag.org/')) {
        const relImg = cleanImage.replace('https://connecttag.org/', '');
        const localImgPath = path.join(ROOT_DIR, relImg);
        if (fs.existsSync(localImgPath)) {
            imageBytes = fs.statSync(localImgPath).size;
        }
    }

    articles.push({
        slug,
        url: `https://connecttag.org/blog/${slug}`,
        title,
        description,
        image: cleanImage,
        imageBytes,
        author,
        datePublished,
        dateModified,
        category,
        subcategory,
        rfc822Date: toRfc822Date(dateModified, idx)
    });
});

// 3. Generate feed.xml (RSS 2.0 + Atom + Dublin Core + Media RSS)
const rssItemsXml = articles.map(art => {
    const cats = [art.category, art.subcategory].filter(Boolean)
        .map(c => `      <category>${xmlEscape(c)}</category>`).join('\n');
    const mediaTag = art.image
        ? `      <enclosure url="${xmlEscape(art.image)}" length="${art.imageBytes}" type="image/webp" />\n      <media:content url="${xmlEscape(art.image)}" medium="image" type="image/webp" width="1200" height="669" />`
        : '';
    return `    <item>
      <title>${xmlEscape(art.title)}</title>
      <link>${xmlEscape(art.url)}</link>
      <guid isPermaLink="true">${xmlEscape(art.url)}</guid>
      <pubDate>${art.rfc822Date}</pubDate>
      <dc:creator>${xmlEscape(art.author)}</dc:creator>
${cats}
      <description>${xmlEscape(art.description)}</description>
${mediaTag}
    </item>`;
}).join('\n');

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>مدونة كونكت تاق التقنية | Connect Tag Engineering Blog</title>
    <link>https://connecttag.org/blog/</link>
    <description>أدلة هندسية ومقالات تقنية متخصصة في برمجة تطبيقات الأندرويد وKotlin Multiplatform، الأمن السيبراني، الشبكات والاتصالات في اليمن، إدارة الخوادم، والتسويق الرقمي.</description>
    <language>ar</language>
    <lastBuildDate>${toRfc822Date(TODAY, 0)}</lastBuildDate>
    <atom:link href="https://connecttag.org/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://connecttag.org/assets/img/connect-tag-official-logo.webp</url>
      <title>مدونة كونكت تاق التقنية | Connect Tag</title>
      <link>https://connecttag.org/blog/</link>
    </image>
${rssItemsXml}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(ROOT_DIR, 'feed.xml'), feedXml, 'utf8');
console.log(`Generated feed.xml with ${articles.length} articles.`);

// 4. Upgrade sitemap.xml with Image Sitemap (xmlns:image) and accurate <lastmod>
const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
const rawSitemap = fs.readFileSync(sitemapPath, 'utf8');

function resolveUrlToLocalHtml(locUrl) {
    const rel = locUrl.replace(/^https:\/\/connecttag\.org\/?/, '');
    if (!rel) return path.join(ROOT_DIR, 'index.html');
    if (rel.endsWith('/')) {
        return path.join(ROOT_DIR, rel, 'index.html');
    }
    const asHtml = path.join(ROOT_DIR, `${rel}.html`);
    if (fs.existsSync(asHtml)) return asHtml;
    const asIndex = path.join(ROOT_DIR, rel, 'index.html');
    if (fs.existsSync(asIndex)) return asIndex;
    return null;
}

const articleMap = new Map(articles.map(a => [a.url, a]));
const urlBlocks = rawSitemap.match(/<url>[\s\S]*?<\/url>/g) || [];
const seenLocs = new Set();
const newUrlBlocks = [];
let imageCount = 0;

urlBlocks.forEach(block => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) return;
    const loc = locMatch[1].trim();
    if (seenLocs.has(loc)) return;
    seenLocs.add(loc);

    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    const freqMatch = block.match(/<changefreq>([^<]+)<\/changefreq>/);
    const prioMatch = block.match(/<priority>([^<]+)<\/priority>/);

    let lastmod = lastmodMatch ? lastmodMatch[1].trim() : TODAY;
    const changefreq = freqMatch ? freqMatch[1].trim() : 'monthly';
    const priority = prioMatch ? prioMatch[1].trim() : '0.8';

    let imageUrl = '';
    let imageTitle = '';

    if (articleMap.has(loc)) {
        const art = articleMap.get(loc);
        lastmod = art.dateModified;
        imageUrl = art.image;
        imageTitle = art.title;
    } else {
        if (
            loc === 'https://connecttag.org/' ||
            loc === 'https://connecttag.org/blog/' ||
            loc === 'https://connecttag.org/blog/authors/' ||
            loc.startsWith('https://connecttag.org/blog/authors/')
        ) {
            lastmod = TODAY;
        }
        const localHtml = resolveUrlToLocalHtml(loc);
        if (localHtml && fs.existsSync(localHtml)) {
            const html = fs.readFileSync(localHtml, 'utf8');
            const imgM = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
            const titleM = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i);
            if (imgM && imgM[1].startsWith('https://connecttag.org/')) {
                const candidateImg = imgM[1].split('?')[0].trim();
                const relImgPath = path.join(ROOT_DIR, candidateImg.replace('https://connecttag.org/', ''));
                if (fs.existsSync(relImgPath)) {
                    imageUrl = candidateImg;
                    imageTitle = titleM ? stripTags(titleM[1]) : '';
                }
            }
        }
    }

    let imageXml = '';
    if (imageUrl) {
        imageCount++;
        imageXml = `\n    <image:image>\n      <image:loc>${xmlEscape(imageUrl)}</image:loc>${imageTitle ? `\n      <image:title>${xmlEscape(imageTitle)}</image:title>` : ''}\n    </image:image>`;
    }

    newUrlBlocks.push(`  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`);
});

const updatedSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${newUrlBlocks.join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, updatedSitemap, 'utf8');
console.log(`Updated sitemap.xml (${newUrlBlocks.length} URLs, ${imageCount} enriched with <image:image>).`);

// 5. Extract Tools from tools/index.html
const toolsIndexPath = path.join(ROOT_DIR, 'tools', 'index.html');
const toolsHtml = fs.readFileSync(toolsIndexPath, 'utf8');
const toolCardRegex = /<div class="tool-card">[\s\S]*?<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>\s*<a href="([^"]+)"/g;
const toolsList = [];
while ((m = toolCardRegex.exec(toolsHtml)) !== null) {
    toolsList.push({
        name: m[1].trim(),
        description: m[2].trim(),
        url: m[3].trim()
    });
}

// Update tools/index.html JSON-LD with ItemList if not already present
const toolsSchemaObj = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "CollectionPage",
            "name": "الأدوات الرقمية والهندسية المجانية - كونكت تاق",
            "description": "مجموعة من الأدوات والحلول التقنية المساعدة، بما في ذلك دليل المودمات، فحص IMEI، حاسبة الزكاة، وأدوات المطورين والأمن السيبراني.",
            "url": "https://connecttag.org/tools/",
            "inLanguage": "ar",
            "publisher": {
                "@type": "Organization",
                "name": "كونكت تاق",
                "url": "https://connecttag.org",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://connecttag.org/assets/img/connect-tag-official-logo.webp"
                }
            },
            "image": "https://connecttag.org/assets/img/covers/all-tools-hub-cover.webp"
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "https://connecttag.org/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "الأدوات",
                    "item": "https://connecttag.org/tools/"
                }
            ]
        },
        {
            "@type": "ItemList",
            "name": "أدوات كونكت تاق الرقمية المجانية",
            "numberOfItems": toolsList.length,
            "itemListElement": toolsList.map((t, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": t.name,
                "description": t.description,
                "url": t.url
            }))
        }
    ]
};

const updatedToolsHtml = toolsHtml.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(toolsSchemaObj, null, 4)}\n  </script>`
);
if (updatedToolsHtml !== toolsHtml) {
    fs.writeFileSync(toolsIndexPath, updatedToolsHtml, 'utf8');
    console.log(`Updated tools/index.html JSON-LD with ${toolsList.length} tools in ItemList.`);
}

// 6. Extract Libraries from company/projects/libraries/index.html
const libsIndexPath = path.join(ROOT_DIR, 'company', 'projects', 'libraries', 'index.html');
const libsHtml = fs.readFileSync(libsIndexPath, 'utf8');
const libCardRegex = /<div class="lib-card">[\s\S]*?<span class="badge-lang[^"]*"><i[^>]*><\/i>\s*([^<]+)<\/span>\s*<span class="badge-category">([^<]+)<\/span>[\s\S]*?<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/g;
const libsList = [];
while ((m = libCardRegex.exec(libsHtml)) !== null) {
    libsList.push({
        lang: m[1].trim(),
        category: m[2].trim(),
        name: m[3].trim(),
        description: m[4].trim(),
        url: `https://connecttag.org/company/projects/libraries/#${m[3].trim()}`
    });
}

const libsSchemaObj = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "CollectionPage",
            "name": "المكاتب البرمجية المفتوحة المصدر - كونكت تاق",
            "description": "تصفح مكاتب كونكت تاق البرمجية المفتوحة المصدر متعددة المنصات (Kotlin Multiplatform، Compose، Python، PHP) للخرائط، الشبكات، التشفير، ومعمارية MVI.",
            "url": "https://connecttag.org/company/projects/libraries/",
            "inLanguage": "ar",
            "publisher": {
                "@type": "Organization",
                "name": "كونكت تاق",
                "url": "https://connecttag.org",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://connecttag.org/assets/img/connect-tag-official-logo.webp"
                }
            },
            "image": "https://connecttag.org/assets/img/covers/projects-libraries-cover.webp"
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "https://connecttag.org/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "الشركة",
                    "item": "https://connecttag.org/company/"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "أعمالنا",
                    "item": "https://connecttag.org/company/projects/"
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": "المكاتب البرمجية",
                    "item": "https://connecttag.org/company/projects/libraries/"
                }
            ]
        },
        {
            "@type": "ItemList",
            "name": "مكاتب كونكت تاق البرمجية مفتوحة المصدر",
            "numberOfItems": libsList.length,
            "itemListElement": libsList.map((lib, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": `${lib.name} (${lib.lang})`,
                "description": lib.description,
                "url": "https://connecttag.org/company/projects/libraries/"
            }))
        }
    ]
};

const updatedLibsHtml = libsHtml.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(libsSchemaObj, null, 2)}\n  </script>`
);
if (updatedLibsHtml !== libsHtml) {
    fs.writeFileSync(libsIndexPath, updatedLibsHtml, 'utf8');
    console.log(`Updated company/projects/libraries/index.html JSON-LD with ${libsList.length} libraries.`);
}

// 7. Update blog/index.html JSON-LD with CollectionPage + ItemList
const currentBlogIndex = fs.readFileSync(blogIndexPath, 'utf8');
const blogIndexSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["Blog", "CollectionPage"],
            "@id": "https://connecttag.org/blog/#blog",
            "name": "مدونة كونكت تاق التقنية",
            "description": "مقالات وأدلة هندسية متخصصة في تطوير تطبيقات الأندرويد وKotlin Multiplatform، الأمن السيبراني، إدارة الخوادم، وخدمات الاتصالات والإنترنت في اليمن من فريق كونكت تاق.",
            "url": "https://connecttag.org/blog/",
            "inLanguage": "ar",
            "publisher": {
                "@type": "Organization",
                "name": "كونكت تاق",
                "url": "https://connecttag.org",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://connecttag.org/assets/img/connect-tag-official-logo.webp"
                }
            },
            "image": "https://connecttag.org/assets/img/covers/blog-tech-cover.webp"
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "https://connecttag.org/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "المدونة",
                    "item": "https://connecttag.org/blog/"
                }
            ]
        },
        {
            "@type": "ItemList",
            "name": "أحدث الأدلة الهندسية والمقالات التقنية في مدونة كونكت تاق",
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": articles.length,
            "itemListElement": articles.slice(0, 25).map((art, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": art.title,
                "url": art.url
            }))
        }
    ]
};

const updatedBlogIndex = currentBlogIndex.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(blogIndexSchema, null, 4)}\n  </script>`
);
if (updatedBlogIndex !== currentBlogIndex) {
    fs.writeFileSync(blogIndexPath, updatedBlogIndex, 'utf8');
    console.log('Updated blog/index.html JSON-LD with CollectionPage and ItemList.');
}

// 8. Ensure WebSite schema exists in index.html for Google Site Name in SERPs
const homeIndexPath = path.join(ROOT_DIR, 'index.html');
let homeHtml = fs.readFileSync(homeIndexPath, 'utf8');
if (!homeHtml.includes('"@type": "WebSite"')) {
    const websiteSchemaBlock = `  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://connecttag.org/#website",
      "name": "كونكت تاق",
      "alternateName": ["Connect Tag", "كونكت تاق لتقنية المعلومات", "connecttag.org"],
      "url": "https://connecttag.org/",
      "inLanguage": "ar",
      "publisher": {
        "@type": "Organization",
        "name": "كونكت تاق - Connect Tag",
        "url": "https://connecttag.org/"
      }
    }
  </script>\n`;
    homeHtml = homeHtml.replace('<!-- Schema.org Structured Data -->', `<!-- Schema.org Structured Data -->\n${websiteSchemaBlock}`);
    fs.writeFileSync(homeIndexPath, homeHtml, 'utf8');
    console.log('Added WebSite JSON-LD schema to index.html.');
}

// 9. Extract Apps from company/projects/apps/index.html and generate llms-full.txt
const appsIndexPath = path.join(ROOT_DIR, 'company', 'projects', 'apps', 'index.html');
const appsHtml = fs.readFileSync(appsIndexPath, 'utf8');
const appsJsonLdMatch = appsHtml.match(/<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/);
let appsList = [];
if (appsJsonLdMatch) {
    try {
        const parsedApps = JSON.parse(appsJsonLdMatch[1]);
        if (parsedApps.itemListElement) {
            appsList = parsedApps.itemListElement;
        }
    } catch (e) {}
}

// Group articles by category for llms-full.txt
const articlesByCategory = {};
articles.forEach(art => {
    if (!articlesByCategory[art.category]) {
        articlesByCategory[art.category] = [];
    }
    articlesByCategory[art.category].push(art);
});

const categorySections = Object.entries(articlesByCategory).map(([cat, list]) => {
    const lines = list.map(a => `- **[${a.title}](${a.url})** *(الكاتب: ${a.author} | التصنيف الفرعي: ${a.subcategory || cat} | التحديث: ${a.dateModified})*: ${a.description}`).join('\n');
    return `### ${cat} (${list.length} أدلة)\n${lines}`;
}).join('\n\n');

const llmsFullContent = `# Connect Tag (كونكت تاق) — Comprehensive AI & LLM Technical Knowledge Base (llms-full.txt)

> **Connect Tag (كونكت تاق لتقنية المعلومات)** is a Yemen-based software engineering, cybersecurity, cloud infrastructure, and telecommunications intelligence company (Sana'a, Yemen — https://connecttag.org).
> This file (\`llms-full.txt\`) provides the complete, authoritative structured reference of all Connect Tag web tools, mobile/desktop applications, open-source multiplatform libraries, and ${articles.length} peer-reviewed Arabic engineering guides.
>
> - **Concise Summary Index**: [https://connecttag.org/llms.txt](https://connecttag.org/llms.txt)
> - **XML Sitemap (with Image Sitemap)**: [https://connecttag.org/sitemap.xml](https://connecttag.org/sitemap.xml)
> - **RSS 2.0 Syndication Feed**: [https://connecttag.org/feed.xml](https://connecttag.org/feed.xml)

---

## 1. Core Engineering & Enterprise Services (https://connecttag.org/company/services/)
- **[تطوير المواقع والتطبيقات والأنظمة (Web & Multiplatform App Development)](https://connecttag.org/company/services/web-app-development)**: Native Android (Kotlin & Jetpack Compose), Cross-Platform (Kotlin Multiplatform - KMP & Compose Multiplatform for Android/iOS/Desktop/Web), Progressive Web Apps (PWA), and Enterprise ERP/POS systems.
- **[الحلول الأمنية والأمن السيبراني (Cybersecurity & Infrastructure Hardening)](https://connecttag.org/company/services/cybersecurity-solutions)**: Mobile app protection (Play Integrity API, R8, NDK, SSL Pinning), Windows Server IIS & Linux hardening, Cloudflare WAF rules, NGFW/UTM firewalls, WireGuard VPN tunnels, and Digital Forensics (DFIR).
- **[ذكاء وبيانات شبكات الاتصالات (Telecom Intelligence & Signal Engineering)](https://connecttag.org/company/services/telecom-intelligence)**: Cellular tower survey (CGI/ECGI, MCC 421, MNC, TAC/LAC, Cell-ID, PCI), 4G LTE RSRP/SINR optimization, CPE modem diagnostics, and ITU-T E.164 numbering systems.
- **[الاستضافة السحابية وإدارة الخوادم (Cloud Hosting & Server Management)](https://connecttag.org/company/services/hosting-services)**: High-availability NVMe VPS/Dedicated servers, Cloudflare Edge deployment, and automated backup architectures.
- **[واجهات برمجة التطبيقات والربط البرمجي (API Solutions & Webhook Automation)](https://connecttag.org/company/services/api-solutions)**: RESTful/GraphQL API engineering, Telegram Bot Webhook infrastructure, and payment/ERP integrations.
- **[التسويق الرقمي وتصدر محركات البحث (Digital Marketing, Technical SEO & AdSense/AdMob)](https://connecttag.org/company/services/digital-marketing)**: Technical SEO auditing, Google Search Essentials & E-E-A-T compliance, Google Business Profile verification ([Local SEO](https://connecttag.org/company/services/local-seo)), and AdSense/AdMob policy optimization.
- **[التصميم الإبداعي والهوية البصرية (Brand Identity & UI/UX Design)](https://connecttag.org/company/services/creative-design)**: Vector logo engineering, WCAG 2.2 accessible UI color systems, and design systems.

---

## 2. Free Interactive Web Tools (${toolsList.length} Client-Side Utilities — https://connecttag.org/tools/)
All Connect Tag web tools execute 100% locally in the user's browser (Zero Server-Side Data Retention):
${toolsList.map(t => `- **[${t.name}](${t.url})**: ${t.description}`).join('\n')}

---

## 3. Applications & Software Portfolio (${appsList.length} Apps — https://connecttag.org/company/projects/apps/)
${appsList.map(a => `- **[${a.name}](${a.url})**`).join('\n')}

---

## 4. Open-Source Software Libraries (${libsList.length} KMP, Python & PHP Libraries — https://connecttag.org/company/projects/libraries/)
${libsList.map(l => `- **\`${l.name}\`** *(${l.lang} — ${l.category})*: ${l.description}`).join('\n')}

---

## 5. Complete Engineering Blog & Technical Guides (${articles.length} In-Depth Articles — https://connecttag.org/blog/)

${categorySections}

---

## 6. Editorial & Engineering Team (https://connecttag.org/blog/authors/)
- **[م. عقيل محمد (Aqel Mohammed)](https://connecttag.org/blog/authors/aqeldev)**: مهندس برمجيات أول وباحث في الأمن السيبراني (Senior Software Engineer & Cybersecurity Researcher — KMP, Android Security, IIS, Cloudflare WAF).
- **[أ. بسمة شرف (Basma Sharaf)](https://connecttag.org/blog/authors/basma)**: كاتبة ومحرتة تقنية متخصصة في قطاع الاتصالات وخدمات الإنترنت في اليمن (Telecom, Yemen 4G, Modems, GNSS & Hardware Diagnostics).
- **[أ. علي الرحبي (Ali Al-Rahbi)](https://connecttag.org/blog/authors/ali)**: كاتب ومحرر تقني متخصص في التحول الرقمي والفحص التقني للمواقع وهندسة البرمجيات (Technical SEO, Jetpack Compose, KMP MVI, PWA, JWT, Deep Links, Telegram Bots).
- **[م. محمد حميد (Mohammed Hameed)](https://connecttag.org/blog/authors/mohammed-hameed)**: مهندس شبكات وأمن بنية تحتية (Network Infrastructure & Routing Security — WireGuard VPN, Android Firewalls, LTE RSRP/SINR, Cell-ID/E.164, Public Wi-Fi Security).
- **[أ. كيان الرحبي (Kayan Al-Rahbi)](https://connecttag.org/blog/authors/kayan)**: مختصة في الأمن السيبراني والتحقيق الجنائي الرقمي (DFIR, APK Reverse Engineering, NAND Flash & FBE Cryptographic Erasure).
- **[أ. مريم اليمني (Mariam Al-Yamani)](https://connecttag.org/blog/authors/mariam)**: باحثة في الأمن السيبراني والخصوصية الرقمية ومكافحة التصيد والاحتيال المالي.
- **[أ. ريم محمد (Reem Mohammed)](https://connecttag.org/blog/authors/reem)**: مختصة في التصميم الجرافيكي وبناء الهوية البصرية وأنظمة الألوان (UI/UX & WCAG Contrast).
- **[أ. جود محمد (Jood Mohammed)](https://connecttag.org/blog/authors/jood)**: مختصة في التسويق الرقمي، تحسين أداء الصور (WebP/AVIF & Core Web Vitals)، وسياسات Google AdSense.
- **[أ. محمد شرف (Mohammed Sharaf)](https://connecttag.org/blog/authors/mohammed)**: مختص في الأنظمة المحاسبية وتقنيات الأعمال (Double-Entry Accounting, WAC/FIFO Inventory, AAOIFI Zakat Calculation).
- **[م. يوسف الرحبي (Yousef Al-Rahbi)](https://connecttag.org/blog/authors/yousef-alrahbi)**: مهندس أنظمة المراقبة المرئية والأمن المادي والشبكي (IP PoE CCTV, NVR Storage & VLAN Hardening).
- **[أ. يوسف محمد (Yousef Mohammed)](https://connecttag.org/blog/authors/yousef)**: مختص في الإعلام الرقمي، سياسات الإعلانات (AdMob/AdSense/GDPR CMP)، وامتثال متاجر التطبيقات.
- **[فريق كونكت تاق (Connect Tag Official Team)](https://connecttag.org/blog/authors/official)**: الفريق الهندسي والتحريري الرسمي في شركة كونكت تاق.

---

## 7. Official Contact & Verification Channels
- **Official Website**: https://connecttag.org
- **Support & Inquiries**: mailto:support@connecttag.org | mailto:info@connecttag.org
- **Security Disclosures (RFC 9116)**: https://connecttag.org/.well-known/security.txt
- **X (Twitter)**: https://x.com/connecttagye
- **GitHub**: https://github.com/connecttagye
- **Google Play Developer Page**: https://play.google.com/store/apps/dev?id=6507822077747485835
`;

fs.writeFileSync(path.join(ROOT_DIR, 'llms-full.txt'), llmsFullContent, 'utf8');
console.log('Generated llms-full.txt successfully.');

// 10. Ensure llms.txt has references to llms-full.txt, feed.xml, and sitemap.xml
const llmsPath = path.join(ROOT_DIR, 'llms.txt');
if (fs.existsSync(llmsPath)) {
    let llmsTxt = fs.readFileSync(llmsPath, 'utf8');
    if (!llmsTxt.includes('llms-full.txt')) {
        llmsTxt = llmsTxt.replace(
            /(> Official LLM & AI Grounding Index[^\r\n]*)/,
            `$1\n> - **Full Comprehensive Knowledge Base (\`llms-full.txt\`)**: [https://connecttag.org/llms-full.txt](https://connecttag.org/llms-full.txt)\n> - **RSS 2.0 Syndication Feed (\`feed.xml\`)**: [https://connecttag.org/feed.xml](https://connecttag.org/feed.xml)\n> - **XML & Image Sitemap (\`sitemap.xml\`)**: [https://connecttag.org/sitemap.xml](https://connecttag.org/sitemap.xml)`
        );
        fs.writeFileSync(llmsPath, llmsTxt, 'utf8');
        console.log('Updated llms.txt with pointers to llms-full.txt, feed.xml, and sitemap.xml.');
    }
}

// ============================================================================
// PHASE 2: On-Page & Internal PageRank Sculpting, Complete Schemas & Clusters
// ============================================================================

function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.idea', 'scripts'].includes(file)) {
                getAllHtmlFiles(fullPath, arrayOfFiles);
            }
        } else if (file.endsWith('.html')) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

// 11. 100% Indexable HTML Coverage for Google Discover robots meta & RSS autodiscovery
const allHtmlFiles = getAllHtmlFiles(ROOT_DIR);
let metaInjectedCount = 0;
allHtmlFiles.forEach(filePath => {
    const base = path.basename(filePath).toLowerCase();
    if (['404.html', 'offline.html', 'delete-data.html', 'account-deletion.html'].includes(base)) {
        return;
    }
    const before = fs.readFileSync(filePath, 'utf8');
    ensureHeadSeoTags(filePath, true);
    const after = fs.readFileSync(filePath, 'utf8');
    if (before !== after) metaInjectedCount++;
});
console.log(`Ensured Google Discover & RSS meta tags across all indexable HTML pages (${metaInjectedCount} newly updated).`);

// 12. Upgrade SoftwareApplication + BreadcrumbList JSON-LD across all 35 App Landing Pages
const appsRoot = path.join(ROOT_DIR, 'company', 'projects', 'apps');
let upgradedAppsCount = 0;
if (fs.existsSync(appsRoot)) {
    fs.readdirSync(appsRoot).forEach(appSlug => {
        const appIndex = path.join(appsRoot, appSlug, 'index.html');
        if (!fs.existsSync(appIndex) || !fs.statSync(path.join(appsRoot, appSlug)).isDirectory()) return;
        let html = fs.readFileSync(appIndex, 'utf8');

        const canonicalUrl = `https://connecttag.org/company/projects/apps/${appSlug}/`;
        const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        const cleanAppImg = ogImgMatch ? ogImgMatch[1].split('?')[0].trim() : 'https://connecttag.org/icon-512.png';
        const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const appDisplayTitle = h1Match ? stripTags(h1Match[1]) : appSlug;

        const ldMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
        if (ldMatch) {
            try {
                const parsed = JSON.parse(ldMatch[1]);
                let swApp = null;
                if (parsed['@type'] === 'SoftwareApplication') {
                    swApp = parsed;
                } else if (parsed['@graph']) {
                    swApp = parsed['@graph'].find(n => n['@type'] === 'SoftwareApplication');
                }
                if (swApp) {
                    delete swApp['@context'];
                    swApp.url = canonicalUrl;
                    swApp.image = cleanAppImg;
                    const unifiedGraph = {
                        "@context": "https://schema.org",
                        "@graph": [
                            swApp,
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://connecttag.org/" },
                                    { "@type": "ListItem", "position": 2, "name": "الشركة", "item": "https://connecttag.org/company/" },
                                    { "@type": "ListItem", "position": 3, "name": "أعمالنا", "item": "https://connecttag.org/company/projects/" },
                                    { "@type": "ListItem", "position": 4, "name": "التطبيقات", "item": "https://connecttag.org/company/projects/apps/" },
                                    { "@type": "ListItem", "position": 5, "name": appDisplayTitle, "item": canonicalUrl }
                                ]
                            }
                        ]
                    };
                    const newScript = `<script type="application/ld+json">\n${JSON.stringify(unifiedGraph, null, 2)}\n</script>`;
                    const updatedHtml = html.replace(ldMatch[0], newScript);
                    if (updatedHtml !== html) {
                        fs.writeFileSync(appIndex, updatedHtml, 'utf8');
                        upgradedAppsCount++;
                    }
                }
            } catch (e) {
                console.error(`Error parsing JSON-LD in app ${appSlug}:`, e.message);
            }
        }
    });
}
console.log(`Upgraded SoftwareApplication + BreadcrumbList JSON-LD in ${upgradedAppsCount} app pages.`);

// 13. Upgrade Service Pages (web-app-development.html & api-solutions.html)
const webAppDevPath = path.join(ROOT_DIR, 'company', 'services', 'web-app-development.html');
if (fs.existsSync(webAppDevPath)) {
    let wadHtml = fs.readFileSync(webAppDevPath, 'utf8');
    // Update visible FAQ #1 answer to include KMP, Jetpack Compose, Compose Multiplatform, and PWA alongside Flutter
    const oldFaqText = 'نعتمد بشكل أساسي على تقنية Flutter لتطوير تطبيقات تعمل على أندرويد وآيفون بكود واحد، كما نوفر تطوير التطبيقات الأصلية (Native) عند الحاجة لأداء فائق.';
    const newFaqText = 'نعتمد على أحدث التقنيات العالمية بما يشمل Kotlin Multiplatform (KMP) وJetpack Compose وCompose Multiplatform لبناء تطبيقات أصيلة عالية الأداء لأندرويد وiOS وسطح المكتب، بالإضافة إلى تقنية Flutter وتطبيقات الويب التقدمية (PWA) والتطوير الأصيل (Native).';
    wadHtml = wadHtml.split(oldFaqText).join(newFaqText);

    if (!wadHtml.includes('"@type": "Service"')) {
        const serviceAndBreadcrumbLd = `<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Service",
            "name": "تطوير المواقع وتطبيقات الهواتف والأنظمة المتعددة",
            "provider": {
                "@type": "Organization",
                "name": "كونكت تاق",
                "url": "https://connecttag.org"
            },
            "serviceType": "Web, Mobile & Multiplatform Software Development (KMP, Compose, Flutter, PWA)",
            "description": "تصميم وبرمجة تطبيقات الهواتف الذكية (Android & iOS) والأنظمة العابرة للمنصات باستخدام Kotlin Multiplatform وJetpack Compose وFlutter، وتطوير المواقع والمنصات السحابية.",
            "areaServed": "YE",
            "url": "https://connecttag.org/company/services/web-app-development",
            "image": "https://connecttag.org/assets/img/covers/web-app-dev-cover.webp"
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://connecttag.org/" },
                { "@type": "ListItem", "position": 2, "name": "الشركة", "item": "https://connecttag.org/company/" },
                { "@type": "ListItem", "position": 3, "name": "الخدمات", "item": "https://connecttag.org/company/services/" },
                { "@type": "ListItem", "position": 4, "name": "تطوير المواقع والتطبيقات", "item": "https://connecttag.org/company/services/web-app-development" }
            ]
        }
    ]
}
</script>\n`;
        wadHtml = wadHtml.replace('<script type="application/ld+json">', `${serviceAndBreadcrumbLd}<script type="application/ld+json">`);
    }
    fs.writeFileSync(webAppDevPath, wadHtml, 'utf8');
    console.log('Upgraded company/services/web-app-development.html with Service + BreadcrumbList schema and KMP/Compose FAQ.');
}

const apiSolPath = path.join(ROOT_DIR, 'company', 'services', 'api-solutions.html');
if (fs.existsSync(apiSolPath)) {
    let apiHtml = fs.readFileSync(apiSolPath, 'utf8');
    if (!apiHtml.includes('"@type": "Service"')) {
        const apiServiceLd = `  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "خدمات الـ API والربط البرمجي والبيانات المتقدمة",
  "provider": {
    "@type": "Organization",
    "name": "كونكت تاق",
    "url": "https://connecttag.org"
  },
  "serviceType": "API Engineering, Webhook Automation & Telecom Data APIs",
  "description": "اربط تطبيقاتك وأنظمتك بواجهات كونكت تاق البرمجية الموثوقة (التحقق من الأرقام ومكافحة الإزعاج، فحص IMEI، بيانات الأندرويد، وبوتات تيليجرام).",
  "areaServed": "YE",
  "url": "https://connecttag.org/company/services/api-solutions",
  "image": "https://connecttag.org/assets/img/covers/api-solutions-cover.webp"
}
  </script>\n`;
        apiHtml = apiHtml.replace('<script type="application/ld+json">', `${apiServiceLd}<script type="application/ld+json">`);
        fs.writeFileSync(apiSolPath, apiHtml, 'utf8');
        console.log('Added Service JSON-LD schema to company/services/api-solutions.html.');
    }
}

// 14. Author E-E-A-T Schema Enhancement: Add ItemList of authored articles to blog/authors/*.html
const authorsDir = path.join(ROOT_DIR, 'blog', 'authors');
let updatedAuthorsCount = 0;
if (fs.existsSync(authorsDir)) {
    fs.readdirSync(authorsDir).forEach(file => {
        if (!file.endsWith('.html') || file === 'index.html') return;
        const authorPath = path.join(authorsDir, file);
        let aHtml = fs.readFileSync(authorPath, 'utf8');

        // Extract articles listed in this author page
        const cardRegex = /<div class="blog-post-card"[\s\S]*?<h3[^>]*><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h3>/g;
        const authoredItems = [];
        let cm;
        while ((cm = cardRegex.exec(aHtml)) !== null) {
            authoredItems.push({
                url: cm[1].trim(),
                title: stripTags(cm[2])
            });
        }

        const ldMatch = aHtml.match(/<script type="application\/ld\+json">\s*(\[[\s\S]*?\])\s*<\/script>/);
        if (ldMatch && authoredItems.length > 0) {
            try {
                const arr = JSON.parse(ldMatch[1]);
                const filteredArr = arr.filter(item => item['@type'] !== 'ItemList');
                filteredArr.push({
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": `المقالات والأدلة المنشورة (${authoredItems.length})`,
                    "numberOfItems": authoredItems.length,
                    "itemListElement": authoredItems.map((it, idx) => ({
                        "@type": "ListItem",
                        "position": idx + 1,
                        "name": it.title,
                        "url": it.url
                    }))
                });
                const newLdScript = `<script type="application/ld+json">\n${JSON.stringify(filteredArr, null, 2)}\n  </script>`;
                const updatedAHtml = aHtml.replace(ldMatch[0], newLdScript);
                if (updatedAHtml !== aHtml) {
                    fs.writeFileSync(authorPath, updatedAHtml, 'utf8');
                    updatedAuthorsCount++;
                }
            } catch (e) {
                console.error(`Error updating author JSON-LD in ${file}:`, e.message);
            }
        }
    });
}
console.log(`Updated Author E-E-A-T ItemList JSON-LD across ${updatedAuthorsCount} author profile pages.`);

// 15. Bidirectional Topic Clusters: Inject Static Contextual Related Guides Box into Tools, Apps & Services
const articleLookup = new Map(articles.map(a => [a.slug, a]));

function renderRelatedGuidesSection(slugs, sectionTitle = 'أدلة وشروحات هندسية ذات صلة') {
    const validArticles = slugs.map(s => articleLookup.get(s)).filter(Boolean);
    if (validArticles.length === 0) return '';

    const cardsHtml = validArticles.map(art => `
        <div class="col-md-4 col-sm-6" style="margin-bottom: 20px; display: flex;">
          <a href="${art.url}" style="display: flex; flex-direction: column; justify-content: space-between; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 82, 204, 0.05); transition: transform 0.25s ease, box-shadow 0.25s ease;">
            <div>
              <span style="display: inline-block; background: #eff6ff; color: #0052cc; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px;"><i class="fa-solid fa-book-open" aria-hidden="true" style="margin-left: 4px;"></i> ${art.subcategory || art.category}</span>
              <h3 style="font-size: 15.5px; font-weight: 800; color: #1e293b; line-height: 1.55; margin: 0 0 10px;">${art.title}</h3>
            </div>
            <span style="font-size: 13px; font-weight: 700; color: #0052cc; display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;">اقرأ الدليل الهندسي <i class="fa-solid fa-arrow-left" aria-hidden="true"></i></span>
          </a>
        </div>`).join('');

    return `<!-- CT-RELATED-GUIDES-START -->
<section class="ct-related-guides" aria-label="${sectionTitle}" style="padding: 45px 0 35px; background: #f8fafc; border-top: 1px solid #e2e8f0; margin-top: 40px;">
  <div class="container">
    <div class="row">
      <div class="col-lg-12" style="text-align: right; margin-bottom: 24px;">
        <h2 style="font-size: 21px; font-weight: 800; color: #0f172a; margin: 0; border-right: 4px solid #0052cc; padding-right: 12px;">${sectionTitle}</h2>
      </div>
    </div>
    <div class="row" style="display: flex; flex-wrap: wrap;">${cardsHtml}
    </div>
  </div>
</section>
<!-- CT-RELATED-GUIDES-END -->`;
}

function injectOrUpdateRelatedGuides(relFilePath, slugs, title) {
    const fullPath = path.join(ROOT_DIR, relFilePath);
    if (!fs.existsSync(fullPath)) return false;
    let html = fs.readFileSync(fullPath, 'utf8');
    const block = renderRelatedGuidesSection(slugs, title);
    if (!block) return false;

    const markerRegex = /<!-- CT-RELATED-GUIDES-START -->[\s\S]*?<!-- CT-RELATED-GUIDES-END -->/;
    let updated = html;
    if (markerRegex.test(html)) {
        updated = html.replace(markerRegex, block);
    } else if (html.includes('</main>')) {
        updated = html.replace('</main>', `${block}\n</main>`);
    }
    if (updated !== html) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        return true;
    }
    return false;
}

const clusterMap = [
    // Tools -> Blog Guides
    ['tools/telecom/imei-checker/index.html', ['imei-number-check-guide', 'smartphone-hardware-battery-diagnostics-guide', 'best-yemen-4g-modem-buying-guide']],
    ['tools/telecom/modems/index.html', ['best-yemen-4g-modem-buying-guide', 'yemen-4g-modem-settings-security-guide', 'lte-wifi-signal-rsrp-sinr-guide']],
    ['tools/telecom/company/index.html', ['yemen-telecom-companies-codes-services-guide', 'yemen-internet-comparison-4g-adsl-fiber', 'yemen-telecom-ministry-guide']],
    ['tools/telecom/network-lookup/index.html', ['telecom-cell-id-mcc-mnc-e164-guide', 'yemen-telecom-companies-codes-services-guide', 'lte-wifi-signal-rsrp-sinr-guide']],
    ['tools/telecom/speed-test/index.html', ['lte-wifi-signal-rsrp-sinr-guide', 'yemen-internet-comparison-4g-adsl-fiber', 'yemen-4g-modem-settings-security-guide']],
    ['tools/telecom/emergency-numbers/index.html', ['offline-gps-yemen-emergency-guide', 'yemen-telecom-companies-codes-services-guide', 'yemen-telecom-ministry-guide']],
    ['tools/finance/zakat-calculator/index.html', ['zakat-calculation-accounting-guide', 'small-business-accounting-guide']],
    ['tools/finance/yemen-exchange/index.html', ['zakat-calculation-accounting-guide', 'small-business-accounting-guide']],
    ['tools/web/jwt-debugger/index.html', ['jwt-security-debugging-guide', 'api-security-guide', 'telegram-bot-webhook-security-guide']],
    ['tools/web/json-formatter/index.html', ['api-security-guide', 'jwt-security-debugging-guide', 'pwa-service-worker-offline-web-guide']],
    ['tools/web/site-checker/index.html', ['technical-seo-audit-guide', 'seo-article-writing-guide', 'pwa-service-worker-offline-web-guide']],
    ['tools/web/regex-tester/index.html', ['telecom-cell-id-mcc-mnc-e164-guide', 'api-security-guide', 'technical-seo-audit-guide']],
    ['tools/mobile/android-permissions/index.html', ['app-privacy-policy-play-store-guide', 'android-manifest-security-exported-components-guide', 'android-accessibility-security-guide']],
    ['tools/mobile/manifest-analyzer/index.html', ['android-manifest-security-exported-components-guide', 'android-deep-links-guide', 'google-play-integrity-api-android-security-guide']],
    ['tools/mobile/deep-link-generator/index.html', ['android-deep-links-guide', 'android-manifest-security-exported-components-guide', 'telegram-bot-webhook-security-guide']],
    ['tools/mobile/screenshot-generator/index.html', ['ui-color-palette-wcag-guide', 'image-optimization-webp-avif-guide', 'why-your-business-needs-app']],
    ['tools/security/crypto-toolbox/index.html', ['wireguard-vs-openvpn-ipsec-security-guide', 'jwt-security-debugging-guide', 'factory-reset-data-recovery-secure-erasure-guide']],
    ['tools/security/password-generator/index.html', ['whatsapp-telegram-hijacking-linked-devices-security-guide', 'website-security-simple-steps', 'yemen-4g-modem-settings-security-guide']],
    ['tools/security/password-breach-checker/index.html', ['whatsapp-telegram-hijacking-linked-devices-security-guide', 'phishing-links-fake-aid-ponzi-investment-scam-guide', 'website-security-simple-steps']],
    ['tools/security/privacy-generator/index.html', ['app-privacy-policy-play-store-guide', 'adsense-ad-serving-limit-invalid-traffic-ads-txt-guide', 'admob-ad-limit-policy-violations-app-ads-txt-guide']],
    ['tools/security/exif-remover/index.html', ['image-exif-metadata-privacy-risks-guide', 'image-optimization-webp-avif-guide', 'caller-id-apps-privacy-risks-security-guide']],
    ['tools/design/image-converter/index.html', ['image-optimization-webp-avif-guide', 'image-exif-metadata-privacy-risks-guide', 'technical-seo-audit-guide']],
    ['tools/design/color-extractor/index.html', ['ui-color-palette-wcag-guide', 'professional-logo-design-types-principles-file-formats-guide', 'visual-identity-mistakes-successful-rebranding-strategy-guide']],
    ['tools/energy/unit-converter/index.html', ['smartphone-hardware-battery-diagnostics-guide', 'ip-cctv-security-guide', 'best-yemen-4g-modem-buying-guide']],
    ['tools/energy/solar-calculator/index.html', ['ip-cctv-security-guide', 'smartphone-hardware-battery-diagnostics-guide']],
    ['tools/misc/word-counter/index.html', ['seo-article-writing-guide', 'google-adsense-approval-guide-fix-low-value-content', 'technical-seo-audit-guide']],
    ['tools/misc/age-calculator/index.html', ['zakat-calculation-accounting-guide', 'small-business-accounting-guide']],

    // Apps -> Blog Guides
    ['company/projects/apps/kabeer/index.html', ['smartphone-hardware-battery-diagnostics-guide', 'android-usb-otg-serial-communication-guide', 'imei-number-check-guide']],
    ['company/projects/apps/yemen-4g/index.html', ['yemen-4g-app-balance-modem-guide', 'how-to-check-yemen-4g-balance', 'yemen-4g-modem-settings-security-guide']],
    ['company/projects/apps/yemen-view/index.html', ['yemen-telecom-companies-codes-services-guide', 'yemen-internet-comparison-4g-adsl-fiber', 'how-to-check-yemen-4g-balance']],
    ['company/projects/apps/soor-net/index.html', ['android-firewall-app-internet-control-soor-net-guide', 'wireguard-vs-openvpn-ipsec-security-guide', 'public-wifi-hotspot-security-evil-twin-mitm-guide']],
    ['company/projects/apps/tayf-spectrum/index.html', ['lte-wifi-signal-rsrp-sinr-guide', 'telecom-cell-id-mcc-mnc-e164-guide', 'public-wifi-hotspot-security-evil-twin-mitm-guide']],
    ['company/projects/apps/dhawd/index.html', ['android-mdm-kiosk-mode-guide', 'android-usb-otg-serial-communication-guide', 'android-manifest-security-exported-components-guide']],
    ['company/projects/apps/zimam/index.html', ['android-mdm-kiosk-mode-guide', 'android-accessibility-security-guide', 'google-play-integrity-api-android-security-guide']],
    ['company/projects/apps/touch-flow/index.html', ['android-accessibility-security-guide', 'android-mdm-kiosk-mode-guide']],
    ['company/projects/apps/mizan-pro/index.html', ['small-business-accounting-guide', 'zakat-calculation-accounting-guide', 'kmp-mvi-architecture-state-guide']],
    ['company/projects/apps/flexible-records/index.html', ['small-business-accounting-guide', 'zakat-calculation-accounting-guide']],
    ['company/projects/apps/wejhah/index.html', ['offline-gps-yemen-emergency-guide', 'google-business-profile-guide']],
    ['company/projects/apps/rafeeq-al-darb/index.html', ['offline-gps-yemen-emergency-guide', 'lte-wifi-signal-rsrp-sinr-guide']],
    ['company/projects/apps/satoor/index.html', ['android-usb-otg-serial-communication-guide', 'ui-color-palette-wcag-guide', 'compose-multiplatform-shared-ui-android-ios-desktop-guide']],
    ['company/projects/apps/rawnaq/index.html', ['image-optimization-webp-avif-guide', 'image-exif-metadata-privacy-risks-guide', 'ui-color-palette-wcag-guide']],
    ['company/projects/apps/kashif/index.html', ['caller-id-apps-privacy-risks-security-guide', 'telecom-cell-id-mcc-mnc-e164-guide', 'yemen-telecom-companies-codes-services-guide']],
    ['company/projects/apps/developer-tool/index.html', ['jwt-security-debugging-guide', 'android-manifest-security-exported-components-guide', 'kmp-expect-actual-coroutines-testing-guide']],
    ['company/projects/apps/forensic-kmp/index.html', ['modded-whatsapp-gold-plus-apk-malware-security-analysis', 'factory-reset-data-recovery-secure-erasure-guide', 'image-exif-metadata-privacy-risks-guide']],

    // Services -> Blog Guides
    ['company/services/web-app-development.html', ['kmp-mvi-architecture-state-guide', 'jetpack-compose-performance-recomposition-guide', 'pwa-service-worker-offline-web-guide']],
    ['company/services/cybersecurity-solutions.html', ['wireguard-vs-openvpn-ipsec-security-guide', 'google-play-integrity-api-android-security-guide', 'cloudflare-waf-security-guide']],
    ['company/services/telecom-intelligence.html', ['telecom-cell-id-mcc-mnc-e164-guide', 'lte-wifi-signal-rsrp-sinr-guide', 'best-yemen-4g-modem-buying-guide']],
    ['company/services/hosting-services.html', ['choosing-web-hosting', 'cloudflare-settings-optimization-guide', 'iis-hardening-guide']],
    ['company/services/api-solutions.html', ['api-security-guide', 'jwt-security-debugging-guide', 'telegram-bot-webhook-security-guide']],
    ['company/services/digital-marketing.html', ['technical-seo-audit-guide', 'seo-article-writing-guide', 'adsense-ad-serving-limit-invalid-traffic-ads-txt-guide']],
    ['company/services/local-seo.html', ['google-business-profile-guide', 'technical-seo-audit-guide', 'seo-article-writing-guide']],
    ['company/services/creative-design.html', ['professional-logo-design-types-principles-file-formats-guide', 'ui-color-palette-wcag-guide', 'visual-identity-mistakes-successful-rebranding-strategy-guide']]
];

let clustersInjected = 0;
clusterMap.forEach(([relPath, slugs]) => {
    if (injectOrUpdateRelatedGuides(relPath, slugs)) {
        clustersInjected++;
    }
});
console.log(`Injected/verified Bidirectional Topic Cluster links across ${clustersInjected} tool, app, and service pages.`);
