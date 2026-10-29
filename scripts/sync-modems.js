/**
 * Connect Tag - Modems Local Data & Image Synchronization Script (V8 Enriched)
 * Usage: node scripts/sync-modems.js [--force-images]
 *
 * Reads the enriched V8 modems and organizations catalogs (excluding dev/debug records),
 * applies the exact Yemen4g_main extraction & normalization rules (NetworkUtil, ProductRepositoryImpl,
 * CatalogColorTokens, UiContentDetailExtensions, ModemGuideText, ModemDetailsShareFormatter),
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
const V8_LISTS_PATH = path.join(V8_CONTENT_DIR, 'lists.json');
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

/**
 * Port of NetworkUtil.normalizeModemUrl & normalizeCompactPrivateIpv4Url from Yemen4g_main:
 * - Trims input
 * - Prefixes http:// if scheme is missing
 * - Fixes compact private IPv4 URLs like http://192168.1.1 -> http://192.168.1.1 only when octets are in 0..255
 */
function normalizeModemUrl(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    const match = withScheme.match(/^(https?:\/\/)192168\.(\d{1,3})\.(\d{1,3})(.*)$/i);
    if (!match) return withScheme;
    const third = Number(match[2]);
    const fourth = Number(match[3]);
    if (!Number.isInteger(third) || !Number.isInteger(fourth) || third < 0 || third > 255 || fourth < 0 || fourth > 255) {
        return withScheme;
    }
    return `${match[1]}192.168.${third}.${fourth}${match[4]}`;
}

/**
 * Port of NetworkUtil.extractModemHost from Yemen4g_main.
 */
function extractModemHost(value) {
    const normalized = normalizeModemUrl(value);
    if (!normalized) return null;
    try {
        const parsed = new URL(normalized);
        const host = (parsed.hostname || '').trim();
        return host || null;
    } catch (_) {
        return null;
    }
}

/**
 * Port of NetworkUtil.isSupportedPrivateModemUrl from Yemen4g_main:
 * Validates private IPv4 gateway ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x).
 */
function isSupportedPrivateModemUrl(url) {
    const host = extractModemHost(url);
    if (!host) return false;
    const parts = host.split('.');
    if (parts.length !== 4) return false;
    const octets = parts.map(p => (/^\d+$/.test(p) ? Number(p) : -1));
    if (octets.some(o => o < 0 || o > 255)) return false;
    const [a, b] = octets;
    return a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

/**
 * Port of NetworkUtil.toModemRouteKey from Yemen4g_main.
 */
function toModemRouteKey(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    let route = trimmed;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            route = `${parsed.pathname || ''}${parsed.search || ''}${parsed.hash || ''}`;
        } catch (_) {
            route = trimmed;
        }
    }
    return route.trim().replace(/^\/+|\/+$/g, '');
}

/**
 * Port of NetworkUtil.containsModemRoute from Yemen4g_main:
 * Checks whether baseUrl already contains routePath on exact path/query/hash boundaries.
 */
function containsModemRoute(baseUrl, routePath) {
    const baseRoute = toModemRouteKey(baseUrl).toLowerCase();
    const pathRoute = toModemRouteKey(routePath).toLowerCase();
    if (!baseRoute || !pathRoute) return false;
    return (
        baseRoute === pathRoute ||
        baseRoute.startsWith(`${pathRoute}?`) ||
        baseRoute.startsWith(`${pathRoute}#`) ||
        baseRoute.endsWith(`/${pathRoute}`) ||
        baseRoute.includes(`/${pathRoute}?`) ||
        baseRoute.includes(`/${pathRoute}#`)
    );
}

/**
 * Port of NetworkUtil.buildModemUrl from Yemen4g_main:
 * Joins baseUrl and path cleanly without duplicating routes.
 */
function buildModemUrl(baseUrl, pathStr) {
    if (!String(baseUrl || '').trim()) return '';
    const normalizedBaseUrl = normalizeModemUrl(baseUrl);
    if (!normalizedBaseUrl) return '';
    const trimmedPath = String(pathStr || '').trim();
    if (!trimmedPath) return normalizedBaseUrl;
    if (/^https?:\/\//i.test(trimmedPath)) return normalizeModemUrl(trimmedPath);
    if (containsModemRoute(normalizedBaseUrl, trimmedPath)) return normalizedBaseUrl;
    if (normalizedBaseUrl.endsWith('/') && trimmedPath.startsWith('/')) {
        return normalizedBaseUrl.slice(0, -1) + trimmedPath;
    }
    if (!normalizedBaseUrl.endsWith('/') && !trimmedPath.startsWith('/')) {
        return `${normalizedBaseUrl}/${trimmedPath}`;
    }
    return normalizedBaseUrl + trimmedPath;
}

/**
 * Port of ProductRepositoryImpl.normalizeModemLoginBy from Yemen4g_main.
 */
function normalizeModemLoginBy(value) {
    return String(value || '').trim().replace(/^\/+/, '').toUpperCase();
}

/**
 * Port of ProductRepositoryImpl.hasTouchScreenHint from Yemen4g_main.
 */
function hasTouchScreenHint(description) {
    const value = String(description || '');
    return value.includes('شاشة لمس') || value.includes(' لمس ');
}

/**
 * Port of ModemGuideText.isPrintedPassword from Yemen4g_main.
 */
function isPrintedPassword(defaultPass) {
    const clean = String(defaultPass || '').trim();
    return !clean || clean.toUpperCase() === 'OUT';
}

/**
 * Port of ModemDetailsShareFormatter.isModemAppResource from Yemen4g_main:
 * Identifies management application resources (Google Play, App Store, APK, or app group/type).
 */
function isModemAppResource(res) {
    if (!res) return false;
    const group = String(res.group || '').toLowerCase();
    const contentType = String(res.contentType || '').toLowerCase();
    const type = String(res.type || '').toLowerCase();
    const title = String(res.title || '').toLowerCase();
    const content = String(res.content || res.url || res.action?.content || '').toLowerCase();

    return (
        group.includes('تطبيق') ||
        group.includes('app') ||
        contentType === 'app' ||
        contentType === 'apk' ||
        type === 'app' ||
        title.includes('تطبيق') ||
        title.includes('ادارة') ||
        title.includes('إدارة') ||
        content.includes('play.google.com') ||
        content.includes('apps.apple.com') ||
        content.endsWith('.apk')
    );
}

/**
 * Port of CatalogColorTokens.kt (com.telecom.yemen4g.core.utils.CatalogColorTokens) from Yemen4g_main:
 * Resolves all 68 color definitions (Arabic & English aliases) and flexible 6/8-digit hex strings.
 */
const CATALOG_COLOR_DEFINITIONS = [
    { hex: '#E53935', name: 'أحمر', nameEn: 'Red', aliases: ['red', 'احمر', 'أحمر'] },
    { hex: '#1E88E5', name: 'أزرق', nameEn: 'Blue', aliases: ['blue', 'ازرق', 'أزرق'] },
    { hex: '#43A047', name: 'أخضر', nameEn: 'Green', aliases: ['green', 'اخضر', 'أخضر'] },
    { hex: '#FDD835', name: 'أصفر', nameEn: 'Yellow', aliases: ['yellow', 'اصفر', 'أصفر'] },
    { hex: '#FB8C00', name: 'برتقالي', nameEn: 'Orange', aliases: ['orange', 'برتقالي'] },
    { hex: '#8E24AA', name: 'بنفسجي', nameEn: 'Purple', aliases: ['purple', 'بنفسجي'] },
    { hex: '#D81B60', name: 'وردي', nameEn: 'Pink', aliases: ['pink', 'وردي'] },
    { hex: '#212121', name: 'أسود', nameEn: 'Black', aliases: ['black', 'اسود', 'أسود'] },
    { hex: '#FFFFFF', name: 'أبيض', nameEn: 'White', aliases: ['white', 'ابيض', 'أبيض'] },
    { hex: '#757575', name: 'رمادي', nameEn: 'Gray', aliases: ['gray', 'grey', 'رمادي'] },
    { hex: '#6D4C41', name: 'بني', nameEn: 'Brown', aliases: ['brown', 'بني'] },
    { hex: '#FFD54F', name: 'ذهبي', nameEn: 'Gold', aliases: ['gold', 'ذهبي'] },
    { hex: '#BDBDBD', name: 'فضي', nameEn: 'Silver', aliases: ['silver', 'فضي'] },

    { hex: '#8DA47E', name: 'أخضر فستقي', nameEn: 'Pistachio', aliases: ['pistachio', 'sage', 'اخضر فستقي', 'أخضر فستقي', 'فستقي'] },
    { hex: '#C48B9F', name: 'وردي غامق', nameEn: 'Rose', aliases: ['dusty rose', 'rose', 'وردي غامق', 'روز'] },
    { hex: '#89BEE3', name: 'أزرق سماوي', nameEn: 'Sky Blue', aliases: ['sky blue', 'baby blue', 'ازرق سماوي', 'أزرق سماوي', 'سماوي'] },
    { hex: '#F5F5F7', name: 'أبيض لؤلؤي', nameEn: 'Pearl White', aliases: ['pearl white', 'pearl', 'ابيض لؤلؤي', 'أبيض لؤلؤي', 'لؤلؤي'] },
    { hex: '#2C2C2C', name: 'أسود مطفي', nameEn: 'Matte Black', aliases: ['matte black', 'اسود مطفي', 'أسود مطفي'] },

    { hex: '#F9F9F9', name: 'أبيض فاقع', nameEn: 'Cool White', aliases: ['cool white', 'ابيض فاقع', 'أبيض فاقع'] },
    { hex: '#1A1A1A', name: 'أسود فاقع', nameEn: 'Cool Black', aliases: ['cool black', 'اسود فاقع', 'أسود فاقع'] },
    { hex: '#EBC1D5', name: 'وردي فاتح', nameEn: 'Light Pink', aliases: ['baby pink', 'light pink', 'وردي فاتح'] },
    { hex: '#A6E3D1', name: 'أخضر نعناعي', nameEn: 'Mint Green', aliases: ['mint green', 'mint', 'اخضر نعناعي', 'أخضر نعناعي'] },

    { hex: '#A594F1', name: 'بنفسجي فاتح', nameEn: 'Light Purple', aliases: ['light purple', 'lavender', 'بنفسجي فاتح', 'لافندر'] },
    { hex: '#F9D342', name: 'أصفر خردلي', nameEn: 'Mustard', aliases: ['mustard', 'اصفر خردلي', 'أصفر خردلي'] },
    { hex: '#545454', name: 'رمادي غامق', nameEn: 'Dark Gray', aliases: ['dark gray', 'dark grey', 'رمادي غامق'] },

    { hex: '#D4AF37', name: 'ذهبي فاتح', nameEn: 'Light Gold', aliases: ['light gold', 'ذهبي فاتح', 'تيتانيوم ذهبي'] },
    { hex: '#C0C0C0', name: 'فضي فاتح', nameEn: 'Light Silver', aliases: ['light silver', 'فضي فاتح', 'تيتانيوم فضي'] },
    { hex: '#808080', name: 'رصاصي', nameEn: 'Slate Gray', aliases: ['slate gray', 'رصاصي', 'سليت', '0xff808080', '#808080'] },

    { hex: '#00B5AD', name: 'فيروزي', nameEn: 'Turquoise', aliases: ['turquoise', 'فيروزي', 'تيل زاهي'] },
    { hex: '#0055B8', name: 'أزرق ملكي', nameEn: 'Royal Blue', aliases: ['royal blue', 'ازرق ملكي', 'أزرق ملكي'] },

    { hex: '#7B9E9E', name: 'أخضر باهت', nameEn: 'Dusty Green', aliases: ['dusty green', 'اخضر باهت', 'أخضر باهت'] },
    { hex: '#8BA2C1', name: 'أزرق رمادي', nameEn: 'Steel Blue', aliases: ['steel blue', 'ازرق رمادي', 'أزرق رمادي'] },
    { hex: '#324A76', name: 'كحلي', nameEn: 'Navy Blue', aliases: ['navy blue', 'navy', 'كحلي', 'كحلي فاتح'] },

    { hex: '#8B0000', name: 'أحمر داكن', nameEn: 'Dark Red', aliases: ['احمر داكن', 'أحمر داكن', 'دم الغزال', 'dark red'] },
    { hex: '#DC143C', name: 'قرمزي', nameEn: 'Crimson', aliases: ['قرمزي', 'crimson'] },
    { hex: '#800000', name: 'عنابي', nameEn: 'Maroon', aliases: ['ماروني', 'عنابي', 'maroon'] },
    { hex: '#FF7F50', name: 'مرجاني', nameEn: 'Coral', aliases: ['مرجاني', 'coral'] },
    { hex: '#FFDAB9', name: 'خوخي', nameEn: 'Peach', aliases: ['خوخي', 'peach'] },
    { hex: '#B22222', name: 'طوبي', nameEn: 'Brick', aliases: ['طوبي', 'brick'] },
    { hex: '#E25822', name: 'ناري', nameEn: 'Flame', aliases: ['ناري', 'flame'] },
    { hex: '#C21E56', name: 'أحمر وردي', nameEn: 'Rose Red', aliases: ['احمر وردي', 'أحمر وردي', 'rose red'] },

    { hex: '#191970', name: 'أزرق ليلي', nameEn: 'Midnight Blue', aliases: ['ازرق ليلي', 'أزرق ليلي', 'midnight blue'] },
    { hex: '#4B0082', name: 'نيلي', nameEn: 'Indigo', aliases: ['نيلي', 'indigo'] },
    { hex: '#FF00FF', name: 'أرجواني', nameEn: 'Magenta', aliases: ['ارجواني', 'أرجواني', 'magenta'] },
    { hex: '#C8A2C8', name: 'ليلكي', nameEn: 'Lilac', aliases: ['ليلكي', 'lilac'] },
    { hex: '#ADD8E6', name: 'أزرق فاتح', nameEn: 'Light Blue', aliases: ['ازرق فاتح', 'أزرق فاتح', 'light blue'] },
    { hex: '#0077BE', name: 'أزرق بحري', nameEn: 'Ocean Blue', aliases: ['ازرق بحري', 'أزرق بحري', 'ocean blue'] },
    { hex: '#301934', name: 'بنفسجي داكن', nameEn: 'Dark Purple', aliases: ['بنفسجي داكن', 'dark purple'] },
    { hex: '#8A2BE2', name: 'توتي', nameEn: 'Berry', aliases: ['توتي', 'berry'] },

    { hex: '#006400', name: 'أخضر غامق', nameEn: 'Dark Green', aliases: ['اخضر غامق', 'أخضر غامق', 'dark green'] },
    { hex: '#808000', name: 'زيتوني', nameEn: 'Olive', aliases: ['زيتوني', 'olive'] },
    { hex: '#00FF00', name: 'ليموني', nameEn: 'Lime', aliases: ['ليموني', 'lime'] },
    { hex: '#50C878', name: 'زمردي', nameEn: 'Emerald', aliases: ['زمردي', 'emerald'] },
    { hex: '#228B22', name: 'غابة', nameEn: 'Forest Green', aliases: ['غابة', 'forest green'] },
    { hex: '#E6BE8A', name: 'ذهبي مطفي', nameEn: 'Matte Gold', aliases: ['ذهبي مطفي', 'matte gold'] },
    { hex: '#FFF700', name: 'ليموني فاتح', nameEn: 'Lemon', aliases: ['ليموني فاتح', 'lemon'] },
    { hex: '#8DB600', name: 'أخضر تفاحي', nameEn: 'Apple Green', aliases: ['اخضر تفاحي', 'أخضر تفاحي', 'apple green'] },

    { hex: '#383838', name: 'جرافيت', nameEn: 'Graphite', aliases: ['جرافيت', 'graphite'] },
    { hex: '#36454F', name: 'فحمي', nameEn: 'Charcoal', aliases: ['فحمي', 'charcoal'] },
    { hex: '#848884', name: 'دخان', nameEn: 'Smoke', aliases: ['دخان', 'smoke'] },
    { hex: '#A8A9AD', name: 'فضي معدني', nameEn: 'Metallic Silver', aliases: ['فضي معدني', 'metallic silver'] },
    { hex: '#0A0A0A', name: 'أسود فاحم', nameEn: 'Jet Black', aliases: ['اسود فاحم', 'أسود فاحم', 'jet black'] },
    { hex: '#D3D3D3', name: 'رمادي فاتح', nameEn: 'Light Gray', aliases: ['رمادي فاتح', 'light gray'] },
    { hex: '#E5E4E2', name: 'بلاتيني', nameEn: 'Platinum', aliases: ['بلاتيني', 'platinum'] },
    { hex: '#878681', name: 'تيتانيوم', nameEn: 'Titanium', aliases: ['تيتانيوم', 'titanium'] },
    { hex: '#928E85', name: 'رمادي صخري', nameEn: 'Stone Gray', aliases: ['رمادي صخري', 'stone gray'] },

    { hex: '#F5F5DC', name: 'بيج', nameEn: 'Beige', aliases: ['بيج', 'beige'] },
    { hex: '#D2691E', name: 'شوكولاتة', nameEn: 'Chocolate', aliases: ['شوكولاتة', 'chocolate'] },
    { hex: '#C2B280', name: 'رملي', nameEn: 'Sand', aliases: ['رملي', 'sand'] },
    { hex: '#FFFFF0', name: 'عاجي', nameEn: 'Ivory', aliases: ['عاجي', 'ivory', 'اوف وايت', 'أوف وايت'] },
    { hex: '#FFFDD0', name: 'كريمي', nameEn: 'Cream', aliases: ['كريمي', 'cream'] },
    { hex: '#C3B091', name: 'خاكي', nameEn: 'Khaki', aliases: ['خاكي', 'khaki'] },
    { hex: '#CD7F32', name: 'برونزي', nameEn: 'Bronze', aliases: ['برونزي', 'bronze'] },
    { hex: '#B87333', name: 'نحاسي', nameEn: 'Copper', aliases: ['نحاسي', 'copper'] },
    { hex: '#6F4E37', name: 'قهوة', nameEn: 'Coffee', aliases: ['قهوة', 'coffee'] }
];

const COLOR_TOKEN_MAP = {};
for (const def of CATALOG_COLOR_DEFINITIONS) {
    for (const alias of def.aliases) {
        COLOR_TOKEN_MAP[alias.toLowerCase()] = { hex: def.hex, name: def.name, nameEn: def.nameEn };
    }
}

/**
 * Port of CatalogColorTokens.parseFlexibleHexColorOrNull from Yemen4g_main.
 */
function parseFlexibleHexColorOrNull(input) {
    const cleaned = String(input || '').trim().replace(/^#|^0x/i, '');
    if (cleaned.length !== 6 && cleaned.length !== 8) return null;
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
    const rgb = cleaned.length === 8 ? cleaned.slice(2) : cleaned;
    return `#${rgb.toUpperCase()}`;
}

function resolveColorToken(rawColor) {
    const raw = String(rawColor || '').trim();
    if (!raw) return null;
    const key = raw.toLowerCase();
    if (COLOR_TOKEN_MAP[key]) {
        return {
            raw,
            name: COLOR_TOKEN_MAP[key].name,
            nameEn: COLOR_TOKEN_MAP[key].nameEn,
            hex: COLOR_TOKEN_MAP[key].hex
        };
    }
    const parsedHex = parseFlexibleHexColorOrNull(raw);
    if (parsedHex) {
        const byHex = CATALOG_COLOR_DEFINITIONS.find(d => d.hex.toUpperCase() === parsedHex.toUpperCase());
        return {
            raw,
            name: byHex ? byHex.name : raw,
            nameEn: byHex ? byHex.nameEn : raw,
            hex: parsedHex
        };
    }
    return { raw, name: raw, nameEn: raw, hex: '#757575' };
}

/**
 * Port of ProductRepositoryImpl.resolveModemSettings + ModemDetailsShareFormatter.resolveModemCredentials:
 * Extracts and normalizes modemSettings from:
 * 1. item.additional.modemSettings
 * 2. item.metadata2
 * 3. item.relatedData.attributes
 * 4. item.relatedData.contentResources (MODEM_SETTINGS or supported private gateway URLs)
 */
function extractModemSettings(item) {
    const raw = item.additional?.modemSettings || {};
    const meta = item.metadata2 || {};
    const attrs = item.relatedData?.attributes || [];
    const resources = item.relatedData?.contentResources || [];

    const findAttr = (codes, nameTerms = []) => {
        const hit = attrs.find(a => {
            if (!a || a.active === false || !a.value) return false;
            const code = String(a.attribute?.code || a.code || '').toLowerCase();
            const name = String(a.attribute?.name || a.attribute?.title || a.description || '').toLowerCase();
            if (codes.includes(code)) return true;
            return nameTerms.some(term => name.includes(term));
        });
        return hit ? String(hit.value).trim() : '';
    };

    const resourceLogin = resources.find(r => {
        if (!r || r.active === false) return false;
        const rType = String(r.type || '').toUpperCase();
        const rUrl = String(r.content || r.action?.content || '').trim();
        return rType === 'MODEM_SETTINGS' || isSupportedPrivateModemUrl(rUrl);
    });
    const resourceUrl = resourceLogin ? String(resourceLogin.content || resourceLogin.action?.content || '').trim() : '';

    const rawLoginLink = (
        raw.loginLink ||
        raw.ipAddress ||
        meta.loginLink ||
        meta.ipAddress ||
        findAttr(['login-link', 'gateway-ip', 'admin-url', 'ip-address'], ['ip', 'gateway', 'login', 'عنوان الدخول', 'عنوان الاعدادات']) ||
        resourceUrl
    ).trim();

    const loginLink = normalizeModemUrl(rawLoginLink);
    const loginLinkPath = String(raw.loginLinkPath ?? meta.loginLinkPath ?? findAttr(['login-link-path', 'admin-path']) ?? '').trim();
    const rawLoginBy = normalizeModemLoginBy(raw.loginBy || meta.loginBy || findAttr(['login-by', 'auth-type']));
    const rawUser = String(
        raw.defaultUserName ??
        meta.defaultUserName ??
        meta.userName ??
        findAttr(['default-username', 'admin-user', 'username'], ['username', 'اسم المستخدم']) ??
        ''
    ).trim();
    const rawPass = String(
        raw.defaultPass ??
        meta.defaultPass ??
        meta.password ??
        findAttr(['default-pass', 'admin-password', 'password'], ['password', 'كلمة المرور']) ??
        ''
    ).trim();

    if (!loginLink && !rawUser && !rawPass) {
        return null;
    }

    const effectiveLoginLink = loginLink || 'http://192.168.0.1';
    const fullLoginUrl = buildModemUrl(effectiveLoginLink, loginLinkPath);
    let ipAddress = String(raw.ipAddress || meta.ipAddress || '').trim();
    if (!ipAddress) {
        try {
            ipAddress = new URL(effectiveLoginLink).hostname;
        } catch (_) {
            ipAddress = effectiveLoginLink.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        }
    }

    const loginBy = rawLoginBy === 'PASS'
        ? 'PASS'
        : (rawLoginBy === 'USER_PASS'
            ? 'USER_PASS'
            : (rawPass.toUpperCase() === 'OUT' && !rawUser ? 'PASS' : 'USER_PASS'));

    const defaultUserName = loginBy === 'PASS' ? '' : (rawUser || 'admin');
    const defaultPass = loginBy === 'PASS'
        ? (isPrintedPassword(rawPass) ? 'OUT' : rawPass)
        : (rawPass || 'admin');

    return {
        ipAddress,
        loginLink: effectiveLoginLink,
        loginLinkPath,
        fullLoginUrl,
        loginBy,
        ...(defaultUserName ? { defaultUserName } : {}),
        defaultPass,
        hasPrintedPassword: isPrintedPassword(defaultPass),
        ...(raw.subnetMask ? { subnetMask: String(raw.subnetMask).trim() } : {}),
        ...(raw.gateway ? { gateway: String(raw.gateway).trim() } : {}),
        ...(raw.dns ? { dns: String(raw.dns).trim() } : {})
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

function formatAttributeDisplayValue(code, rawVal, unit = '') {
    const val = String(rawVal || '').trim();
    const cleanUnit = String(unit || '').trim();
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
    if (cleanUnit && !val.toLowerCase().includes(cleanUnit.toLowerCase())) {
        return `${val} ${cleanUnit}`;
    }
    return val;
}

function formatOperatingHours(hoursList, fallbackHours = '') {
    if (Array.isArray(hoursList) && hoursList.length > 0) {
        const openDays = hoursList.filter(h => h && h.isOpen !== false && h.openTime && h.closeTime);
        if (openDays.length > 0) {
            const first = openDays[0];
            return `من ${first.openTime} إلى ${first.closeTime}`;
        }
    }
    const cleanFallback = String(fallbackHours || '').trim();
    if (cleanFallback) {
        const parts = cleanFallback.split(/\s*-\s*/);
        if (parts.length === 2 && parts[0] && parts[1]) {
            return `من ${parts[0]} إلى ${parts[1]}`;
        }
        return cleanFallback;
    }
    return '';
}

async function main() {
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    let rawModems = [];
    let rawOrgs = [];
    const listsTipsBySlug = new Map();

    if (fs.existsSync(V8_LISTS_PATH)) {
        try {
            const listsDoc = JSON.parse(fs.readFileSync(V8_LISTS_PATH, 'utf8'));
            for (const lItem of (listsDoc.items || [])) {
                if (lItem && !isDevRecord(lItem) && lItem.slug && Array.isArray(lItem.tips) && lItem.tips.length > 0) {
                    listsTipsBySlug.set(String(lItem.slug).trim(), lItem.tips.filter(Boolean));
                }
            }
        } catch (_) {
            // Optional fallback only
        }
    }

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
                label: (p.name || p.title || 'للتواصل').trim(),
                type: p.type || 'MOBILE',
                hasWhatsapp: Boolean(p.accounts?.hasWhatsapp)
            });
        }
        for (const p of (org.relatedData?.contacts?.phones || [])) {
            if (p && p.active === false) continue;
            const num = String(p.value || p.number || '').trim();
            if (!num) continue;
            if (!phoneMap.has(num)) {
                phoneMap.set(num, {
                    number: num,
                    label: (p.title || p.name || 'للتواصل').trim(),
                    type: p.type || 'MOBILE',
                    hasWhatsapp: Boolean(p.accounts?.hasWhatsapp)
                });
            }
        }

        // Merge emails from relatedData.contacts.emails and contact.emails (deduplicated)
        const emailMap = new Map();
        for (const e of [...(org.relatedData?.contacts?.emails || []), ...(org.contact?.emails || [])]) {
            if (!e || e.active === false) continue;
            const addr = String(e.value || e.email || '').trim();
            if (!addr) continue;
            const key = addr.toLowerCase();
            if (!emailMap.has(key)) {
                emailMap.set(key, {
                    email: addr,
                    label: (e.title || e.label || 'البريد الإلكتروني').trim()
                });
            }
        }
        const emails = Array.from(emailMap.values());

        const addrObj = org.relatedData?.contacts?.addresses?.find(a => a && a.active !== false) ||
            org.contact?.address ||
            null;
        const formattedAddress = addrObj
            ? (addrObj.formattedAddress || [addrObj.country, addrObj.state, addrObj.city, addrObj.street].filter(Boolean).join('، ')).trim()
            : '';
        const mapsUrl = addrObj
            ? String(addrObj.mapsUrl || addrObj.coordinates?.googleMapUrl || '').trim()
            : '';

        const rawWebsite = org.relatedData?.contacts?.websites?.find(w => w && w.active !== false)?.content ||
            org.contact?.website ||
            '';
        const website = normalizeWebsiteUrl(rawWebsite);

        const seenSocialUrls = new Set();
        const socialLinks = (org.relatedData?.contacts?.socialMedias || org.contact?.socialLinks || [])
            .filter(s => s && s.active !== false)
            .map(s => {
                const url = normalizeWebsiteUrl(s.url || s.value || '');
                return {
                    platform: String(s.platform || s.platformName || '').toLowerCase(),
                    url,
                    label: (s.title || s.label || s.platform || s.platformName || '').trim()
                };
            })
            .filter(s => {
                if (!s.url || s.url.includes('UCxxxx') || seenSocialUrls.has(s.url)) return false;
                seenSocialUrls.add(s.url);
                return true;
            });

        const categories = (org.relatedData?.categories || [])
            .filter(c => c && c.active !== false)
            .map(c => c.category?.name || '')
            .filter(name => name && name !== 'شركات الاتصالات وتقنية المعلومات');

        orgsMap[orgId] = {
            id: orgId,
            name: (org.nameAr || org.name || '').trim(),
            nameEn: (org.nameEn || org.name || '').trim(),
            role: org.role || '',
            isVerified: Boolean(org.isVerified || org.verified),
            description: (org.description || '').trim(),
            ...(org.advantages ? { advantages: String(org.advantages).trim() } : {}),
            logo: localLogoUrl || remoteLogo,
            logoBackup: remoteLogo,
            categories,
            website,
            phones: Array.from(phoneMap.values()),
            emails,
            address: formattedAddress,
            ...(mapsUrl ? { mapsUrl } : {}),
            operatingHours: formatOperatingHours(org.relatedData?.contacts?.operatingHours || [], org.workingHours),
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
        let localPrimaryImg = 'https://connecttag.org/assets/img/covers/modems-catalog-cover.webp';

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

        // Gallery Media (sorted by orderIndex, preserving isMain & caption)
        const gallery = [];
        const rawMedias = [...(item.relatedData?.medias || [])]
            .filter(med => med && med.active !== false)
            .sort((a, b) => (a.orderIndex ?? a.sortOrder ?? 99) - (b.orderIndex ?? b.sortOrder ?? 99));

        for (const med of rawMedias) {
            // Skip known cross-linked Vortex image on SAM M50 (media id 1021)
            if (String(med.id) === '1021' && String(item.id) === '1437414') continue;
            const mediaRemoteUrl = (med.mediaUrl || med.image?.content || '').trim().replace('cdn.connecttag.org', 'cdn.connecttag.net');
            if (!mediaRemoteUrl.startsWith('http')) continue;

            const parsedUrl = new URL(mediaRemoteUrl);
            const ext = path.extname(parsedUrl.pathname) || '.webp';
            const scopedFileName = `media-${med.id}-${item.id}${ext}`;
            const fileName = fs.existsSync(path.join(IMAGES_DIR, scopedFileName))
                ? scopedFileName
                : `media-${med.id}${ext}`;
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
                caption: (med.caption || med.description || '').trim(),
                ...(med.isMain ? { isMain: true } : {})
            });
        }

        // Technical Attributes (UiContentDetailExtensions.getFilteredAttributes + DetailTechnicalSections)
        const attributes = (item.relatedData?.attributes || [])
            .filter(a => a && a.active !== false && a.attribute?.active !== false && (a.value ?? a.attribute?.value))
            .sort((a, b) => (a.orderIndex ?? a.attribute?.orderIndex ?? 99) - (b.orderIndex ?? b.attribute?.orderIndex ?? 99))
            .map(a => {
                const attrObj = a.attribute || {};
                const code = attrObj.code || a.code || String(a.attributeId || '');
                const rawVal = String(a.value ?? attrObj.value ?? '').trim();
                const unit = String(attrObj.unit || a.unit || '').trim();
                const note = String(a.note || attrObj.note || '').trim();
                return {
                    code,
                    name: (attrObj.name || attrObj.title || a.description || '').trim(),
                    nameEn: (attrObj.nameEn || '').trim(),
                    value: rawVal,
                    ...(unit ? { unit } : {}),
                    displayValue: formatAttributeDisplayValue(code, rawVal, unit),
                    group: (a.group || attrObj.group || 'المواصفات العامة').trim(),
                    ...(note ? { note } : {})
                };
            });

        // Tags (UiContentDetailExtensions.getFilteredTags)
        const tags = (item.relatedData?.tags || [])
            .filter(t => t && t.active !== false && t.tag?.active !== false && t.tag?.name)
            .sort((a, b) => (a.orderIndex ?? a.tag?.orderIndex ?? 99) - (b.orderIndex ?? b.tag?.orderIndex ?? 99))
            .map(t => ({
                name: t.tag.name.trim(),
                nameEn: (t.tag.nameEn || '').trim(),
                code: (t.tag.code || '').trim(),
                color: t.tag.color || '#0052cc'
            }));

        // Colors Palette (CatalogColorTokens + DynamicHeader.kt distinct() + DetailTechnicalSections.ColorPaletteSection)
        const seenRawColors = new Set();
        const colors = Array.isArray(item.colors)
            ? item.colors
                .filter(c => {
                    const key = String(c || '').trim().toLowerCase();
                    if (!key || seenRawColors.has(key)) return false;
                    seenRawColors.add(key);
                    return true;
                })
                .map(resolveColorToken)
                .filter(Boolean)
            : [];

        // Content Resources & Attachments (UiContentDetailExtensions.getFilteredResources / getFilteredAttachments)
        const seenResourceUrls = new Set();
        const allRawResources = [
            ...(item.relatedData?.contentResources || []),
            ...(item.references || []),
            ...(item.attachments || []).map(att => ({ ...att, type: 'ATTACHMENT' }))
        ];

        const normalizedAllResources = allRawResources
            .filter(r => r && r.active !== false && (r.content || r.url || r.action?.content))
            .sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99))
            .map(r => {
                const url = String(r.content || r.url || r.action?.content || '').trim();
                const rType = String(r.type || 'REF').trim().toUpperCase();
                const isApp = isModemAppResource(r);
                const contentType = String(r.contentType || (isApp ? 'APP' : 'LINK')).trim().toUpperCase();
                const imgUrl = String(r.image?.content || '').trim();
                return {
                    title: (r.title || r.name || 'مورد مرفق').trim(),
                    description: (r.description || '').trim(),
                    group: (r.group || (isApp ? 'تطبيقات' : 'مراجع عامة')).trim(),
                    url,
                    type: rType,
                    contentType,
                    isApp,
                    ...(imgUrl ? { image: imgUrl } : {})
                };
            })
            .filter(r => {
                // Exclude raw private gateway IPs or MODEM_SETTINGS links from external resources
                if (!r.url || r.type === 'MODEM_SETTINGS' || isSupportedPrivateModemUrl(r.url)) return false;
                if (seenResourceUrls.has(r.url)) return false;
                seenResourceUrls.add(r.url);
                return true;
            });

        const resources = normalizedAllResources.filter(r => r.type !== 'ATTACHMENT');
        const attachments = normalizedAllResources.filter(r => r.type === 'ATTACHMENT');

        // FAQs (UiContentDetailExtensions.getFilteredFaqs)
        const faqs = (item.relatedData?.faqs || item.faq || [])
            .filter(f => f && f.active !== false && f.question && f.answer)
            .sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99))
            .map(f => ({
                question: String(f.question).trim(),
                answer: String(f.answer).trim(),
                group: String(f.group || 'أسئلة عامة').trim()
            }));

        // Linked Providers / Organizations (UiContentDetailExtensions.getFilteredOrganizations, excluding dev organizations)
        const seenOrgIds = new Set();
        const providers = (item.relatedData?.organizations || [])
            .filter(o => o && o.active !== false && !DEV_ENTITY_IDS.has(String(o.organizationId)) && !isDevRecord(o.organization))
            .sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99))
            .map(o => ({
                orgId: String(o.organizationId),
                role: (o.role || 'الوكيل المعتمد').trim()
            }))
            .filter(p => {
                if (!p.orgId || seenOrgIds.has(p.orgId)) return false;
                seenOrgIds.add(p.orgId);
                return true;
            });

        // Related Modems / Entity Links (ProductRepositoryImpl + UiContentDetailExtensions.getFilteredRelations)
        const relatedLinks = (item.relatedData?.entityLinks || [])
            .filter(l => l && l.active !== false && l.sourceEntityType === 'PRODUCT' && l.targetEntityType === 'PRODUCT')
            .filter(l => !DEV_ENTITY_IDS.has(String(l.sourceEntityId)) && !DEV_ENTITY_IDS.has(String(l.targetEntityId)))
            .filter(l => {
                const isOutgoing = String(l.sourceEntityId) === String(item.id);
                const isIncomingBidirectional = String(l.targetEntityId) === String(item.id) &&
                    (l.bidirectional === true || Boolean(l.inverseRelationTypeId));
                return isOutgoing || isIncomingBidirectional;
            })
            .sort((a, b) => {
                const orderDiff = (a.orderIndex ?? 99) - (b.orderIndex ?? 99);
                if (orderDiff !== 0) return orderDiff;
                return (b.strength ?? 0) - (a.strength ?? 0);
            })
            .map(l => {
                const targetId = String(l.sourceEntityId) === String(item.id)
                    ? String(l.targetEntityId)
                    : String(l.sourceEntityId);
                let reason = '';
                if (l.metadataJson) {
                    try {
                        const parsedMeta = JSON.parse(l.metadataJson);
                        reason = String(parsedMeta.reason || '').trim();
                    } catch (_) {}
                }
                return {
                    targetId,
                    relationCode: l.relationType?.code || 'similar',
                    relationName: l.relationType?.name || 'مودم مشابه',
                    ...(reason ? { reason } : {})
                };
            })
            .filter(l => l.targetId && l.targetId !== String(item.id));

        const brandStr = (item.brand || item.manufacturer || 'عام').trim();
        const rawModelOrVersion = (item.modelOrVersion || item.model || '').replace(/M90-RRO/i, 'M90-PRO').trim();
        const rawModel = (item.model || item.modelOrVersion || '').replace(/M90-RRO/i, 'M90-PRO').trim();
        const resolvedModemSettings = extractModemSettings(item);

        const notes = String(item.notes || '').trim();
        const hint = String(item.hint || '').trim();
        const alertMessage = String(item.alertMessage || '').trim();
        const hintMessage = String(item.hintMessage || '').trim();
        const infoMessage = String(item.infoMessage || '').trim();
        const advantages = String(item.advantages || '').trim();
        const itemTips = Array.isArray(item.tips) && item.tips.length > 0
            ? item.tips.filter(Boolean)
            : (listsTipsBySlug.get(canonicalSlug) || []);

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
            ...(notes ? { notes } : {}),
            ...(hint ? { hint } : {}),
            ...(alertMessage ? { alertMessage } : {}),
            ...(hintMessage ? { hintMessage } : {}),
            ...(infoMessage ? { infoMessage } : {}),
            ...(advantages ? { advantages } : {}),
            availabilityStatus: item.availabilityStatus || '',
            countryOfOrigin: item.countryOfOrigin || 'الصين',
            keyWords: item.keyWords || '',
            keyWordsEnglish: item.keyWordsEnglish || '',
            isNew: Boolean(item.isNew),
            tips: itemTips,
            ...(colors.length > 0 ? { colors } : {}),
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
                hasTouchScreen: Boolean(item.additional?.hasTouchScreen || hasTouchScreenHint(item.description)),
                ...(resolvedModemSettings ? { modemSettings: resolvedModemSettings } : {})
            },
            attributes,
            tags,
            resources,
            ...(attachments.length > 0 ? { attachments } : {}),
            ...(faqs.length > 0 ? { faqs } : {}),
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
