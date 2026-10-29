/**
 * Connect Tag - Modems Local Data & Image Synchronization Script
 * Usage: node scripts/sync-modems.js [--force-images]
 *
 * Fetches the modems catalog from the Connect Tag API, downloads all modem
 * images locally into /upload/modems/ to eliminate external CDN/API server load,
 * normalizes missing fields, and writes tools/telecom/modems/data.js.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.join(__dirname, '../');
const API_URL = 'https://api.connecttag.app/v5/yemen4g/lists?X-Api-Key=ktmo5flizpu';
const IMAGES_DIR = path.join(ROOT_DIR, 'upload', 'modems');
const DATA_JS_PATH = path.join(ROOT_DIR, 'tools', 'telecom', 'modems', 'data.js');
const FORCE_IMAGES = process.argv.includes('--force-images');

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
            return resolve(false); // Already downloaded
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

async function main() {
    console.log('[Sync Modems] Fetching modems catalog from API...');
    const payload = await fetchJson(API_URL);

    if (!payload || !payload.success || !payload.result || !Array.isArray(payload.result.items)) {
        throw new Error('Unexpected API response structure.');
    }

    const items = payload.result.items;
    console.log(`[Sync Modems] Retrieved ${items.length} modems.`);

    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    let downloadedCount = 0;
    let cachedCount = 0;

    for (const item of items) {
        const remoteImg = item.image && item.image.content ? item.image.content.trim() : '';
        if (remoteImg && remoteImg.startsWith('http')) {
            const parsedUrl = new URL(remoteImg);
            const ext = path.extname(parsedUrl.pathname) || '.webp';
            const fileName = `${item.slug || item.id}${ext}`;
            const localImgPath = path.join(IMAGES_DIR, fileName);

            try {
                const wasDownloaded = await downloadFile(remoteImg, localImgPath);
                if (wasDownloaded) {
                    downloadedCount++;
                    console.log(`  [+] Downloaded image: upload/modems/${fileName}`);
                } else {
                    cachedCount++;
                }
                item.image.content = `https://connecttag.org/upload/modems/${fileName}`;
                item.image.remoteBackup = remoteImg;
            } catch (err) {
                console.warn(`  [!] Warning: Could not download ${remoteImg}: ${err.message}`);
            }
        }

        // Normalize missing additional.modemSettings for devices that omit it
        if (!item.additional) {
            item.additional = { portable: item.category === 'مودم محمول' };
        }
        if (!item.additional.modemSettings) {
            item.additional.modemSettings = {
                loginLink: 'http://192.168.0.1',
                loginLinkPath: '',
                loginBy: 'USER_PASS',
                defaultUserName: 'admin',
                defaultPass: 'admin'
            };
        }
    }

    console.log(`[Sync Modems] Images ready (${downloadedCount} downloaded, ${cachedCount} already up to date).`);

    // Project only needed fields to keep data.js lightweight and fast
    const cleanedItems = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        arabicName: (item.arabicName || '').trim(),
        englishName: (item.englishName || '').trim(),
        brand: item.brand || item.manufacturer || 'عام',
        modelOrVersion: item.modelOrVersion || item.model || '',
        model: item.model || item.modelOrVersion || '',
        modelYear: item.modelYear || '',
        category: item.category || 'مودم 4G',
        subCategory: item.subCategory || 'مودم فورجي',
        description: item.description || '',
        shortDescription: item.shortDescription || '',
        summary: item.summary || '',
        condition: item.condition || '',
        availabilityStatus: item.availabilityStatus || '',
        countryOfOrigin: item.countryOfOrigin || 'الصين',
        keyWords: item.keyWords || '',
        keyWordsEnglish: item.keyWordsEnglish || '',
        isNew: Boolean(item.isNew),
        tips: Array.isArray(item.tips) ? item.tips : [],
        price: item.price || { currentValue: 0, currency: 'RYE' },
        rating: item.rating || { average: 5, count: 1 },
        image: {
            content: item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp',
            remoteBackup: item.image?.remoteBackup || ''
        },
        additional: {
            portable: Boolean(item.additional?.portable || (item.category && item.category.includes('محمول'))),
            modemSettings: item.additional?.modemSettings || {
                loginLink: 'http://192.168.0.1',
                loginLinkPath: '',
                loginBy: 'USER_PASS',
                defaultUserName: 'admin',
                defaultPass: 'admin'
            }
        }
    }));

    // Write tools/telecom/modems/data.js
    const banner = `/**\n * Connect Tag - Local Modems Catalog Data\n * Auto-generated by scripts/sync-modems.js on ${new Date().toISOString().split('T')[0]}\n * Total Modems: ${cleanedItems.length}\n */\n`;
    const jsContent = `${banner}window.MODEMS_DATA = ${JSON.stringify(cleanedItems)};\n`;
    fs.writeFileSync(DATA_JS_PATH, jsContent, 'utf8');
    console.log(`[Sync Modems] Wrote ${path.relative(ROOT_DIR, DATA_JS_PATH)} (${(Buffer.byteLength(jsContent, 'utf8') / 1024).toFixed(1)} KB).`);
}

main().catch((err) => {
    console.error('[Sync Modems] Error:', err.message);
    process.exit(1);
});
