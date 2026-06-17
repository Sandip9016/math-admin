import { use } from "react";
import api from "./axiosInstance";



// Delete user by admin
export const deleteUserbyAdmin = (userId) => {
  return api.delete(`/auth/admin/delete-user/${userId}`);
};

// Get all users
export const getAllUsers = () => {
  return api.get("/auth/allUser"); // returns a promise with user data
};

export const blockUserByAdmin = (userId, reason) => {
  console.log(userId, reason);
  return api.put(
    `/admin/block-user`,
    { reason },  {params: { userId }, }
  );
};


export const unblockUserByAdmin = (userId) => {
  console.log(userId);

  return api.put(
    "/admin/unblock-user",
    {}, // no body
    { params: { userId } }
  );
};

