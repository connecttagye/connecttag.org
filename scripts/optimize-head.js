/**
 * Connect Tag - Head Optimization Script (Safe Version)
 * Injects essential meta tags statically into HTML files and cleans head-includes.js.
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

console.log(`Starting optimization for ${htmlFiles.length} files...`);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(path.dirname(file), ROOT_DIR);
    const prefix = relativePath ? relativePath.replace(/\\/g, '/') + '/' : './';

    // Define the tags to inject
    const tags = `
  <link rel="icon" href="${prefix}favicon.webp" type="image/webp">
  <link rel="apple-touch-icon" href="${prefix}icon-192.png">
  <link rel="manifest" href="${prefix}manifest.json">
  <meta name="theme-color" content="#0077b6">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`;

    // Safety Check: Only inject if manifest isn't already there
    if (!content.includes('rel="manifest"') && !content.includes("rel='manifest'")) {
        // Inject after <title> or before the first <link/meta>
        const headMatch = content.match(/<head>[\s\S]*?<title>[\s\S]*?<\/title>/i);
        if (headMatch) {
            const insertionPoint = headMatch[0].length;
            const updatedContent = content.slice(0, insertionPoint) + tags + content.slice(insertionPoint);
            fs.writeFileSync(file, updatedContent);
            console.log(`+ Injected tags into: ${path.relative(ROOT_DIR, file)}`);
        }
    } else {
        console.log(`- Skipped (already exists): ${path.relative(ROOT_DIR, file)}`);
    }
});

// Step 2: Clean head-includes.js
const headJsPath = path.join(ROOT_DIR, 'assets/js/components/head-includes.js');
if (fs.existsSync(headJsPath)) {
    let jsContent = fs.readFileSync(headJsPath, 'utf8');

    // Remove the static tag injection logic but keep SW registration
    const cleanedJs = jsContent.replace(/\/\/ Favicon[\s\S]*?\/\/ Register Service Worker/m, '// Register Service Worker');

    // Also remove helper functions that are no longer used for tags
    const finalJs = cleanedJs.replace(/\/\/ Helper to add link tags[\s\S]*?\/\/ Helper to add meta tags[\s\S]*?};/m, '');

    if (jsContent !== finalJs) {
        fs.writeFileSync(headJsPath, finalJs);
        console.log('✓ Cleaned assets/js/components/head-includes.js');
    }
}

console.log('--- Head Optimization Completed Successfully ---');
