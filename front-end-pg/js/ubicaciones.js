// ubicaciones.js - Lógica para la Gestión de Ubicaciones (Estados y Ciudades)
(function() {
    const pais_api = `${API_BASE}/paises`;
    const estado_api = `${API_BASE}/estados`;
    const ciudad_api = `${API_BASE}/ciudades`;
    const zonahoraria_api = `${API_BASE}/zonas-horarias`;

    // Elementos generales
    const btnShowEstados = document.getElementById('btn-show-estados');
    const btnShowCiudades = document.getElementById('btn-show-ciudades');
    const subviewEstados = document.getElementById('subview-estados');
    const subviewCiudades = document.getElementById('subview-ciudades');

    // Elementos de la vista ESTADOS
    const paisSelectEstado = document.getElementById('pais-select-estado');
    const estadoForm = document.getElementById('form-estado');
    const estadoTable = document.getElementById('estado-table');
    const estadoCount = document.getElementById('estado-count');
    const estadoNomEst = document.getElementById('estado-nom_est');

    // Elementos de la vista CIUDADES
    const paisSelectCiudad = document.getElementById('pais-select-ciudad');
    const estadoSelectCiudad = document.getElementById('estado-select-ciudad');
    const zonahorariaSelectCiudad = document.getElementById('zonahoraria-select-ciudad');
    const ciudadForm = document.getElementById('form-ciudad');
    const ciudadTable = document.getElementById('ciudad-table');
    const ciudadCount = document.getElementById('ciudad-count');
    const ciudadNomCiu = document.getElementById('ciudad-nom_ciu');

    // --- Funciones de Utilidad y Carga ---
    async function cargarPaisesEnSelect(selectElement) {
        if (!selectElement) return;
        try {
            const res = await fetch(pais_api);
            const paises = await res.json();
            selectElement.innerHTML = '<option value="">Seleccione un país...</option>';
            paises.forEach(pais => {
                selectElement.innerHTML += `<option value="${pais.cod_pai}">${pais.nom_pai}</option>`;
            });
        } catch (error) {
            selectElement.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    async function cargarZonasHorariasParaSelect() {
        if (!zonahorariaSelectCiudad) return;
        try {
            const res = await fetch(zonahoraria_api);
            const zonas = await res.json();
            zonahorariaSelectCiudad.innerHTML = '<option value="">Seleccione zona horaria...</option>';
            zonas.forEach(z => {
                zonahorariaSelectCiudad.innerHTML += `<option value="${z.cod_zon}">${z.nom_zon} (${z.acr_zon})</option>`;
            });
        } catch (error) {
            zonahorariaSelectCiudad.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    // --- Lógica para la vista de ESTADOS ---
    async function cargarEstados(paisId) {
        if (!estadoTable) return;
        if (!paisId) {
            renderEmptyState(estadoTable, 4, 'Seleccione un país para ver sus estados.');
            estadoCount.textContent = '0 Estados';
            return;
        }
        renderLoadingState(estadoTable, 4);
        try {
            const res = await fetch(`${estado_api}/pais/${paisId}`);
            const estados = await res.json();
            estadoCount.textContent = `${estados.length} Estados`;
            if (estados.length === 0) {
                renderEmptyState(estadoTable, 4, 'Este país no tiene estados registrados.');
                return;
            }
           
            estadoTable.innerHTML = estados.map(e => `
                <tr>
                    <td>${e.nom_est}</td>
                    <td>${e.nom_pai}</td> 
                    <td>${renderEstado(e.est_est)}</td>
                    <td class="actions">
                        <button onclick="estado_eliminar('${e.cod_est}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            estadoTable.innerHTML = `<tr><td colspan="4" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    if (paisSelectEstado) paisSelectEstado.addEventListener('change', () => cargarEstados(paisSelectEstado.value));

    if (estadoForm) {
        estadoForm.addEventListener('submit', async e => {
            e.preventDefault();
            const datos = { nom_est: estadoNomEst.value, fky_pai: paisSelectEstado.value };
            await fetch(estado_api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
            estadoNomEst.value = ''; // Solo limpiamos el input, no el select
            await cargarEstados(datos.fky_pai);
        });
    }

    window.estado_eliminar = async (id) => {
        if (!confirm("¿Eliminar este estado?")) return;
        const paisIdActual = paisSelectEstado.value;
        await fetch(`${estado_api}/${id}`, { method: 'DELETE' });
        await cargarEstados(paisIdActual);
    };


    // --- Lógica para la vista de CIUDADES ---
    async function cargarEstadosEnSelect(paisId) {
        if (!estadoSelectCiudad) return;
        estadoSelectCiudad.innerHTML = '<option value="">Cargando estados...</option>';
        if (!paisId) {
            estadoSelectCiudad.innerHTML = '<option value="">Seleccione un país primero</option>';
            return;
        }
        try {
            const res = await fetch(`${estado_api}/pais/${paisId}`);
            const estados = await res.json();
            estadoSelectCiudad.innerHTML = '<option value="">Seleccione un estado...</option>';
            estados.forEach(estado => {
                estadoSelectCiudad.innerHTML += `<option value="${estado.cod_est}">${estado.nom_est}</option>`;
            });
        } catch (error) {
            estadoSelectCiudad.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    async function cargarCiudades(estadoId) {
        if (!ciudadTable) return;
        if (!estadoId) {
            renderEmptyState(ciudadTable, 5, 'Seleccione un país y un estado para ver las ciudades.');
            ciudadCount.textContent = '0 Ciudades';
            return;
        }
        renderLoadingState(ciudadTable, 5);
        try {
            const res = await fetch(`${ciudad_api}/estado/${estadoId}`);
            const ciudades = await res.json();
            ciudadCount.textContent = `${ciudades.length} Ciudades`;
            if (ciudades.length === 0) {
                renderEmptyState(ciudadTable, 5, 'Este estado no tiene ciudades registradas.');
                return;
            }
            ciudadTable.innerHTML = ciudades.map(c => `
                <tr>
                    <td>${c.nom_ciu}</td>
                    <td>${c.nom_est}</td>
                    <td>${c.nom_pai}</td>
                    <td>${c.nom_zon}</td>
                    <td class="actions">
                        <button onclick="ciudad_eliminar('${c.cod_ciu}')" class="delete" title="Eliminar"><i class="fas fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            ciudadTable.innerHTML = `<tr><td colspan="5" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    if (paisSelectCiudad) {
        paisSelectCiudad.addEventListener('change', () => {
            cargarEstadosEnSelect(paisSelectCiudad.value);
            cargarCiudades(null);
        });
    }
    if (estadoSelectCiudad) estadoSelectCiudad.addEventListener('change', () => cargarCiudades(estadoSelectCiudad.value));
    
    if (ciudadForm) {
        ciudadForm.addEventListener('submit', async e => {
            e.preventDefault();
            const datos = { 
                nom_ciu: ciudadNomCiu.value, 
                fky_est: estadoSelectCiudad.value,
                fky_zon: zonahorariaSelectCiudad.value 
            };
            await fetch(ciudad_api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
            ciudadNomCiu.value = ''; 
            await cargarCiudades(datos.fky_est);
        });
    }

    window.ciudad_eliminar = async (id) => {
        if (!confirm("¿Eliminar esta ciudad?")) return;
        const estadoIdActual = estadoSelectCiudad.value;
        await fetch(`${ciudad_api}/${id}`, { method: 'DELETE' });
        await cargarCiudades(estadoIdActual);
    };

    // --- Lógica para cambiar entre sub-vistas ---
    window.initUbicaciones = function() {
        if (btnShowEstados) {
            btnShowEstados.addEventListener('click', () => {
                if (subviewEstados) subviewEstados.classList.remove('hidden');
                if (subviewCiudades) subviewCiudades.classList.add('hidden');
                btnShowEstados.classList.replace('btn-secondary', 'btn-primary');
                btnShowCiudades.classList.replace('btn-primary', 'btn-secondary');
            });
        }
        if (btnShowCiudades) {
            btnShowCiudades.addEventListener('click', () => {
                if (subviewCiudades) subviewCiudades.classList.remove('hidden');
                if (subviewEstados) subviewEstados.classList.add('hidden');
                btnShowCiudades.classList.replace('btn-secondary', 'btn-primary');
                btnShowEstados.classList.replace('btn-primary', 'btn-secondary');
            });
        }
    }


    // Función principal para esta vista
    window.cargarUbicaciones = async function() {
        await cargarPaisesEnSelect(paisSelectEstado);
        await cargarPaisesEnSelect(paisSelectCiudad);
        await cargarZonasHorariasParaSelect();
        cargarEstados(paisSelectEstado ? paisSelectEstado.value : null);
        cargarCiudades(estadoSelectCiudad ? estadoSelectCiudad.value : null);
    }
})();