// roles.js - Lógica para la Gestión de Roles
(function() {
    const role_api = `${API_BASE}/roles`;
    const role_form = document.getElementById('form-rol');
    const role_form_container = document.getElementById('role_form_container');
    const role_table = document.getElementById('role-table');
    const role_count = document.getElementById('role-count');
    const role_cod_rol = document.getElementById('role-cod_rol');
    const role_nom_rol = document.getElementById('role-nom_rol');
    const role_des_rol = document.getElementById('role-des_rol');
    const role_est_rol = document.getElementById('role-est_rol');
    const role_formTitle = document.getElementById('role-form-title');
    const role_saveButtonText = document.getElementById('role-save-button-text');
    const role_cancelButton = document.getElementById('role-cancel-button');

    window.cargarRoles = async function() {
        if (!role_table) return;
        renderLoadingState(role_table, 4);
        try {
            const res = await fetch(role_api);
            if (!res.ok) throw new Error('Error de red al cargar los roles.');
            const data = await res.json();
            role_count.textContent = `${data.length} Roles`;
            if (data.length === 0) {
                renderEmptyState(role_table, 4, 'No hay roles registrados.');
                return;
            }
            role_table.innerHTML = data.map(r => `
                <tr>
                    <td>${r.nom_rol}</td>
                    <td>${r.des_rol}</td>
                    <td>${renderEstado(r.est_rol)}</td>
                    <td class="actions">
                        <button onclick="role_editar('${r.cod_rol}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button onclick="role_eliminar('${r.cod_rol}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            role_table.innerHTML = `<tr><td colspan="4" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    if (role_form) {
        role_form.addEventListener('submit', async e => {
            e.preventDefault();
            const id = role_cod_rol.value;
            const datos = {
                nom_rol: role_nom_rol.value,
                des_rol: role_des_rol.value,
                est_rol: role_est_rol.value
            };
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `${role_api}/${id}` : role_api;
            try {
                const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
                if (!res.ok) throw new Error('La operación de guardado falló.');
                role_resetForm();
                await cargarRoles();
            } catch (error) { alert('Error al guardar el rol.'); }
        });
    }

    window.role_editar = async function(id) {
        try {
            const res = await fetch(`${role_api}/${id}`);
            if (!res.ok) throw new Error('No se pudo encontrar el rol.');
            const r = await res.json();
            role_cod_rol.value = r.cod_rol;
            role_nom_rol.value = r.nom_rol;
            role_des_rol.value = r.des_rol;
            role_est_rol.value = r.est_rol;
            role_formTitle.textContent = 'Editar Rol';
            role_saveButtonText.textContent = 'Actualizar Rol';
            role_cancelButton.classList.remove('hidden');
            if (role_form_container) role_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert(error.message); }
    }

    window.role_resetForm = function() {
        if (!role_form) return;
        role_form.reset();
        role_cod_rol.value = '';
        role_formTitle.textContent = 'Añadir Nuevo Rol';
        role_saveButtonText.textContent = 'Guardar Rol';
        role_cancelButton.classList.add('hidden');
    }

    window.role_eliminar = async function(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este rol?")) {
            try {
                const res = await fetch(`${role_api}/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }
                await cargarRoles();
            } catch (error) { alert(error.message); }
        }
    }
})();