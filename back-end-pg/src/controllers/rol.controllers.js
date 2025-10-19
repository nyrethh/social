/* Tabla: seguridad.rol
Esquema: seguridad

cod_rol
nom_rol
des_rol
est_rol */

import { Pool } from "../db.js";

export const getRoles = async (req, res) => {
    const { rows } = await Pool.query("SELECT * FROM seguridad.rol");
    res.json(rows);
};

export const getRolById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM seguridad.rol WHERE cod_rol = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.json(rows[0]);
};

export const postRol = async (req, res) => {
    const { nom_rol, des_rol, est_rol } = req.body;
    const { rows } = await Pool.query(
        "INSERT INTO seguridad.rol (nom_rol, des_rol, est_rol) VALUES ($1, $2, $3) RETURNING *",
        [nom_rol, des_rol, est_rol]
    );
    res.status(201).json(rows[0]);
};

export const putRol = async (req, res) => {
    const { id } = req.params;
    const { nom_rol, des_rol, est_rol } = req.body;
    const { rows } = await Pool.query(
        "UPDATE seguridad.rol SET nom_rol = $1, des_rol = $2, est_rol = $3 WHERE cod_rol = $4 RETURNING *",
        [nom_rol, des_rol, est_rol, id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.json(rows[0]);
};

export const deleteRol = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await Pool.query("DELETE FROM seguridad.rol WHERE cod_rol = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.sendStatus(204);
};