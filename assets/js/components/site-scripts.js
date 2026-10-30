(function() {
'use strict';
function hidePreloader() {
const preloader = document.getElementById('preloader') || document.getElementById('preloader-skeleton');
if (document.body.classList.contains('preloader-visible')) {
document.body.classList.remove('preloader-visible');
document.body.style.overflow = '';
}
document.body.classList.add('loaded', 'page-entered');
if (!preloader || preloader.classList.contains('preloader-hidden')) return;
preloader.classList.add('preloader-hidden');
setTimeout(() => {
preloader.style.display = 'none';
}, 500);
}
if (document.readyState === 'interactive' || document.readyState === 'complete') {
hidePreloader();
} else {
document.addEventListener('DOMContentLoaded', hidePreloader, { once: true });
}
})();
(function() {
'use strict';
function initSiteLogic() {
function triggerAOS() {
setTimeout(() => {
if (typeof AOS !== 'undefined') {
AOS.init({
duration: 800,
once: true,
startEvent: 'DOMContentLoaded'
});
} else {
document.querySelectorAll('[data-aos]').forEach(el => {
el.classList.add('aos-animate');
el.removeAttribute('data-aos');
});
}
}, 50);
}
triggerAOS();
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
const updateBtt = () => {
if (window.scrollY > 300) {
backToTop.classList.add('visible');
} else {
backToTop.classList.remove('visible');
}
};
window.addEventListener('scroll', updateBtt, { passive: true });
backToTop.addEventListener('click', function(e) {
e.preventDefault();
window.scrollTo({ top: 0, behavior: 'smooth' });
});
}
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
const duration = 2000;
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
const typedTextSpan = document.querySelector("#typed-text");
if (typedTextSpan) {
const textArray = ["كونكت تاق", "حلولك التقنية", "شريكك الرقمي"];
const typingSpeed = 150;
const erasingSpeed = 100;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = textArray[0].length;
function type() {
if (charIndex < textArray[textArrayIndex].length) {
typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex + 1);
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
setTimeout(type, typingSpeed + 500);
}
}
if (textArray.length) setTimeout(erase, newTextDelay + 2500);
}
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
const menu = document.getElementById('ct-nav-menu');
if (menu && menu.classList.contains('open')) {
const btn = document.getElementById('ct-menu-btn');
if (btn) btn.click();
}
}
}
});
});
const sections = document.querySelectorAll('div[id]');
const navItems = document.querySelectorAll('.ct-nav-item');
if (sections.length > 0 && navItems.length > 0) {
const observerOptions = {
root: null,
rootMargin: '-20% 0px -70% 0px',
threshold: 0
};
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const id = entry.target.getAttribute('id');
navItems.forEach(item => {
item.classList.remove('active');
const link = item.querySelector('a');
if (link && link.getAttribute('href') === `#${id}`) {
item.classList.add('active');
}
});
}
});
}, observerOptions);
sections.forEach(section => observer.observe(section));
}
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
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initSiteLogic);
} else {
initSiteLogic();
}
})();