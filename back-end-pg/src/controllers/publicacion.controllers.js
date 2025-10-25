import { Pool } from "../db.js";

// Controlador para OBTENER TODAS las publicaciones (para el feed principal)
export const getPublicaciones = async (req, res) => {
    try {
        const { rows } = await Pool.query(
            `SELECT 
                pub.*, 
                per.nm1_per, 
                per.ap1_per, 
                per.per_per,
                ciu.nom_ciu
             FROM perfil_personal.publicacion pub
             JOIN perfil_personal.persona per ON pub.fky_per = per.cod_per
             JOIN ubicacion.ciudad ciu ON pub.fky_ciu = ciu.cod_ciu
             WHERE pub.est_pub = 'A' 
             ORDER BY pub.fec_pub DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ message: "Error interno al obtener las publicaciones" });
    }
};

export const postPublicacion = async (req, res) => {
    // AHORA LEEMOS 'tit_pub' y 'fky_ciu' DESDE EL BODY
    const { des_pub, fky_per, tit_pub, fky_ciu } = req.body;

    // Valores por defecto SÓLO para lo que no envía el formulario
    const fec_pub = new Date();
    const fky_tip_aco = 1; // ID de tipo de acontecimiento por defecto
    const fky_tip_pri = 1; // ID de privacidad por defecto (ej. 1 = "Público") aqui lo tngo asi pero hay que cambiarlo.
    const est_pub = 'A';

    // sirve para verificar que los datos minimoso requeridos lleguen.
    if (!des_pub || !fky_per || !tit_pub || !fky_ciu) {
        return res.status(400).json({ message: "El contenido, autor, título y ciudad son requeridos." });
    }

    try {
        const { rows } = await Pool.query(
            `INSERT INTO perfil_personal.publicacion 
             (fec_pub, tit_pub, des_pub, fky_ciu, fky_per, fky_tip_aco, fky_tip_pri, est_pub)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            // Asegúrate que el orden coincida
            [fec_pub, tit_pub, des_pub, fky_ciu, fky_per, fky_tip_aco, fky_tip_pri, est_pub]
        );
        res.status(201).json(rows[0]); 

    } catch (error) {
        console.error("Error al crear publicacion:", error);
        // Error de FK es por si el autor o la ciudad no existen
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: `Error de referencia: El autor o la ciudad especificada no existe. (${error.constraint})`
            });
        }
        res.status(500).json({ message: "Error interno al crear la publicación", error: error.message });
    }
};

export const getPublicacionesPorPersona = async (req, res) => {
    const { id } = req.params; // Este 'id' es el fky_per
    try {
        // consulta
        const { rows } = await Pool.query(
            `SELECT 
                pub.*, 
                per.nm1_per, 
                per.ap1_per,
                per.per_per,
                ciu.nom_ciu
             FROM perfil_personal.publicacion pub
             JOIN perfil_personal.persona per ON pub.fky_per = per.cod_per
             JOIN ubicacion.ciudad ciu ON pub.fky_ciu = ciu.cod_ciu
             WHERE pub.fky_per = $1 AND pub.est_pub = 'A' 
             ORDER BY pub.fec_pub DESC`,
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ message: "Error interno al obtener las publicaciones" });
    }
};

export const deletePublicacion = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await Pool.query(
            `UPDATE perfil_personal.publicacion SET est_pub = 'I' WHERE cod_pub = $1`,
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: "Publicación no encontrada." });
        }

        res.sendStatus(204);

    } catch (error) {
        console.error("Error al eliminar la publicación:", error);
        res.status(500).json({ message: "Error interno al eliminar la publicación" });
    }
};