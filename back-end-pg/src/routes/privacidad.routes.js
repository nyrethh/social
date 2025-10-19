import { Router } from "express";

import {
    getPrivacidades,
    getPrivacidadById,
    postPrivacidad,
    putPrivacidad,
    deletePrivacidad
} from "../controllers/privacidad.controllers.js";

const router = Router();

router.get("/", getPrivacidades);
router.get("/:id", getPrivacidadById);
router.post("/", postPrivacidad);
router.put("/:id", putPrivacidad);
router.delete("/:id", deletePrivacidad);

export default router;
