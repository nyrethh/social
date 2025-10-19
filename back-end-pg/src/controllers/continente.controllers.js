/* tabla: continente de esquema: ubicacion
cod_con: serial (Llave Primaria)

nom_con: character varying(100)

des_con: character varying(100)

est_con: char(1) */



import {Pool} from "../db.js";

export const getContinentes = async (req, res) => {
   const { rows } = await Pool.query("SELECT * FROM ubicacion.continente");
   res.json(rows);
};

export const getContinenteById = async (req, res) => {
   const { id } = req.params;
   const { rows } = await Pool.query("SELECT * FROM ubicacion.continente WHERE cod_con = $1", [id]);
   if (rows.length === 0) {
       return res.status(404).json({ error: "Continente no encontrado" });
   }
   res.json(rows[0]);
};

export const postContinente = async (req, res) => {
   const { nom_con, des_con, est_con } = req.body;
   const { rows } = await Pool.query(
       "INSERT INTO ubicacion.continente (nom_con, des_con, est_con) VALUES ($1, $2, $3) RETURNING *",
       [nom_con, des_con, est_con]
   );
   res.status(201).json(rows[0]);
};

export const putContinente = async (req, res) => {
   const { id } = req.params;
   const { nom_con, des_con, est_con } = req.body;
   const { rows } = await Pool.query(
       "UPDATE ubicacion.continente SET nom_con = $1, des_con = $2, est_con = $3 WHERE cod_con = $4 RETURNING *",
       [nom_con, des_con, est_con, id]
   );
   if (rows.length === 0) {
       return res.status(404).json({ error: "Continente no encontrado" });
   }
   res.json(rows[0]);
};

export const deleteContinente = async (req, res) => {
   const { id } = req.params;
   const { rowCount } = await Pool.query("DELETE FROM ubicacion.continente WHERE cod_con = $1", [id]);
   if (rowCount === 0) {
       return res.status(404).json({ error: "Continente no encontrado" });
   }
   res.sendStatus(204);
};