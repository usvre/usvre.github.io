document.addEventListener('DOMContentLoaded', () => {
    // 1. Animaciones al hacer scroll (Fade-in)
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });

    // 2. Menú móvil (Hamburguesa)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 3. Simulación de envío del formulario de emergencias
    const formDesaparecidos = document.getElementById('form-desaparecidos');
    if(formDesaparecidos) {
        formDesaparecidos.addEventListener('submit', (e) => {
            e.preventDefault();
            // Aquí iría la conexión con el backend o la base de datos de la unidad
            alert('REPORTE EMITIDO CON ÉXITO. El centro de comando de la USVRE ha recibido la información. Mantenga su línea abierta.');
            formDesaparecidos.reset();
        });
    }

    // 4. Smooth Scrolling para los enlaces de anclaje
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // Cierra menú móvil si está abierto
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
