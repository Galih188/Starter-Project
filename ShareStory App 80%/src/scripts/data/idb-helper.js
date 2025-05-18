/**
 * IndexedDB Helper untuk aplikasi ShareStory
 * Mengimplementasikan kemampuan menyimpan, menampilkan, dan menghapus data cerita
 */

const DATABASE_NAME = "share-story-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

export default class IndexedDBHelper {
  static async openDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Buat object store jika belum ada
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          const objectStore = db.createObjectStore(OBJECT_STORE_NAME, {
            keyPath: "id",
          });

          // Buat index-index yang dibutuhkan
          objectStore.createIndex("name", "name", { unique: false });
          objectStore.createIndex("createdAt", "createdAt", { unique: false });
          objectStore.createIndex("syncStatus", "syncStatus", {
            unique: false,
          });
        }
      };
    });
  }

  /**
   * Menyimpan cerita ke IndexedDB
   * @param {Object} story - Objek cerita yang akan disimpan
   * @returns {Promise<Object>} - Objek cerita yang berhasil disimpan
   */
  static async saveStory(story) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      // Tambahkan syncStatus dan id lokal jika belum ada
      if (!story.id) {
        story.id = `local-${Date.now()}`;
      }

      if (!story.syncStatus) {
        story.syncStatus = "pending";
      }

      const request = store.put(story);

      request.onerror = (event) => {
        console.error("Error saving story to IndexedDB:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = () => {
        resolve(story);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Mengambil semua cerita dari IndexedDB
   * @returns {Promise<Array>} - Array dari objek cerita
   */
  static async getAllStories() {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onerror = (event) => {
        console.error(
          "Error getting stories from IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Mengambil cerita berdasarkan ID
   * @param {string} id - ID cerita
   * @returns {Promise<Object|null>} - Objek cerita atau null jika tidak ditemukan
   */
  static async getStoryById(id) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onerror = (event) => {
        console.error(
          "Error getting story from IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Memperbarui status sinkronisasi cerita
   * @param {string} id - ID cerita
   * @param {string} newStatus - Status sinkronisasi baru ('synced', 'pending', 'failed')
   * @returns {Promise<boolean>} - true jika berhasil diperbarui
   */
  static async updateStorySyncStatus(id, newStatus) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onerror = (event) => {
        console.error("Error getting story for update:", event.target.error);
        reject(event.target.error);
      };

      getRequest.onsuccess = (event) => {
        const story = event.target.result;
        if (!story) {
          resolve(false);
          return;
        }

        // Update sync status
        story.syncStatus = newStatus;

        const updateRequest = store.put(story);

        updateRequest.onerror = (event) => {
          console.error(
            "Error updating story sync status:",
            event.target.error
          );
          reject(event.target.error);
        };

        updateRequest.onsuccess = () => {
          resolve(true);
        };
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Menghapus cerita dari IndexedDB
   * @param {string} id - ID cerita
   * @returns {Promise<boolean>} - true jika berhasil dihapus
   */
  static async deleteStory(id) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onerror = (event) => {
        console.error(
          "Error deleting story from IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };

      request.onsuccess = () => {
        resolve(true);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Mengambil semua cerita dengan status sinkronisasi tertentu
   * @param {string} status - Status sinkronisasi ('synced', 'pending', 'failed')
   * @returns {Promise<Array>} - Array dari objek cerita dengan status yang ditentukan
   */
  static async getStoriesByStatus(status) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const index = store.index("syncStatus");

    return new Promise((resolve, reject) => {
      const request = index.getAll(status);

      request.onerror = (event) => {
        console.error("Error getting stories by status:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }

  /**
   * Menghapus semua cerita dari IndexedDB
   * @returns {Promise<boolean>} - true jika berhasil menghapus semua data
   */
  static async clearAllStories() {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onerror = (event) => {
        console.error(
          "Error clearing stories from IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };

      request.onsuccess = () => {
        resolve(true);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  }
}
