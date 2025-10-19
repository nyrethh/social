// home.js - Lógica para la página principal (Feed y crear posts)

document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión ANTES que nada
    if (!window.session || !window.session.isLoggedIn()) {
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
        return;
    }

    const formPublicacion = document.getElementById('form-nueva-publicacion');

    const txtTitulo = document.getElementById('titulo-publicacion');
    const selectCiudad = document.getElementById('select-ciudad');

    const btnPublicar = document.getElementById('btn-publicar');
    const txtContenido = document.getElementById('contenido-publicacion');
    const feedbackMsg = document.getElementById('post-feedback');

    let personaLogueada = null;
    const usuarioLogueado = window.session.getUser();


    // --- NUEVA FUNCIÓN ---
    // Carga las ciudades en el dropdown
    const cargarCiudades = async () => {
        try {
            // Usamos el endpoint que ya tienes de ciudades
            const res = await fetch(`${API_BASE}/ciudades`);
            if (!res.ok) throw new Error('No se pudieron cargar las ciudades');
            
            const ciudades = await res.json();
            
            ciudades.forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad.cod_ciu; // El ID
                option.textContent = ciudad.nom_ciu; // El Nombre
                selectCiudad.appendChild(option);
            });
            
        } catch (error) {
            console.error(error);
            selectCiudad.disabled = true;
            const option = document.createElement('option');
            option.textContent = 'Error al cargar ciudades';
            selectCiudad.appendChild(option);
        }
    };


    // 1. Necesitamos obtener el 'cod_per' (ID de la persona) antes de poder publicar.
    //    El 'cod_usu' (ID de usuario) está en la sesión.
    const inicializarHome = async () => {
        if (!usuarioLogueado || !usuarioLogueado.cod_usu) {
            alert('Error de sesión. Saliendo...');
            window.session.logout();
            return;
        }

        try {
            // Buscamos el perfil de la persona asociado al usuario
            const res = await fetch(`${API_BASE}/personas/usuario/${usuarioLogueado.cod_usu}`);
            
            if (res.status === 404) {
                // Si la persona no existe, no puede publicar.
                // Lo forzamos a crear su perfil.
                alert('Debes completar tu perfil antes de poder publicar.');
                window.location.href = 'formulario-usuario.html';
                return;
            }
            if (!res.ok) {
                throw new Error('No se pudo cargar la información del perfil.');
            }
            
            personaLogueada = await res.json();
            
            // ¡Éxito! Habilitamos el formulario de publicación
            if(btnPublicar) btnPublicar.disabled = false;

            await cargarCiudades();
            
            // (Opcional) Aquí puedes llamar a una función para cargar el feed:
            // await cargarFeedPublicaciones();

        } catch (error) {
            console.error('Error fatal al iniciar home:', error);
            if(feedbackMsg) {
                feedbackMsg.textContent = 'Error al cargar. Intenta recargar la página.';
                feedbackMsg.classList.add('error');
            }
            if(btnPublicar) btnPublicar.disabled = true; // Deshabilitar si falla
        }
    };




    // 2. Manejador del formulario de publicación
    if (formPublicacion) {
        formPublicacion.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!personaLogueada || !personaLogueada.cod_per) {
                alert('Error: No se ha podido verificar tu perfil para publicar.');
                return;
            }
           
            const titulo = txtTitulo.value.trim();
            const ciudadId = selectCiudad.value;
            const contenido = txtContenido.value.trim();
            
       if (contenido.length === 0 || titulo.length === 0 || !ciudadId) {
                if(feedbackMsg) feedbackMsg.textContent = 'Todos los campos son requeridos.';
                if(feedbackMsg) feedbackMsg.classList.add('error');
                return;
            }

            // Deshabilitar botón para evitar posts duplicados
            if(btnPublicar) btnPublicar.disabled = true;
            if(feedbackMsg) feedbackMsg.textContent = 'Publicando...';
            if(feedbackMsg) feedbackMsg.classList.remove('error');

           try {
                // --- ACTUALIZAR EL BODY ENVIADO ---
                const res = await fetch(`${API_BASE}/publicaciones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        des_pub: contenido,
                        tit_pub: titulo, // <-- NUEVO
                        fky_ciu: ciudadId, // <-- NUEVO
                        fky_per: personaLogueada.cod_per
                    })
                });

                if (!res.ok) {
                if(txtContenido) txtContenido.value = '';
                if(txtTitulo) txtTitulo.value = ''; // Limpiar título
                if(selectCiudad) selectCiudad.selectedIndex = 0; // Resetear select
                    }

                const nuevaPublicacion = await res.json();

                // Éxito
                if(txtContenido) txtContenido.value = ''; // Limpiar textarea
                if(feedbackMsg) feedbackMsg.textContent = '¡Publicado con éxito!';
                
                // (Opcional) Aquí deberías recargar el feed
                // await cargarFeedPublicaciones();

            } catch (error) {
                console.error('Error al publicar:', error);
                if(feedbackMsg) feedbackMsg.textContent = 'Error al publicar. Inténtalo de nuevo.';
                if(feedbackMsg) feedbackMsg.classList.add('error');
            } finally {
                // Habilitar el botón de nuevo
                if(btnPublicar) btnPublicar.disabled = false;
                // Limpiar mensaje de feedback después de unos segundos
                setTimeout(() => {
                    if(feedbackMsg) feedbackMsg.textContent = '';
                    if(feedbackMsg) feedbackMsg.classList.remove('error');
                }, 3000);
            }
        });
    }




    // 3. Iniciar la página
    inicializarHome();
});