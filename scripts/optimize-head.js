/**
 * Connect Tag - Head Optimization Script (V2 - Safe & Precise)
 * Injects essential meta tags statically before </head> and cleans head-includes.js.
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

console.log(`🚀 Starting optimization for ${htmlFiles.length} files...`);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Safety: Skip if already optimized or manifest exists
    if (content.includes('rel="manifest"') || content.includes("rel='manifest'")) {
        console.log(`- Skipped (already has manifest): ${path.relative(ROOT_DIR, file)}`);
        return;
    }

    const relativePath = path.relative(path.dirname(file), ROOT_DIR);
    const prefix = relativePath ? relativePath.replace(/\\/g, '/') + '/' : './';

    const tagsToInject = `
  <!-- PWA & Mobile Optimization Tags -->
  <link rel="icon" href="${prefix}favicon.webp" type="image/webp">
  <link rel="apple-touch-icon" href="${prefix}icon-192.png">
  <link rel="manifest" href="${prefix}manifest.json">
  <meta name="theme-color" content="#0077b6">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`;

    // Final Injection Logic: Place right before </head>
    if (content.toLowerCase().includes('</head>')) {
        // We use a regex with 'i' flag for case-insensitive matching of </head>
        const updatedContent = content.replace(/<\/head>/i, tagsToInject + '\n</head>');
        fs.writeFileSync(file, updatedContent);
        console.log(`+ Optimized: ${path.relative(ROOT_DIR, file)}`);
    } else {
        console.log(`! Warning: No </head> tag found in: ${path.relative(ROOT_DIR, file)}`);
    }
});

// Step 2: Clean assets/js/components/head-includes.js
const headJsPath = path.join(ROOT_DIR, 'assets/js/components/head-includes.js');
if (fs.existsSync(headJsPath)) {
    let jsContent = fs.readFileSync(headJsPath, 'utf8');

    // Safely remove the Favicon/Manifest/ThemeColor logic block
    const cleanedJs = jsContent.replace(/\/\/ Favicon[\s\S]*?\/\/ Register Service Worker/m, '// Register Service Worker');

    // Remove the helper functions that are now obsolete
    const finalJs = cleanedJs.replace(/\/\/ Helper to add link tags[\s\S]*?\/\/ Helper to add meta tags[\s\S]*?};/m, '');

    if (jsContent !== finalJs) {
        fs.writeFileSync(headJsPath, finalJs);
        console.log('✓ Cleaned assets/js/components/head-includes.js');
    }
}

console.log('--- Optimization Completed Successfully ---');
