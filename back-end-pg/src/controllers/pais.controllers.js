

import { Pool } from "../db.js";

export const getPaises = async (req, res) => {
    
    const { rows } = await Pool.query("SELECT * FROM ubicacion.pais ORDER BY nom_pai");
    res.json(rows);
};

export const getPaisById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM ubicacion.pais WHERE cod_pai = $1", [id]);
    
    if (rows.length === 0) {
        return res.status(404).json({ message: "País no encontrado" });
    }
    res.json(rows[0]);
};

export const postPais = async (req, res) => {
    const { nom_pai, des_pai, ali_pai, cti_pai, fky_con, est_pai } = req.body;
    const { rows } = await Pool.query(
        "INSERT INTO ubicacion.pais (nom_pai, des_pai, ali_pai, cti_pai, fky_con, est_pai) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [nom_pai, des_pai, ali_pai, cti_pai, fky_con, est_pai]
    );
    res.status(201).json(rows[0]);
};

export const putPais = async (req, res) => {
    const { id } = req.params;
    const { nom_pai, des_pai, ali_pai, cti_pai, fky_con, est_pai } = req.body;
    const { rows } = await Pool.query(
        "UPDATE ubicacion.pais SET nom_pai = $1, des_pai = $2, ali_pai = $3, cti_pai = $4, fky_con = $5, est_pai = $6 WHERE cod_pai = $7 RETURNING *",
        [nom_pai, des_pai, ali_pai, cti_pai, fky_con, est_pai, id]
    );
    
    if (rows.length === 0) {
        return res.status(404).json({ message: "País no encontrado" });
    }
    res.json(rows[0]);
};

export const deletePais = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await Pool.query("DELETE FROM ubicacion.pais WHERE cod_pai = $1", [id]);
    
    if (rowCount === 0) {
        return res.status(404).json({ message: "País no encontrado" });
    }
    res.sendStatus(204);
};