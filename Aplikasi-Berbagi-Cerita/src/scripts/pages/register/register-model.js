import CONFIG from "../../config.js";

class RegisterModel {
  async register(userData) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();

      if (!result.error) {
        return { success: true, message: "Registrasi berhasil! Silakan login." };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Gagal daftar" };
    }
  }
}

export default RegisterModel;
