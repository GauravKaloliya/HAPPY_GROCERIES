/**
 * Layout Loader - Loads XML header and footer into pages
 */

const LayoutLoader = (function() {
    'use strict';

    const BASE_PATH = window.location.pathname.includes('/pages/') ? '../' : '';
    const PAGES_PATH = window.location.pathname.includes('/pages/') ? '' : 'pages/';

    function getPath(relativePath) {
        return BASE_PATH + relativePath;
    }

    function getPagePath(page) {
        if (page === 'index.html') {
            return getPath('index.html');
        }
        return PAGES_PATH + page;
    }

    function parseXML(xmlString) {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, 'application/xml');
    }

    function buildHeaderHTML(xmlDoc) {
        const navbar = xmlDoc.querySelector('navbar');
        if (!navbar) return '';

        const logoText = navbar.querySelector('logo text')?.textContent || '🛒 Happy Groceries';
        const menuItems = navbar.querySelectorAll('menuItems item');
        const themeIcon = navbar.querySelector('themeToggle')?.getAttribute('icon') || '🌙';
        const themeAriaLabel = navbar.querySelector('themeToggle')?.getAttribute('ariaLabel') || 'Toggle dark mode';
        const cartEmoji = navbar.querySelector('cartIcon')?.getAttribute('emoji') || '🛒';

        let navLinksHTML = '';
        menuItems.forEach(item => {
            const name = item.getAttribute('name');
            const href = item.getAttribute('href');
            const active = item.getAttribute('active') === 'true';
            const pagePath = getPagePath(href);
            navLinksHTML += `<li><a href="${pagePath}" class="nav-link ${active ? 'active' : ''}">${name}</a></li>`;
        });

        const loginPath = getPagePath('login.html');
        const signupPath = getPagePath('signup.html');

        const profileDropdownItems = navbar.querySelectorAll('profile dropdown item');
        let dropdownHTML = '';
        profileDropdownItems.forEach(item => {
            const name = item.getAttribute('name');
            const href = item.getAttribute('href');
            const id = item.getAttribute('id') || '';
            const pagePath = href === '#' ? '#' : (href === 'index.html' ? getPath('index.html') : (href.startsWith('http') ? href : (PAGES_PATH + href)));
            if (id) {
                dropdownHTML += `<a href="${pagePath}" id="${id}">${name}</a>`;
            } else {
                dropdownHTML += `<a href="${pagePath}">${name}</a>`;
            }
        });

        return `
<nav class="navbar" id="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="${getPath('index.html')}">${logoText}</a>
        </div>
        
        <div class="hamburger" id="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <ul class="nav-menu" id="navMenu">
            ${navLinksHTML}
        </ul>

        <div class="nav-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="${themeAriaLabel}">
                <span class="theme-icon">${themeIcon}</span>
            </button>
            
            <a href="${getPagePath('cart.html')}" class="cart-icon">
                ${cartEmoji}
                <span class="cart-counter" id="cartCounter">0</span>
            </a>

            <div class="auth-buttons" id="authButtons">
                <a href="${loginPath}" class="btn-login">Login</a>
                <a href="${signupPath}" class="btn-signup">Sign Up</a>
            </div>

            <div class="user-profile" id="userProfile" style="display: none;">
                <button class="profile-btn" id="profileBtn">
                    <span class="greeting">Welcome, <span id="userName">User</span>! 👋</span>
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    ${dropdownHTML}
                </div>
            </div>
        </div>
    </div>
</nav>
        `.trim();
    }

    function buildFooterHTML(xmlDoc) {
        const footer = xmlDoc.querySelector('footer');
        if (!footer) return '';

        const year = footer.querySelector('copyright year')?.textContent || '2026';
        const company = footer.querySelector('copyright company')?.textContent || 'Happy Groceries';
        const emoji = footer.querySelector('copyright emoji')?.textContent || '🛒';
        const message = footer.querySelector('copyright message')?.textContent || 'Created by Gaurav Kaloliya';

        return `
<footer class="footer">
    <div class="container">
        <p>&copy; ${year} ${company} ${emoji} | ${message}</p>
    </div>
</footer>
        `.trim();
    }

    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            
            if (currentPath.includes(linkPath) || 
                (currentPath.endsWith('/') && linkPath === 'index.html') ||
                (currentPath.endsWith('index.html') && linkPath.includes('index.html'))) {
                link.classList.add('active');
            }
        });
    }

    function loadHeader() {
        return fetch(getPath('layout/header.xml'))
            .then(response => {
                if (!response.ok) throw new Error('Failed to load header');
                return response.text();
            })
            .then(xmlString => {
                const xmlDoc = parseXML(xmlString);
                const headerHTML = buildHeaderHTML(xmlDoc);
                
                const body = document.body;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = headerHTML;
                
                while (tempDiv.firstChild) {
                    body.insertBefore(tempDiv.firstChild, body.firstChild);
                }
                
                setActiveNavLink();
            })
            .catch(error => {
                console.error('LayoutLoader: Error loading header:', error);
            });
    }

    function loadFooter() {
        return fetch(getPath('layout/footer.xml'))
            .then(response => {
                if (!response.ok) throw new Error('Failed to load footer');
                return response.text();
            })
            .then(xmlString => {
                const xmlDoc = parseXML(xmlString);
                const footerHTML = buildFooterHTML(xmlDoc);
                
                const main = document.querySelector('main');
                if (main) {
                    main.insertAdjacentHTML('afterend', footerHTML);
                } else {
                    document.body.insertAdjacentHTML('beforeend', footerHTML);
                }
            })
            .catch(error => {
                console.error('LayoutLoader: Error loading footer:', error);
            });
    }

    function init() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Load both header and footer in parallel for faster loading
        const loadPromises = [];

        if (headerPlaceholder) {
            loadPromises.push(
                loadHeader().then(() => {
                    headerPlaceholder.remove();
                    if (typeof initializeNavbar === 'function') {
                        initializeNavbar();
                    }
                    if (typeof initializeDarkMode === 'function') {
                        initializeDarkMode();
                    }

                    const hamburger = document.getElementById('hamburger');
                    const navMenu = document.getElementById('navMenu');
                    if (hamburger && navMenu) {
                        hamburger.addEventListener('click', () => {
                            hamburger.classList.toggle('active');
                            navMenu.classList.toggle('active');
                        });

                        document.addEventListener('click', (e) => {
                            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                                hamburger.classList.remove('active');
                                navMenu.classList.remove('active');
                            }
                        });
                    }

                    const profileBtn = document.getElementById('profileBtn');
                    const profileDropdown = document.getElementById('profileDropdown');
                    if (profileBtn && profileDropdown) {
                        profileBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            profileDropdown.classList.toggle('active');
                        });

                        document.addEventListener('click', (e) => {
                            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                                profileDropdown.classList.remove('active');
                            }
                        });
                    }

                    const logoutBtn = document.getElementById('logoutBtn');
                    if (logoutBtn && typeof logoutUser === 'function') {
                        logoutBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            logoutUser();
                        });
                    }
                })
            );
        }

        if (footerPlaceholder) {
            loadPromises.push(
                loadFooter().then(() => {
                    footerPlaceholder.remove();
                })
            );
        }

        return Promise.all(loadPromises);
    }

    return {
        init: init,
        loadHeader: loadHeader,
        loadFooter: loadFooter
    };
})();

document.addEventListener('DOMContentLoaded', LayoutLoader.init);
