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
    
    // Configuración inicial de la sesión
    const ADMIN_ROLE_ID = 'COD_ROL_ADMIN'; // Asume un ID de rol para administrador
    const USER_ROLE_ID = 'COD_ROL_USUARIO'; // Asume un ID de rol para usuario normal

    window.session = {
        isLoggedIn: () => localStorage.getItem('user_token') !== null,
        getUser: () => JSON.parse(localStorage.getItem('logged_user')),
        login: (userData) => {
            // Mock: Simular almacenamiento de token y datos de usuario
            localStorage.setItem('user_token', 'mock-token-12345'); 
            localStorage.setItem('logged_user', JSON.stringify(userData));
        },
        logout: () => {
            localStorage.removeItem('user_token');
            localStorage.removeItem('logged_user');
        },
        isAdmin: () => {
             const user = window.session.getUser();
             // Mock: Asume que el rol se almacena en el objeto de usuario y es 'Administrador' o 'admin'
             return user && (user.rol_nombre === 'Administrador' || user.rol_nombre === 'Admin');
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
        const user = window.session.getUser();
        if (user && user.rol_nombre === 'Administrador') {
            navigateTo('usuarios'); // Iniciar en una vista de Admin si es admin
        } else {
             navigateTo('perfil'); // Iniciar en el perfil si es usuario normal
        }
    } else {
        navigateTo('login'); // Mostrar la pantalla de Login
    }

    // Inicializar sub-vistas de Ubicaciones para que los listeners funcionen
    if(window.initUbicaciones) window.initUbicaciones();
});