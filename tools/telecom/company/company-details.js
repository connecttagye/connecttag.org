document.addEventListener('DOMContentLoaded', function() {
    const params = CompanyApp.getQueryParams();
    const querySlug = params.get('slug');
    const queryId = params.get('id');

    if (!querySlug && !queryId) {
        window.location.href = './';
        return;
    }

    let rendered = false;
    const cachedData = CompanyApp.loadFromCache();
    if (cachedData && Array.isArray(cachedData.companies)) {
        const matched = cachedData.companies.find(c => (querySlug && c.slug === querySlug) || (queryId && String(c.id) === String(queryId)));
        if (matched) {
            renderDetails(matched);
            rendered = true;
        }
    }

    CompanyApp.fetchData(data => {
        const company = data.companies.find(c => (querySlug && c.slug === querySlug) || (queryId && String(c.id) === String(queryId)));
        if (company) {
            renderDetails(company);
        } else if (!rendered) {
            handleNotFound();
        }
    }, () => {
        if (!rendered) handleNotFound();
    }, rendered);

    function renderDetails(c) {
        const displayName = c.arName || c.name || 'تفاصيل الشركة';
        const displayDesc = c.arDescription || c.description || `استعرض كافة خدمات وأكواد وباقات شركة ${displayName} في اليمن.`;

        document.title = `${displayName} - الخدمات والأكواد والباقات | كونكت تاق`;
        document.getElementById('breadcrumb-company-name').textContent = displayName;

        const logoEl = document.getElementById('comp-logo');
        logoEl.src = c.logo;
        logoEl.alt = `شعار شركة ${displayName}`;
        logoEl.onerror = function() {
            this.src = 'https://connecttag.org/assets/img/connect-tag-official-logo.webp';
        };

        document.getElementById('comp-name').textContent = displayName;
        document.getElementById('comp-desc').textContent = displayDesc;

        const compWeb = document.getElementById('comp-web');
        if (c.website) {
            compWeb.href = c.website;
            compWeb.textContent = c.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } else {
            compWeb.textContent = 'غير متوفر';
            compWeb.removeAttribute('href');
        }

        const phonesContainer = document.getElementById('comp-phones-container');
        phonesContainer.innerHTML = '';
        if (Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0) {
            c.phoneNumbers.forEach(p => {
                const phoneLink = document.createElement('a');
                phoneLink.href = `tel:${p}`;
                phoneLink.className = 'phone-tag';
                phoneLink.innerHTML = `<i class="fa-solid fa-phone-volume" style="font-size:11px; margin-left:4px;"></i> ${p}`;
                phonesContainer.appendChild(phoneLink);
            });
        } else {
            phonesContainer.textContent = 'غير متوفر';
        }

        const targetParam = c.slug ? `slug=${encodeURIComponent(c.slug)}` : `companyId=${encodeURIComponent(c.id)}`;
        document.getElementById('link-services').href = `services?${targetParam}`;
        document.getElementById('link-packages').href = `packages?${targetParam}`;

        const socialLinksDiv = document.getElementById('social-links');
        socialLinksDiv.innerHTML = '';
        if (Array.isArray(c.socialLinks)) {
            c.socialLinks.forEach(s => {
                if (s.active && s.value) {
                    const a = document.createElement('a');
                    a.href = s.value;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'social-btn';
                    a.setAttribute('aria-label', s.type || 'Social Link');

                    let iconHtml = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
                    const type = (s.type || '').toUpperCase();

                    if (type === 'FACEBOOK') iconHtml = '<i class="fa-brands fa-facebook-f"></i>';
                    else if (type === 'TWITTER' || type === 'X') {
                        iconHtml = '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
                    }
                    else if (type === 'INSTAGRAM') iconHtml = '<i class="fa-brands fa-instagram"></i>';
                    else if (type === 'YOUTUBE') iconHtml = '<i class="fa-brands fa-youtube"></i>';
                    else if (type === 'TELEGRAM') iconHtml = '<i class="fa-brands fa-telegram"></i>';
                    else if (type === 'WHATSAPP') iconHtml = '<i class="fa-brands fa-whatsapp"></i>';
                    else if (type === 'TIKTOK') {
                        iconHtml = '<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.13.47-.1.99.09 1.44.35 1.03 1.5 1.74 2.59 1.61.88-.04 1.65-.58 2.02-1.37.15-.33.24-.69.24-1.05V0z"/></svg>';
                    }
                    else if (type === 'SNAPCHAT') iconHtml = '<i class="fa-brands fa-snapchat"></i>';

                    a.innerHTML = iconHtml;
                    socialLinksDiv.appendChild(a);
                }
            });
        }

        updateSEO(displayName, displayDesc, c.logo);
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('company-content').style.display = 'block';
    }

    function updateSEO(name, desc, logo) {
        const pageTitle = `${name} - الخدمات والأكواد والباقات | كونكت تاق`;
        const currentUrl = window.location.href;
        const logoUrl = logo || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        document.getElementById('meta-description')?.setAttribute('content', desc);
        document.getElementById('canonical-url')?.setAttribute('href', currentUrl);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', logoUrl);

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', logoUrl);

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Organization",
            "name": name,
            "url": currentUrl,
            "logo": logoUrl,
            "description": desc
        };
        const schemaEl = document.getElementById('schema-org');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    function handleNotFound() {
        document.getElementById('loading-screen').style.display = 'none';
        CompanyApp.showToast('عذراً، الشركة غير موجودة أو تعذر تحميل البيانات.', 1500);
        setTimeout(() => {
            window.location.href = './';
        }, 1500);
    }
});
