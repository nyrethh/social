/* 
Tabla: seguridad.usuario
cod_usu
ali_usu
ema_usu
cla_usu
est_usu */

import { Pool } from "../db.js";

export const getUsuarios = async (req, res) => {
    const { rows } = await Pool.query("SELECT * FROM seguridad.usuario");
    res.json(rows);
};

export const getUsuarioById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await Pool.query("SELECT * FROM seguridad.usuario WHERE cod_usu = $1", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    } 
    res.json(rows[0]);
};

export const postUsuario = async (req, res) => {
    const { ali_usu, ema_usu, cla_usu, est_usu } = req.body;
    try {
        // Buscar el id del rol 'Usuario' (case-insensitive)
        const rolRes = await Pool.query(
            "SELECT cod_rol FROM seguridad.rol WHERE LOWER(nom_rol) = 'usuario' AND est_rol = 'A' LIMIT 1"
        );
        if (rolRes.rows.length === 0) {
            return res.status(500).json({ message: "No se encontró el rol 'Usuario' activo en la base de datos." });
        }
        const fky_rol = rolRes.rows[0].cod_rol;
        // Insertar usuario con fky_rol
        const { rows } = await Pool.query(
            "INSERT INTO seguridad.usuario (ali_usu, ema_usu, cla_usu, est_usu, fky_rol) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [ali_usu, ema_usu, cla_usu, est_usu, fky_rol]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al registrar usuario con rol:', error);
        res.status(500).json({ message: 'Error interno al registrar usuario.' });
    }
};

/* export const putUsuario = async (req, res) => {
    const { id } = req.params;
    const { ali_usu, ema_usu, cla_usu, est_usu } = req.body;
    const { rows } = await Pool.query(
        "UPDATE seguridad.usuario SET ali_usu = $1, ema_usu = $2, cla_usu = $3, est_usu = $4 WHERE cod_usu = $5 RETURNING *",
        [ali_usu, ema_usu, cla_usu, est_usu, id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
};
 */

/* editar usuario pero consevando la contrañsea */
export const putUsuario = async (req, res) => {
    const { id } = req.params;
    const { ali_usu, ema_usu, cla_usu, est_usu } = req.body;

    let query;
    let params;

    // Verificamos si el usuario envió una nueva contraseña en la petición
    if (cla_usu) {
        // Si SÍ hay contraseña nueva, la consulta la incluye
        query = 'UPDATE seguridad.usuario SET ali_usu = $1, ema_usu = $2, est_usu = $3, cla_usu = $4 WHERE cod_usu = $5 RETURNING *';
        params = [ali_usu, ema_usu, est_usu, cla_usu, id];
    } else {
        // Si NO hay contraseña nueva, la consulta la omite para no sobreescribirla
        query = 'UPDATE seguridad.usuario SET ali_usu = $1, ema_usu = $2, est_usu = $3 WHERE cod_usu = $4 RETURNING *';
        params = [ali_usu, ema_usu, est_usu, id];
    }

    const { rows } = await Pool.query(query, params);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
};

/* export const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await Pool.query("DELETE FROM seguridad.usuario WHERE cod_usu = $1", [id]);
    if (rowCount === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.sendStatus(204);
};



 */


export const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await Pool.query(
            "DELETE FROM seguridad.usuario WHERE cod_usu = $1", [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        return res.sendStatus(204);

    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({
                message: "No se puede eliminar este usuario porque tiene otros registros asociados (como un rol de fan)."
            });
        }

        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// Login - Autenticación de Usuario
export const loginUsuario = async (req, res) => {
    const { ali_usu, cla_usu } = req.body; // alias/email y clave
    if (!ali_usu || !cla_usu) {
        return res.status(400).json({ message: 'Alias o Clave son requeridos.' });
    }


    try {
        const result = await pool.query(
            `SELECT
                cod_usu, ali_usu, ema_usu
            FROM seguridad.usuario
            WHERE (ali_usu = $1 OR ema_usu = $1) 
            AND cla_usu = $2`, // **¡Advertencia de Seguridad! Usar HASH (bcrypt) en producción.**
            [ali_usu, cla_usu]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];
        
        // --- Lógica de Asignación de Rol de Administrador para el Front-end (Temporal) ---
        const isAdmin = user.ali_usu.toLowerCase() === 'admin' || user.ema_usu.toLowerCase() === 'admin@teeker.com';
    const rolNombre = isAdmin ? 'Administrador' : 'Usuario';
        // ----------------------------------------------------------------------------------

        return res.status(200).json({ 
            message: 'Inicio de sesión exitoso',
            user: {
                cod_usu: user.cod_usu,
                ali_usu: user.ali_usu,
                ema_usu: user.ema_usu,
                rol_nombre: rolNombre // Rol simulado para la navegación del Front-end
            }
        });

    } catch (error) {
        console.error('Error de login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};