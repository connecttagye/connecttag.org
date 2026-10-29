document.addEventListener('DOMContentLoaded', function() {
    function setNoIndex() {
        if (!document.querySelector('meta[name="robots"]')) {
            const m = document.createElement('meta');
            m.name = 'robots';
            m.content = 'noindex';
            document.head.appendChild(m);
        }
    }

    function loadAdSenseOnce() {
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5795447491202357';
            s.crossOrigin = 'anonymous';
            document.head.appendChild(s);
        }
    }

    function hideLoading() {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.display = 'none';
    }

    const params = ModemApp.getQueryParams();
    const slug = params.get('slug');

    if (!slug) {
        setNoIndex();
        window.location.href = './';
        return;
    }

    const esc = ModemApp.escapeHtml || (s => String(s || ''));

    function getGroupIcon(groupName) {
        const g = String(groupName || '');
        if (g.includes('الشبكة')) return 'fa-solid fa-tower-cell';
        if (g.includes('البطارية')) return 'fa-solid fa-battery-full';
        if (g.includes('المنافذ')) return 'fa-solid fa-ethernet';
        if (g.includes('الهوائيات')) return 'fa-solid fa-satellite-dish';
        if (g.includes('الأداء')) return 'fa-solid fa-gauge-high';
        if (g.includes('الشاشة')) return 'fa-solid fa-display';
        if (g.includes('الأمان')) return 'fa-solid fa-shield-halved';
        if (g.includes('الإعدادات')) return 'fa-solid fa-sliders';
        if (g.includes('الفيزيائية')) return 'fa-solid fa-ruler-combined';
        return 'fa-solid fa-circle-check';
    }

    function getResourceIcon(res) {
        const url = String(res.url || '').toLowerCase();
        if (url.includes('play.google.com')) return 'fa-brands fa-google-play';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'fa-brands fa-youtube';
        if (url.includes('t.me') || url.includes('telegram')) return 'fa-brands fa-telegram';
        if (res.contentType === 'VIDEO') return 'fa-solid fa-circle-play';
        return 'fa-solid fa-up-right-from-square';
    }

    function getSocialIcon(platform) {
        const p = String(platform || '').toLowerCase();
        if (p.includes('facebook')) return 'fa-brands fa-facebook';
        if (p.includes('instagram')) return 'fa-brands fa-instagram';
        if (p.includes('tiktok')) return 'fa-brands fa-tiktok';
        if (p.includes('youtube')) return 'fa-brands fa-youtube';
        if (p.includes('telegram')) return 'fa-brands fa-telegram';
        if (p.includes('whatsapp')) return 'fa-brands fa-whatsapp';
        if (p === 'x' || p.includes('twitter')) return 'fa-brands fa-x-twitter';
        return 'fa-solid fa-globe';
    }

    function processCatalog(catalog) {
        const modem = ModemApp.findModemBySlugOrId ? ModemApp.findModemBySlugOrId(catalog, slug) : catalog.find(item => item.slug === slug);
        hideLoading();
        if (modem) {
            renderDetails(modem);
            updateSEOAndMeta(modem, catalog);
            renderRelated(catalog, modem);
            loadAdSenseOnce();
            return true;
        }
        return false;
    }

    const localData = ModemApp.getData();
    if (localData && Array.isArray(localData) && localData.length > 0) {
        if (!processCatalog(localData)) {
            setNoIndex();
            ModemApp.showToast('عذراً، المودم المطلوب غير موجود');
            setTimeout(() => { window.location.href = './'; }, 1500);
        }
    } else {
        ModemApp.fetchData(data => {
            if (!processCatalog(data)) {
                setNoIndex();
                ModemApp.showToast('عذراً، المودم المطلوب غير موجود');
                setTimeout(() => { window.location.href = './'; }, 1500);
            }
        }, () => {
            hideLoading();
            ModemApp.showToast('حدث خطأ أثناء تحميل البيانات');
        });
    }

    function renderDetails(m) {
        const displayName = ModemApp.formatDisplayName(m);
        const canonicalHref = `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(m.slug)}`;

        // Update <site-breadcrumb> attribute so both UI and JSON-LD BreadcrumbList schema update
        const breadcrumbEl = document.querySelector('site-breadcrumb');
        if (breadcrumbEl) {
            breadcrumbEl.setAttribute('items', JSON.stringify([
                { title: 'الرئيسية', url: 'https://connecttag.org/' },
                { title: 'الأدوات', url: 'https://connecttag.org/tools/' },
                { title: 'الاتصالات والإنترنت', url: 'https://connecttag.org/tools/telecom/' },
                { title: 'دليل مودمات يمن فورجي 4G', url: 'https://connecttag.org/tools/telecom/modems/' },
                { title: displayName, url: canonicalHref, id: 'breadcrumb-active' }
            ]));
        }
        const activeCrumb = document.getElementById('breadcrumb-active');
        if (activeCrumb) activeCrumb.textContent = displayName;

        const imgEl = document.getElementById('modem-image');
        const primaryImg = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        const backupImg = m.image?.remoteBackup || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        imgEl.src = primaryImg;
        imgEl.alt = displayName;
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = backupImg;
        };

        // Gallery Thumbnails
        const thumbsContainer = document.getElementById('modem-gallery-thumbs');
        const captionEl = document.getElementById('modem-gallery-caption');
        if (thumbsContainer && Array.isArray(m.gallery) && m.gallery.length > 0) {
            const slides = [{ url: primaryImg, remoteBackup: backupImg, caption: '' }];
            m.gallery.forEach(g => {
                if (g && g.url && g.url !== primaryImg) {
                    slides.push({
                        url: g.url,
                        remoteBackup: g.remoteBackup || g.url,
                        caption: g.caption || ''
                    });
                }
            });

            if (slides.length > 1) {
                thumbsContainer.style.display = 'flex';
                thumbsContainer.innerHTML = slides.map((s, idx) => `
                    <button type="button"
                            class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}"
                            data-idx="${idx}"
                            aria-label="عرض صورة ${idx + 1} لـ ${esc(displayName)}">
                        <img src="${esc(s.url)}"
                             alt="${esc(s.caption || displayName)}"
                             loading="lazy"
                             width="56"
                             height="56"
                             onerror="this.onerror=null;this.src='${esc(s.remoteBackup)}';">
                    </button>
                `).join('');

                thumbsContainer.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const idx = Number(this.getAttribute('data-idx') || 0);
                        const selected = slides[idx] || slides[0];
                        thumbsContainer.querySelectorAll('.gallery-thumb-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        imgEl.onerror = function() {
                            this.onerror = null;
                            this.src = selected.remoteBackup;
                        };
                        imgEl.src = selected.url;
                        if (captionEl) {
                            if (selected.caption) {
                                captionEl.textContent = selected.caption;
                                captionEl.style.display = 'block';
                            } else {
                                captionEl.textContent = '';
                                captionEl.style.display = 'none';
                            }
                        }
                    });
                });
            }
        }

        document.getElementById('modem-title').textContent = displayName;
        document.getElementById('modem-brand').textContent = m.brand || 'عام';

        // Tags Bar
        const tagsBar = document.getElementById('modem-tags-bar');
        if (tagsBar) {
            const pills = [];
            if (Array.isArray(m.tags) && m.tags.length > 0) {
                m.tags.forEach(t => {
                    if (!t || !t.name) return;
                    const dotColor = esc(t.color || '#0052cc');
                    pills.push(`<span class="modem-tag-pill"><span class="modem-tag-dot" style="background:${dotColor};"></span>${esc(t.name)}</span>`);
                });
            }
            if (m.price && Number(m.price.currentValue) > 0) {
                const formattedPrice = Number(m.price.currentValue).toLocaleString('en-US');
                const currencyLabel = m.price.currency === 'USD' ? '$' : 'ريال يمني';
                pills.push(`<span class="modem-tag-pill" style="background:#eff6ff;color:#0052cc;border-color:#bfdbfe;"><i class="fa-solid fa-tag"></i> السعر التقريبي: ${formattedPrice} ${currencyLabel}</span>`);
            }
            if (pills.length > 0) {
                tagsBar.innerHTML = pills.join('');
                tagsBar.style.display = 'flex';
            } else {
                tagsBar.style.display = 'none';
            }
        }

        document.getElementById('modem-description').innerHTML = ModemApp.formatDescriptionHtml(m.description || m.shortDescription || '');

        document.getElementById('spec-model').textContent = m.modelOrVersion || m.model || '-';
        document.getElementById('spec-type').textContent = m.category || '-';
        document.getElementById('spec-year').textContent = m.modelYear || '-';

        if (m.additional && m.additional.modemSettings) {
            const s = m.additional.modemSettings;
            document.getElementById('config-panel').style.display = 'block';

            const baseLink = (s.loginLink || 'http://192.168.0.1').replace(/\/+$/, '');
            const pathPart = (s.loginLinkPath || '').trim();
            const fullUrl = pathPart ? `${baseLink}${pathPart.startsWith('/') ? '' : '/'}${pathPart}` : baseLink;

            const confLink = document.getElementById('conf-link');
            confLink.textContent = baseLink;
            confLink.href = fullUrl;

            const openPanelBtn = document.getElementById('btn-open-panel');
            if (openPanelBtn) {
                openPanelBtn.href = fullUrl;
            }

            const userRow = document.getElementById('conf-user-row');
            const confUser = document.getElementById('conf-user');
            const isPassOnly = (s.loginBy || '').toUpperCase() === 'PASS';

            if (isPassOnly) {
                if (userRow) userRow.style.display = 'none';
            } else {
                if (userRow) userRow.style.display = 'flex';
                confUser.textContent = s.defaultUserName || 'admin';
            }

            const rawPass = (s.defaultPass || 'admin').trim();
            const passEl = document.getElementById('conf-pass');
            const copyPassBtn = document.getElementById('btn-copy-pass');

            if (rawPass.toLowerCase() === 'out') {
                passEl.textContent = 'مدونة على الملصق خلف المودم';
                passEl.style.direction = 'rtl';
                passEl.style.fontFamily = 'inherit';
                passEl.style.fontSize = '13px';
                passEl.style.color = '#e89a2f';
                if (copyPassBtn) copyPassBtn.style.display = 'none';
            } else {
                passEl.textContent = rawPass;
                passEl.style.direction = 'ltr';
                passEl.style.fontFamily = "'Courier New', monospace";
                passEl.style.fontSize = '15px';
                passEl.style.color = '#006b98';
                if (copyPassBtn) copyPassBtn.style.display = 'inline-flex';
            }
        }

        // Full Technical Specifications Section
        const fullSpecsSec = document.getElementById('full-specs-section');
        const fullSpecsContainer = document.getElementById('full-specs-container');
        if (fullSpecsSec && fullSpecsContainer && Array.isArray(m.attributes) && m.attributes.length > 0) {
            const groupsMap = new Map();
            m.attributes.forEach(attr => {
                if (!attr || !attr.name || !(attr.displayValue || attr.value)) return;
                const grp = attr.group || 'مواصفات عامة';
                if (!groupsMap.has(grp)) groupsMap.set(grp, []);
                groupsMap.get(grp).push(attr);
            });

            if (groupsMap.size > 0) {
                fullSpecsSec.style.display = 'block';
                fullSpecsContainer.innerHTML = Array.from(groupsMap.entries()).map(([groupName, attrs]) => `
                    <div class="spec-group-card">
                        <h3 class="spec-group-header"><i class="${getGroupIcon(groupName)}"></i> ${esc(groupName)}</h3>
                        <ul class="spec-row-list">
                            ${attrs.map(a => `
                                <li class="spec-row-item">
                                    <span class="spec-row-name">${esc(a.name)}</span>
                                    <span class="spec-row-val">${esc(a.displayValue || a.value)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('');
            }
        }

        // Resources & Management Apps Section
        const resourcesSec = document.getElementById('resources-section');
        const resourcesContainer = document.getElementById('resources-container');
        if (resourcesSec && resourcesContainer && Array.isArray(m.resources) && m.resources.length > 0) {
            resourcesSec.style.display = 'block';
            resourcesContainer.innerHTML = m.resources.map(res => {
                const subText = res.description || res.group || 'رابط خارجي مفيد';
                return `
                    <a href="${esc(res.url)}" target="_blank" rel="noopener noreferrer" class="resource-card">
                        <div class="resource-info">
                            <span class="resource-icon"><i class="${getResourceIcon(res)}"></i></span>
                            <div class="resource-meta">
                                <h4>${esc(res.title)}</h4>
                                <p>${esc(subText)}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-up-right-from-square" style="color:#94a3b8;font-size:14px;"></i>
                    </a>
                `;
            }).join('');
        }

        // Authorized Provider / Organization Section
        const providerSec = document.getElementById('provider-section');
        const providerContainer = document.getElementById('provider-container');
        if (providerSec && providerContainer && Array.isArray(m.providers) && m.providers.length > 0) {
            const resolvedOrgs = m.providers
                .map(p => ({ role: p.role, org: ModemApp.getOrganizationById ? ModemApp.getOrganizationById(p.orgId) : null }))
                .filter(entry => entry.org);

            if (resolvedOrgs.length > 0) {
                providerSec.style.display = 'block';
                providerContainer.innerHTML = resolvedOrgs.map(({ role, org }) => {
                    const logoSrc = org.logo || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
                    const logoBackup = org.logoBackup || logoSrc;
                    const roleBadge = role || org.categories?.[0] || 'الوكيل المعتمد';

                    const contactPills = [];
                    (org.phones || []).forEach(ph => {
                        contactPills.push(`
                            <a href="tel:${esc(ph.number)}" class="provider-contact-pill" title="${esc(ph.label || 'اتصال')}">
                                <i class="fa-solid fa-phone" style="color:#0052cc;"></i>
                                <span dir="ltr">${esc(ph.number)}</span>
                            </a>
                        `);
                        if (ph.hasWhatsapp) {
                            const waNum = ph.number.replace(/^0+/, '');
                            contactPills.push(`
                                <a href="https://wa.me/967${esc(waNum)}" target="_blank" rel="noopener noreferrer" class="provider-contact-pill" title="واتساب">
                                    <i class="fa-brands fa-whatsapp" style="color:#16a34a;"></i>
                                    <span>واتساب</span>
                                </a>
                            `);
                        }
                    });
                    (org.emails || []).forEach(em => {
                        contactPills.push(`
                            <a href="mailto:${esc(em.email)}" class="provider-contact-pill">
                                <i class="fa-regular fa-envelope" style="color:#0052cc;"></i>
                                <span dir="ltr">${esc(em.email)}</span>
                            </a>
                        `);
                    });
                    if (org.website) {
                        contactPills.push(`
                            <a href="${esc(org.website)}" target="_blank" rel="noopener noreferrer" class="provider-contact-pill">
                                <i class="fa-solid fa-globe" style="color:#0052cc;"></i>
                                <span>الموقع الرسمي</span>
                            </a>
                        `);
                    }

                    const socialsHtml = Array.isArray(org.socialLinks) && org.socialLinks.length > 0
                        ? `<div class="provider-socials">
                            ${org.socialLinks.map(s => `
                                <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="provider-social-link">
                                    <i class="${getSocialIcon(s.platform)}"></i> ${esc(s.label || s.platform)}
                                </a>
                            `).join('')}
                           </div>`
                        : '';

                    return `
                        <div class="provider-card">
                            <div class="provider-header">
                                <img src="${esc(logoSrc)}"
                                     alt="${esc(org.name)}"
                                     class="provider-logo"
                                     loading="lazy"
                                     width="60"
                                     height="60"
                                     onerror="this.onerror=null;this.src='${esc(logoBackup)}';">
                                <div class="provider-title-wrap">
                                    <h4>${esc(org.name)}</h4>
                                    <span class="provider-role-badge">${esc(roleBadge)}</span>
                                </div>
                            </div>
                            ${org.description ? `<p class="provider-desc">${esc(org.description)}</p>` : ''}
                            ${contactPills.length > 0 ? `<div class="provider-contacts">${contactPills.join('')}</div>` : ''}
                            ${org.address ? `<div class="provider-meta-line"><i class="fa-solid fa-location-dot" style="color:#0052cc;"></i> <span>${esc(org.address)}</span></div>` : ''}
                            ${org.operatingHours ? `<div class="provider-meta-line"><i class="fa-regular fa-clock" style="color:#0052cc;"></i> <span>ساعات العمل: ${esc(org.operatingHours)}</span></div>` : ''}
                            ${socialsHtml}
                        </div>
                    `;
                }).join('');
            }
        }
    }

    function updateSEOAndMeta(m, catalog) {
        const displayName = ModemApp.formatDisplayName(m);
        const pageTitle = `${displayName} - المواصفات وإعدادات الدخول | كونكت تاق`;
        const cleanDesc = ModemApp.cleanMetaText(
            m.shortDescription || m.summary || m.description || `المواصفات التقنية وإعدادات الدخول لمودم يمن فورجي ${displayName}`
        );
        const canonicalUrl = `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(m.slug)}`;
        const imgUrl = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        document.title = pageTitle;
        document.getElementById('meta-description')?.setAttribute('content', cleanDesc);
        document.getElementById('canonical-url')?.setAttribute('href', canonicalUrl);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', cleanDesc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', imgUrl);

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', cleanDesc);
        document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', canonicalUrl);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imgUrl);

        const imageList = [imgUrl];
        if (Array.isArray(m.gallery)) {
            m.gallery.forEach(g => {
                if (g && g.url && !imageList.includes(g.url)) imageList.push(g.url);
            });
        }

        const primaryProvider = Array.isArray(m.providers) && m.providers.length > 0 && ModemApp.getOrganizationById
            ? ModemApp.getOrganizationById(m.providers[0].orgId)
            : null;

        const additionalProperty = Array.isArray(m.attributes)
            ? m.attributes.map(a => ({
                "@type": "PropertyValue",
                "name": a.name,
                "value": a.displayValue || a.value
            }))
            : [];

        const isSimilarTo = [];
        if (Array.isArray(m.relatedLinks) && Array.isArray(catalog)) {
            m.relatedLinks.forEach(link => {
                const target = catalog.find(it => String(it.id) === String(link.targetId));
                if (target) {
                    isSimilarTo.push({
                        "@type": "Product",
                        "name": ModemApp.formatDisplayName(target),
                        "url": `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(target.slug)}`
                    });
                }
            });
        }

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": displayName,
            "image": imageList.length > 1 ? imageList : imgUrl,
            "description": cleanDesc,
            "sku": m.slug || String(m.id || ''),
            "brand": {
                "@type": "Brand",
                "name": m.brand || "Yemen 4G"
            },
            "manufacturer": {
                "@type": "Organization",
                "name": m.manufacturer || m.brand || "Yemen 4G"
            },
            "countryOfOrigin": m.countryOfOrigin || "الصين",
            "model": m.modelOrVersion || m.model || "",
            "category": m.category || "مودم 4G",
            ...(additionalProperty.length > 0 ? { "additionalProperty": additionalProperty } : {}),
            ...(isSimilarTo.length > 0 ? { "isSimilarTo": isSimilarTo } : {}),
            "offers": {
                "@type": "Offer",
                "url": canonicalUrl,
                "priceCurrency": m.price?.currency === 'USD' ? 'USD' : 'YER',
                "price": String(m.price?.currentValue || 0),
                "availability": m.availabilityStatus === 'غير متوفر'
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/InStock",
                ...(primaryProvider ? {
                    "seller": {
                        "@type": "Organization",
                        "name": primaryProvider.name,
                        ...(primaryProvider.website ? { "url": primaryProvider.website } : {})
                    }
                } : {})
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(m.rating?.average || 5),
                "reviewCount": String(Math.max(1, Number(m.rating?.count || 1))),
                "bestRating": "5",
                "worstRating": "1"
            }
        };

        const schemaEl = document.getElementById('schema-product');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    function renderRelated(catalog, currentModem) {
        const container = document.getElementById('related-items-container');
        if (!container) return;

        const linkedIds = new Set(
            (currentModem.relatedLinks || []).map(l => String(l.targetId))
        );

        const others = catalog.filter(item => item.slug !== currentModem.slug && String(item.id) !== String(currentModem.id));
        const scored = others.map(item => {
            let score = 0;
            if (linkedIds.has(String(item.id))) score += 100;
            if (item.category === currentModem.category) score += 2;
            if (item.brand && item.brand === currentModem.brand) score += 3;
            if (item.isNew) score += 1;
            return { item, score };
        }).sort((a, b) => b.score - a.score);

        const sample = scored.slice(0, 4).map(entry => entry.item);
        container.innerHTML = sample.map(item => {
            const name = ModemApp.formatDisplayName(item);
            const primaryImg = item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
            const backupImg = item.image?.remoteBackup || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
            return `
                <div class="col-6 col-md-3">
                    <a href="details?slug=${encodeURIComponent(item.slug)}" class="related-card">
                        <img src="${primaryImg}"
                             alt="${name}"
                             class="img-fluid"
                             loading="lazy"
                             width="160"
                             height="110"
                             onerror="this.onerror=null;this.src='${backupImg}';">
                        <h5>${name}</h5>
                        <small class="text-muted">${item.category || ''}</small>
                    </a>
                </div>
            `;
        }).join('');
    }
});

function copyText(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.innerText.trim();
    navigator.clipboard.writeText(text).then(() => {
        ModemApp.showToast('تم نسخ: ' + text);
    }).catch(() => {
        ModemApp.showToast('تعذر النسخ');
    });
}
