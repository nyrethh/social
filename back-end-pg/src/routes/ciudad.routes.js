import { Router } from "express";

import {
    getCiudades,
    getCiudadById,
    getCiudadesByEstado,
    
    postCiudad,
    putCiudad,
    deleteCiudad
} from "../controllers/ciudad.controllers.js";

const router = Router();

router.get("/", getCiudades);
router.get("/:id", getCiudadById);
router.post("/", postCiudad);
router.put("/:id", putCiudad);
router.delete("/:id", deleteCiudad);
router.get("/estado/:id", getCiudadesByEstado);

export default router;
