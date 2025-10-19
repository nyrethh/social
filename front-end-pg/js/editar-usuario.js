// editar-usuario.js
// Lógica para cargar y actualizar datos del usuario en formulario-usuario.html

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('profile-form');
    const formTitle = document.getElementById('form-title');
    const cod_per = document.getElementById('cod_per');
    const fky_usu = document.getElementById('fky_usu');
    const nm1_per = document.getElementById('nm1_per');
    const nm2_per = document.getElementById('nm2_per');
    const ap1_per = document.getElementById('ap1_per');
    const ap2_per = document.getElementById('ap2_per');
    const sex_per = document.getElementById('sex_per');
    const per_per_file = document.getElementById('per_per_file');
    const por_per_file = document.getElementById('por_per_file');
    const alias_input = document.getElementById('alias_input');
    const email_input = document.getElementById('email_input');
    const previewPerfil = document.getElementById('preview-perfil');
    const previewPortada = document.getElementById('preview-portada');

    // Cargar datos del usuario actual desde la sesión global
    const usuario = window.session ? window.session.getUser() : null;
    if (!usuario) {
        alert('No hay usuario en sesión.');
        window.location.href = 'index.html';
        return;
    }

    // Obtener persona asociada al usuario y datos de usuario
    try {
        // Obtener usuario para precargar alias/email
        const userRes = await fetch(`/api/usuarios/${usuario.cod_usu}`);
        if (userRes.ok) {
            const userData = await userRes.json();
            alias_input.value = userData.ali_usu || '';
            email_input.value = userData.ema_usu || '';
        }

        const res = await fetch(`/api/personas/usuario/${usuario.cod_usu}`);
        if (res.status === 404) {
            // No hay persona creada todavía; precargar usuario mínimo
            fky_usu.value = usuario.cod_usu;
            formTitle.textContent = 'Completa tu Perfil';
        } else if (!res.ok) {
            throw new Error('No se pudo cargar la persona');
        } else {
            const data = await res.json();
            // Rellenar campos
            cod_per.value = data.cod_per || '';
            fky_usu.value = data.fky_usu || usuario.cod_usu;
            nm1_per.value = data.nm1_per || '';
            if (nm2_per) nm2_per.value = data.nm2_per || '';
            if (ap1_per) ap1_per.value = data.ap1_per || '';
            if (ap2_per) ap2_per.value = data.ap2_per || '';
            sex_per.value = data.sex_per || 'O';
            // Mostrar previews si existen
            if (data.per_per) { previewPerfil.src = data.per_per; previewPerfil.style.display = 'block'; }
            if (data.por_per) { previewPortada.src = data.por_per; previewPortada.style.display = 'block'; }
            formTitle.textContent = 'Editar Perfil';
        }
    } catch (err) {
        alert('Error cargando datos: ' + err.message);
    }

    if (!form) return;

    // Mostrar preview al seleccionar archivos
    if (per_per_file) per_per_file.addEventListener('change', async () => {
        const f = per_per_file.files[0];
        if (f) previewPerfil.src = await fileToDataURL(f); previewPerfil.style.display = 'block';
    });
    if (por_per_file) por_per_file.addEventListener('change', async () => {
        const f = por_per_file.files[0];
        if (f) previewPortada.src = await fileToDataURL(f); previewPortada.style.display = 'block';
    });

    // Guardar cambios (actualiza usuario + persona)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Leer archivos y convertir a data URL completo si hay cambios
       let per_per_data = per_per_file && per_per_file.files[0] 
            ? await fileToDataURL(per_per_file.files[0]) 
            : previewPerfil.src;

            let por_per_data = por_per_file && por_per_file.files[0] 
            ? await fileToDataURL(por_per_file.files[0]) 
            : previewPortada.src;

            if (!per_per_data || !per_per_data.startsWith('data:image')) {
            per_per_data = 'https://i.imgur.com/8Km9tLL.png';
        }
        if (!por_per_data || !por_per_data.startsWith('data:image')) {
            por_per_data = 'https://i.imgur.com/Qr71crq.jpg';
        }

        // 1) Actualizar usuario (alias/email)
       try {
            const usuarioBody = { ali_usu: alias_input.value, ema_usu: email_input.value, est_usu: 'A' };
            const userUpdate = await fetch(`/api/usuarios/${usuario.cod_usu}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(usuarioBody)
            });
           if (!userUpdate.ok) throw new Error('No se pudo actualizar usuario');
            const updatedUser = await userUpdate.json();

            // 2) Crear/actualizar persona
         const personaPayload = {
                nm1_per: nm1_per.value || undefined, 
                sex_per: sex_per.value || undefined, 

                nm2_per: nm2_per ? (nm2_per.value || undefined) : undefined,
                ap1_per: ap1_per ? (ap1_per.value || undefined) : undefined,
                ap2_per: ap2_per ? (ap2_per.value || undefined) : undefined,
                
                per_per: per_per_data, 
                por_per: por_per_data,
                
                fky_usu: usuario.cod_usu,
                est_per: 'A'
            };

            if (!cod_per.value) {
                const createRes = await fetch(`/api/personas`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personaPayload)
                });
                if (!createRes.ok) throw new Error('No se pudo crear la persona');
            } else {
                const res = await fetch(`/api/personas/${cod_per.value}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personaPayload)
                });
                if (!res.ok) throw new Error('No se pudo actualizar la persona');
            }

            // Actualizar sesión en localStorage con los nuevos datos del usuario
            const session = window.session.getUser() || {};
            session.ali_usu = alias_input.value;
            session.ema_usu = email_input.value;
            localStorage.setItem('user_session', JSON.stringify(session));

            alert('Perfil y usuario actualizados correctamente');
            window.location.href = 'perfil-usuario.html';
        } catch (err) {
            alert('Error al actualizar: ' + err.message);
        }
    });
});

function fileToDataURL(file) {
    return new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // data:image/...;base64,...
        reader.readAsDataURL(file);
    });
}
