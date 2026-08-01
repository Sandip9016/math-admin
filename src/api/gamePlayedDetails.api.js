import api from "./axiosInstance";

/**
 * 6x3 matrix (diffCode x timer) of normally-completed PvP games.
 */
export const getPvpGamePlayedDetails = () => {
  return api.get("/admin/game-played-details/pvp");
};

/**
 * 6x3 matrix (diffCode x timer) of normally-completed Computer games.
 */
export const getComputerGamePlayedDetails = () => {
  return api.get("/admin/game-played-details/computer");
};
