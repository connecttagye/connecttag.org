/**
 * Connect Tag - Site Specific Scripts (Vanilla JS Version)
 * Optimized for performance, removing jQuery dependencies.
 */

// 1. Optimized Professional Preloader Logic (Ultra-Fast)
(function() {
    'use strict';

    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader || preloader.classList.contains('preloader-hidden')) return;

        // Force immediate visual transition
        preloader.classList.add('preloader-hidden');
        document.body.classList.remove('preloader-visible');
        document.body.classList.add('loaded');
        document.body.classList.add('page-entered');
        document.body.style.overflow = 'auto';

        // Clean up memory
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }

    // Trigger as soon as the DOM is ready (Lighthouse/FCP/LCP win)
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        hidePreloader();
    } else {
        document.addEventListener('DOMContentLoaded', hidePreloader);
    }

    // Final safety fallback
    setTimeout(hidePreloader, 3000);
})();

// 2. Core Site Logic (Independent of jQuery)
(function() {
    'use strict';

    function initSiteLogic() {
        // --- AOS Initialization ---
        function triggerAOS() {
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        once: true,
                        startEvent: 'DOMContentLoaded'
                    });
                }
            }, 100);
        }

        triggerAOS();

        // --- Back to Top Scroll Handler ---
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTop.style.display = "block";
                    backToTop.style.opacity = "1";
                } else {
                    backToTop.style.opacity = "0";
                    setTimeout(() => { if(window.pageYOffset <= 300) backToTop.style.display = "none"; }, 300);
                }
            });

            backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // --- Statistics Counter Animation (IntersectionObserver) ---
        const statsSection = document.getElementById('stats');
        const counters = document.querySelectorAll('.counter');

        if (statsSection && counters.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(statsSection);

            function startCounters() {
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // 2 seconds
                    let current = 0;

                    const timer = setInterval(() => {
                        current += Math.ceil(target / (duration / 50));
                        if (current >= target) {
                            counter.innerText = target + "+";
                            clearInterval(timer);
                        } else {
                            counter.innerText = current;
                        }
                    }, 50);
                });
            }
        }

        // --- Typing Effect ---
        const typedTextSpan = document.querySelector("#typed-text");
        if (typedTextSpan) {
            const textArray = ["كونكت تاق", "حلولك التقنية", "شريكك الرقمي"];
            const typingSpeed = 150;
            const erasingSpeed = 100;
            const newTextDelay = 2000;
            let textArrayIndex = 0;
            let charIndex = 0;

            function type() {
                if (charIndex === 0) {
                    typedTextSpan.textContent = "";
                }
                if (charIndex < textArray[textArrayIndex].length) {
                    typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                    charIndex++;
                    setTimeout(type, typingSpeed);
                } else {
                    setTimeout(erase, newTextDelay);
                }
            }

            function erase() {
                if (charIndex > 0) {
                    typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
                    charIndex--;
                    setTimeout(erase, erasingSpeed);
                } else {
                    textArrayIndex++;
                    if (textArrayIndex >= textArray.length) textArrayIndex = 0;
                    setTimeout(type, typingSpeed + 1100);
                }
            }

            if (textArray.length) setTimeout(type, newTextDelay + 250);
        }

        // --- Smooth Page Scroll & Active Link highlighting ---
        const navLinks = document.querySelectorAll('.ct-nav-link, .page-scroll');
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const offsetTop = targetElement.offsetTop - 70;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });

                        // Auto-close mobile menu if open
                        const menu = document.getElementById('ct-nav-menu');
                        if (menu && menu.classList.contains('open')) {
                            const btn = document.getElementById('ct-menu-btn');
                            if (btn) btn.click();
                        }
                    }
                }
            });
        });

        // --- ScrollSpy Replacement ---
        const sections = document.querySelectorAll('div[id]');
        const navItems = document.querySelectorAll('.ct-nav-item');

        window.addEventListener('scroll', () => {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= (sectionTop - 100)) {
                    current = section.getAttribute('id');
                }
            });

            navItems.forEach(item => {
                item.classList.remove('active');
                const link = item.querySelector('a');
                if (link && link.getAttribute('href') === `#${current}`) {
                    item.classList.add('active');
                }
            });
        });

        // --- Mobile Menu Overlay Logic ---
        const mobileToggle = document.getElementById('ct-menu-btn');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                let overlay = document.querySelector('.nav-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'nav-overlay';
                    overlay.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:998;";
                    document.body.appendChild(overlay);

                    overlay.addEventListener('click', () => {
                        mobileToggle.click();
                    });
                }

                setTimeout(() => {
                    const isOpen = document.getElementById('ct-nav-menu').classList.contains('open');
                    if (isOpen) {
                        overlay.style.display = 'block';
                        overlay.style.opacity = '1';
                    } else {
                        overlay.style.opacity = '0';
                        setTimeout(() => { overlay.style.display = 'none'; }, 300);
                    }
                }, 10);
            });
        }
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSiteLogic);
    } else {
        initSiteLogic();
    }
})();
