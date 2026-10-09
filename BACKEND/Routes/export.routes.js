import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import {
  getExportCatalog,
  previewDataset,
  downloadDataset,
  downloadCompleteExport,
} from "../Controllers/export.controller.js";

const router = express.Router();


router.use(authMiddleware, authorizeRoles("Admin"));


router.get("/", getExportCatalog);

router.get("/all/download", downloadCompleteExport);

router.get("/:dataset/preview", previewDataset);


router.get("/:dataset/download", downloadDataset);

export default router;
