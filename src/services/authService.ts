const API_BASE_URL = "http://192.168.1.14:5000/api";

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
  
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
};