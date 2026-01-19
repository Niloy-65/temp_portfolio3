// 1. Preloader
window.addEventListener("load", () => {
    // Check if GSAP is loaded to avoid errors
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        tl.to(".loader-progress", { width: "100%", duration: 1 })
          .to(".preloader", { y: "-100%", duration: 0.8, ease: "power4.inOut" })
          .from(".reveal-text", { y: 50, opacity: 0, stagger: 0.1, duration: 0.8 });
    }
});

// 2. Cursor
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

// Only run cursor logic if elements exist
if (cursor && cursorDot) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0 });
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15 });
    });
}

// 3. Magnetic Logic
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
        if(cursor) cursor.classList.add('active');
    });
    elem.addEventListener('mouseleave', () => {
        if(cursor) cursor.classList.remove('active');
        gsap.to(elem, { x: 0, y: 0, duration: 0.3 });
    });
    elem.addEventListener('mousemove', (e) => {
        const rect = elem.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        gsap.to(elem, { x: x, y: y, duration: 0.3 });
    });
});

// 4. Infinite Carousel
const track = document.querySelector('.carousel-track');
if (track) {
    const cards = Array.from(track.children);
    cards.forEach(card => track.appendChild(card.cloneNode(true)));
    let anim = gsap.to(track, { xPercent: -50, ease: "none", duration: 25, repeat: -1 });
    track.addEventListener('mouseenter', () => anim.pause());
    track.addEventListener('mouseleave', () => anim.play());
}

// 5. Theme & Mobile Menu
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const body = document.documentElement;
        const isDark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        toggleBtn.querySelector('i').classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
    });
}

const menuToggle = document.getElementById('mobile-menu');
const navLinksContainer = document.querySelector('.nav-links');

if (menuToggle && navLinksContainer) {
    // Toggle Menu
    menuToggle.addEventListener('click', () => navLinksContainer.classList.toggle('active'));

    // Close Menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
        });
    });
}

// GSAP ScrollTrigger Animations
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Image Reveal
    const aboutSection = document.querySelector("#about");
    if (aboutSection) {
        gsap.from(".reveal-img", { 
            scrollTrigger: "#about", 
            scale: 0.9, 
            opacity: 0, 
            duration: 1 
        });

        // 6. Number Counter Animation for About Section
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            let zero = { val: 0 };
            let target = counter.getAttribute('data-target');

            gsap.to(zero, {
                val: target,
                duration: 2,
                scrollTrigger: {
                    trigger: "#about",
                    start: "top 70%", 
                },
                onUpdate: function() {
                    counter.innerText = Math.ceil(zero.val);
                }
            });
        });

        // Parallax effect for the Watermark Text
        gsap.to(".watermark-text", {
            xPercent: 20, 
            scrollTrigger: {
                trigger: "#about",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }
}

// 7. Portfolio Filtering Logic (Unified & Fixed)
document.addEventListener("DOMContentLoaded", function () {
    // Select filter buttons ONLY if they have a 'data-filter' attribute
    const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");

    if (portfolioItems.length > 0) {
        // --- CONFIGURATION ---
        const initialItems = 9; 
        const loadItems = 3;    
        // ---------------------

        let visibleCount = initialItems;
        let currentFilter = 'all';

        function updateVisibility() {
            let filteredItems = [];

            // 1. Identify which items belong to the current filter
            portfolioItems.forEach(item => {
                const category = item.getAttribute("data-category");
                
                // Clear any inline styles left by other scripts (Important fix)
                item.style.display = ''; 
                item.style.opacity = '';
                item.style.transform = '';

                if (currentFilter === 'all' || category === currentFilter) {
                    filteredItems.push(item);
                    item.classList.add("hidden"); 
                } else {
                    item.classList.add("hidden");
                }
            });

            // 2. Show items up to the visibleCount
            filteredItems.forEach((item, index) => {
                if (index < visibleCount) {
                    item.classList.remove("hidden");
                    // Optional: Add simple fade in if desired
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                }
            });

            // 3. Button Logic
            if (!loadMoreBtn) return; // Guard clause if button missing

            if (filteredItems.length <= initialItems) {
                loadMoreBtn.style.display = 'none'; 
            } 
            else {
                loadMoreBtn.style.display = 'inline-block';
                if (visibleCount >= filteredItems.length) {
                    loadMoreBtn.innerText = "Show Less";
                } else {
                    loadMoreBtn.innerText = "Show More";
                }
            }
        }

        // Filter Buttons Click Event
        filterBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                filterBtns.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                currentFilter = this.getAttribute("data-filter");
                visibleCount = initialItems; 
                updateVisibility();
            });
        });

        // Load More / Show Less Button Click Event
        if(loadMoreBtn) {
            loadMoreBtn.addEventListener("click", function (e) {
                e.preventDefault();
                
                const totalFiltered = Array.from(portfolioItems).filter(item => {
                    const category = item.getAttribute("data-category");
                    return currentFilter === 'all' || category === currentFilter;
                }).length;

                if (visibleCount >= totalFiltered) {
                    visibleCount = initialItems;
                    // Smooth scroll back to filters
                    const filters = document.querySelector('.portfolio-filters');
                    if(filters) filters.scrollIntoView({ behavior: 'smooth' });
                } else {
                    visibleCount += loadItems;
                }
                updateVisibility();
            });
        }

        // Initialize
        updateVisibility();
    }
});

// 8. Intersection Observer for Skill Bars
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card').forEach(card => {
    observer.observe(card);
});

// 9. 3D Tilt Effect for Market Cards
const cards = document.querySelectorAll('.market-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
});

// 10. Swiper Initialization
document.addEventListener("DOMContentLoaded", function() {
    // Only initialize if element exists
    if(document.querySelector('.cert-swiper')) {
        const certificateSwiper = new Swiper('.cert-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            grabCursor: true,
            autoHeight: false,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1100: { slidesPerView: 3 }
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            speed: 800,
        });
    }
});

// 11. PDF Modal Logic
const pdfUrl = "assets/imgs/Cyber-Security-And-Ethics-Latest-Trend.pdf";

function openPdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfFrame");
    if(modal && iframe) {
        iframe.src = pdfUrl; 
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfFrame");
    if(modal && iframe) {
        modal.style.display = "none";
        iframe.src = "";
        document.body.style.overflow = "auto";
    }
}

// Close PDF modal if user clicks background
window.onclick = function(event) {
    const modal = document.getElementById("pdfModal");
    if (event.target == modal) { closePdfModal(); }
}