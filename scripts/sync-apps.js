/**
 * Connect Tag - Sync Apps Script
 * Reads assets/data/apps.json and synchronizes HTML files in company/projects/apps/
 * Generates pre-rendered Light DOM inside <app-metrics-ribbon> and <app-specs-table>
 * for zero-CLS rendering and Wave 1 SEO/AdSense crawler visibility.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appsJsonPath = path.join(rootDir, 'assets', 'data', 'apps.json');
const appsDir = path.join(rootDir, 'company', 'projects', 'apps');

if (!fs.existsSync(appsJsonPath)) {
  console.error('apps.json not found at', appsJsonPath);
  process.exit(1);
}

const appsData = JSON.parse(fs.readFileSync(appsJsonPath, 'utf8'));
const appKeys = Object.keys(appsData);
console.log(`Loaded ${appKeys.length} apps from apps.json`);

function renderRibbonHtml(slug, data) {
  return `<!-- App Store Metrics Ribbon Component -->
        <app-metrics-ribbon app-id="${slug}">
            <div class="as-lazy-row-wrapper" data-aos="fade-up">
                <div class="as-metrics-ribbon as-lazy-row">
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">السعر</span>
                        <span class="as-metric-value">${data.price}</span>
                        <span class="as-metric-sub">${data.priceSub}</span>
                    </div>
                    <div class="as-metric-divider as-lazy-divider"></div>
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">الفئة</span>
                        <span class="as-metric-value"><i class="${data.categoryIcon}" style="color: #0071e3; font-size: 20px;"></i></span>
                        <span class="as-metric-sub">${data.category}</span>
                    </div>
                    <div class="as-metric-divider as-lazy-divider"></div>
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">${data.targetLabel}</span>
                        <span class="as-metric-value">${data.targetValue}</span>
                        <span class="as-metric-sub">${data.targetSub}</span>
                    </div>
                    <div class="as-metric-divider as-lazy-divider"></div>
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">التوافق</span>
                        <span class="as-metric-value">${data.platformIcon ? `<i class="${data.platformIcon}" style="color: #0071e3; font-size: 18px;"></i> ` : ''}${data.platform}</span>
                        <span class="as-metric-sub">${data.platformSub}</span>
                    </div>
                    <div class="as-metric-divider as-lazy-divider"></div>
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">اللغات</span>
                        <span class="as-metric-value">${data.languages}</span>
                        <span class="as-metric-sub">${data.languagesSub}</span>
                    </div>
                    <div class="as-metric-divider as-lazy-divider"></div>
                    <div class="as-metric-item as-lazy-card">
                        <span class="as-metric-label">الحجم</span>
                        <span class="as-metric-value">${data.size}</span>
                        <span class="as-metric-sub">MB</span>
                    </div>
                </div>
            </div>
        </app-metrics-ribbon>`;
}

function renderSpecsHtml(slug, data) {
  return `<!-- Information & Technical Specs Component -->
        <app-specs-table app-id="${slug}">
            <div class="as-section" data-aos="fade-up">
                <h2 class="as-section-title" style="margin-bottom: 18px;">تفاصيل إضافية</h2>
                <div class="as-info-group">
                    <div class="as-info-row">
                        <span class="as-info-label">المطور</span>
                        <span class="as-info-val">${data.developer}</span>
                    </div>
                    <div class="as-info-row">
                        <span class="as-info-label">المنصة</span>
                        <span class="as-info-val">${data.platformIcon ? `<i class="${data.platformIcon}" style="color: #3ddc84; margin-left: 6px;"></i> ` : ''}${data.platformInfo}</span>
                    </div>
                    <div class="as-info-row">
                        <span class="as-info-label">الجهة المستفيدة</span>
                        <span class="as-info-val">${data.isCustomClient ? '<i class="fa-solid fa-lock" style="color: #64748b; margin-left: 6px; font-size: 13px;"></i> ' : ''}${data.audience}</span>
                    </div>
                    <div class="as-info-row">
                        <span class="as-info-label">معرّف التطبيق</span>
                        <span class="as-info-val" style="font-family: monospace; font-size: 13px;">${data.packageId}</span>
                    </div>
                    <div class="as-info-row">
                        <span class="as-info-label">سياسة الخصوصية</span>
                        <span class="as-info-val"><a href="${data.privacyPolicyUrl}">عرض السياسة</a></span>
                    </div>
                    <div class="as-info-row">
                        <span class="as-info-label">شروط الاستخدام</span>
                        <span class="as-info-val"><a href="${data.termsOfUseUrl}">عرض الشروط</a></span>
                    </div>${data.deleteDataUrl ? `
                    <div class="as-info-row">
                        <span class="as-info-label">حذف الحساب والبيانات</span>
                        <span class="as-info-val"><a href="${data.deleteDataUrl}">بوابة الحذف وإلغاء الإدراج</a></span>
                    </div>` : ''}${data.supportEmail ? `
                    <div class="as-info-row">
                        <span class="as-info-label">الدعم الفني</span>
                        <span class="as-info-val"><a href="mailto:${data.supportEmail}">${data.supportEmail}</a></span>
                    </div>` : ''}
                </div>
            </div>
        </app-specs-table>`;
}

let updatedCount = 0;

for (const slug of appKeys) {
  const htmlPath = path.join(appsDir, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.warn(`HTML file not found for ${slug}: ${htmlPath}`);
    continue;
  }

  let content = fs.readFileSync(htmlPath, 'utf8');
  const data = appsData[slug];

  // 1. Replace existing <app-metrics-ribbon> or legacy ribbon block
  const newRibbon = renderRibbonHtml(slug, data);
  const existingRibbonTagRegex = /(?:<!-- App Store Metrics Ribbon[^\n]*-->\s*)*<app-metrics-ribbon[^>]*>[\s\S]*?<\/app-metrics-ribbon>/;
  const legacyRibbonRegex = /(?:<!-- App Store Metrics Ribbon[^\n]*-->\s*)*<div class="as-lazy-row-wrapper"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

  if (existingRibbonTagRegex.test(content)) {
    content = content.replace(existingRibbonTagRegex, newRibbon);
  } else if (legacyRibbonRegex.test(content)) {
    content = content.replace(legacyRibbonRegex, newRibbon);
  }

  // 2. Replace existing <app-specs-table> or legacy info-group block
  const newInfo = renderSpecsHtml(slug, data);
  const existingSpecsTagRegex = /(?:<!-- Information & Technical Specs[^\n]*-->\s*)*<app-specs-table[^>]*>[\s\S]*?<\/app-specs-table>/;
  const legacySpecsRegex = /(?:<!-- Information & Technical Specs[^\n]*-->\s*)*<div class="as-section"[^>]*>\s*<h2 class="as-section-title"[^>]*>تفاصيل إضافية[^<]*<\/h2>\s*<div class="as-info-group">[\s\S]*?<\/div>\s*<\/div>/;

  if (existingSpecsTagRegex.test(content)) {
    content = content.replace(existingSpecsTagRegex, newInfo);
  } else if (legacySpecsRegex.test(content)) {
    content = content.replace(legacySpecsRegex, newInfo);
  }

  fs.writeFileSync(htmlPath, content, 'utf8');
  updatedCount++;
}

console.log(`Successfully synchronized ${updatedCount} app detail pages with pre-rendered web components!`);
