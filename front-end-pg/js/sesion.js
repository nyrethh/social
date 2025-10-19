// sesion.js - Controla el estado global de la sesión
document.addEventListener('DOMContentLoaded', () => {
    window.session = {
        getUser: () => {
            const userData = localStorage.getItem('user_session');
            return userData ? JSON.parse(userData) : null;
        },
        isLoggedIn: () => localStorage.getItem('is_logged_in') === 'true',
        logout: () => {
            localStorage.removeItem('user_session');
            localStorage.removeItem('is_logged_in');
            window.location.href = 'index.html'; // Redirigir al login
        },
        // Simulación de isAdmin basada en la lógica del controlador de login
        isAdmin: () => {
            const user = window.session.getUser();
            return user && user.rol_nombre === 'Administrador';
        }
    };

    // Función global para logout (para botones inline)
    window.logout = window.session.logout;

    // Aplicar lógica de sesión al cargar cualquier página (excepto index.html/login)
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

    if (!isLoginPage && !window.session.isLoggedIn()) {
        window.session.logout(); // Si no está logueado, forzar al login
    }

    // Si está en una página post-login, asegurar que el perfil.js sepa quién es.
    if (window.session.isLoggedIn() && window.cargarPerfil) {
        window.cargarPerfil();
    }
});
