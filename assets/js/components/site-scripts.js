/**
 * Connect Tag - Site Specific Scripts
 * Extracted logic for UI interactions, animations, and preloader.
 */

// 1. Optimized Professional Preloader Logic (Independent of jQuery)
(function() {
    'use strict';

    function runPreloader() {
        const preloader = document.getElementById('preloader');
        const logElement = document.getElementById('loader-log');
        const progressFill = document.getElementById('progress-fill');

        if (!preloader) return;

        // Force show if it was stuck
        preloader.style.display = 'flex';

        const steps = [
            { text: "> Initializing core...", delay: 200, progress: 20 },
            { text: "> Checking security protocols...", delay: 400, progress: 45 },
            { text: "> Optimizing UI assets...", delay: 300, progress: 75 },
            { text: "> Establishing secure link...", delay: 400, progress: 90 },
            { text: "> Welcome to Connect Tag", delay: 300, progress: 100 }
        ];

        let currentStep = 0;

        function processStep() {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                if (logElement) logElement.innerHTML = step.text;
                if (progressFill) progressFill.style.width = step.progress + "%";

                if (logElement && (step.text.includes("Success") || step.progress === 100)) {
                    logElement.style.color = "#25d366";
                }

                currentStep++;
                setTimeout(processStep, step.delay);
            } else {
                setTimeout(() => {
                    preloader.classList.add('preloader-hidden');
                    document.body.classList.add('loaded');

                    setTimeout(() => {
                        document.body.classList.add('page-entered');
                        document.body.style.overflow = 'auto';
                        // Final backup to ensure it's gone
                        setTimeout(() => { preloader.style.display = 'none'; }, 1000);
                    }, 300);
                }, 500);
            }
        }

        processStep();
    }

    if (document.readyState === 'complete') {
        runPreloader();
    } else {
        window.addEventListener('load', runPreloader);
    }

    // Safety timeout: if preloader is still visible after 10 seconds, hide it
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('preloader-hidden')) {
            preloader.classList.add('preloader-hidden');
            document.body.style.overflow = 'auto';
        }
    }, 10000);
})();

// 2. jQuery Dependent Logic
(function() {
    'use strict';

    function initSiteLogic($) {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true
            });
        }

        // Back to Top Scroll Handler
        const $backToTop = $('#back-to-top');
        if ($backToTop.length) {
            $(window).scroll(function() {
                if ($(this).scrollTop() > 300) {
                    $backToTop.fadeIn();
                } else {
                    $backToTop.fadeOut();
                }
            });

            $backToTop.click(function() {
                $('html, body').animate({scrollTop : 0}, 800);
                return false;
            });
        }

        // Statistics Counter Animation
        const $stats = $('#stats');
        if ($stats.length) {
            let counted = 0;
            $(window).scroll(function() {
                const oTop = $stats.offset().top - window.innerHeight;
                if (counted === 0 && $(window).scrollTop() > oTop) {
                    $('.counter').each(function() {
                        const $this = $(this),
                              countTo = $this.attr('data-target');
                        $({
                            countNum: $this.text()
                        }).animate({
                            countNum: countTo
                        }, {
                            duration: 2000,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.floor(this.countNum));
                            },
                            complete: function() {
                                $this.text(this.countNum + "+");
                            }
                        });
                    });
                    counted = 1;
                }
            });
        }

        // Active Link Highlighting
        const path = window.location.pathname;
        let page = path.split("/").pop();
        if (page === "" || page === "index") page = "index";

        $('.navbar-nav li').removeClass('active');
        $('.navbar-nav li a').each(function() {
            const href = $(this).attr('href');
            if (href === page || (page === "index" && (href === "./" || href === "#home"))) {
                $(this).parent().addClass('active');
            }
            if (path.includes(href) && href !== "" && href !== "/" && !href.startsWith("#")) {
                $(this).parent().addClass('active');
            }
        });

        // Typing Effect
        const typedTextSpan = document.querySelector("#typed-text");
        if (typedTextSpan) {
            const textArray = ["كونكت تاق", "حلولك التقنية", "شريكك الرقمي"];
            const typingSpeed = 150;
            const erasingSpeed = 100;
            const newTextDelay = 2000;
            let textArrayIndex = 0;
            let charIndex = 0;

            function type() {
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
    }

    // Wait for jQuery to be available
    function checkJQuery() {
        if (window.jQuery) {
            initSiteLogic(window.jQuery);
        } else {
            setTimeout(checkJQuery, 50);
        }
    }

    checkJQuery();
})();
