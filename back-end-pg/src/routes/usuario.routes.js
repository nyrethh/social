import { Router } from "express";
import { 
    getUsuarios,
    getUsuarioById,
    postUsuario,
    putUsuario,
    deleteUsuario,
    loginUsuario
} from "../controllers/usuario.controllers.js";

    const router = Router();

    router.get("/", getUsuarios);
    router.get("/:id", getUsuarioById);
    router.post("/", postUsuario);
    router.put("/:id", putUsuario);
    router.delete("/:id", deleteUsuario);

    router.post("/login", loginUsuario);
    export default router;