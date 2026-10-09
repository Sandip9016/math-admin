export const TOKEN_KEY = "adminToken";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

// Call from axios response interceptors.
// 401/403 on a protected route -> clear token, back to login.
// Login call itself is skipped: wrong password = 401, must stay on form.
export const handleAuthError = (error) => {
  const status = error?.response?.status;
  const url = error?.config?.url || "";
  const isLoginCall = url.includes("/admin/auth/login");

  if ((status === 401 || status === 403) && !isLoginCall) {
    clearSession();
    sessionStorage.setItem(
      "adminLogoutReason",
      error.response?.data?.code === "TOKEN_EXPIRED"
        ? "Your session expired. Please log in again."
        : "Please log in again."
    );
    if (window.location.pathname !== "/signin") {
      window.location.href = "/signin";
    }
  }
};
