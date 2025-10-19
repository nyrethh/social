// zonahoraria.js - Lógica para la Gestión de Zonas Horarias
(function() {
    const zonahoraria_api = `${API_BASE}/zonas-horarias`;
    const zonahoraria_form = document.getElementById('form-zonahoraria');
    const zonahoraria_form_container = document.getElementById('zonahoraria_form_container');
    const zonahoraria_table = document.getElementById('zonahoraria-table');
    const zonahoraria_count = document.getElementById('zonahoraria-count');

    // Campos del formulario (NOTA: Se deben añadir los inputs de acrónimo y diferencia UTC en seguridad.html)
    const zonahoraria_cod_zon = document.getElementById('zonahoraria-cod_zon');
    const zonahoraria_nom_zon = document.getElementById('zonahoraria-nom_zon');
    const zonahoraria_acr_zon = document.getElementById('zonahoraria-acr_zon');
    const zonahoraria_dif_zon = document.getElementById('zonahoraria-dif_zon');
    const zonahoraria_est_zon = document.getElementById('zonahoraria-est_zon');

    // Elementos del formulario
    const zonahoraria_formTitle = document.getElementById('zonahoraria-form-title');
    const zonahoraria_saveButtonText = document.getElementById('zonahoraria-save-button-text');
    const zonahoraria_cancelButton = document.getElementById('zonahoraria-cancel-button');

    window.cargarZonasHorarias = async function() {
        if (!zonahoraria_table) return;
        renderLoadingState(zonahoraria_table, 5);
        try {
            const res = await fetch(zonahoraria_api);
            const data = await res.json();
            zonahoraria_count.textContent = `${data.length} Zonas`;
            if (data.length === 0) {
                renderEmptyState(zonahoraria_table, 5, 'No hay zonas horarias registradas.');
                return;
            }
            zonahoraria_table.innerHTML = data.map(z => `
                <tr>
                    <td>${z.nom_zon}</td>
                    <td>${z.acr_zon}</td>
                    <td>UTC ${z.dif_zon > 0 ? '+' : ''}${z.dif_zon}</td>
                    <td>${renderEstado(z.est_zon)}</td>
                    <td class="actions">
                        <button onclick="zonahoraria_editar('${z.cod_zon}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button onclick="zonahoraria_eliminar('${z.cod_zon}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            zonahoraria_table.innerHTML = `<tr><td colspan="5" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    if (zonahoraria_form) {
        zonahoraria_form.addEventListener('submit', async e => {
            e.preventDefault();
            const id = zonahoraria_cod_zon.value;
            const datos = {
                nom_zon: zonahoraria_nom_zon.value,
                acr_zon: zonahoraria_acr_zon.value,
                dif_zon: zonahoraria_dif_zon.value,
                est_zon: zonahoraria_est_zon.value
            };
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `${zonahoraria_api}/${id}` : zonahoraria_api;
            try {
                const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
                if (!res.ok) throw new Error('La operación de guardado falló.');
                zonahoraria_resetForm();
                await cargarZonasHorarias();
            } catch (error) {
                alert('Error al guardar la zona horaria.');
            }
        });
    }


    window.zonahoraria_editar = async function(id) {
        try {
            const res = await fetch(`${zonahoraria_api}/${id}`);
            const z = await res.json();
            zonahoraria_cod_zon.value = z.cod_zon;
            zonahoraria_nom_zon.value = z.nom_zon;
            zonahoraria_acr_zon.value = z.acr_zon;
            zonahoraria_dif_zon.value = z.dif_zon;
            zonahoraria_est_zon.value = z.est_zon;
            
            zonahoraria_formTitle.textContent = 'Editar Zona Horaria';
            zonahoraria_saveButtonText.textContent = 'Actualizar';
            zonahoraria_cancelButton.classList.remove('hidden');
            if (zonahoraria_form_container) zonahoraria_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert('Error al cargar los datos para editar.');
        }
    }

    window.zonahoraria_resetForm = function() {
        if (!zonahoraria_form) return;
        zonahoraria_form.reset();
        zonahoraria_cod_zon.value = '';
        zonahoraria_formTitle.textContent = 'Añadir Nueva Zona Horaria';
        zonahoraria_saveButtonText.textContent = 'Guardar';
        zonahoraria_cancelButton.classList.add('hidden');
    }

    window.zonahoraria_eliminar = async function(id) {
        if (confirm("¿Estás seguro de que quieres eliminar esta zona horaria?")) {
            try {
                const res = await fetch(`${zonahoraria_api}/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'No se pudo eliminar. Es posible que esté en uso.');
                }
                await cargarZonasHorarias();
            } catch (error) {
                alert(error.message);
            }
        }
    }
})();