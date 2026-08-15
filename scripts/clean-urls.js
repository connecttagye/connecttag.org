/**
 * Connect Tag - Clean URLs Utility (V2)
 * Comprehensive removal of .html extensions from links and logic.
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
            if (file !== 'node_modules' && file !== '.git' && file !== '.idea' && file !== 'scripts') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles(ROOT_DIR);
const targetFiles = allFiles.filter(f => f.endsWith('.html') || f.endsWith('.js'));

targetFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Replace folder/index.html with folder/
    content = content.replace(/([^a-zA-Z0-9])([^"']*\/)index\.html/g, '$1$2');

    // 2. Replace standalone index.html with ./
    content = content.replace(/([^a-zA-Z0-9/])index\.html/g, '$1./');

    // 3. Remove .html from internal links (href="...")
    content = content.replace(/href="((?![a-z]+:\/\/|mailto:|tel:|#)[^"]+)\.html"/g, 'href="$1"');

    // This is safer as it looks for .html preceded by a path-like string inside quotes
    content = content.replace(/(["'])((?![a-z]+:\/\/|mailto:|tel:|#)[^"']+)\.html\1/g, '$1$2$1');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Cleaned URLs in: ${path.relative(ROOT_DIR, file)}`);
    }
});

console.log('--- URL Cleaning Completed Successfully (V2) ---');
