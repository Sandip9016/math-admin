import api from "./questionAxiosInstance";

// ============================================
// Question List / Search
// ============================================

/**
 * Get paginated / filtered question list
 * @param {Object} params - { page, limit, search, difficulty, finalLevel, symbol, status }
 * status: enabled | disabled | deleted | all (omit = enabled + disabled)
 */
export const getQuestions = (params = {}) => {
  return api.get("/admin/questions", { params });
};

/**
 * Get single question by id
 */
export const getQuestionById = (id) => {
  return api.get(`/admin/questions/${id}`);
};

// ============================================
// Add / Edit / Delete
// ============================================

/**
 * Create a new question
 */
export const createQuestion = (payload) => {
  return api.post("/admin/questions", payload);
};

/**
 * Update a question (partial or full body supported)
 */
export const updateQuestion = (id, payload) => {
  return api.put(`/admin/questions/${id}`, payload);
};

/**
 * Delete a question (status -> deleted, also disabled)
 */
export const deleteQuestion = (id) => {
  return api.delete(`/admin/questions/${id}`);
};

/**
 * Restore a deleted question (comes back as disabled)
 */
export const restoreQuestion = (id) => {
  return api.post(`/admin/questions/${id}/restore`);
};

/**
 * Enable a question (live in games). 400 if finalLevel is 0, 409 if deleted.
 */
export const enableQuestion = (id) => {
  return api.post(`/admin/questions/${id}/enable`);
};

/**
 * Disable a question (out of games). 409 if deleted.
 */
export const disableQuestion = (id) => {
  return api.post(`/admin/questions/${id}/disable`);
};

// ============================================
// Per-question Analytics
// ============================================

export const getQuestionAnalytics = (id) => {
  return api.get(`/admin/questions/${id}/analytics`);
};

// ============================================
// Import / Export
// ============================================

/**
 * Import questions from an Excel file (.xlsx / .xls)
 */
export const importQuestions = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // Do not set Content-Type: the browser adds it with the multipart boundary.
  return api.post("/admin/questions/import", formData);
};

/**
 * Export questions to Excel — returns a Blob (binary file), not JSON.
 */
export const exportQuestions = () => {
  return api.get("/admin/questions/export", { responseType: "blob" });
};

/**
 * Trigger a browser download of the exported Excel file.
 */
export const downloadQuestionsExport = async () => {
  const blob = await exportQuestions();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `question_analytics_export_${timestamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};