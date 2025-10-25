// Controlador para `seguridad`.
// Implementación mínima del endpoint de login que consulta la tabla `seguridad.usuario`.
import { Pool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// TODO: Mover a variables de entorno
const JWT_SECRET = "your_jwt_secret";

export const getSeguridades = async (req, res) => {
    // TODO: si hay una tabla concreta, reemplazar la consulta
    try {
        const { rows } = await Pool.query("SELECT * FROM seguridad.usuario ORDER BY cod_usu");
        res.json(rows);
    } catch (error) {
        console.error('Error en getSeguridades:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getSeguridadById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await Pool.query("SELECT * FROM seguridad.usuario WHERE cod_usu = $1", [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error en getSeguridadById:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const postSeguridad = async (req, res) => {
    // Inserción genérica: adaptar a la estructura real
    res.status(501).json({ message: 'postSeguridad no implementado aún.' });
};

export const putSeguridad = async (req, res) => {
    const { id } = req.params;
    res.status(501).json({ message: `putSeguridad no implementado aún. id=${id}` });
};

export const deleteSeguridad = async (req, res) => {
    const { id } = req.params;
    res.status(501).json({ message: `deleteSeguridad no implementado aún. id=${id}` });
};

// POST /api/seguridad/login
// Body: { ali_usu: string (alias o email), cla_usu: string }
export const loginSeguridad = async (req, res) => {
    const { ali_usu, cla_usu } = req.body;
    if (!ali_usu || !cla_usu) {
        return res.status(400).json({ message: 'Alias/email y clave son requeridos.' });
    }

    try {
        const { rows } = await Pool.query(
            `SELECT u.cod_usu, u.ali_usu, u.ema_usu, u.cla_usu, r.nom_rol
             FROM seguridad.usuario u
             JOIN seguridad.rol r ON u.fky_rol = r.cod_rol
             WHERE (u.ali_usu = $1 OR u.ema_usu = $1)`,
            [ali_usu]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0];

        const isMatch = cla_usu === user.cla_usu;

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
                cod_usu: user.cod_usu,
                ali_usu: user.ali_usu,
                ema_usu: user.ema_usu,
                nom_rol: user.nom_rol
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            user: {
                cod_usu: user.cod_usu,
                ali_usu: user.ali_usu,
                ema_usu: user.ema_usu,
                nom_rol: user.nom_rol
            }
        });

    } catch (error) {
        console.error('Error en loginSeguridad:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
