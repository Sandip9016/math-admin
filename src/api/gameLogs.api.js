import api from "./axiosInstance";

/**
 * Paginated list of PvP + Computer game logs.
 * @param {Object} params - { page, limit, skip, type, playerId }
 */
export const getGameLogs = (params = {}) => {
  return api.get("/admin/game-logs", { params });
};

/**
 * Full question-by-question detail of a single game.
 * @param {"pvp"|"computer"} type
 * @param {string} validateId
 */
export const getGameLogDetail = (type, validateId) => {
  return api.get(`/admin/game-logs/${type}/${validateId}`);
};

/**
 * Build the server download URL for a game log.
 * @param {string} playerId
 * @param {"pvp"|"computer"} type
 * @param {string} validateId
 */
export const getGameLogDownloadUrl = (playerId, type, validateId) => {
  const baseUrl =
    import.meta.env.VITE_API_URL || "http://43.204.228.107:3000/api";
  return `${baseUrl}/gameValidation/${encodeURIComponent(
    playerId
  )}/download/${encodeURIComponent(type)}/${encodeURIComponent(validateId)}`;
};
