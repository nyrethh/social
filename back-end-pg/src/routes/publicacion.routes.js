import { Router } from "express";
import { getPublicaciones, postPublicacion, getPublicacionesPorPersona, deletePublicacion } from "../controllers/publicacion.controllers.js";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas protegidas para administradores
router.get("/", [authenticateToken, isAdmin], getPublicaciones);
router.delete("/:id", [authenticateToken, isAdmin], deletePublicacion);

// Rutas para usuarios autenticados
router.post("/", authenticateToken, postPublicacion);

// Rutas públicas
router.get("/persona/:id", getPublicacionesPorPersona);

export default router;