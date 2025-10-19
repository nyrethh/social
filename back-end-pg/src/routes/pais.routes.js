import { Router } from "express";

import { 
    getPaises,
    getPaisById,
    postPais,
    putPais,
    deletePais
} from "../controllers/pais.controllers.js";

const router = Router();

router.get("/", getPaises);
router.get("/:id", getPaisById);
router.post("/", postPais);
router.put("/:id", putPais);
router.delete("/:id", deletePais);

export default router;  