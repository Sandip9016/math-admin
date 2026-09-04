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
