// usuarios.js - Lógica para la Gestión de Usuarios
(function() {
    const user_api = `${API_BASE}/usuarios`;
    const user_form = document.getElementById('form-usuario');
    const user_table = document.getElementById('user-table');
    const user_count = document.getElementById('user-count');
    const user_cod_usu = document.getElementById('user-cod_usu');
    const user_ali_usu = document.getElementById('user-ali_usu');
    const user_ema_usu = document.getElementById('user-ema_usu');
    const user_cla_usu = document.getElementById('user-cla_usu');
    const user_est_usu = document.getElementById('user-est_usu');
    const user_formTitle = document.getElementById('user-form-title');
    const user_saveButtonText = document.getElementById('user-save-button-text');
    const user_cancelButton = document.getElementById('user-cancel-button');
    const user_form_container = document.getElementById('user_form_container');

    window.cargarUsuarios = async function() {
        if (!user_table) return;
        renderLoadingState(user_table, 4);
        try {
            const res = await fetch(user_api);
            const data = await res.json();
            user_count.textContent = `${data.length} Usuarios`;
            user_table.innerHTML = ''; 
            if (data.length === 0) {
                renderEmptyState(user_table, 4, 'No hay usuarios registrados.');
                return;
            }
            data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.ali_usu}</td>
                    <td>${u.ema_usu}</td>
                    <td>${renderEstado(u.est_usu)}</td>
                    <td class="actions">
                        <button onclick="user_editar('${u.cod_usu}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button onclick="user_eliminar('${u.cod_usu}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                `;
                user_table.appendChild(tr);
            });
        } catch (error) {
            user_table.innerHTML = `<tr><td colspan="4" class="table-state-cell">Error: ${error.message}</td></tr>`;
        }
    }

    if (user_form) {
        user_form.addEventListener('submit', async e => {
            e.preventDefault();
            const id = user_cod_usu.value;
            const datos = { ali_usu: user_ali_usu.value, ema_usu: user_ema_usu.value, est_usu: user_est_usu.value };
            if (user_cla_usu.value || !id) { datos.cla_usu = user_cla_usu.value; }
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `${user_api}/${id}` : user_api;
            try {
                await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
                user_resetForm();
                await cargarUsuarios();
            } catch (error) { alert('Error al guardar los datos.'); }
        });
    }

    window.user_editar = async (id) => {
        try {
            const res = await fetch(`${user_api}/${id}`);
            const u = await res.json();
            user_cod_usu.value = u.cod_usu;
            user_ali_usu.value = u.ali_usu;
            user_ema_usu.value = u.ema_usu;
            user_est_usu.value = u.est_usu;
            user_cla_usu.value = '';
            user_cla_usu.placeholder = "Dejar en blanco para no cambiar";
            user_cla_usu.required = false;
            user_formTitle.textContent = 'Editar Usuario';
            user_saveButtonText.textContent = 'Actualizar Usuario';
            user_cancelButton.classList.remove('hidden');
            if (user_form_container) user_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert('Error al cargar datos de usuario.'); }
    };

    window.user_resetForm = () => {
        if (!user_form) return;
        user_form.reset();
        user_cod_usu.value = '';
        user_cla_usu.placeholder = "••••••••";
        user_cla_usu.required = true;
        user_formTitle.textContent = 'Añadir Nuevo Usuario';
        user_saveButtonText.textContent = 'Guardar Usuario';
        user_cancelButton.classList.add('hidden');
    };

    window.user_eliminar = async (id) => {
        if (confirm("¿Eliminar usuario?")) {
            try {
                await fetch(`${user_api}/${id}`, { method: 'DELETE' });
                await cargarUsuarios();
            } catch (error) { alert('Error al eliminar el usuario.'); }
        }
    };
})();