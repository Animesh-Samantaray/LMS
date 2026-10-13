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


// get export catalog
router.get("/", getExportCatalog);

// download complete export
router.get("/all/download", downloadCompleteExport);

// preview dataset
router.get("/:dataset/preview", previewDataset);


// download dataset
router.get("/:dataset/download", downloadDataset);

export default router;
