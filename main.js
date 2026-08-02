/* [Bloque 3]: main.js */
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================================
       1. CANVAS BACKGROUND: RED DE NODOS (Tech/Monitoreo)
       ========================================================================= */
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    const connectionDistance = 150;
    
    // Configuración para pantallas de alta densidad (Retina)
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = document.getElementById('hero').offsetHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 1.5 + 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Rebote suave en los bordes
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)'; // Cyan Tech
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Cantidad de partículas depende del tamaño de la pantalla
        const particleCount = Math.floor((width * height) / 12000); 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateNetwork() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Conectar partículas cercanas
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    ctx.beginPath();
                    // Opacidad basada en la distancia
                    const opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateNetwork);
    }

    // Inicializar Canvas
    window.addEventListener('resize', resize);
    resize();
    animateNetwork();


    /* =========================================================================
       2. INTERSECTION OBSERVER: FADE IN UP SCROLL EFFECTS
       ========================================================================= */
    const revealElements = document.querySelectorAll('.reveal-element');
    
    const revealOptions = {
        threshold: 0.15, // Ejecutar cuando el 15% del elemento es visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            // Añadir clase active para detonar el CSS
            entry.target.classList.add('active');
            
            // Dejar de observar una vez animado para mejor rendimiento
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    /* =========================================================================
       3. 3D TILT EFFECT (TARJETAS DE DEPARTAMENTOS)
       ========================================================================= */
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        const inner = card.querySelector('.card-inner');
        const glow = card.querySelector('.card-glow');

        card.addEventListener('mousemove', (e) => {
            // Eliminar transition temporalmente para movimiento fluido
            inner.style.transition = 'none'; 
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posición X dentro de la tarjeta
            const y = e.clientY - rect.top;  // Posición Y dentro de la tarjeta
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcular grados de rotación (Máx 10 grados)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Mover el pseudo-glow al cursor
            if(glow) {
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
            }
        });

        card.addEventListener('mouseleave', () => {
            // Restaurar transición para suavizar el retorno
            inner.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            inner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });


    /* =========================================================================
       4. UI UTILITIES: STICKY HEADER & MOBILE MENU
       ========================================================================= */
    const header = document.querySelector('.glass-header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Sticky Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
        hamburger.setAttribute('aria-expanded', !isExpanded);
    });
});
