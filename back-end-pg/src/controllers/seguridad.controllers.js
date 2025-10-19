// Controlador para `seguridad`.
// Implementación mínima del endpoint de login que consulta la tabla `seguridad.usuario`.
import { Pool } from "../db.js";

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
// Nota: en producción debes usar hashing (bcrypt) y HTTPS.
export const loginSeguridad = async (req, res) => {
    const { ali_usu, cla_usu } = req.body;
    if (!ali_usu || !cla_usu) {
        return res.status(400).json({ message: 'Alias/email y clave son requeridos.' });
    }

    try {
        const { rows } = await Pool.query(
            `SELECT cod_usu, ali_usu, ema_usu
             FROM seguridad.usuario
             WHERE (ali_usu = $1 OR ema_usu = $1) AND cla_usu = $2`,
            [ali_usu, cla_usu]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0];
        const isAdmin = user.ali_usu && user.ali_usu.toLowerCase() === 'admin';
    const rolNombre = isAdmin ? 'Administrador' : 'Usuario';

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
                cod_usu: user.cod_usu,
                ali_usu: user.ali_usu,
                ema_usu: user.ema_usu,
                rol_nombre: rolNombre
            }
        });

    } catch (error) {
        console.error('Error en loginSeguridad:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
