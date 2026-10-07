import { Router } from "express";
import {
  getInstallations,
  createInstallation,
  getInstallationById,
  updateInstallation,
  deleteInstallation,
} from "../controllers/installation.controller";

const router = Router();

router.get("/", getInstallations);
router.post("/", createInstallation);
router.get("/:id", getInstallationById);
router.put("/:id", updateInstallation);
router.delete("/:id", deleteInstallation);

export default router;