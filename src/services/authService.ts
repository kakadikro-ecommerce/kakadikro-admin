import axiosInstance from "../services/axiosInstance";

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      
      console.log("AuthService - Full response:", response);
      console.log("AuthService - Response data:", response.data);
      
      let token = null;
      let userData = null;
      
      if (response.data.token) {
        token = response.data.token;
        userData = response.data.user;
        console.log("Token found at response.data.token");
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
        userData = response.data.data.user;
        console.log("Token found at response.data.data.token");
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
        userData = response.data.user;
        console.log("Token found at response.data.accessToken");
      } else if (response.data.access_token) {
        token = response.data.access_token;
        userData = response.data.user;
        console.log("Token found at response.data.access_token");
      } else {
        console.error("No token found in response. Available keys:", Object.keys(response.data));
        throw new Error("Invalid server response: Token not found");
      }
      
      if (!token) {
        throw new Error("Token is null or undefined");
      }
      
      localStorage.setItem("token", token);
      const finalUserData = userData || { 
        email: email, 
        name: response.data.name || response.data.user?.name || email.split('@')[0] 
      };
      localStorage.setItem("user", JSON.stringify(finalUserData));
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log("AuthService - Token saved successfully:", token.substring(0, 30) + "...");
      
      return {
        token,
        user: finalUserData,
        ...response.data
      };
      
    } catch (error) {
      console.error("AuthService - Login error:", error);
      throw error;
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem("token");
    console.log("isAuthenticated - Token exists:", !!token);
    
    if (!token) {
      return false;
    }
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const isExpired = tokenData.exp && tokenData.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log("Token expired");
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking token:", error);
      return false;
    }
  },

  logout() {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  initAuth() {
    const token = localStorage.getItem("token");
    console.log("initAuth - Token found:", !!token);
    
    if (token && this.isAuthenticated()) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("initAuth - Auth header set");
      return true;
    }
    
    console.log("initAuth - No valid token");
    return false;
  }
};

authService.initAuth();