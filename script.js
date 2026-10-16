// Modern Portfolio JavaScript

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 1500);
});

// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursorDot) {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }
});

function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    if (cursorOutline) {
        cursorOutline.style.transform = `translate(${outlineX - 15}px, ${outlineY - 15}px)`;
    }
    
    requestAnimationFrame(animateOutline);
}

animateOutline();

// Hide cursor on touch devices
if ('ontouchstart' in window) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
}

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Close menu when clicking nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate counters
            if (entry.target.classList.contains('stat-value') && entry.target.getAttribute('data-target')) {
                animateCounter(entry.target);
            }
            
            // Animate skill bars
            if (entry.target.classList.contains('skill-fill')) {
                entry.target.style.width = entry.target.style.getPropertyValue('--skill');
            }
            
            // Animate usage bars
            if (entry.target.classList.contains('usage-bar')) {
                const fill = entry.target.querySelector('::after');
                if (fill) {
                    fill.style.width = entry.target.style.getPropertyValue('--usage');
                }
            }
        }
    });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
    // Fade in elements
    document.querySelectorAll('.project-card, .tool-card, .stat-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Observe stat values
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
        observer.observe(el);
    });
    
    // Observe skill bars
    document.querySelectorAll('.skill-item').forEach(el => {
        observer.observe(el);
    });
    
    // Observe tool cards
    document.querySelectorAll('.tool-card').forEach(el => {
        observer.observe(el);
    });
});

// Project Card Hover Effect
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// Tool Card Click Effect
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', function() {
        // Add pulse effect
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = '';
        }, 10);
    });
});

// Parallax Effect for Hero
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        const spheres = heroSection.querySelectorAll('.gradient-sphere');
        spheres.forEach((sphere, index) => {
            const speed = 0.5 + (index * 0.1);
            sphere.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Scroll Indicator Hide on Scroll
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    });
}

// Add hover effect to buttons
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Project Link Arrow Animation
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        const arrow = this.querySelector('svg');
        if (arrow) {
            arrow.style.transform = 'translateX(5px)';
        }
    });
    
    link.addEventListener('mouseleave', function() {
        const arrow = this.querySelector('svg');
        if (arrow) {
            arrow.style.transform = 'translateX(0)';
        }
    });
});

// Console Message
console.log('%c🚀 taozheyin.dev', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; color: transparent;');
console.log('%c探索 AI 驱动的开发未来', 'font-size: 14px; color: #64748b;');
console.log('%cGitHub: https://github.com/taozheyin-dev', 'font-size: 12px; color: #6366f1;');

// Add smooth reveal for sections
const revealSections = document.querySelectorAll('section');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

revealSections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    revealObserver.observe(section);
});

// Easter egg: Konami code
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    console.log('%c🎉 You found the easter egg!', 'font-size: 20px; color: #ec4899;');
    document.body.style.animation = 'rainbow 2s ease infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttle to scroll-heavy operations
window.addEventListener('scroll', throttle(() => {
    // Additional scroll operations here
}, 100));
