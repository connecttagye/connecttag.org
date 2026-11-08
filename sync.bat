@echo off
echo [Connect Tag] Starting Version & SEO Synchronization...
node scripts/sync-version.js
node scripts/sync-seo.js
echo.
echo [Done] All files, sitemaps, RSS feed, and GEO indexes updated to the latest version.
pause
