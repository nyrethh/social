/* Tabla: estado

cod_est
nom_est
des_est
fky_pai
est_est */


import { Pool } from '../db.js';

export const getEstados = async (req, res) => {
    const query = `
        SELECT e.cod_est, e.nom_est, e.est_est, p.nom_pai 
        FROM ubicacion.estado e
        JOIN ubicacion.pais p ON e.fky_pai = p.cod_pai
        ORDER BY p.nom_pai, e.nom_est;
    `;
    const { rows } = await Pool.query(query);
    res.json(rows);
};

export const getEstadoById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM ubicacion.estado WHERE cod_est = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.json(rows[0]);
};


export const postEstado = async (req, res) => {
    const { nom_est, fky_pai } = req.body;
    if (!nom_est || !fky_pai) {
        return res.status(400).json({ message: "El nombre del estado y el país son obligatorios." });
    }
    const { rows } = await Pool.query(
        "INSERT INTO ubicacion.estado (nom_est, fky_pai, des_est, est_est) VALUES ($1, $2, $3, $4) RETURNING *",
        [nom_est, fky_pai, 'Sin descripción', 'A']
    );
    res.status(201).json(rows[0]);
};



export const putEstado = async (req, res) => {
   const { id } = req.params;
   const { nom_est, des_est, fky_pai, est_est } = req.body;
   const { rows } = await Pool.query(
       "UPDATE ubicacion.estado SET nom_est = $1, des_est = $2, fky_pai = $3, est_est = $4 WHERE cod_est = $5 RETURNING *",
       [nom_est, des_est, fky_pai, est_est, id]
   );
   if (rows.length === 0) {
       return res.status(404).json({ error: "Estado no encontrado" });
   }
   res.json(rows[0]);
};

/* filtrar x pais */
export const getEstadosByPais = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT e.cod_est, e.nom_est, e.est_est, p.nom_pai
        FROM ubicacion.estado e
        JOIN ubicacion.pais p ON e.fky_pai = p.cod_pai
        WHERE e.fky_pai = $1 
        ORDER BY e.nom_est
    `;
    const { rows } = await Pool.query(query, [id]);
    res.json(rows);
};

export const deleteEstado = async (req, res) => {
   const { id } = req.params;
   const { rowCount } = await Pool.query("DELETE FROM ubicacion.estado WHERE cod_est = $1", [id]);
   if (rowCount === 0) {
       return res.status(404).json({ error: "Estado no encontrado" });
   }
   res.sendStatus(204);
};