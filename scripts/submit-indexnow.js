/**
 * Connect Tag - IndexNow Instant Indexing Submitter
 * Submits all URLs from sitemap.xml to the IndexNow API (Bing, Yandex, Naver, Seznam, ChatGPT Search).
 * Usage: node scripts/submit-indexnow.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'connecttag.org';
const KEY = 'c7a9e4b2f8d143e6a5b0c2d8e9f1a3b5';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const sitemapPath = path.join(__dirname, '../sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: locMatches
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log(`Submitting ${locMatches.length} URLs from sitemap.xml to IndexNow API...`);
const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
        console.log(`IndexNow Response Status: ${res.statusCode} ${res.statusMessage}`);
        if (body) console.log(`Response Body: ${body}`);
    });
});

req.on('error', err => {
    console.error(`IndexNow Request Error: ${err.message}`);
});

req.write(payload);
req.end();
