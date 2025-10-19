import { Pool } from "../db.js";

export const getPrivacidades = async (req, res) => {
   
    const { rows } = await Pool.query("SELECT * FROM seguridad.tipo_privacidad");
    res.json(rows);
};

export const getPrivacidadById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM seguridad.tipo_privacidad WHERE cod_tip = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Tipo de privacidad no encontrado" });
    }
    res.json(rows[0]);
};

export const postPrivacidad = async (req, res) => {
    const { nom_tip, est_tip } = req.body;
    const { rows } = await Pool.query(
        "INSERT INTO seguridad.tipo_privacidad (nom_tip, est_tip) VALUES ($1, $2) RETURNING *",
        [nom_tip, est_tip]
    );
    res.status(201).json(rows[0]);
};

export const putPrivacidad = async (req, res) => {
    const { id } = req.params;
    const { nom_tip, est_tip } = req.body;
    const { rows } = await Pool.query(
        "UPDATE seguridad.tipo_privacidad SET nom_tip = $1, est_tip = $2 WHERE cod_tip = $3 RETURNING *",
        [nom_tip, est_tip, id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Tipo de privacidad no encontrado" });
    }
    res.json(rows[0]);
};

export const deletePrivacidad = async (req, res) => {
    const { id } = req.params;

    const { rowCount } = await Pool.query("DELETE FROM seguridad.tipo_privacidad WHERE cod_tip = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ error: "Tipo de privacidad no encontrado" });
    }
    res.sendStatus(204); 
};