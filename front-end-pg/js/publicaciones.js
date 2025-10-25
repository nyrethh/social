
document.addEventListener('DOMContentLoaded', () => {
    const publicacionesTable = document.getElementById('publicaciones-table');
    const publicacionesCount = document.getElementById('publicaciones-count');

    const fetchPublicaciones = async () => {
        try {
            renderLoadingState(publicacionesTable, 4);

            const res = await fetchWithAuth(`${API_BASE}/publicaciones`);

            if (!res.ok) {
                throw new Error('Error al obtener las publicaciones');
            }

            const publicaciones = await res.json();

            publicacionesCount.textContent = `${publicaciones.length} publicaciones`;

            if (publicaciones.length === 0) {
                renderEmptyState(publicacionesTable, 4, 'No hay publicaciones disponibles.');
                return;
            }

            publicacionesTable.innerHTML = publicaciones.map(pub => `
                <tr>
                    <td>${pub.nm1_per} ${pub.ap1_per}</td>
                    <td>${pub.des_pub}</td>
                    <td>${new Date(pub.fec_pub).toLocaleString()}</td>
                    <td class="actions-cell">
                        <button class="btn btn-danger btn-sm" onclick="handleDeletePublicacion(${pub.cod_pub})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error al cargar publicaciones:', error);
            renderEmptyState(publicacionesTable, 4, 'Error al cargar las publicaciones.');
        }
    };

    window.handleDeletePublicacion = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_BASE}/publicaciones/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                throw new Error('Error al eliminar la publicación');
            }

            fetchPublicaciones();

        } catch (error) {
            console.error('Error al eliminar la publicación:', error);
            alert('No se pudo eliminar la publicación.');
        }
    };

    // Cargar las publicaciones cuando se muestra la vista
    const navLink = document.getElementById('nav-publicaciones');
    if (navLink) {
        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Lógica para mostrar la vista de publicaciones (debe estar en main.js)
            // Aquí solo nos aseguramos de cargar los datos
            fetchPublicaciones();
        });
    }
});
