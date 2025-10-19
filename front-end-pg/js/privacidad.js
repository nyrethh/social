// privacidad.js - Lógica para la Gestión de Tipos de Privacidad
(function() {
    const privacidad_api = `${API_BASE}/privacidad`;
    const privacidad_form = document.getElementById('form-privacidad');
    const privacidad_form_container = document.getElementById('privacidad_form_container');
    const privacidad_table = document.getElementById('privacidad-table');
    const privacidad_count = document.getElementById('privacidad-count');
    const privacidad_cod_tip = document.getElementById('privacidad-cod_tip');
    const privacidad_nom_tip = document.getElementById('privacidad-nom_tip');
    const privacidad_est_tip = document.getElementById('privacidad-est_tip');
    const privacidad_formTitle = document.getElementById('privacidad-form-title');
    const privacidad_saveButtonText = document.getElementById('privacidad-save-button-text');
    const privacidad_cancelButton = document.getElementById('privacidad-cancel-button');

    window.cargarPrivacidades = async function() {
        if (!privacidad_table) return;
        renderLoadingState(privacidad_table, 3);
        try {
            const res = await fetch(privacidad_api);
            if (!res.ok) throw new Error(`Error de red: ${res.status} ${res.statusText}`);
            const data = await res.json();
            privacidad_count.textContent = `${data.length} Tipos`;
            if (data.length === 0) {
                renderEmptyState(privacidad_table, 3, 'No hay tipos de privacidad registrados.');
                return;
            }
            privacidad_table.innerHTML = data.map(p => `
                <tr>
                    <td>${p.nom_tip}</td>
                    <td>${renderEstado(p.est_tip)}</td>
                    <td class="actions">
                        <button onclick="privacidad_editar('${p.cod_tip}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button onclick="privacidad_eliminar('${p.cod_tip}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            privacidad_table.innerHTML = `<tr><td colspan="3" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    if (privacidad_form) {
        privacidad_form.addEventListener('submit', async e => {
            e.preventDefault();
            const id = privacidad_cod_tip.value;
            const datos = {
                nom_tip: privacidad_nom_tip.value,
                est_tip: privacidad_est_tip.value
            };
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `${privacidad_api}/${id}` : privacidad_api;
            try {
                const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
                if (!res.ok) throw new Error('La operación de guardado falló.');
                privacidad_resetForm();
                await cargarPrivacidades();
            } catch (error) { alert('Error al guardar el tipo de privacidad.'); }
        });
    }

    window.privacidad_editar = async function(id) {
        try {
            const res = await fetch(`${privacidad_api}/${id}`);
            if (!res.ok) throw new Error('No se pudo encontrar el tipo de privacidad.');
            const p = await res.json();
            privacidad_cod_tip.value = p.cod_tip;
            privacidad_nom_tip.value = p.nom_tip;
            privacidad_est_tip.value = p.est_tip;
            privacidad_formTitle.textContent = 'Editar Tipo de Privacidad';
            privacidad_saveButtonText.textContent = 'Actualizar';
            privacidad_cancelButton.classList.remove('hidden');
            if (privacidad_form_container) privacidad_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert(error.message); }
    }

    window.privacidad_resetForm = function() {
        if (!privacidad_form) return;
        privacidad_form.reset();
        privacidad_cod_tip.value = '';
        privacidad_formTitle.textContent = 'Añadir Tipo de Privacidad';
        privacidad_saveButtonText.textContent = 'Guardar';
        privacidad_cancelButton.classList.add('hidden');
    }

    window.privacidad_eliminar = async function(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este tipo de privacidad?")) {
            try {
                const res = await fetch(`${privacidad_api}/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }
                await cargarPrivacidades();
            } catch (error) { alert(error.message); }
        }
    }
})();