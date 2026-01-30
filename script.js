/**
 * LogicPrompt AI - Unified Site Logic
 * CORRECTED VERSION - Production Ready
 */
let roiTrackingTimer; // Start here: This must be at the very top.

document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE NAVIGATION TOGGLE
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('open');
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('open');
            });
        });
    }

    // 2. ROI / TEI CALCULATOR - FIXED ELEMENT IDs
    const weeklyHoursInput = document.getElementById('weeklyHours');
    const hourlyRateInput = document.getElementById('hourlyRate');
    const errorRateInput = document.getElementById('errorRate');

    if (weeklyHoursInput && hourlyRateInput && errorRateInput) {
        // Add event listeners to all inputs
        [weeklyHoursInput, hourlyRateInput, errorRateInput].forEach(input => {
            input.addEventListener('input', calculateROI);
        });

        // Calculate on page load
        calculateROI();
    }

    function calculateROI() {
        const weeklyHours = parseFloat(document.getElementById('weeklyHours')?.value) || 0;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate')?.value) || 0;
        const errorRate = (parseFloat(document.getElementById('errorRate')?.value) || 0) / 100;

        const annualLaborCost = weeklyHours * hourlyRate * 52;
        const driftCost = annualLaborCost * errorRate;
        const potentialRecovery = driftCost * 0.70;

        updateElement('annualCost', formatCurrency(annualLaborCost));
        updateElement('potentialSavings', formatCurrency(potentialRecovery));
        
        const systemCost = 12000; 
        const netROI = ((potentialRecovery - systemCost) / systemCost) * 100;
        updateElement('netROI', Math.round(netROI) + '%+');

        // 4. Google Analytics Event Tracking
        clearTimeout(roiTrackingTimer);
        if (annualLaborCost > 0) {
            roiTrackingTimer = setTimeout(() => {
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_roi_report', {
                        'event_category': 'engagement',
                        'event_label': 'TEI Calculator',
                        'value': Math.round(driftCost), 
                        'currency': 'USD'
                    });
                    console.log("GA4: ROI Event Sent", driftCost);
                }
            }, 2000); 
        }
    } 

    // Helper: Format as Currency
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(num);
    }

    // Helper: Safe UI Update
    function updateElement(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // 3. SCROLL REVEAL ANIMATIONS
    const observerOptions = { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully visible
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing after animation for better performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target all animated elements
    const animatedElements = document.querySelectorAll(
        '.hero, .drift-card, .solution-card, .proof-stat, .result-card, .calculator-card, .pricing-card'
    );
    
    animatedElements.forEach(el => observer.observe(el));

    // 4. SMOOTH SCROLL FOR ANCHOR LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = document.querySelector('.nav')?.offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. ACTIVE NAV LINK ON SCROLL (Optional enhancement)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Only add scroll listener if we have sections with IDs
    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveNavLink);
    }
});