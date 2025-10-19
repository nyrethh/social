
import { Pool } from "../db.js";


export const getPersonas = async (req, res) => {
    const { rows } = await Pool.query("SELECT p.*, u.ali_usu FROM perfil_personal.persona p JOIN seguridad.usuario u ON p.fky_usu = u.cod_usu");
    res.json(rows);
};

export const getPersonaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM perfil_personal.persona WHERE cod_per = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Persona no encontrada" });
    }
    res.json(rows[0]);
};

export const postPersona = async (req, res) => {
    const { nm1_per, nm2_per, ap1_per, ap2_per, sex_per, per_per, por_per, fky_usu, est_per } = req.body;
    const { rows } = await Pool.query(
        "INSERT INTO perfil_personal.persona (nm1_per, nm2_per, ap1_per, ap2_per, sex_per, per_per, por_per, fky_usu, est_per) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [nm1_per, nm2_per, ap1_per, ap2_per, sex_per, per_per, por_per, fky_usu, est_per]
    );
    res.status(201).json(rows[0]);
};

export const putPersona = async (req, res) => {
    const { id } = req.params;
    // 1. Obtener SÓLO los campos que el front-end envió en el body
    const { nm1_per, nm2_per, ap1_per, ap2_per, sex_per, per_per, por_per, fky_usu, est_per } = req.body;

    try {
        // 2. Obtener los datos ACTUALES de la persona en la DB
        const { rows: currentRows } = await Pool.query(
            "SELECT * FROM perfil_personal.persona WHERE cod_per = $1", 
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ error: "Persona no encontrada" });
        }
        const currentData = currentRows[0];

        // 3. Fusionar los datos:
        //    Usamos (valor_nuevo ?? valor_actual)
        //    Esto significa: Usa 'valor_nuevo' si NO es null/undefined.
        //    Si es null/undefined (porque el front-end no lo envió), usa 'valor_actual'.
        const data = {
            nm1_per: nm1_per ?? currentData.nm1_per,
            nm2_per: nm2_per ?? currentData.nm2_per,
            ap1_per: ap1_per ?? currentData.ap1_per,
            ap2_per: ap2_per ?? currentData.ap2_per,
            sex_per: sex_per ?? currentData.sex_per,
            per_per: per_per ?? currentData.per_per,
            por_per: por_per ?? currentData.por_per,
            fky_usu: fky_usu ?? currentData.fky_usu,
            est_per: est_per ?? currentData.est_per
        };

        // 4. Actualizar la DB con el objeto fusionado
        const { rows } = await Pool.query(
            `UPDATE perfil_personal.persona 
             SET nm1_per = $1, nm2_per = $2, ap1_per = $3, ap2_per = $4, 
                 sex_per = $5, per_per = $6, por_per = $7, fky_usu = $8, est_per = $9 
             WHERE cod_per = $10 RETURNING *`,
            [
                data.nm1_per, data.nm2_per, data.ap1_per, data.ap2_per,
                data.sex_per, data.per_per, data.por_per,
                data.fky_usu, data.est_per, id
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Persona no encontrada después de actualizar" });
        }
        res.json(rows[0]);

    } catch (error) {
        console.error(error); // Mantén esto para depuración

        // Mejor manejo de errores (como el que viste)
        if (error.code === '23502') { // 'NOT NULL' violation
            return res.status(400).json({ 
                message: `Error: El campo '${error.column}' no puede ser nulo.`
            });
        }
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/* export const deletePersona = async (req, res) => {
    const { id } = req.params;

    const { rowCount } = await Pool.query("DELETE FROM perfil_personal.persona WHERE cod_per = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ error: "Persona no encontrada" });
    }
    res.sendStatus(204);
};
 */


export const deletePersona = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await Pool.query(
            "DELETE FROM perfil_personal.persona WHERE cod_per = $1", [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
        
        return res.sendStatus(204);

    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({ 
                message: "No se puede eliminar este perfil porque tiene otros registros asociados (como un rol de fan)." 
            });
        }
        
        console.error("Error al eliminar persona:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener el perfil asociado a un usuario específico
export const getPersonaByUsuario = async (req, res) => {
    const { id } = req.params; // Aquí 'id' es el cod_usu del usuario logueado
    try {
        const result = await Pool.query(
            `SELECT 
                p.cod_per, p.nm1_per, p.nm2_per, p.ap1_per, p.ap2_per, 
                p.sex_per, p.est_per, p.per_per, p.por_per, p.fky_usu,
                u.ali_usu, u.ema_usu 
            FROM perfil_personal.persona p
            JOIN seguridad.usuario u ON p.fky_usu = u.cod_usu
            WHERE p.fky_usu = $1`, 
            [id]
        );

        if (result.rows.length === 0) {
            // El front-end (perfil.js) espera un 404 si el perfil no ha sido creado.
            return res.status(404).json({ message: "Perfil no encontrado para este usuario." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener perfil por usuario:", error);
        res.status(500).json({ message: 'Error al obtener el perfil por usuario.' });
    }
};


export const getPublicacionesPorPersona = async (req, res) => {
    const { id } = req.params; // Este 'id' es el fky_per
    try {
        const { rows } = await Pool.query(
            "SELECT * FROM perfil_personal.publicacion WHERE fky_per = $1 AND est_pub = 'A' ORDER BY fec_pub DESC",
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ message: "Error al obtener publicaciones" });
    }
};