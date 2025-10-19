import { Router } from "express";

import {
    getSeguridades,
    getSeguridadById,
    postSeguridad,
    putSeguridad,
    deleteSeguridad,
    loginSeguridad
} from "../controllers/seguridad.controllers.js";

const router = Router();

router.get("/", getSeguridades);
router.get("/:id", getSeguridadById);
router.post("/", postSeguridad);
router.put("/:id", putSeguridad);
router.delete("/:id", deleteSeguridad);
router.post('/login', loginSeguridad);

export default router;
