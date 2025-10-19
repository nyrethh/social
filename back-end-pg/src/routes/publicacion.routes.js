import { Router } from "express";
import { postPublicacion, getPublicacionesPorPersona } from "../controllers/publicacion.controllers.js";

const router = Router();

// Esta ruta POST / maneja las peticiones a /api/publicaciones
router.post("/", postPublicacion);

// Esta ruta GET maneja las peticiones a /api/publicaciones/persona/:id
router.get("/persona/:id", getPublicacionesPorPersona);

export default router;