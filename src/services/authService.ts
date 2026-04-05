import axiosInstance from "../services/axiosInstance";

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post("/v1/admin/auth/login", { email, password });
      
      console.log("AuthService - Full response:", response);
      console.log("AuthService - Response data:", response.data);
      
      const responseData = response.data;
      const payload = responseData?.data ?? responseData;

      let accessToken = null;
      let userData = null;
      
      if (payload?.accessToken) {
        accessToken = payload.accessToken;
        userData = payload.user;
        console.log("Token found at payload.accessToken");
      } else if (payload?.token) {
        accessToken = payload.token;
        userData = payload.user;
        console.log("Token found at payload.token");
      } else if (payload?.access_token) {
        accessToken = payload.access_token;
        userData = payload.user;
        console.log("Token found at payload.access_token");
      } else {
        console.error("No token found in response. Available keys:", Object.keys(payload ?? {}));
        throw new Error("Invalid server response: Token not found");
      }
      
      if (!accessToken) {
        throw new Error("Token is null or undefined");
      }
      
      localStorage.setItem("accessToken", accessToken);
      const finalUserData = userData || { 
        email: email, 
        name: payload?.name || payload?.user?.name || email.split('@')[0] 
      };
      localStorage.setItem("user", JSON.stringify(finalUserData));
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log("AuthService - Token saved successfully:", accessToken.substring(0, 30) + "...");
      
      return {
        accessToken,
        user: finalUserData,
        ...responseData,
        data: payload,
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
    const accessToken = localStorage.getItem("accessToken");
    console.log("isAuthenticated - Token exists:", !!accessToken);
    
    return Boolean(accessToken);
  },

  logout() {
    console.log("Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  initAuth() {
    const accessToken = localStorage.getItem("accessToken");
    console.log("initAuth - Token found:", !!accessToken);
    
    if (accessToken && this.isAuthenticated()) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      console.log("initAuth - Auth header set");
      return true;
    }
    
    console.log("initAuth - No valid token");
    return false;
  }
};

authService.initAuth();
