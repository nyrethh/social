// login.js - Lógica para el inicio de sesión y redirección
document.addEventListener('DOMContentLoaded', () => {
   
    const loginForm = document.getElementById('form-login'); 
    const loginAlias = document.getElementById('username');   
    const loginClave = document.getElementById('password');   
    const errorMessage = document.getElementById('error-message'); 
    
    // Aseguramos que API_BASE sea accesible (asumimos que core.js se carga primero)
    // Fallback: si window.API_BASE no está definido, usar el origen actual + '/api'
    const base = (window.API_BASE && window.API_BASE !== 'undefined') ? window.API_BASE : `${window.location.origin}/api`;
    const loginAPI = `${base}/seguridad/login`;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
                errorMessage.textContent = ''; // Limpiar mensajes previos

            const credentials = {
                ali_usu: loginAlias.value, // o ema_usu
                cla_usu: loginClave.value
            };

            try {
                const res = await fetch(loginAPI, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });

                // Intentar parsear JSON; si la respuesta no es JSON (por ejemplo HTML de error), lo capturamos
                let data;
                try {
                    data = await res.json();
                } catch (err) {
                    console.error('Respuesta no JSON recibida:', await res.text());
                    throw new Error('Respuesta inválida del servidor');
                }

                if (res.ok) {
                    // 1. Guardar la sesión, el token y datos del usuario en localStorage
                    localStorage.setItem('user_session', JSON.stringify(data.user));
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('is_logged_in', 'true');

                    // 2. Redirección basada en el rol simulado
                    if (data.user.nom_rol === 'Admin') {
                        // Redirige a la pantalla de administrador
                        window.location.href = 'seguridad.html';
                    } else {
                        // Redirige a la pantalla de perfil social
                        window.location.href = 'perfil-usuario.html';
                    }

                } else {
                    errorMessage.textContent = data.message || 'Credenciales inválidas.';
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                errorMessage.textContent = 'Error de conexión con el servidor. Intenta de nuevo.';
            }
        });
    }
});
