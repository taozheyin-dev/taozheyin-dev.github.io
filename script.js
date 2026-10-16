/**
 * AI Agent Tools Portfolio - High-Performance Vanilla JS
 * Author: taozheyin-dev
 * Features: Zero-delay startup, Dual-theme toggle, Layout-thrashing-free Section Spy,
 *           Smooth Filter Switcher, Cubic Counter, and SVG Reading Progress Ring.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. Dual Theme System (Dark Mode by Default + Persistence)
    // -------------------------------------------------------------------------
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const STORAGE_KEY = 'taozheyin_portfolio_theme';

    function initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
            htmlEl.setAttribute('data-theme', savedTheme);
        } else {
            // Default to dark as requested
            htmlEl.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', nextTheme);
        localStorage.setItem(STORAGE_KEY, nextTheme);
    }

    initTheme();
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // -------------------------------------------------------------------------
    // 2. High-Performance Unified Scroll Manager (RAF + Passive Listener)
    // -------------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const readingProgress = document.getElementById('readingProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const progressCircle = document.getElementById('progressCircle');
    const heroSpheres = document.querySelectorAll('.hero-section .gradient-sphere');

    // Circumference for r=20 circle: 2 * PI * 20 ≈ 125.66
    const CIRCLE_CIRCUMFERENCE = 125.66;
    let isScrollTicking = false;

    function handleScrollUpdates() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollRatio = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;

        // 1. Navbar transparent -> frosted glass
        if (navbar) {
            if (scrollTop > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // 2. Top reading progress bar (scaleX)
        if (readingProgress) {
            readingProgress.style.transform = `scaleX(${scrollRatio})`;
        }

        // 3. Back to Top Button visibility & Circular Progress Ring
        if (backToTopBtn) {
            if (scrollTop > 350) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }

            if (progressCircle) {
                const dashOffset = CIRCLE_CIRCUMFERENCE - (scrollRatio * CIRCLE_CIRCUMFERENCE);
                progressCircle.style.strokeDashoffset = dashOffset;
            }
        }

        // 4. Subtle Parallax for Hero ambient spheres (only when hero is visible)
        if (scrollTop < window.innerHeight && heroSpheres.length > 0) {
            heroSpheres.forEach((sphere, index) => {
                const factor = 0.25 + (index * 0.08);
                sphere.style.transform = `translate3d(0, ${scrollTop * factor}px, 0)`;
            });
        }

        isScrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!isScrollTicking) {
            window.requestAnimationFrame(handleScrollUpdates);
            isScrollTicking = true;
        }
    }, { passive: true });

    // Back to top button action
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // -------------------------------------------------------------------------
    // 3. Section Spy via IntersectionObserver (Zero Layout Thrashing)
    // -------------------------------------------------------------------------
    const sectionElements = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.nav-link');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinkElements.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0
    });

    sectionElements.forEach(sec => spyObserver.observe(sec));

    // -------------------------------------------------------------------------
    // 4. Project Category Filter Switcher
    // -------------------------------------------------------------------------
    const filterContainer = document.getElementById('projectFilter');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterContainer) {
        const filterBtns = filterContainer.querySelectorAll('.filter-btn');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selectedCategory = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');

                    if (selectedCategory === 'all' || cardCat === selectedCategory) {
                        card.style.display = 'flex';
                        // Re-trigger visual entry
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 20);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(12px)';
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // -------------------------------------------------------------------------
    // 5. High-Precision Cubic Ease-Out Counter Animation
    // -------------------------------------------------------------------------
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        const duration = 1600; // ms
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease-out: 1 - (1 - t)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(step);
    }

    // -------------------------------------------------------------------------
    // 6. Viewport Reveal & Unobserve Observer (Fade-In Entry)
    // -------------------------------------------------------------------------
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // If element has counter
                const counterChild = entry.target.querySelector('.stat-value[data-target]');
                if (counterChild) {
                    animateCounter(counterChild);
                } else if (entry.target.classList.contains('stat-value') && entry.target.hasAttribute('data-target')) {
                    animateCounter(entry.target);
                }

                // If element has intensity/skill bar
                const bar = entry.target.querySelector('.intensity-bar');
                if (bar) {
                    bar.style.width = bar.style.getPropertyValue('--level') || '75%';
                }

                // Free memory by unobserving revealed elements
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in-entry, .hero-stat-card, .tool-card, .project-card, .achievement-card, .insight-card, .tech-radar-category').forEach(el => {
        el.classList.add('fade-in-entry');
        revealObserver.observe(el);
    });

    // -------------------------------------------------------------------------
    // 7. Mobile Navigation Drawer & Outside Click Handling
    // -------------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        navLinkElements.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 8. Smooth Scrolling with Fixed Header Offset
    // -------------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------------------------------------------------------------------------
    // 9. Console Technical Branding
    // -------------------------------------------------------------------------
    console.log(
        '%c🚀 taozheyin.dev %c| AI Systems & Multi-Agent Architecture',
        'background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
        'background: #111622; color: #94a3b8; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
    console.log('GitHub: https://github.com/taozheyin-dev');
});
