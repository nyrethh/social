// main.js - Punto de entrada y navegación principal

// Asume que los módulos de lógica han expuesto sus funciones de carga a `window`.
// Por ejemplo: window.cargarUsuarios, window.cargarRoles, window.cargarPerfil, etc.

document.addEventListener('DOMContentLoaded', () => {
    // Definiciones de elementos y enlaces
    const adminSidebar = document.getElementById('admin-sidebar');
    const allViews = Array.from(document.querySelectorAll('main'));

    const navLinks = {
        perfil: document.getElementById('nav-perfil'),
        usuarios: document.getElementById('nav-usuarios'),
        roles: document.getElementById('nav-roles'),
        personas: document.getElementById('nav-personas'),
        privacidad: document.getElementById('nav-privacidad'),
        publicaciones: document.getElementById('nav-publicaciones'),
        ubicaciones: document.getElementById('nav-ubicaciones'),
        zonahoraria: document.getElementById('nav-zonahoraria'),
        cerrarSesion: document.getElementById('nav-cerrar-sesion'),
    };
    const views = {
        login: document.getElementById('view-login'),
        perfil: document.getElementById('view-perfil'),
        usuarios: document.getElementById('view-usuarios'),
        roles: document.getElementById('view-roles'),
        personas: document.getElementById('view-personas'),
        privacidad: document.getElementById('view-privacidad'),
        publicaciones: document.getElementById('view-publicaciones'),
        ubicaciones: document.getElementById('view-ubicaciones'),
        zonahoraria: document.getElementById('view-zonahoraria'),
    };

    /**
     * Navega a una vista específica.
     * @param {string} view - El ID de la vista (ej: 'usuarios', 'perfil').
     */
    function navigateTo(view) {
        // Ocultar todas las vistas
        allViews.forEach(v => v.classList.add('hidden'));
        
        // Remover clase 'active-link' de todos los enlaces
        Object.values(navLinks).forEach(l => {
             if (l) l.classList.remove('active-link');
        });

        // Mostrar la vista solicitada y activar el enlace correspondiente
        if (views[view]) {
            views[view].classList.remove('hidden');
            if (navLinks[view]) navLinks[view].classList.add('active-link');

            // Llamar a la función de carga del módulo.
            if (window[`cargar${view.charAt(0).toUpperCase() + view.slice(1)}`]) {
                window[`cargar${view.charAt(0).toUpperCase() + view.slice(1)}`]();
            }

            // Manejo de la barra lateral (solo visible en vistas de administrador/perfil)
            if (view === 'login') {
                adminSidebar.classList.add('hidden');
            } else {
                 adminSidebar.classList.remove('hidden');
            }
        }
    }
    window.navigateTo = navigateTo; // Hacemos la función global para uso en login/logout

    // Manejador del botón de Cerrar Sesión
    if (navLinks.cerrarSesion) {
        navLinks.cerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            window.session.logout();
            navigateTo('login');
        });
    }

    // Manejadores de los enlaces de navegación
    Object.keys(navLinks).forEach(key => {
        if (key !== 'cerrarSesion') { // Ya manejamos cerrarSesion aparte
             if (navLinks[key]) {
                navLinks[key].addEventListener('click', (e) => { 
                    e.preventDefault(); 
                    navigateTo(key); 
                });
             }
        }
    });
    
    window.session = {
        isLoggedIn: () => localStorage.getItem('jwt_token') !== null,
        getUser: () => JSON.parse(localStorage.getItem('user_session')),
        logout: () => {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_session');
            localStorage.removeItem('is_logged_in');
        },
        isAdmin: () => {
             const user = window.session.getUser();
             return user && user.nom_rol === 'Admin';
        }
    }

    // Lógica para mostrar/ocultar el botón de Admin
    const btnAdminPanel = document.getElementById('btn-admin-panel');
     if (btnAdminPanel) {
        btnAdminPanel.addEventListener('click', () => {
             navigateTo('usuarios'); // Navegar a la vista de inicio del Admin Panel
        });
    }


    // Comprobación inicial para decidir la vista a mostrar
    if (window.session.isLoggedIn()) {
        if (window.session.isAdmin()) {
            navigateTo('usuarios'); // Iniciar en una vista de Admin si es admin
        } else {
             navigateTo('no-access'); // Mostrar vista de acceso denegado
        }
    } else {
        navigateTo('login'); // Mostrar la pantalla de Login
    }

    // Inicializar sub-vistas de Ubicaciones para que los listeners funcionen
    if(window.initUbicaciones) window.initUbicaciones();
});