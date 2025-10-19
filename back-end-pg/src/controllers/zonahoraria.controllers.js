/* zona_horaria
Almacena las diferentes zonas horarias con su diferencia respecto al meridiano de Greenwich.

cod_zon: serial (Llave Primaria)

nom_zon: character varying(50)

acr_zon: character varying(50)

dif_zon: double precision

est_zon: */


import { Pool } from "../db.js";    

export const getZonasHorarias = async (req, res) => {
    const { rows } = await Pool.query("SELECT * FROM ubicacion.zona_horaria");
    res.json(rows);
};

export const getZonaHorariaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM ubicacion.zona_horaria WHERE cod_zon = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Zona horaria no encontrada" });
    }
    res.json(rows[0]);
};

export const postZonaHoraria = async (req, res) => {
    const { nom_zon, acr_zon, dif_zon, est_zon } = req.body;
    const { rows } = await Pool.query(
        "INSERT INTO ubicacion.zona_horaria (nom_zon, acr_zon, dif_zon, est_zon) VALUES ($1, $2, $3, $4) RETURNING *",
        [nom_zon, acr_zon, dif_zon, est_zon]
    );
    res.status(201).json(rows[0]);
};

export const putZonaHoraria = async (req, res) => {
    const { id } = req.params;
    const { nom_zon, acr_zon, dif_zon, est_zon } = req.body;
    const { rows } = await Pool.query(
        "UPDATE ubicacion.zona_horaria SET nom_zon = $1, acr_zon = $2, dif_zon = $3, est_zon = $4 WHERE cod_zon = $5 RETURNING *",
        [nom_zon, acr_zon, dif_zon, est_zon, id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Zona horaria no encontrada" });
    }
    res.json(rows[0]);
};

export const deleteZonaHoraria = async (req, res) => {
    const { id } = req.params;

    const { rowCount } = await Pool.query("DELETE FROM ubicacion.zona_horaria WHERE cod_zon = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ error: "Zona horaria no encontrada" });
    }
    res.sendStatus(204);
};