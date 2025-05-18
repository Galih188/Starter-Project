/**
 * Repository untuk mengelola data cerita di IndexedDB
 * dan sinkronisasi dengan API
 */

import IndexedDBHelper from "./idb-helper.js";
import { postStory } from "./api.js";
import { convertBase64ToFile } from "../utils/index.js";

export default class StoryIDBRepository {
  /**
   * Mendapatkan semua cerita dari IndexedDB
   * @returns {Promise<Array>} Daftar cerita
   */
  static async getAllStories() {
    try {
      const stories = await IndexedDBHelper.getAllStories();
      // Urutkan cerita dari yang terbaru
      return stories.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error("Failed to get stories from IndexedDB", error);
      return [];
    }
  }

  /**
   * Menyimpan cerita dari API ke IndexedDB
   * @param {Array} stories - Daftar cerita dari API
   */
  static async saveStoriesFromAPI(stories) {
    try {
      // Tambahkan status synced ke setiap cerita dari API
      const storiesWithStatus = stories.map((story) => ({
        ...story,
        syncStatus: "synced",
      }));

      // Simpan setiap cerita
      for (const story of storiesWithStatus) {
        await IndexedDBHelper.saveStory(story);
      }

      return true;
    } catch (error) {
      console.error("Failed to save stories to IndexedDB", error);
      return false;
    }
  }

  /**
   * Menyimpan cerita baru ke IndexedDB
   * @param {Object} storyData - Data cerita yang ingin disimpan
   * @returns {Promise<Object>} Cerita yang tersimpan
   */
  static async saveStory(storyData) {
    try {
      // Siapkan data cerita untuk disimpan offline
      const timestamp = new Date().toISOString();
      const story = {
        ...storyData,
        id: `local-${Date.now()}`,
        name: localStorage.getItem("username") || "Anonymous User",
        createdAt: timestamp,
        syncStatus: "pending",
      };

      // Simpan ke IndexedDB
      const savedStory = await IndexedDBHelper.saveStory(story);
      return savedStory;
    } catch (error) {
      console.error("Failed to save story to IndexedDB", error);
      throw error;
    }
  }

  /**
   * Menghapus cerita dari IndexedDB
   * @param {string} id - ID cerita
   * @returns {Promise<boolean>} - true jika berhasil dihapus
   */
  static async deleteStory(id) {
    try {
      return await IndexedDBHelper.deleteStory(id);
    } catch (error) {
      console.error("Failed to delete story from IndexedDB", error);
      return false;
    }
  }

  /**
   * Mengecek apakah ada cerita yang perlu disinkronkan
   * @returns {Promise<boolean>} Ada/tidaknya cerita yang perlu disinkronkan
   */
  static async hasUnsyncedStories() {
    try {
      const pendingStories = await IndexedDBHelper.getStoriesByStatus(
        "pending"
      );
      return pendingStories.length > 0;
    } catch (error) {
      console.error("Failed to check unsynced stories", error);
      return false;
    }
  }

  /**
   * Sinkronisasi cerita yang masih dalam status pending ke server
   * @returns {Promise<Object>} - Hasil sinkronisasi
   */
  static async syncPendingStories() {
    try {
      const pendingStories = await IndexedDBHelper.getStoriesByStatus(
        "pending"
      );

      if (pendingStories.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      let syncedCount = 0;
      let failedCount = 0;

      for (const story of pendingStories) {
        try {
          // Convert base64 photo data to File object
          const photoFile = await convertBase64ToFile(
            story.photoUrl || story.photo,
            "photo.jpg"
          );

          // Upload ke server
          await postStory({
            description: story.description,
            photo: photoFile,
            lat: story.lat,
            lon: story.lon,
          });

          // Update status cerita menjadi synced
          await IndexedDBHelper.updateStorySyncStatus(story.id, "synced");
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync story ID ${story.id}:`, error);
          await IndexedDBHelper.updateStorySyncStatus(story.id, "failed");
          failedCount++;
        }
      }

      return {
        success: true,
        synced: syncedCount,
        failed: failedCount,
      };
    } catch (error) {
      console.error("Failed to sync pending stories", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mendapatkan detail cerita berdasarkan ID dari IndexedDB
   * @param {string} id - ID cerita
   * @returns {Promise<Object|null>} Detail cerita
   */
  static async getStoryById(id) {
    try {
      return await IndexedDBHelper.getStoryById(id);
    } catch (error) {
      console.error("Failed to get story from IndexedDB", error);
      return null;
    }
  }

  /**
   * Mencoba kembali sinkronisasi cerita yang gagal
   * @param {string} id - ID cerita
   * @returns {Promise<boolean>} Berhasil atau tidak
   */
  static async retryFailedSync(id) {
    try {
      const story = await IndexedDBHelper.getStoryById(id);

      if (!story || story.syncStatus !== "failed") {
        return false;
      }

      // Update status menjadi pending untuk disinkronkan lagi
      await IndexedDBHelper.updateStorySyncStatus(id, "pending");
      return true;
    } catch (error) {
      console.error("Failed to retry sync for story", error);
      return false;
    }
  }
}
