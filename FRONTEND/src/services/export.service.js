import api from "./api.service";


export const exportService = {

  async getCatalog() {
    const res = await api.get("/api/admin/exports");
    return res.data;
  },

  
  async getPreview(datasetKey, page = 1, limit = 20) {
    const res = await api.get(`/api/admin/exports/${datasetKey}/preview`, {
      params: { page, limit },
    });
    return res.data;
  },

  
  async downloadDataset(datasetKey) {
    const res = await api.get(`/api/admin/exports/${datasetKey}/download`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `lms-${datasetKey}-${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

 
  async downloadCompleteExport() {
    const res = await api.get("/api/admin/exports/all/download", {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `lms-full-export-${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default exportService;
