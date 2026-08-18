document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const btnSearch = document.getElementById('btnSearch');
    const resultCard = document.getElementById('resultCard');
    const errorMessage = document.getElementById('errorMessage');
    const searchBox = document.getElementById('searchBox');
    const skeletonLoader = document.getElementById('skeletonLoader');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');

    loadHistory();

    // Input Validation (Allow text when searching by name 'q')
    searchInput.addEventListener('input', function() {
        const type = document.querySelector('input[name="searchType"]:checked').value;
        if (type !== 'q') {
            this.value = this.value.replace(/\D/g, ''); // Numbers only
        }
        const val = this.value.trim();
        if ((type === 'imei' && val.length === 15) || (type === 'tac' && val.length === 8) || (type === 'q' && val.length > 2)) {
            this.classList.add('valid-input');
        } else {
            this.classList.remove('valid-input');
        }
    });

    btnSearch.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.which === 13 || e.keyCode === 13) performSearch();
    });

    let currentTurnstileToken = '';
    window.onTurnstileSuccess = function(token) {
        currentTurnstileToken = token;
    };

    function performSearch() {
        const val = searchInput.value.trim();
        const type = document.querySelector('input[name="searchType"]:checked').value;

        if (!val) {
            showError('يرجى إدخال قيمة البحث أولاً.');
            return;
        }

        if (!currentTurnstileToken) {
            showError('يرجى تأكيد أنك لست روبوت (تحقق Turnstile).');
            return;
        }

        resultCard.style.display = 'none';
        errorMessage.style.display = 'none';
        searchBox.classList.add('scanning');
        skeletonLoader.style.display = 'block';

        // New API Path: v1/master-data/tac
        let apiUrl = 'https://api.connecttag.app/v1/master-data/tac/';

        if (type === 'q') {
            apiUrl += `search?q=${encodeURIComponent(val)}&cf_token=${currentTurnstileToken}`;
        } else {
            // For imei and tac, we use the direct lookup path
            apiUrl += `${encodeURIComponent(val)}?cf_token=${currentTurnstileToken}`;
        }

        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            setTimeout(() => {
                searchBox.classList.remove('scanning');
                skeletonLoader.style.display = 'none';

                // Reset Turnstile for next attempt
                if (window.turnstile) {
                    turnstile.reset();
                    currentTurnstileToken = '';
                }

                if (data.success && data.result) {
                    // If it's a search result (array), take the first item
                    const result = Array.isArray(data.result) ? data.result[0] : data.result;

                    if (result) {
                        displayResult(result);
                        saveToHistory(val);
                    } else {
                        showError('لم يتم العثور على سجلات مطابقة لهذا الرقم.');
                    }
                } else {
                    // Handle error object or string
                    const msg = data.error ? (typeof data.error === 'object' ? data.error.message : data.error) : 'لم يتم العثور على نتائج.';
                    showError(msg);
                }
            }, 800);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            searchBox.classList.remove('scanning');
            skeletonLoader.style.display = 'none';
            showError('عذراً، حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
        });
    }

    function displayResult(data) {
        if (!data) return;

        // Helper to format values
        const fmt = (val, def = '-') => (val && val !== 'null' && val !== 'N/A' && val !== 'N') ? val : def;
        const bool = (val) => val === 'Y' ? '<span class="text-success">يدعم ✅</span>' : (val === 'N' ? '<span class="text-muted">لا يدعم</span>' : '-');

        // Mapping Fields (New Schema Support)
        const brand = data.brandName || data.brand_name || data.manufacturerName || data.manufacturer_name || 'غير معروف';
        const marketing = data.marketingName || data.marketing_name || '-';
        const model = data.modelName || data.model_name || '-';
        const tac = data.tac || '-';

        // Fill UI Elements with Safety Checks
        const setSafe = (id, val, isHTML = false) => {
            const el = document.getElementById(id);
            if (el) {
                if (isHTML) el.innerHTML = val;
                else el.textContent = val;
            }
        };

        setSafe('resBrand', brand);
        setSafe('resMarketingName', marketing);
        setSafe('resModelName', model);
        setSafe('resDeviceType', fmt(data.deviceTypeRaw || data.device_type_raw, 'جهاز ذكي'));
        setSafe('resOsName', fmt(data.osName || data.os_name, 'غير محدد'));

        setSafe('resBodyType', fmt(data.bodyType || data.body_type));
        setSafe('resSimSlots', fmt(data.simSlots || data.sim_slots, '1'));
        setSafe('resEsimSlots', (data.esimSlots > 0 || data.esim_slots > 0 ? '<span class="text-success">يدعم ✅</span>' : '<span class="text-muted">لا يدعم</span>'), true);
        setSafe('resNfc', bool(data.nfc), true);

        setSafe('resBands4g', fmt(data.bands4g || data.bands_4g, 'ترددات قياسية'));
        setSafe('resBands5g', fmt(data.bands5g || data.bands_5g, 'غير مدعوم'));
        setSafe('resTechs', fmt(data.supportedTechnologies || data.supported_technologies));
        setSafe('resWlan', bool(data.wlan), true);
        setSafe('resBluetooth', bool(data.bluetooth), true);

        setSafe('resTac', tac);
        setSafe('resDeviceCode', fmt(data.deviceCode || data.device_code));

        // QR Code
        const qrData = `Device Details:\nBrand: ${brand}\nModel: ${marketing}\nTAC: ${tac}\nCheck: connecttag.org`;
        const resQR = document.getElementById('resQR');
        if (resQR) resQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrData)}`;

        // Comprehensive Icon mapping based on Database Types
        const getDeviceIcon = (type, marketing, brand) => {
            const fullType = (type + ' ' + marketing + ' ' + brand).toLowerCase();

            // 1. Tablets & e-Books
            if (fullType.includes('tablet') || fullType.includes('e-book')) return 'fa-tablet-screen-button';

            // 2. Mobile Phones (Smartphones, Feature phones, etc.)
            if (fullType.includes('smartphone') || fullType.includes('mobile phone') ||
                fullType.includes('feature phone') || fullType.includes('handheld') ||
                fullType.includes('flip') || fullType.includes('slider') ||
                fullType.includes('pda') || fullType.includes('phone')) return 'fa-mobile-screen-button';

            // 3. Connectivity (Modems, Routers, Hotspots, Gateways)
            if (fullType.includes('modem') || fullType.includes('router') ||
                fullType.includes('hotspot') || fullType.includes('dongle') ||
                fullType.includes('gateway')) return 'fa-wifi';

            // 4. Wearables (Watches, Earbuds)
            if (fullType.includes('watch') || fullType.includes('wearable') ||
                fullType.includes('earbuds')) return 'fa-stopwatch-20';

            // 5. Computers
            if (fullType.includes('laptop') || fullType.includes('notebook') ||
                fullType.includes('computer')) return 'fa-laptop';

            // 6. Tracking & Vehicles
            if (fullType.includes('vehicle') || fullType.includes('car') ||
                fullType.includes('gps') || fullType.includes('tracker') ||
                fullType.includes('navigator')) return 'fa-location-crosshairs';

            // 7. IoT & Industrial (Sensors, Modules, Signage, Hubs)
            if (fullType.includes('module') || fullType.includes('sensor') ||
                fullType.includes('monitor') || fullType.includes('iot') ||
                fullType.includes('hub') || fullType.includes('signage')) return 'fa-microchip';

            return 'fa-microchip'; // General technical fallback
        };

        const typeRaw = data.deviceTypeRaw || data.device_type_raw || '';
        const icon = getDeviceIcon(typeRaw, marketing, brand);
        const resIcon = document.getElementById('resIcon');
        if (resIcon) {
            let iconColor = '#006b98'; // Default
            if (icon.includes('mobile')) iconColor = '#006b98';
            else if (icon === 'fa-wifi') iconColor = '#e89a2f';
            else if (icon === 'fa-tablet-screen-button') iconColor = '#8b5cf6';
            else if (icon === 'fa-stopwatch-20') iconColor = '#ec4899';
            else if (icon === 'fa-laptop') iconColor = '#3b82f6';
            else if (icon === 'fa-location-crosshairs') iconColor = '#10b981';
            else if (icon === 'fa-microchip') iconColor = '#64748b';

            resIcon.innerHTML = `<i class="fa-solid ${icon}" style="color: ${iconColor};"></i>`;
            resIcon.style.backgroundColor = iconColor + '12';
            resIcon.style.border = `1px solid ${iconColor}30`;
        }

        resultCard.style.display = 'block';

        // Copy Action
        const btnCopy = document.getElementById('btnCopy');
        if (btnCopy) {
            btnCopy.onclick = () => {
                const text = `تفاصيل الجهاز من كونكت تاق:\n- الشركة: ${brand}\n- الموديل: ${marketing}\n- طراز: ${model}\n- رقم TAC: ${tac}`;
                navigator.clipboard.writeText(text).then(() => {
                    if (window.toast) window.toast.show('تم نسخ التفاصيل!', 'success');
                });
            };
        }

        // Share Action
        const btnShare = document.getElementById('btnShare');
        if (btnShare) {
            btnShare.onclick = () => {
                const text = `نتيجة فحص الجهاز:\nالشركة: ${brand}\nالموديل: ${marketing}\nرابط الفحص: ${window.location.href}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            };
        }

        if (window.innerWidth < 768) {
            window.scrollTo({ top: resultCard.offsetTop - 40, behavior: 'smooth' });
        }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        searchBox.classList.remove('scanning');
    }

    function saveToHistory(val) {
        let history = JSON.parse(localStorage.getItem('check_imei_history') || '[]');
        if (!history.includes(val)) {
            history.unshift(val);
            if (history.length > 6) history.pop();
            localStorage.setItem('check_imei_history', JSON.stringify(history));
            loadHistory();
        }
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('check_imei_history') || '[]');
        if (history.length > 0) {
            historySection.style.display = 'block';
            historyList.innerHTML = history.map(item => `<span class="history-item">${item}</span>`).join('');

            document.querySelectorAll('.history-item').forEach(item => {
                item.onclick = function() {
                    searchInput.value = this.textContent;
                    performSearch();
                };
            });
        } else {
            historySection.style.display = 'none';
        }
    }

    window.clearHistory = function() {
        localStorage.removeItem('check_imei_history');
        loadHistory();
        if (window.toast) window.toast.show('تم مسح سجل البحث', 'info');
    };

    // Change input constraints on radio change
    document.querySelectorAll('input[name="searchType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const type = this.value;
            searchInput.value = '';
            searchInput.classList.remove('valid-input');

            if (type === 'imei') {
                searchInput.placeholder = 'أدخل 15 رقماً هنا...';
                searchInput.setAttribute('maxlength', '15');
                searchInput.setAttribute('inputmode', 'numeric');
            } else if (type === 'tac') {
                searchInput.placeholder = 'أدخل أول 8 أرقام (TAC)...';
                searchInput.setAttribute('maxlength', '8');
                searchInput.setAttribute('inputmode', 'numeric');
            } else {
                searchInput.placeholder = 'اكتب اسم الجهاز أو الموديل (مثال: ZTE, L818)...';
                searchInput.removeAttribute('maxlength');
                searchInput.setAttribute('inputmode', 'text');
            }
            searchInput.focus();
        });
    });
});
