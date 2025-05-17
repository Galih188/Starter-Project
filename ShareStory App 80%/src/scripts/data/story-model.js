import CONFIG from "../config";
import { getToken } from "../utils";

class StoryModel {
  async getStories() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengambil cerita.");
      }

      const { listStory } = await response.json();

      return listStory;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  }

  async getStoryById(id) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengambil detail cerita.");
      }

      const { story } = await response.json();
      return story;
    } catch (error) {
      console.error("Error fetching story by id:", error);
      throw error;
    }
  }

  async postStory({ description, photo, lat, lon }) {
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);

      if (lat && lon) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    } catch (error) {
      console.error("Error posting story:", error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  }
}

export default StoryModel;
