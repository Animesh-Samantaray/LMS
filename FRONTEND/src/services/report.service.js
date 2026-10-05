import api from './api.service';

class ReportService {
  /**
   * Submit a new report/issue
   * @param {FormData} formData - Contains type, name, description, courseId (optional), file (optional)
   */
  async createReport(formData) {
    try {
      const response = await api.post('/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  }

  /**
   * Get all reports for the current user
   */
  async getMyReports() {
    try {
      const response = await api.get('/api/reports/my');
      return response.data;
    } catch (error) {
      console.error('Fetch my reports error:', error);
      throw error;
    }
  }

  /**
   * Get all reports (Admin only)
   */
  async getAllReportsAdmin() {
    try {
      const response = await api.get('/api/reports/admin/all');
      return response.data;
    } catch (error) {
      console.error('Fetch all reports admin error:', error);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   * @param {string} reportId 
   */
  async getReportDetails(reportId) {
    try {
      const response = await api.get(`/api/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch report details error:', error);
      throw error;
    }
  }

  /**
   * Update report status (Admin only)
   * @param {string} reportId 
   * @param {string} status - Open, In Review, Resolved, Rejected
   */
  async updateReportStatus(reportId, status) {
    try {
      const response = await api.patch(`/api/reports/${reportId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update report status error:', error);
      throw error;
    }
  }

  /**
   * Add a reply to a report (Admin only)
   * @param {string} reportId 
   * @param {string} reply 
   */
  async replyToReport(reportId, reply) {
    try {
      const response = await api.patch(`/api/reports/${reportId}/reply`, { reply });
      return response.data;
    } catch (error) {
      console.error('Reply to report error:', error);
      throw error;
    }
  }
}

const reportService = new ReportService();
export default reportService;
