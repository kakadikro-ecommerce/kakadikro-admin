// src/services/authService.js
import axiosInstance from "../services/axiosInstance";

export const authService = {
  /**
   * Main Login Function
   */
  async login(email: string, password: any) {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const data = response.data;

      // Extract token from various possible backend structures
      let token = data.token || data.data?.token || data.accessToken || data.access_token;
      let userData = data.user || data.data?.user;

      if (!token) {
        throw new Error("Invalid server response: Token not found");
      }

      // Persist Session
      localStorage.setItem("token", token);

      // Prepare and save user data (fallback to email if name is missing)
      const finalUserData = userData || {
        email: email,
        name: data.name || data.user?.name || email.split('@')[0],
      };
      localStorage.setItem("user", JSON.stringify(finalUserData));

      // Set Global Axios Header for all future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { token, user: finalUserData };
    } catch (error) {
      console.error("AuthService Error:", error);
      throw error;
    }
  },

  /**
   * Validation Logic
   */
  isAuthenticated() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();

      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  initAuth() {
    const token = localStorage.getItem("token");
    if (token && this.isAuthenticated()) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  }
};

// Initialize headers immediately on app load
authService.initAuth();