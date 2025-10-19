// core.js - Funciones y constantes compartidas
const API_BASE = 'http://localhost:4000/api';

/**
 * Renderiza el badge de estado.
 * @param {string} estado - 'A' para Activo, 'I' para Inactivo.
 * @returns {string} HTML del badge.
 */
function renderEstado(estado) {
    const statusClass = estado === 'A' ? 'status-active' : 'status-inactive';
    const statusText = estado === 'A' ? 'Activo' : 'Inactivo';
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

/**
 * Muestra un estado de carga en una tabla.
 * @param {HTMLElement} tbody - El cuerpo de la tabla.
 * @param {number} colspan - Número de columnas.
 */
function renderLoadingState(tbody, colspan) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-state-cell"><i class="fas fa-spinner fa-spin"></i><p>Cargando...</p></td></tr>`;
}

/**
 * Muestra un estado de tabla vacía.
 * @param {HTMLElement} tbody - El cuerpo de la tabla.
 * @param {number} colspan - Número de columnas.
 * @param {string} message - Mensaje a mostrar.
 */
function renderEmptyState(tbody, colspan, message) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-state-cell"><i class="fas fa-box-open"></i><p>${message}</p></td></tr>`;
}

// Exportar funciones y constantes al objeto window para que estén disponibles
// para otros scripts, incluyendo los manejadores de eventos inline en seguridad.html.
window.API_BASE = API_BASE;
window.renderEstado = renderEstado;
window.renderLoadingState = renderLoadingState;
window.renderEmptyState = renderEmptyState;