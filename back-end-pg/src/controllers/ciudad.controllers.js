
import { Pool } from "../db.js";

export const getCiudades = async (req, res) => {
    const { rows } = await Pool.query("SELECT * FROM ubicacion.ciudad ORDER BY nom_ciu");
    res.json(rows);
};

export const getCiudadById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM ubicacion.ciudad WHERE cod_ciu = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Ciudad no encontrada" });
    }
    res.json(rows[0]);
};

export const getCiudadesByEstado = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT c.cod_ciu, c.nom_ciu, c.est_ciu, e.nom_est, p.nom_pai, z.nom_zon
        FROM ubicacion.ciudad c
        JOIN ubicacion.estado e ON c.fky_est = e.cod_est
        JOIN ubicacion.pais p ON e.fky_pai = p.cod_pai
        JOIN ubicacion.zona_horaria z ON c.fky_zon = z.cod_zon
        WHERE c.fky_est = $1
        ORDER BY c.nom_ciu;
    `;
    const { rows } = await Pool.query(query, [id]);
    res.json(rows);
};

export const postCiudad = async (req, res) => {
    const { nom_ciu, fky_est, fky_zon } = req.body;
    if (!nom_ciu || !fky_est || !fky_zon) {
        return res.status(400).json({ message: "El nombre, estado y zona horaria son obligatorios." });
    }
    const { rows } = await Pool.query(
        "INSERT INTO ubicacion.ciudad (nom_ciu, fky_est, fky_zon, des_ciu, est_ciu) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nom_ciu, fky_est, fky_zon, 'Sin descripción', 'A']
    );
    res.status(201).json(rows[0]);
};

export const putCiudad = async (req, res) => {
    const { id } = req.params;
    const { nom_ciu, fky_est, fky_zon } = req.body;
    const { rows } = await Pool.query(
        "UPDATE ubicacion.ciudad SET nom_ciu = $1, fky_est = $2, fky_zon = $3 WHERE cod_ciu = $4 RETURNING *",
        [nom_ciu, fky_est, fky_zon, id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ message: "Ciudad no encontrada" });
    }
    res.json(rows[0]);
}

export const deleteCiudad = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await Pool.query("DELETE FROM ubicacion.ciudad WHERE cod_ciu = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Ciudad no encontrada" });
    }
    res.sendStatus(204);
};