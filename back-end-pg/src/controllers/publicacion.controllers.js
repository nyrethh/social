import { Pool } from "../db.js";

// Controlador para CREAR una nueva publicación
export const postPublicacion = async (req, res) => {
    // AHORA LEEMOS 'tit_pub' y 'fky_ciu' DESDE EL BODY
    const { des_pub, fky_per, tit_pub, fky_ciu } = req.body;

    // Valores por defecto SÓLO para lo que no envía el formulario
    const fec_pub = new Date();
    const fky_tip_aco = 1; // ID de tipo de acontecimiento por defecto
    const fky_tip_pri = 1; // ID de privacidad por defecto (ej. 1 = "Público")
    const est_pub = 'A';

    // Verificamos que los datos mínimos llegaron
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
        res.status(500).json({ message: "Error interno al crear la publicación" });
    }
};

export const getPublicacionesPorPersona = async (req, res) => {
    const { id } = req.params; // Este 'id' es el fky_per
    try {
        // MODIFICAMOS LA CONSULTA CON UN JOIN
        const { rows } = await Pool.query(
            `SELECT 
                pub.*, 
                per.nm1_per, 
                per.ap1_per, 
                per.per_per 
             FROM perfil_personal.publicacion pub
             JOIN perfil_personal.persona per ON pub.fky_per = per.cod_per
             WHERE pub.fky_per = $1 AND pub.est_pub = 'A' 
             ORDER BY pub.fec_pub DESC`,
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ message: "Error al obtener publicaciones" });
    }
};