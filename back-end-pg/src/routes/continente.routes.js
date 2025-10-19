import {Router} from "express";
import {
    getContinentes,
    getContinenteById,
    postContinente,
    putContinente,
    deleteContinente
} from '../controllers/continente.controllers.js';

const router = Router();

router.get("/", getContinentes);
router.get("/:id", getContinenteById);
router.post("/", postContinente);
router.put("/:id", putContinente);
router.delete("/:id", deleteContinente);

export default router;