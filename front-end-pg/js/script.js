// script.js (VERSIÓN FINAL, UNIFICADA Y CORREGIDA)

document.addEventListener('DOMContentLoaded', () => {
    // ====================================================================
    // --- CONFIGURACIÓN GLOBAL Y FUNCIONES COMUNES ---
    // ====================================================================
    const API_BASE = 'http://localhost:4000/api';

    function renderEstado(estado) {
        const statusClass = estado === 'A' ? 'status-active' : 'status-inactive';
        const statusText = estado === 'A' ? 'Activo' : 'Inactivo';
        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
    }

    function renderLoadingState(tbody, colspan) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-state-cell"><i class="fas fa-spinner fa-spin"></i><p>Cargando...</p></td></tr>`;
    }

    function renderEmptyState(tbody, colspan, message) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-state-cell"><i class="fas fa-box-open"></i><p>${message}</p></td></tr>`;
    }

    // ====================================================================
    // --- NAVEGACIÓN PRINCIPAL ---
    // ====================================================================
    const navLinks = {
        usuarios: document.getElementById('nav-usuarios'),
        roles: document.getElementById('nav-roles'),
        personas: document.getElementById('nav-personas'),
        privacidad: document.getElementById('nav-privacidad'),
        ubicaciones: document.getElementById('nav-ubicaciones'),
         zonahoraria: document.getElementById('nav-zonahoraria'),

    };
    const views = {
        usuarios: document.getElementById('view-usuarios'),
        roles: document.getElementById('view-roles'),
        personas: document.getElementById('view-personas'),
        privacidad: document.getElementById('view-privacidad'),
        ubicaciones: document.getElementById('view-ubicaciones'), 
        zonahoraria: document.getElementById('view-zonahoraria'),

    };

    function navigateTo(view) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(navLinks).forEach(l => l.classList.remove('active-link'));
        if (views[view] && navLinks[view]) {
            views[view].classList.remove('hidden');
            navLinks[view].classList.add('active-link');
            if (view === 'usuarios') cargarUsuarios();
            if (view === 'roles') cargarRoles();
            if (view === 'privacidad') cargarPrivacidades();
            if (view === 'personas') cargarPersonas();
            if (view === 'ubicaciones') cargarUbicaciones();
            if (view === 'zonahoraria') cargarZonasHorarias();

        }
    }

    Object.keys(navLinks).forEach(key => {
        navLinks[key].addEventListener('click', (e) => { e.preventDefault(); navigateTo(key); });
    });

    // ====================================================================
    // --- LÓGICA PARA USUARIOS ---
    // ====================================================================
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

    async function cargarUsuarios() {
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
            user_table.innerHTML = `<tr><td colspan="4" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    user_form.addEventListener('submit', async e => {
        e.preventDefault();
        const id = user_cod_usu.value;
        const datos = { ali_usu: user_ali_usu.value, ema_usu: user_ema_usu.value, est_usu: user_est_usu.value };
        if (!id || (id && user_cla_usu.value)) { datos.cla_usu = user_cla_usu.value; }
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${user_api}/${id}` : user_api;
        try {
            await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
            user_resetForm();
            await cargarUsuarios();
        } catch (error) { alert('Error al guardar los datos.'); }
    });

    window.user_editar = async (id) => {
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
        user_form_container.scrollIntoView({ behavior: 'smooth' });
    };

    window.user_resetForm = () => {
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
            await fetch(`${user_api}/${id}`, { method: 'DELETE' });
            await cargarUsuarios();
        }
    };

    // --- LÓGICA PARA ROLES ---
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

    async function cargarRoles() {
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
            role_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert(error.message); }
    }

    window.role_resetForm = function() {
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

    // --- LÓGICA PARA TIPOS DE PRIVACIDAD ---
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

    async function cargarPrivacidades() {
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
            privacidad_form_container.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { alert(error.message); }
    }

    window.privacidad_resetForm = function() {
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
    // ====================================================================
    // --- LÓGICA PARA PERFILES (PERSONAS) ---
    // ====================================================================
    const persona_api = `${API_BASE}/personas`;
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

    async function cargarPersonas() {
        await cargarUsuariosParaSelect();
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
            persona_table.innerHTML = `<tr><td colspan="4" class="table-state-cell">${error.message}</td></tr>`;
        }
    }

    window.persona_resetForm = () => {
        persona_form.reset();
        persona_cod_per.value = '';
        persona_formTitle.textContent = 'Añadir Nuevo Perfil';
        persona_saveButtonText.textContent = 'Guardar Perfil';
        persona_cancelButton.classList.add('hidden');
    };

    window.persona_editar = async (id) => {
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
        persona_form_container.scrollIntoView({ behavior: 'smooth' });
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
    persona_form.addEventListener('submit', async e => {
        e.preventDefault();
        const id = persona_cod_per.value;
        const datos = {
            fky_usu: persona_fky_usu.value, nm1_per: persona_nm1_per.value,
            ap1_per: persona_ap1_per.value, sex_per: persona_sex_per.value,
            est_per: persona_est_per.value, nm2_per: persona_nm2_per.value, ap2_per: persona_ap2_per.value,
            per_per: 'default_profile.png', por_per: 'default_cover.png'
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



// ====================================================================
    // --- LÓGICA PARA UBICACIONES (CON ESTADOS Y CIUDADES) ---
    // ====================================================================
const pais_api_ubicaciones = `${API_BASE}/paises`;
const estado_api_ubicaciones = `${API_BASE}/estados`;
const ciudad_api_ubicaciones = `${API_BASE}/ciudades`;

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

// --- Lógica para cambiar entre sub-vistas ---
btnShowEstados.addEventListener('click', () => {
    subviewEstados.classList.remove('hidden');
    subviewCiudades.classList.add('hidden');
    btnShowEstados.classList.replace('btn-secondary', 'btn-primary');
    btnShowCiudades.classList.replace('btn-primary', 'btn-secondary');
});
btnShowCiudades.addEventListener('click', () => {
    subviewCiudades.classList.remove('hidden');
    subviewEstados.classList.add('hidden');
    btnShowCiudades.classList.replace('btn-secondary', 'btn-primary');
    btnShowEstados.classList.replace('btn-primary', 'btn-secondary');
});

// --- Funciones reutilizables ---
async function cargarPaisesEnSelect(selectElement) {
    try {
        const res = await fetch(pais_api_ubicaciones);
        const paises = await res.json();
        selectElement.innerHTML = '<option value="">Seleccione un país...</option>';
        paises.forEach(pais => {
            selectElement.innerHTML += `<option value="${pais.cod_pai}">${pais.nom_pai}</option>`;
        });
    } catch (error) {
        selectElement.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// --- Lógica para la vista de ESTADOS ---
async function cargarEstados(paisId) {
    if (!paisId) {
        renderEmptyState(estadoTable, 4, 'Seleccione un país para ver sus estados.');
        estadoCount.textContent = '0 Estados';
        return;
    }
    renderLoadingState(estadoTable, 4);
    try {
        const res = await fetch(`${estado_api_ubicaciones}/pais/${paisId}`);
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
paisSelectEstado.addEventListener('change', () => cargarEstados(paisSelectEstado.value));
estadoForm.addEventListener('submit', async e => {
    e.preventDefault();
    const datos = { nom_est: estadoNomEst.value, fky_pai: paisSelectEstado.value };
    await fetch(estado_api_ubicaciones, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    estadoNomEst.value = ''; // Solo limpiamos el input, no el select
    await cargarEstados(datos.fky_pai);
});
window.estado_eliminar = async (id) => {
    if (!confirm("¿Eliminar este estado?")) return;
    const paisIdActual = paisSelectEstado.value;
    await fetch(`${estado_api_ubicaciones}/${id}`, { method: 'DELETE' });
    await cargarEstados(paisIdActual);
};


    // --- Lógica para la vista de CIUDADES ---
    async function cargarZonasHorariasParaSelect() {
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

async function cargarEstadosEnSelect(paisId) {
    estadoSelectCiudad.innerHTML = '<option value="">Cargando estados...</option>';
    if (!paisId) {
        estadoSelectCiudad.innerHTML = '<option value="">Seleccione un país primero</option>';
        return;
    }
    try {
        const res = await fetch(`${estado_api_ubicaciones}/pais/${paisId}`);
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
    if (!estadoId) {
        renderEmptyState(ciudadTable, 5, 'Seleccione un país y un estado para ver las ciudades.');
        ciudadCount.textContent = '0 Ciudades';
        return;
    }
    renderLoadingState(ciudadTable, 5);
    try {
        const res = await fetch(`${ciudad_api_ubicaciones}/estado/${estadoId}`);
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
paisSelectCiudad.addEventListener('change', () => {
    cargarEstadosEnSelect(paisSelectCiudad.value);
    cargarCiudades(null);
});
estadoSelectCiudad.addEventListener('change', () => cargarCiudades(estadoSelectCiudad.value));
ciudadForm.addEventListener('submit', async e => {
    e.preventDefault();
    const datos = { 
        nom_ciu: ciudadNomCiu.value, 
        fky_est: estadoSelectCiudad.value,
        fky_zon: zonahorariaSelectCiudad.value 
    };
    await fetch(ciudad_api_ubicaciones, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    // No reseteamos los selects para mantener el contexto
    ciudadNomCiu.value = ''; 
    await cargarCiudades(datos.fky_est);
});
window.ciudad_eliminar = async (id) => {
    if (!confirm("¿Eliminar esta ciudad?")) return;
    const estadoIdActual = estadoSelectCiudad.value;
    await fetch(`${ciudad_api_ubicaciones}/${id}`, { method: 'DELETE' });
    await cargarCiudades(estadoIdActual);
};

// --- Función principal para esta vista ---
async function cargarUbicaciones() {
    await cargarPaisesEnSelect(paisSelectEstado);
    await cargarPaisesEnSelect(paisSelectCiudad);
    await cargarZonasHorariasParaSelect();
    cargarEstados(null);
    cargarCiudades(null);
}

// ====================================================================
// --- LÓGICA PARA ZONAS HORARIAS (CÓDIGO COMPLETO) ---
// ====================================================================
const zonahoraria_api = `${API_BASE}/zonas-horarias`;
const zonahoraria_form = document.getElementById('form-zonahoraria');
const zonahoraria_form_container = document.getElementById('zonahoraria_form_container');
const zonahoraria_table = document.getElementById('zonahoraria-table');
const zonahoraria_count = document.getElementById('zonahoraria-count');

// Campos del formulario
const zonahoraria_cod_zon = document.getElementById('zonahoraria-cod_zon');
const zonahoraria_nom_zon = document.getElementById('zonahoraria-nom_zon');
const zonahoraria_acr_zon = document.getElementById('zonahoraria-acr_zon');
const zonahoraria_dif_zon = document.getElementById('zonahoraria-dif_zon');
const zonahoraria_est_zon = document.getElementById('zonahoraria-est_zon');

// Elementos del formulario
const zonahoraria_formTitle = document.getElementById('zonahoraria-form-title');
const zonahoraria_saveButtonText = document.getElementById('zonahoraria-save-button-text');
const zonahoraria_cancelButton = document.getElementById('zonahoraria-cancel-button');

async function cargarZonasHorarias() {
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
        zonahoraria_form_container.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Error al cargar los datos para editar.');
    }
}

window.zonahoraria_resetForm = function() {
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


    
    // --- INICIALIZACIÓN ---
    navigateTo('usuarios');
});