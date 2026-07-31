/**
 * ==========================================================================
 * USVRE - UNIDAD DE SOPORTE VITAL Y RESCATE ESTRATÉGICO
 * Archivo: script.js
 * Arquitectura: POO (Programación Orientada a Objetos) / ES6+
 * Descripción: Controladores tácticos, renderizado en canvas y UI dinámica.
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   1. UTILIDADES Y FUNCIONES DE ALTO RENDIMIENTO
   ========================================================================== */
const Utils = {
    /**
     * Limita la frecuencia de ejecución de una función (ideal para resize/scroll)
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function}
     */
    debounce: (func, wait = 20) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    /**
     * Interpolación Lineal (Lerp) para animaciones suaves
     * @param {number} start - Valor inicial
     * @param {number} end - Valor final
     * @param {number} amt - Cantidad de interpolación (0.0 a 1.0)
     * @returns {number}
     */
    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Generador de IDs únicos para el DOM
     * @returns {string}
     */
    generateId: () => '_' + Math.random().toString(36).substr(2, 9)
};

/* ==========================================================================
   2. MOTOR DE RENDERIZADO VISUAL: SIMULADOR DE RADAR Y TOPOGRAFÍA
   ========================================================================== */
class TacticalRadarSystem {
    /**
     * Inicializa el sistema de radar en el canvas especificado
     * @param {string} canvasId - ID del elemento canvas
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.particles = [];
        this.angle = 0;
        this.gridSize = 50;
        this.animationFrame = null;
        this.isRunning = false;

        this.init();
        this.bindEvents();
    }

    init() {
        this.resize();
        this.generateTopography();
        this.start();
    }

    bindEvents() {
        window.addEventListener('resize', Utils.debounce(() => this.resize(), 200));
    }

    resize() {
        // Soporte para pantallas Retina / High DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.max(this.width, this.height) / 1.5;
        
        this.generateTopography(); // Regenerar puntos al redimensionar
    }

    generateTopography() {
        this.particles = [];
        const numPoints = Math.floor((this.width * this.height) / 15000);
        
        for (let i = 0; i < numPoints; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                speedY: Math.random() * 0.5 + 0.1
            });
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
        this.ctx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= this.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= this.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Círculos concéntricos del radar
        for (let r = this.gridSize * 2; r <= this.radius; r += this.gridSize * 2) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
            this.ctx.stroke();
        }
        
        // Ejes X y Y centrales
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.height);
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
        this.ctx.stroke();
    }

    drawRadarSweep() {
        this.angle += 0.02;
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.angle);

        // Cono de luz del radar
        const gradient = this.ctx.createConicGradient(0, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
        gradient.addColorStop(0.1, 'rgba(0, 229, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Línea directriz del escáner
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.radius, 0);
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawDataPoints() {
        this.particles.forEach(p => {
            // Movimiento topográfico sutil (simulando lectura de terreno)
            p.y -= p.speedY;
            if (p.y < 0) p.y = this.height;

            // Calcular distancia al centro para efecto de brillo
            const dx = p.x - this.centerX;
            const dy = p.y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Ángulo del punto respecto al centro
            let pointAngle = Math.atan2(dy, dx);
            if (pointAngle < 0) pointAngle += Math.PI * 2;
            
            let normalizedRadarAngle = this.angle % (Math.PI * 2);
            
            // Iluminar puntos cuando pasa el escáner del radar
            let pointOpacity = p.opacity;
            const angleDiff = Math.abs(normalizedRadarAngle - pointAngle);
            
            if (angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2) {
                pointOpacity = 1;
                this.ctx.fillStyle = '#fff';
            } else {
                this.ctx.fillStyle = `rgba(0, 229, 255, ${pointOpacity})`;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    render() {
        if (!this.isRunning) return;

        // Limpiar lienzo con efecto de estela (trail)
        this.ctx.fillStyle = 'rgba(6, 10, 17, 0.3)'; // Color base oscuro
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawGrid();
        this.drawDataPoints();
        this.drawRadarSweep();

        this.animationFrame = requestAnimationFrame(() => this.render());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.render();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

/* ==========================================================================
   3. SISTEMA DE NOTIFICACIONES (TOAST ALERTS)
   ========================================================================== */
class NotificationSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.queue = [];
        this.activeToasts = new Map(); // Para rastrear timers y elementos
    }

    /**
     * Muestra una notificación táctica en pantalla
     * @param {string} title - Título de la alerta
     * @param {string} message - Mensaje detallado
     * @param {string} type - 'info', 'alert', 'warning'
     * @param {number} duration - Tiempo en ms antes de auto-destruirse
     */
    show(title, message, type = 'info', duration = 5000) {
        if (!this.container) return;

        const toastId = Utils.generateId();
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast--${type}`;
        toastEl.id = toastId;
        toastEl.setAttribute('role', 'alert');

        toastEl.innerHTML = `
            <div class="toast__header">
                <span class="toast__title">${title}</span>
                <button class="toast__close" aria-label="Cerrar alerta">&times;</button>
            </div>
            <div class="toast__message">${message}</div>
            <div class="toast__progress"></div>
        `;

        this.container.appendChild(toastEl);

        // Lógica de progreso visual
        const progressBar = toastEl.querySelector('.toast__progress');
        progressBar.style.transition = `width ${duration}ms linear`;

        // Reflow forzado para que CSS reconozca el elemento antes de animar
        void toastEl.offsetWidth; 

        // Entrar en pantalla
        toastEl.classList.add('show');
        progressBar.style.width = '0%';

        // Evento de cierre manual
        const closeBtn = toastEl.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => this.dismiss(toastId));

        // Auto-destrucción
        const timer = setTimeout(() => {
            this.dismiss(toastId);
        }, duration);

        this.activeToasts.set(toastId, { element: toastEl, timer });
    }

    dismiss(toastId) {
        if (!this.activeToasts.has(toastId)) return;

        const toastData = this.activeToasts.get(toastId);
        clearTimeout(toastData.timer);

        toastData.element.classList.remove('show');
        
        // Esperar a que termine la animación de salida CSS antes de remover del DOM
        setTimeout(() => {
            if (toastData.element.parentNode) {
                toastData.element.parentNode.removeChild(toastData.element);
            }
            this.activeToasts.delete(toastId);
        }, 500); // 500ms coincide con --transition-bounce del CSS
    }
}

/* ==========================================================================
   4. SISTEMA DE CONTADORES ESTADÍSTICOS ANIMADOS (HUD STATS)
   ========================================================================== */
class DataCounterSystem {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        this.duration = 2000; // 2 segundos de animación
    }

    /**
     * Inicia la animación de un elemento específico
     * @param {HTMLElement} el - Elemento del DOM a animar
     */
    animate(el) {
        const targetValue = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(targetValue)) return;

        let startTime = null;
        const startValue = 0;

        const updateCounter = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            
            // Progreso de 0 a 1
            let progress = Math.min(elapsedTime / this.duration, 1);
            
            // Función de suavizado Ease-Out (desacelera al final)
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = Math.floor(Utils.lerp(startValue, targetValue, easeOutProgress));
            
            // Mantener el signo "+" si el elemento original lo tenía (Ej. +100)
            const hasPlus = el.innerText.includes('+');
            el.innerText = hasPlus ? `+${currentValue}` : currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.innerText = hasPlus ? `+${targetValue}` : targetValue;
            }
        };

        requestAnimationFrame(updateCounter);
        
        // Prevenir que se anime múltiples veces al hacer scroll arriba y abajo
        el.removeAttribute('data-target'); 
    }
}
/* ==========================================================================
   5. MOTOR DE OBSERVACIÓN DE SCROLL (REVELADO DE ELEMENTOS)
   ========================================================================== */
class ScrollObserverEngine {
    constructor() {
        // Configuramos el IntersectionObserver nativo para máximo rendimiento
        this.observerOptions = {
            root: null, // Usa el viewport del navegador
            rootMargin: '0px',
            threshold: 0.15 // Se activa cuando el 15% del elemento es visible
        };

        this.observer = new IntersectionObserver(
            this.handleIntersect.bind(this), 
            this.observerOptions
        );
        
        // Instancia del sistema de contadores para activarlos al hacer scroll
        this.counterSystem = new DataCounterSystem('.stat-number');
    }

    init() {
        // Seleccionamos todos los elementos con clases de animación previas
        const hiddenElements = document.querySelectorAll('.fade-up, .fade-in, .slide-left, .stat-number');
        
        hiddenElements.forEach(el => {
            // Añadimos una clase base de ocultamiento si no la tiene el CSS
            el.classList.add('is-hidden-initially');
            this.observer.observe(el);
        });
    }

    handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // 1. Activar animaciones CSS
                target.classList.add('is-visible');
                target.classList.remove('is-hidden-initially');

                // 2. Si el elemento es un contador, disparar el motor matemático
                if (target.classList.contains('stat-number') && target.hasAttribute('data-target')) {
                    this.counterSystem.animate(target);
                }

                // Dejamos de observar el elemento una vez revelado para ahorrar memoria
                observer.unobserve(target);
            }
        });
    }
}

/* ==========================================================================
   6. GESTOR DE INTERFAZ DE USUARIO (UI MANAGER)
   ========================================================================== */
class UIManager {
    constructor() {
        this.header = document.querySelector('header');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('nav ul');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        this.bindEvents();
    }

    bindEvents() {
        // Control del menú móvil
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Control del Header pegajoso (Sticky Header)
        window.addEventListener('scroll', Utils.debounce(() => this.handleScroll(), 10));

        // Smooth Scroll para enlaces internos
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.smoothScroll(e));
        });
    }

    toggleMenu() {
        const isExpanded = this.menuToggle.getAttribute('aria-expanded') === 'true';
        this.menuToggle.setAttribute('aria-expanded', !isExpanded);
        this.navMenu.classList.toggle('nav-active');
        
        // Animación de las barras del botón hamburguesa
        this.menuToggle.classList.toggle('toggle-active');
    }

    handleScroll() {
        if (!this.header) return;
        
        if (window.scrollY > 50) {
            this.header.classList.add('header-scrolled');
        } else {
            this.header.classList.remove('header-scrolled');
        }
    }

    smoothScroll(e) {
        e.preventDefault();
        
        // Cerrar menú móvil si está abierto al hacer clic en un enlace
        if (this.navMenu && this.navMenu.classList.contains('nav-active')) {
            this.toggleMenu();
        }

        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = this.header ? this.header.offsetHeight : 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

/* ==========================================================================
   7. CONTROLADOR PRINCIPAL DE LA APLICACIÓN (CORE APP)
   ========================================================================== */
class USVREApp {
    constructor() {
        // Inicialización de subsistemas
        this.uiManager = new UIManager();
        this.scrollEngine = new ScrollObserverEngine();
        
        // El radar buscará el canvas con id 'radarCanvas' (asegúrate de tenerlo en tu HTML)
        this.radar = new TacticalRadarSystem('radarCanvas');
        
        // Sistema de notificaciones central
        this.notifications = new NotificationSystem('toast-container');
    }

    /**
     * Secuencia de arranque del sistema
     */
    boot() {
        // Iniciar observación de elementos para revelado en scroll
        this.scrollEngine.init();

        // Firma del sistema en consola 
        console.log(
            "%c[USVRE SYSTEM BOOT] %cDISCIPLINA, ESTUDIO, ÍMPETU Y ABNEGACIÓN", 
            "color: #00E5FF; font-weight: bold; font-size: 12px;", 
            "color: #b0bec5; font-style: italic; font-size: 12px;"
        );

        // Disparar una notificación de bienvenida tras cargar (opcional, para testear)
        setTimeout(() => {
            this.notifications.show(
                'SISTEMA EN LÍNEA', 
                'Red de soporte vital y rescate estratégico operativa.', 
                'info', 
                6000
            );
        }, 1500);
    }
}

/* ==========================================================================
   8. ARRANQUE DEL DOM (ENTRY POINT)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Instanciar y arrancar la aplicación de forma global 
    // (asignado a window por si necesitas depurar en consola)
    window.App = new USVREApp();
    window.App.boot();
});
