/**
 * Connect Tag - Modems Local Data & Image Synchronization Script (V8 Enriched)
 * Usage: node scripts/sync-modems.js [--force-images]
 *
 * Reads the enriched V8 modems and organizations catalogs (excluding dev/debug records),
 * downloads all modem images, gallery media, and organization logos locally into /upload/modems/
 * to eliminate external CDN/API server load, normalizes fields, and writes tools/telecom/modems/data.js.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.join(__dirname, '../');
const V8_CONTENT_DIR = 'F:\\my-software-projects\\Kotlin\\ConnectTag\\4g\\yemen-4g-api\\server\\src\\data\\v8\\content';
const V8_MODEMS_PATH = path.join(V8_CONTENT_DIR, 'modems-all.json');
const V8_ORGS_PATH = path.join(V8_CONTENT_DIR, 'organizations-all.json');
const API_URL = 'https://api.connecttag.app/v5/yemen4g/lists?X-Api-Key=ktmo5flizpu';
const IMAGES_DIR = path.join(ROOT_DIR, 'upload', 'modems');
const DATA_JS_PATH = path.join(ROOT_DIR, 'tools', 'telecom', 'modems', 'data.js');
const FORCE_IMAGES = process.argv.includes('--force-images');

const DEV_ENTITY_IDS = new Set(['1026', '1217745']);

function isDevRecord(record) {
    if (!record) return true;
    if (record.isForDev === true || record.isDebug === true) return true;
    if (DEV_ENTITY_IDS.has(String(record.id || ''))) return true;
    return false;
}

function extractModemSettings(item) {
    const raw = item.additional?.modemSettings || {};
    const attrs = item.relatedData?.attributes || [];
    const resources = item.relatedData?.contentResources || [];

    const findAttr = (codes) => {
        const hit = attrs.find(a => a && a.active !== false && a.value && codes.includes(String(a.attribute?.code || '').toLowerCase()));
        return hit ? String(hit.value).trim() : '';
    };

    const resourceLogin = resources.find(r =>
        r && r.active !== false && /^https?:\/\/192\.168\./i.test(String(r.content || r.action?.content || '').trim())
    );
    const resourceUrl = resourceLogin ? String(resourceLogin.content || resourceLogin.action?.content || '').trim() : '';

    const loginLink = (raw.loginLink || findAttr(['login-link', 'gateway-ip', 'admin-url', 'ip-address']) || resourceUrl).trim();
    const loginLinkPath = (raw.loginLinkPath ?? findAttr(['login-link-path', 'admin-path']) ?? '').trim();
    const loginBy = (raw.loginBy || findAttr(['login-by', 'auth-type']) || '').trim();
    const defaultUserName = (raw.defaultUserName ?? findAttr(['default-username', 'admin-user', 'username']) ?? '').trim();
    const defaultPass = (raw.defaultPass ?? findAttr(['default-pass', 'admin-password', 'password']) ?? '').trim();

    if (!loginLink && !defaultUserName && !defaultPass) {
        return null;
    }

    return {
        loginLink,
        loginLinkPath,
        ...(loginBy ? { loginBy } : {}),
        ...(defaultUserName ? { defaultUserName } : {}),
        ...(defaultPass ? { defaultPass } : {})
    };
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} when fetching ${url}`));
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString('utf8');
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        if (!FORCE_IMAGES && fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
            return resolve(false);
        }
        const file = fs.createWriteStream(destPath);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                file.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

function normalizeWebsiteUrl(rawUrl) {
    const val = String(rawUrl || '').trim();
    if (!val) return '';
    if (/^https?:\/\//i.test(val)) return val;
    return `https://${val.replace(/^\/+/, '')}`;
}

function formatAttributeDisplayValue(code, rawVal) {
    const val = String(rawVal || '').trim();
    if (!val) return '';
    if (code === 'battery-capacity' && /^\d+$/.test(val)) {
        return `${Number(val).toLocaleString('en-US')} مللي أمبير (mAh)`;
    }
    if (code === 'max-users' && /^\d+$/.test(val)) {
        return `حتى ${val} مستخدم`;
    }
    if (code === 'lan-ports' && /^\d+$/.test(val)) {
        return val === '1' ? 'منفذ واحد (RJ45)' : `${val} منافذ (RJ45)`;
    }
    return val;
}

function formatOperatingHours(hoursList) {
    if (!Array.isArray(hoursList) || hoursList.length === 0) return '';
    const openDays = hoursList.filter(h => h.isOpen && h.openTime && h.closeTime);
    if (openDays.length === 0) return '';
    const first = openDays[0];
    return `من ${first.openTime} إلى ${first.closeTime}`;
}

async function main() {
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    let rawModems = [];
    let rawOrgs = [];

    if (fs.existsSync(V8_MODEMS_PATH)) {
        console.log(`[Sync Modems] Reading local V8 catalog from ${V8_MODEMS_PATH}...`);
        const modemsDoc = JSON.parse(fs.readFileSync(V8_MODEMS_PATH, 'utf8'));
        rawModems = (modemsDoc.items || []).filter(item => !isDevRecord(item));
        if (fs.existsSync(V8_ORGS_PATH)) {
            const orgsDoc = JSON.parse(fs.readFileSync(V8_ORGS_PATH, 'utf8'));
            rawOrgs = (orgsDoc.items || []).filter(org => !isDevRecord(org));
        }
    } else {
        console.log('[Sync Modems] Local V8 catalog not found; fetching from remote API...');
        const payload = await fetchJson(API_URL);
        if (!payload || !payload.success || !payload.result || !Array.isArray(payload.result.items)) {
            throw new Error('Unexpected API response structure.');
        }
        rawModems = payload.result.items.filter(item => !isDevRecord(item));
    }

    console.log(`[Sync Modems] Loaded ${rawModems.length} production modems and ${rawOrgs.length} production organizations.`);

    let downloadedCount = 0;
    let cachedCount = 0;

    // 1. Process Organizations
    const orgsMap = {};
    for (const org of rawOrgs) {
        if (isDevRecord(org)) continue;
        const orgId = String(org.id);
        const remoteLogo = (org.avatar || org.image?.content || '').trim();
        let localLogoUrl = '';

        if (remoteLogo && remoteLogo.startsWith('http')) {
            const parsedUrl = new URL(remoteLogo);
            const ext = path.extname(parsedUrl.pathname) || '.webp';
            const fileName = `org-${orgId}${ext}`;
            const localPath = path.join(IMAGES_DIR, fileName);
            try {
                const downloaded = await downloadFile(remoteLogo, localPath);
                if (downloaded) {
                    downloadedCount++;
                    console.log(`  [+] Downloaded org logo: upload/modems/${fileName}`);
                } else {
                    cachedCount++;
                }
                localLogoUrl = `https://connecttag.org/upload/modems/${fileName}`;
            } catch (err) {
                console.warn(`  [!] Warning: Could not download org logo ${remoteLogo}: ${err.message}`);
                localLogoUrl = remoteLogo;
            }
        }

        // Merge phones from contact.phones and relatedData.contacts.phones
        const phoneMap = new Map();
        for (const p of (org.contact?.phones || [])) {
            const num = String(p.number || '').trim();
            if (!num) continue;
            phoneMap.set(num, {
                number: num,
                label: p.name || 'للتواصل',
                type: p.type || 'MOBILE',
                hasWhatsapp: Boolean(p.accounts?.hasWhatsapp)
            });
        }
        for (const p of (org.relatedData?.contacts?.phones || [])) {
            const num = String(p.value || p.number || '').trim();
            if (!num) continue;
            if (!phoneMap.has(num)) {
                phoneMap.set(num, {
                    number: num,
                    label: p.title || 'للتواصل',
                    type: p.type || 'MOBILE',
                    hasWhatsapp: false
                });
            }
        }

        const emails = (org.relatedData?.contacts?.emails || org.contact?.emails || [])
            .map(e => ({
                email: String(e.value || '').trim(),
                label: (e.title || e.label || 'البريد الإلكتروني').trim()
            }))
            .filter(e => e.email);

        const addrObj = org.relatedData?.contacts?.addresses?.[0] || org.contact?.address || null;
        const formattedAddress = addrObj
            ? (addrObj.formattedAddress || [addrObj.city, addrObj.street].filter(Boolean).join(' - ')).trim()
            : '';

        const rawWebsite = org.relatedData?.contacts?.websites?.[0]?.content || org.contact?.website || '';
        const website = normalizeWebsiteUrl(rawWebsite);

        const socialLinks = (org.relatedData?.contacts?.socialMedias || org.contact?.socialLinks || [])
            .map(s => {
                const url = normalizeWebsiteUrl(s.url || s.value || '');
                return {
                    platform: String(s.platform || s.platformName || '').toLowerCase(),
                    url,
                    label: s.title || s.label || s.platform || s.platformName || ''
                };
            })
            .filter(s => s.url && !s.url.includes('UCxxxx'));

        const categories = (org.relatedData?.categories || [])
            .map(c => c.category?.name || '')
            .filter(name => name && name !== 'شركات الاتصالات وتقنية المعلومات');

        orgsMap[orgId] = {
            id: orgId,
            name: (org.nameAr || org.name || '').trim(),
            nameEn: (org.nameEn || org.name || '').trim(),
            role: org.role || '',
            description: (org.description || '').trim(),
            logo: localLogoUrl || remoteLogo,
            logoBackup: remoteLogo,
            categories,
            website,
            phones: Array.from(phoneMap.values()),
            emails,
            address: formattedAddress,
            operatingHours: formatOperatingHours(org.relatedData?.contacts?.operatingHours || []),
            socialLinks
        };
    }

    // 2. Process Modems
    const cleanedItems = [];
    for (const item of rawModems) {
        if (isDevRecord(item)) continue;

        // Preserve canonical SEO slug 'jeep-4g' while supporting 'jaeb-4g' alias
        let canonicalSlug = (item.slug || String(item.id)).trim();
        let slugAliases = [];
        if (canonicalSlug === 'jaeb-4g' || String(item.id) === '1410116') {
            canonicalSlug = 'jeep-4g';
            slugAliases = ['jaeb-4g', 'jeep-4g'];
        }

        const remoteImg = item.image && item.image.content ? item.image.content.trim() : '';
        let localPrimaryImg = 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        // Prefer existing .webp in upload/modems/${canonicalSlug}.webp if already present
        const existingWebpPath = path.join(IMAGES_DIR, `${canonicalSlug}.webp`);
        if (!FORCE_IMAGES && fs.existsSync(existingWebpPath) && fs.statSync(existingWebpPath).size > 0) {
            cachedCount++;
            localPrimaryImg = `https://connecttag.org/upload/modems/${canonicalSlug}.webp`;
        } else if (remoteImg && remoteImg.startsWith('http')) {
            const parsedUrl = new URL(remoteImg);
            const ext = path.extname(parsedUrl.pathname) || '.webp';
            const fileName = `${canonicalSlug}${ext}`;
            const localImgPath = path.join(IMAGES_DIR, fileName);
            try {
                const wasDownloaded = await downloadFile(remoteImg, localImgPath);
                if (wasDownloaded) {
                    downloadedCount++;
                    console.log(`  [+] Downloaded modem image: upload/modems/${fileName}`);
                } else {
                    cachedCount++;
                }
                localPrimaryImg = `https://connecttag.org/upload/modems/${fileName}`;
            } catch (err) {
                console.warn(`  [!] Warning: Could not download ${remoteImg}: ${err.message}`);
                localPrimaryImg = remoteImg;
            }
        }

        // Gallery Media
        const gallery = [];
        const rawMedias = item.relatedData?.medias || [];
        for (const med of rawMedias) {
            if (!med || med.active === false) continue;
            // Skip known cross-linked Vortex image on SAM M50 (media id 1021)
            if (String(med.id) === '1021' && String(item.id) === '1437414') continue;
            const mediaRemoteUrl = (med.mediaUrl || '').trim().replace('cdn.connecttag.org', 'cdn.connecttag.net');
            if (!mediaRemoteUrl.startsWith('http')) continue;

            const parsedUrl = new URL(mediaRemoteUrl);
            const ext = path.extname(parsedUrl.pathname) || '.webp';
            const fileName = `media-${med.id}${ext}`;
            const localMediaPath = path.join(IMAGES_DIR, fileName);
            let localMediaUrl = mediaRemoteUrl;

            try {
                const wasDownloaded = await downloadFile(mediaRemoteUrl, localMediaPath);
                if (wasDownloaded) {
                    downloadedCount++;
                    console.log(`  [+] Downloaded gallery image: upload/modems/${fileName}`);
                } else {
                    cachedCount++;
                }
                localMediaUrl = `https://connecttag.org/upload/modems/${fileName}`;
            } catch (err) {
                console.warn(`  [!] Warning: Could not download gallery media ${mediaRemoteUrl}: ${err.message}`);
            }

            gallery.push({
                url: localMediaUrl,
                remoteBackup: mediaRemoteUrl,
                caption: (med.caption || med.description || '').trim()
            });
        }

        // Technical Attributes
        const attributes = (item.relatedData?.attributes || [])
            .filter(a => a && a.active !== false && a.value)
            .sort((a, b) => (a.orderIndex || 99) - (b.orderIndex || 99))
            .map(a => {
                const code = a.attribute?.code || String(a.attributeId || '');
                const rawVal = String(a.value || '').trim();
                return {
                    code,
                    name: (a.attribute?.name || a.description || '').trim(),
                    nameEn: (a.attribute?.nameEn || '').trim(),
                    value: rawVal,
                    displayValue: formatAttributeDisplayValue(code, rawVal),
                    group: (a.attribute?.group || 'مواصفات عامة').trim()
                };
            });

        // Tags
        const tags = (item.relatedData?.tags || [])
            .filter(t => t && t.active !== false && t.tag?.name)
            .map(t => ({
                name: t.tag.name.trim(),
                nameEn: (t.tag.nameEn || '').trim(),
                code: (t.tag.code || '').trim(),
                color: t.tag.color || '#0052cc'
            }));

        // Content Resources (Management Apps, Videos, Guides)
        const resources = (item.relatedData?.contentResources || [])
            .filter(r => r && r.active !== false && (r.content || r.action?.content))
            .sort((a, b) => (a.orderIndex || 99) - (b.orderIndex || 99))
            .map(r => ({
                title: (r.title || 'مورد مرفق').trim(),
                description: (r.description || '').trim(),
                group: (r.group || '').trim(),
                url: (r.content || r.action?.content || '').trim(),
                contentType: (r.contentType || 'LINK').toUpperCase()
            }));

        // Linked Providers / Organizations (excluding dev organizations)
        const providers = (item.relatedData?.organizations || [])
            .filter(o => o && o.active !== false && !DEV_ENTITY_IDS.has(String(o.organizationId)) && !isDevRecord(o.organization))
            .map(o => ({
                orgId: String(o.organizationId),
                role: (o.role || 'الوكيل المعتمد').trim()
            }));

        // Related Modems / Entity Links (excluding dev entities)
        const relatedLinks = (item.relatedData?.entityLinks || [])
            .filter(l => l && l.active !== false && l.sourceEntityType === 'PRODUCT' && l.targetEntityType === 'PRODUCT')
            .filter(l => !DEV_ENTITY_IDS.has(String(l.sourceEntityId)) && !DEV_ENTITY_IDS.has(String(l.targetEntityId)))
            .map(l => {
                const targetId = String(l.sourceEntityId) === String(item.id)
                    ? String(l.targetEntityId)
                    : String(l.sourceEntityId);
                return {
                    targetId,
                    relationCode: l.relationType?.code || 'similar',
                    relationName: l.relationType?.name || 'مودم مشابه'
                };
            });

        const brandStr = (item.brand || item.manufacturer || 'عام').trim();
        const rawModelOrVersion = (item.modelOrVersion || item.model || '').replace(/M90-RRO/i, 'M90-PRO').trim();
        const rawModel = (item.model || item.modelOrVersion || '').replace(/M90-RRO/i, 'M90-PRO').trim();
        const resolvedModemSettings = extractModemSettings(item);

        cleanedItems.push({
            id: String(item.id),
            slug: canonicalSlug,
            ...(slugAliases.length > 0 ? { slugAliases } : {}),
            arabicName: (item.arabicName || '').replace(/\s+/g, ' ').trim(),
            englishName: (item.englishName || '').replace(/\s+/g, ' ').trim(),
            brand: brandStr,
            manufacturer: (item.manufacturer || brandStr).trim(),
            modelOrVersion: rawModelOrVersion,
            model: rawModel,
            modelYear: item.modelYear || '',
            category: item.category || 'مودم 4G',
            subCategory: item.subCategory || 'مودم فورجي',
            description: item.description || '',
            shortDescription: item.shortDescription || '',
            summary: item.summary || '',
            availabilityStatus: item.availabilityStatus || '',
            countryOfOrigin: item.countryOfOrigin || 'الصين',
            keyWords: item.keyWords || '',
            keyWordsEnglish: item.keyWordsEnglish || '',
            isNew: Boolean(item.isNew),
            tips: Array.isArray(item.tips) ? item.tips : [],
            price: {
                currentValue: Number(item.price?.currentValue || 0),
                currency: item.price?.currency || 'RYE',
                ...(item.price?.note ? { note: item.price.note } : {})
            },
            rating: item.rating || { average: 5, count: 1 },
            image: {
                content: localPrimaryImg,
                remoteBackup: remoteImg
            },
            additional: {
                portable: Boolean(item.additional?.portable || (item.category && item.category.includes('محمول'))),
                ...(resolvedModemSettings ? { modemSettings: resolvedModemSettings } : {})
            },
            attributes,
            tags,
            resources,
            gallery,
            providers,
            relatedLinks
        });
    }

    console.log(`[Sync Modems] Images ready (${downloadedCount} downloaded, ${cachedCount} already up to date).`);

    // Write tools/telecom/modems/data.js
    const banner = `/**\n * Connect Tag - Local Modems & Organizations Catalog Data (V8 Enriched)\n * Auto-generated by scripts/sync-modems.js on ${new Date().toISOString().split('T')[0]}\n * Total Modems: ${cleanedItems.length} | Total Organizations: ${Object.keys(orgsMap).length}\n */\n`;
    const jsContent = `${banner}window.MODEM_ORGS_DATA = ${JSON.stringify(orgsMap)};\nwindow.MODEMS_DATA = ${JSON.stringify(cleanedItems)};\n`;
    if (fs.existsSync(DATA_JS_PATH)) {
        const fd = fs.openSync(DATA_JS_PATH, 'r+');
        fs.ftruncateSync(fd, 0);
        fs.writeSync(fd, jsContent, 0, 'utf8');
        fs.closeSync(fd);
    } else {
        fs.writeFileSync(DATA_JS_PATH, jsContent, 'utf8');
    }
    console.log(`[Sync Modems] Wrote ${path.relative(ROOT_DIR, DATA_JS_PATH)} (${(Buffer.byteLength(jsContent, 'utf8') / 1024).toFixed(1)} KB).`);
}

main().catch((err) => {
    console.error('[Sync Modems] Error:', err.message);
    process.exit(1);
});
