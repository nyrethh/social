// perfil.js - Lógica para la vista de perfil social

const perfil_api = `${API_BASE}/personas`;
const user_api = `${API_BASE}/usuarios`; // Necesario para obtener el email/alias si no viene del perfil

// Elementos del DOM para la vista de perfil
// Adaptar a los ids de perfil-usuario.html
const perfilCoverPhoto = document.getElementById('profile-cover-img');
const perfilProfilePhoto = document.getElementById('profile-avatar-img');
const perfilNombreCompleto = document.getElementById('profile-full-name');
const perfilAlias = document.getElementById('profile-alias');
const perfilEmail = document.getElementById('profile-email');
const perfilSexo = document.getElementById('profile-sex');

// Elementos del formulario de edición
const perfilEditFormContainer = document.getElementById('perfil-edit-form-container');
const formEditarPerfil = document.getElementById('form-editar-perfil');
const btnEditarPerfil = document.getElementById('btn-editar-perfil');
const editCodPer = document.getElementById('edit-persona-cod_per');
const editAlias = document.getElementById('edit-alias');
const editEmail = document.getElementById('edit-email');
const editNm1Per = document.getElementById('edit-nm1_per');
const editNm2Per = document.getElementById('edit-nm2_per');
const editAp1Per = document.getElementById('edit-ap1_per');
const editAp2Per = document.getElementById('edit-ap2_per');
const editSexPer = document.getElementById('edit-sex_per');
const editPerPer = document.getElementById('edit-per_per'); // base64
const editPorPer = document.getElementById('edit-por_per'); // base64
const editPerPerFile = document.getElementById('edit-per_per-file');
const editPorPerFile = document.getElementById('edit-por_per-file');
const feedbackMsg = document.getElementById('edit-profile-feedback');

const btnAdminPanel = document.getElementById('btn-admin-panel');


/**
 * Carga y muestra los datos del perfil del usuario logueado.
 */
window.cargarPerfil = async function() {
    const loggedUser = window.session.getUser();
    if (!loggedUser || !loggedUser.cod_usu) return;

    // 1. Ocultar/Mostrar botón de Admin
    if (window.session.isAdmin() && btnAdminPanel) {
        btnAdminPanel.classList.remove('hidden');
    } else if (btnAdminPanel) {
        btnAdminPanel.classList.add('hidden');
    }

    if (perfilEditFormContainer) perfilEditFormContainer.classList.add('hidden'); // Asegurarse de que el formulario de edición esté oculto

    try {
        // Asume un endpoint para buscar el perfil por código de usuario (fky_usu)
        const res = await fetch(`${perfil_api}/usuario/${loggedUser.cod_usu}`);
        
        
       if (!res.ok) {
           // Si no hay perfil, mostramos un estado de "perfil no completado"
           perfilNombreCompleto.textContent = loggedUser.ali_usu;
           perfilAlias.textContent = `@${loggedUser.ali_usu}`;
           perfilEmail.textContent = loggedUser.ema_usu;
           perfilSexo.textContent = loggedUser.sex_per;
         
          
           return;
       }

        const perfil = await res.json();
        
        // Asume que la respuesta del perfil incluye los datos del usuario para el email/alias
        const userData = await fetch(`${user_api}/${perfil.fky_usu}`).then(r => r.json());

        // Rellenar datos de la vista
        perfilNombreCompleto.textContent = `${perfil.nm1_per} ${perfil.ap1_per}`;
        perfilAlias.textContent = `@${userData.ali_usu}`;
        perfilEmail.textContent = userData.ema_usu;
    perfilSexo.textContent = perfil.sex_per === 'M' ? 'Masculino' : (perfil.sex_per === 'F' ? 'Femenino' : 'Otro');
    perfilProfilePhoto.src = perfil.per_per || '...';
    perfilCoverPhoto.src = perfil.por_per || '...';

    await cargarPublicaciones(perfil.cod_per);

        // Llenar campos del formulario de edición
  if (editCodPer) { 
            editCodPer.value = perfil.cod_per;
            editAlias.value = userData.ali_usu;
            editEmail.value = userData.ema_usu;
            editNm1Per.value = perfil.nm1_per;
            editNm2Per.value = perfil.nm2_per || '';
            editAp1Per.value = perfil.ap1_per;
            editAp2Per.value = perfil.ap2_per || '';
            editSexPer.value = perfil.sex_per;
            editPerPer.value = perfil.per_per || '';
            editPorPer.value = perfil.por_per || '';
        }


    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        // Manejo de error al cargar
        perfilNombreCompleto.textContent = 'Error al cargar el perfil.';
        perfilAlias.textContent = '@error';
    }
}

/**
 * Muestra el formulario de edición del perfil.
 */
if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', () => {
        if (perfilEditFormContainer) {
            perfilEditFormContainer.classList.remove('hidden');
            perfilEditFormContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Si no existe el contenedor de edición en esta página, redirigir al formulario dedicado
            window.location.href = 'formulario-usuario.html';
        }
    });
}

/**
 * Oculta el formulario de edición.
 */
window.perfil_hideEditForm = () => {
    if (perfilEditFormContainer) perfilEditFormContainer.classList.add('hidden');
}


/**
 * Manejador del formulario de edición.
 */
if (formEditarPerfil) {
    // Subida de imagen de perfil a base64 (solo si existen los inputs)
    if (editPerPerFile) {
        editPerPerFile.addEventListener('change', function() {
            const file = this.files[0];
            if (file && editPerPer) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editPerPer.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    // Subida de imagen de portada a base64
    if (editPorPerFile) {
        editPorPerFile.addEventListener('change', function() {
            const file = this.files[0];
            if (file && editPorPer) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editPorPer.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    formEditarPerfil.addEventListener('submit', async e => {
        e.preventDefault();
        if (feedbackMsg) feedbackMsg.textContent = '';
        const id = editCodPer ? editCodPer.value : null;
        // Actualizar usuario (alias/email) y persona (datos personales)
        try {
            // 1. Actualizar usuario (alias/email)
            const userSession = window.session.getUser();
            if (!userSession || !userSession.cod_usu) throw new Error('Sesión inválida');

            const usuarioBody = {
                ali_usu: editAlias ? editAlias.value : undefined,
                ema_usu: editEmail ? editEmail.value : undefined,
                est_usu: 'A'
            };

            const usuarioRes = await fetch(`${user_api}/${userSession.cod_usu}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioBody)
            });
            if (!usuarioRes.ok) throw new Error('Error al actualizar alias/email.');

            // 2. Actualizar persona (datos personales y fotos)
            const datos = {
                nm1_per: editNm1Per ? editNm1Per.value : undefined,
                ap1_per: editAp1Per ? editAp1Per.value : undefined,
                sex_per: editSexPer ? editSexPer.value : undefined,
                nm2_per: editNm2Per ? editNm2Per.value : undefined,
                ap2_per: editAp2Per ? editAp2Per.value : undefined,
                per_per: editPerPer ? editPerPer.value : undefined, // base64
                por_per: editPorPer ? editPorPer.value : undefined, // base64
                est_per: 'A'
            };

            if (!id) throw new Error('No se pudo determinar el id de la persona a actualizar');

            const url = `${perfil_api}/${id}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (!res.ok) throw new Error('Error al actualizar el perfil.');

            perfil_hideEditForm();
            await cargarPerfil();
            if (feedbackMsg) feedbackMsg.textContent = 'Perfil actualizado con éxito.';
        } catch (error) {
            console.error(error);
            if (feedbackMsg) feedbackMsg.textContent = 'Error al guardar los cambios: ' + error.message;
        }
    });
}

// Lógica de Publicaciones (Mock)
const formPublicacion = document.getElementById('form-publicacion');
const feedContainer = document.getElementById('feed-container');

if (formPublicacion) {
    formPublicacion.addEventListener('submit', (e) => {
        e.preventDefault();
        const postContentEl = document.getElementById('post-content');
        const postContent = postContentEl ? postContentEl.value : '';
        const loggedUser = window.session.getUser();

        if (postContent && loggedUser && feedContainer) {
            const newPost = document.createElement('div');
            newPost.classList.add('card', 'post-mock');
            const avatarSrc = perfilProfilePhoto ? perfilProfilePhoto.src : '';
            newPost.innerHTML = `
                 <div class="post-header">
                    <div class="post-author-photo" style="background-image: url('${avatarSrc}');"></div>
                    <span class="post-author-name">@${loggedUser.ali_usu}</span>
                </div>
                <p>${postContent}</p>
                <small>Recién publicado</small>
            `;
            
            // Insertar el nuevo post al principio del feed
            feedContainer.prepend(newPost);
            if (postContentEl) postContentEl.value = ''; // Limpiar el textarea
        }
    });
}

// 1. Crea esta nueva función
async function cargarPublicaciones(cod_per) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    try {
        const res = await fetch(`${API_BASE}/publicaciones/persona/${cod_per}`);
        
        if (!res.ok) throw new Error('Error cargando posts');
        
        const posts = await res.json();
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="placeholder-text">Todavía no tienes publicaciones.</p>';
            return;
        }

        postsContainer.innerHTML = ''; // Limpiar el placeholder
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post-item'); // Dales estilo en tu CSS
            postElement.innerHTML = `
                <h4>${post.tit_pub}</h4>
                <p>${post.des_pub}</p>
                <small>${new Date(post.fec_pub).toLocaleString()}</small>
            `;
            postsContainer.appendChild(postElement);
            // formatear la fecha
            const fecha = new Date(post.fec_pub).toLocaleString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            
    

        // --- ¡NUEVO HTML DE RENDERIZADO! ---
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${post.per_per}" alt="Foto de perfil" class="post-avatar-img">
                    <div class="post-author-info">
                        <span class="post-author-name">${post.nm1_per} ${post.ap1_per || ''}</span>
                        <small class="post-date">${fecha}</small>
                    </div>
                </div>
                <div class="post-content">
                    <h4>${post.tit_pub}</h4>
                    <p>${post.des_pub}</p>
                </div>
                <div class="post-reactions">
                    <button class="reaction-btn">
                        <i class="fas fa-thumbs-up"></i> Me gusta
                    </button>
                    <button class="reaction-btn">
                        <i class="fas fa-heart"></i> Me encanta
                    </button>
                    <button class="reaction-btn">
                        <i class="fas fa-comment"></i> Comentar
                    </button>
                </div>
            `;
            postsContainer.appendChild(postElement);

        }); 


    } catch (error) {
        postsContainer.innerHTML = '<p class="placeholder-text">Error al cargar publicaciones.</p>';
        console.error(error);
    }
}