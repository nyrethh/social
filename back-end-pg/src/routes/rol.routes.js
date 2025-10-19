import { Router } from "express";

import {
    getRoles,
    getRolById,
    postRol,
    putRol,
    deleteRol
} from "../controllers/rol.controllers.js";

const router = Router();

router.get("/", getRoles);
router.get("/:id", getRolById);
router.post("/", postRol);
router.put("/:id", putRol);
router.delete("/:id", deleteRol);

export default router;
