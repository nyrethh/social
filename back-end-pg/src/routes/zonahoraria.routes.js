import { Router } from "express";
import {   
    getZonasHorarias,
    getZonaHorariaById,
    postZonaHoraria,
    putZonaHoraria,
    deleteZonaHoraria
} from "../controllers/zonahoraria.controllers.js";

    const router = Router();

    router.get("/", getZonasHorarias);
    router.get("/:id", getZonaHorariaById);
    router.post("/", postZonaHoraria);
    router.put("/:id", putZonaHoraria);
    router.delete("/:id", deleteZonaHoraria);

    export default router;