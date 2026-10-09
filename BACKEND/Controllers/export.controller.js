import {
  DATASET_REGISTRY,
  getExportCatalogList,
  getDatasetPreview,
  getFullDatasetExport,
  getCompletePlatformExport,
} from "../Services/export.service.js";


export const getExportCatalog = async (req, res) => {
  try {
    const datasets = await getExportCatalogList();
    return res.status(200).json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    console.error("Get Export Catalog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve export catalog",
    });
  }
};


export const previewDataset = async (req, res) => {
  try {
    const { dataset } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!DATASET_REGISTRY[dataset]) {
      return res.status(404).json({
        success: false,
        message: `Dataset '${dataset}' not found or not eligible for export`,
      });
    }

    const preview = await getDatasetPreview(dataset, page, limit);

    return res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    console.error(`Preview Dataset '${req.params.dataset}' Error:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dataset preview",
    });
  }
};


export const downloadDataset = async (req, res) => {
  try {
    const { dataset } = req.params;

    if (!DATASET_REGISTRY[dataset]) {
      return res.status(404).json({
        success: false,
        message: `Dataset '${dataset}' not found or not eligible for export`,
      });
    }

    const exportData = await getFullDatasetExport(dataset);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `lms-${dataset}-${dateStr}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error(`Download Dataset '${req.params.dataset}' Error:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate dataset download",
    });
  }
};


export const downloadCompleteExport = async (req, res) => {
  try {
    const fullExport = await getCompletePlatformExport();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `lms-full-export-${dateStr}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(JSON.stringify(fullExport, null, 2));
  } catch (error) {
    console.error("Full Platform Export Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate full platform export",
    });
  }
};
