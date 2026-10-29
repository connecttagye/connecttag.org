/**
 * Connect Tag - Version Sync Utility (Improved)
 * This script synchronizes the version across all HTML, JS, and SW files.
 */
const fs = require('fs');
const path = require('path');

// Root is now the parent of the script's directory
const ROOT_DIR = path.join(__dirname, '../');

// Load Source of Truth using absolute path
const configPath = path.join(__dirname, 'version.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const VERSION = config.version;
const CACHE_NAME = config.cache_version;

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.idea') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// 1. Update HTML files (Target only CSS and JS in assets/ or tools/)
const allFiles = getAllFiles(ROOT_DIR);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Improved Regex: Target .css and .js files inside assets/ or tools/
    const updatedContent = content.replace(/(href|src)="([^"]*(?:assets|tools)\/[^"]*\.(?:css|js))(\?v=[^"]*)?"/g, (match, attr, pathStr, oldV) => {
        return `${attr}="${pathStr}?v=${VERSION}"`;
    });

    if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        console.log(`Updated HTML: ${path.relative(ROOT_DIR, file)}`);
    }
});

// 2. Update sw.js (Be extremely specific to avoid breaking code)
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');

    // Update CACHE_NAME constant correctly
    swContent = swContent.replace(/const CACHE_NAME = 'connecttag-cache-v\d+';/, `const CACHE_NAME = 'connecttag-cache-${CACHE_NAME}';`);

    // Update asset versions ONLY in the ASSETS_TO_CACHE array or specific assets/ paths
    swContent = swContent.replace(/'([^']*assets\/[^']*\.(?:css|js))(\?v=[^']*)?'/g, (match, pathStr) => {
        return `'${pathStr}?v=${VERSION}'`;
    });

    fs.writeFileSync(swPath, swContent);
    console.log(`Updated sw.js to ${CACHE_NAME}`);
}

// 3. Update components-bundle.js & site-header.js
const bundlePath = path.join(ROOT_DIR, 'assets/js/components/components-bundle.js');
if (fs.existsSync(bundlePath)) {
    let bundleContent = fs.readFileSync(bundlePath, 'utf8');
    bundleContent = bundleContent.replace(/const ASSET_VERSION = '[^']*';/, `const ASSET_VERSION = '${VERSION}';`);
    bundleContent = bundleContent.replace(/(\.webp\?v=)[0-9.]+/g, `$1${VERSION}`);
    fs.writeFileSync(bundlePath, bundleContent);
    console.log(`Updated components-bundle.js to ${VERSION}`);
}

const headerPath = path.join(ROOT_DIR, 'assets/js/components/site-header.js');
if (fs.existsSync(headerPath)) {
    let headerContent = fs.readFileSync(headerPath, 'utf8');
    headerContent = headerContent.replace(/(\.webp\?v=)[0-9.]+/g, `$1${VERSION}`);
    fs.writeFileSync(headerPath, headerContent);
    console.log(`Updated site-header.js to ${VERSION}`);
}

// 4. Update CSS files with versioned .webp URLs
['assets/css/styles.css', 'assets/css/styles.min.css'].forEach(relCss => {
    const cssPath = path.join(ROOT_DIR, relCss);
    if (fs.existsSync(cssPath)) {
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        const updatedCss = cssContent.replace(/(\.webp\?v=)[0-9.]+/g, `$1${VERSION}`);
        if (cssContent !== updatedCss) {
            fs.writeFileSync(cssPath, updatedCss);
            console.log(`Updated ${relCss} to ${VERSION}`);
        }
    }
});

console.log('--- Version Sync Completed Successfully ---');
