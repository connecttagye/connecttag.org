/**
 * Connect Tag - SEO & Path Optimizer
 * 1. Converts internal links to Root-Relative (starts with /).
 * 2. Ensures Canonical & OG tags use Full Absolute URLs.
 * 3. Removes .html extensions.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../');
const DOMAIN = 'https://connecttag.org';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.idea', 'scripts'].includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(ROOT_DIR);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    const fileName = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const pagePath = fileName === 'index.html' ? '' : fileName.replace('.html', '').replace(/\/index$/, '/');
    const fullCanonical = `${DOMAIN}/${pagePath}`.replace(/\/+$/, '');

    // 1. Fix Canonical Tags (Must be Absolute)
    content = content.replace(/<link rel="canonical" href="[^"]*"/g, `<link rel="canonical" href="${fullCanonical}"`);

    // 2. Fix OpenGraph URL (Must be Absolute)
    content = content.replace(/property="og:url" content="[^"]*"/g, `property="og:url" content="${fullCanonical}"`);

    // 3. Convert Internal Assets (src/href) to Root-Relative
    // Matches patterns like src="../assets/..." or href="assets/..."
    content = content.replace(/(src|href)="(?:\.\.\/|\.\/)*assets\//g, '$1="/assets/');

    // 4. Convert Internal Page Links to Root-Relative & Clean Extensions
    // Matches internal links that don't have http, mailto, etc.
    content = content.replace(/href="(?:\.\.\/|\.\/)+((?![a-z]+:\/\/|mailto:|tel:|#)[^"]+)"/g, (match, path) => {
        const cleanPath = path.replace(/\.html$/i, '').replace(/\/index$/, '/');
        return `href="/${cleanPath}"`;
    });

    // 5. Special Case for root files linked from subfolders (e.g. href="../contact")
    content = content.replace(/href="(?:\.\.\/)+contact"/g, 'href="/contact"');
    content = content.replace(/href="(?:\.\.\/)+faq"/g, 'href="/faq"');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`🚀 Optimized SEO for: ${fileName}`);
    }
});

console.log('--- SEO Path Optimization Completed ---');
