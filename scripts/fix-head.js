/**
 * Connect Tag - Head Fix & Optimization Script
 * 1. Removes any previous bad injections.
 * 2. Injects meta tags safely before </head>.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../');

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
    const relativePath = path.relative(path.dirname(file), ROOT_DIR);
    const prefix = relativePath ? relativePath.replace(/\\/g, '/') + '/' : './';

    // 1. CLEANUP: Remove any existing injected tags (even if broken inside title)
    // We target the unique signature of our injection
    const tagSignature = /<link rel="icon" href="[^"]*favicon\.webp"[\s\S]*?apple-mobile-web-app-status-bar-style" content="black-translucent">/g;
    let cleanedContent = content.replace(tagSignature, '');

    // 2. REPAIR: If it was injected inside <title>, the title might be broken.
    // This is hard to automate perfectly, but we can try to find if <title> is split
    // For simplicity, we just look for </head> as our anchor now.

    const tagsToInject = `
  <link rel="icon" href="${prefix}favicon.webp" type="image/webp">
  <link rel="apple-touch-icon" href="${prefix}icon-192.png">
  <link rel="manifest" href="${prefix}manifest.json">
  <meta name="theme-color" content="#0077b6">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`;

    // 3. INJECT: Place before </head>
    if (cleanedContent.includes('</head>')) {
        const updatedContent = cleanedContent.replace('</head>', tagsToInject + '\n</head>');
        fs.writeFileSync(file, updatedContent);
        console.log(`✓ Repaired & Optimized: ${path.relative(ROOT_DIR, file)}`);
    }
});

console.log('--- Head Fix Completed Successfully ---');
