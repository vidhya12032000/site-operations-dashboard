import { Router } from "express";
import {
  getSites,
  createSite,
  getSiteById,
  updateSite,
  deleteSite
} from "../controllers/site.controller";

const router = Router();

router.get("/", getSites);
router.post("/", createSite);
router.get("/:id", getSiteById);
router.put("/:id", updateSite);
router.delete("/:id", deleteSite);

export default router;