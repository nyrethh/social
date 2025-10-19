// register.js - lógica para registrar usuario y persona, iniciar sesión y redirigir al perfil
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-register');
    const apiBase = window.API_BASE || `${window.location.origin}/api`;
    const usuariosApi = `${apiBase}/usuarios`;
    const personasApi = `${apiBase}/personas`;
    const seguridadLoginApi = `${apiBase}/seguridad/login`;

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Datos de acceso
        const ali_usu = document.getElementById('reg-alias').value.trim();
        const ema_usu = document.getElementById('reg-email').value.trim();
        const cla_usu = document.getElementById('reg-clave').value;

        // Datos personales
        const nm1_per = document.getElementById('reg-nm1').value.trim();
        const nm2_per = document.getElementById('reg-nm2').value.trim();
        const ap1_per = document.getElementById('reg-ap1').value.trim();
        const ap2_per = document.getElementById('reg-ap2').value.trim();
        const sex_per = document.getElementById('reg-sex').value;

        try {
            // 1) Crear usuario
            const userRes = await fetch(usuariosApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ali_usu, ema_usu, cla_usu, est_usu: 'A' })
            });

            if (!userRes.ok) {
                const err = await userRes.json().catch(() => ({ message: 'Error al crear usuario' }));
                throw new Error(err.message || 'Error al crear usuario');
            }

            const createdUser = await userRes.json();

            // 2) Crear persona asociada
            const personaPayload = {
                nm1_per, nm2_per, ap1_per, ap2_per, sex_per,
                per_per: '', por_per: '', fky_usu: createdUser.cod_usu, est_per: 'A'
            };

            const personaRes = await fetch(personasApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personaPayload)
            });

            if (!personaRes.ok) {
                const err = await personaRes.json().catch(() => ({ message: 'Error al crear persona' }));
                // Intentar limpiar el usuario creado? (opcional)
                throw new Error(err.message || 'Error al crear persona');
            }

            // 3) Iniciar sesión automáticamente (login) usando alias y clave
            const loginRes = await fetch(seguridadLoginApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ali_usu, cla_usu })
            });

            if (!loginRes.ok) {
                const err = await loginRes.json().catch(() => ({ message: 'Error al iniciar sesión' }));
                throw new Error(err.message || 'Error al iniciar sesión');
            }

            const loginData = await loginRes.json();

            // Guardar sesión y redirigir al perfil
            localStorage.setItem('user_session', JSON.stringify(loginData.user));
            localStorage.setItem('is_logged_in', 'true');

            // Redirigir al perfil
            window.location.href = 'perfil-usuario.html';

        } catch (error) {
            console.error('Error en registro:', error);
            alert('Error al registrarse: ' + (error.message || 'Intenta de nuevo'));
        }
    });
});
