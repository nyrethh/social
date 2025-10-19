import { Router } from "express";
import {
    getEstados,
    getEstadoById,
    getEstadosByPais,
    postEstado,
    putEstado,
    deleteEstado
} from '../controllers/estado.controllers.js';

const router = Router();

router.get("/", getEstados);
router.get("/:id", getEstadoById);
router.get("/pais/:id", getEstadosByPais); // Nueva ruta para filtrar por país
router.post("/", postEstado);
router.put("/:id", putEstado);
router.delete("/:id", deleteEstado);

export default router;
