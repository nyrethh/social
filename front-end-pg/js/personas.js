// personas.js - Lógica para la Gestión de Perfiles (Personas)
(function() {
    const persona_api = `${API_BASE}/personas`;
    const user_api = `${API_BASE}/usuarios`;
    const persona_form = document.getElementById('form-persona');
    const persona_table = document.getElementById('persona-table');
    const persona_count = document.getElementById('persona-count');
    const persona_cod_per = document.getElementById('persona-cod_per');
    const persona_fky_usu = document.getElementById('persona-fky_usu');
    const persona_nm1_per = document.getElementById('persona-nm1_per');
    const persona_nm2_per = document.getElementById('persona-nm2_per');
    const persona_ap1_per = document.getElementById('persona-ap1_per');
    const persona_ap2_per = document.getElementById('persona-ap2_per');
    const persona_sex_per = document.getElementById('persona-sex_per');
    const persona_est_per = document.getElementById('persona-est_per');
    const persona_formTitle = document.getElementById('persona-form-title');
    const persona_saveButtonText = document.getElementById('persona-save-button-text');
    const persona_cancelButton = document.getElementById('persona-cancel-button');
    const persona_form_container = document.getElementById('persona_form_container');

    async function cargarUsuariosParaSelect() {
        try {
            const res = await fetch(user_api);
            const usuarios = await res.json();
            persona_fky_usu.innerHTML = '<option value="">Seleccione un usuario...</option>';
            usuarios.forEach(u => {
                persona_fky_usu.innerHTML += `<option value="${u.cod_usu}">${u.ali_usu}</option>`;
            });
        } catch (error) {
            console.error("Error al cargar usuarios en el select:", error);
        }
    }

    window.cargarPersonas = async function() {
        await cargarUsuariosParaSelect();
        if (!persona_table) return;
        renderLoadingState(persona_table, 4);
        try {
            const res = await fetch(persona_api);
            const data = await res.json();
            persona_count.textContent = `${data.length} Perfiles`;
            persona_table.innerHTML = ''; 
            if (data.length === 0) {
                renderEmptyState(persona_table, 4, 'No hay perfiles registrados.');
                return;
            }
            data.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.nm1_per} ${p.ap1_per}</td>
                    <td>${p.ali_usu}</td>
                    <td>${renderEstado(p.est_per)}</td>
                    <td class="actions">
                        <button onclick="persona_editar('${p.cod_per}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button onclick="persona_eliminar('${p.cod_per}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                `;
                persona_table.appendChild(tr);
            });
        } catch (error) {
            persona_table.innerHTML = `<tr><td colspan="4" class="table-state-cell">Error: ${error.message}</td></tr>`;
        }
    }

    window.persona_resetForm = () => {
        if (!persona_form) return;
        persona_form.reset();
        persona_cod_per.value = '';
        persona_formTitle.textContent = 'Añadir Nuevo Perfil';
        persona_saveButtonText.textContent = 'Guardar Perfil';
        persona_cancelButton.classList.add('hidden');
    };

    window.persona_editar = async (id) => {
        try {
            const res = await fetch(`${persona_api}/${id}`);
            const p = await res.json();
            persona_cod_per.value = p.cod_per;
            persona_fky_usu.value = p.fky_usu;
            persona_nm1_per.value = p.nm1_per;
            persona_nm2_per.value = p.nm2_per;
            persona_ap1_per.value = p.ap1_per;
            persona_ap2_per.value = p.ap2_per;
            persona_sex_per.value = p.sex_per;
            persona_est_per.value = p.est_per;
            persona_formTitle.textContent = 'Editar Perfil';
            persona_saveButtonText.textContent = 'Actualizar Perfil';
            persona_cancelButton.classList.remove('hidden');
            if(persona_form_container) persona_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert('Error al cargar datos del perfil.'); }
    };

    window.persona_eliminar = async (id) => {
        if (confirm("¿Eliminar perfil?")) {
            try {
                const res = await fetch(`${persona_api}/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Ocurrió un error desconocido.');
                }
                await cargarPersonas();
            } catch (error) {
                console.error("Error al eliminar persona:", error);
                alert(error.message);
            }
        }
    };
    
    if (persona_form) {
        persona_form.addEventListener('submit', async e => {
            e.preventDefault();
            const id = persona_cod_per.value;
            const datos = {
                fky_usu: persona_fky_usu.value, nm1_per: persona_nm1_per.value,
                ap1_per: persona_ap1_per.value, sex_per: persona_sex_per.value,
                est_per: persona_est_per.value, nm2_per: persona_nm2_per.value, ap2_per: persona_ap2_per.value,
                per_per: 'default_profile.png', por_per: 'default_cover.png' // Valores por defecto para perfil/portada
            };
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `${persona_api}/${id}` : persona_api;
            try {
                await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
                persona_resetForm();
                await cargarPersonas();
            } catch (error) {
                alert('Error al guardar el perfil.');
            }
        });
    }
})();