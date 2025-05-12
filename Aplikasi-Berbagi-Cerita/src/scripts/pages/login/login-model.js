import CONFIG from "../../config.js";

class LoginModel {
  async login(credentials) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      const result = await response.json();

      if (!result.error) {
        // Store token
        localStorage.setItem("token", result.loginResult.token);
        return { success: true, message: "Login berhasil!" };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Terjadi kesalahan saat login" };
    }
  }
}

export default LoginModel;
