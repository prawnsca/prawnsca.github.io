const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
const menuBackdrop = document.getElementById('menu-backdrop');

const MENU_QUERY = '(max-width: 768px)';


function isMobileMenu() {
    return window.matchMedia(MENU_QUERY).matches;
}

function setMenuOpen(open) {
    if (!menuToggle || !siteNav) return;

    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    siteNav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-menu-open', open);

    if (menuBackdrop) {
        menuBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    if (open) {
        header?.classList.remove('hide');
    }
}

function closeMenu() {
    setMenuOpen(false);
}

if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
        if (!isMobileMenu()) return;
        const next = menuToggle.getAttribute('aria-expanded') !== 'true';
        setMenuOpen(next);
    });

    menuBackdrop?.addEventListener('click', closeMenu);

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobileMenu()) closeMenu();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (!isMobileMenu()) closeMenu();
    });
}

let lastScrollTop = 0;

window.addEventListener('scroll', function () {
    if (!header) return;
    if (document.body.classList.contains('is-menu-open')) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        header.classList.add('hide');
    } else {
        header.classList.remove('hide');
    }

    lastScrollTop = scrollTop;
});

const contactForm = document.getElementById('contact-form');

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const to = (contactForm.dataset.contactEmail || 'mail@example.com').trim();
    const name = (contactForm.querySelector('#contact-name')?.value || '').trim();
    const from = (contactForm.querySelector('#contact-email')?.value || '').trim();
    const message = (contactForm.querySelector('#contact-message')?.value || '').trim();

    const subject = encodeURIComponent('Сообщение с сайта prawnsca');
    const body = encodeURIComponent(
        ['Имя: ' + (name || '—'), 'Ответить на: ' + from, '', message].join('\n')
    );
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
});
