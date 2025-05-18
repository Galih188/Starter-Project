/**
 * Controller for managing IndexedDB operations
 * Handles saving, displaying, and deleting data
 */

import IndexedDBHelper from './idb-helper.js';
import StoryIDBRepository from './idb-repository.js';
import { convertBlobToBase64 } from '../utils/index.js';

class IndexedDBController {
  /**
   * Initializes the IndexedDB controller
   * @returns {Promise<void>}
   */
  static async init() {
    try {
      // Ensure database is open and ready
      await IndexedDBHelper.openDB();
      console.log('IndexedDB initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      return false;
    }
  }

  /**
   * Saves a story to IndexedDB
   * @param {Object} storyData - Story data to save
   * @returns {Promise<Object>} - Saved story
   */
  static async saveStory(storyData) {
    try {
      // Check if photo is a File/Blob and convert to base64
      if (storyData.photo instanceof Blob || storyData.photo instanceof File) {
        storyData.photoUrl = await convertBlobToBase64(storyData.photo);
      }

      // Save story to IndexedDB using repository
      const savedStory = await StoryIDBRepository.saveStory(storyData);
      return {
        success: true,
        story: savedStory,
        message: 'Cerita berhasil disimpan ke penyimpanan lokal'
      };
    } catch (error) {
      console.error('Error saving story to IndexedDB:', error);
      return {
        success: false,
        error: error.message || 'Gagal menyimpan cerita ke penyimpanan lokal'
      };
    }
  }

  /**
   * Gets all stories from IndexedDB
   * @param {Object} options - Options for filtering and sorting
   * @returns {Promise<Array>} - Array of stories
   */
  static async getStories(options = {}) {
    try {
      // Get all stories from IndexedDB
      const stories = await StoryIDBRepository.getAllStories();
      
      // Apply filtering if options provided
      let filteredStories = stories;
      
      if (options.syncStatus) {
        filteredStories = filteredStories.filter(
          story => story.syncStatus === options.syncStatus
        );
      }
      
      return {
        success: true,
        stories: filteredStories,
        message: 'Berhasil mendapatkan data cerita'
      };
    } catch (error) {
      console.error('Error getting stories from IndexedDB:', error);
      return {
        success: false,
        stories: [],
        error: error.message || 'Gagal mendapatkan data cerita'
      };
    }
  }

  /**
   * Deletes a story from IndexedDB
   * @param {string} storyId - ID of the story to delete
   * @returns {Promise<Object>} - Result of the delete operation
   */
  static async deleteStory(storyId) {
    try {
      // Delete story from IndexedDB
      const result = await StoryIDBRepository.deleteStory(storyId);
      return {
        success: result,
        message: result ? 'Cerita berhasil dihapus' : 'Cerita tidak ditemukan'
      };
    } catch (error) {
      console.error('Error deleting story from IndexedDB:', error);
      return {
        success: false,
        error: error.message || 'Gagal menghapus cerita'
      };
    }
  }

  /**
   * Gets a story by ID from IndexedDB
   * @param {string} storyId - ID of the story to get
   * @returns {Promise<Object>} - The story or null if not found
   */
  static async getStoryById(storyId) {
    try {
      const story = await StoryIDBRepository.getStoryById(storyId);
      return {
        success: !!story,
        story,
        message: story ? 'Cerita ditemukan' : 'Cerita tidak ditemukan'
      };
    } catch (error) {
      console.error('Error getting story by ID from IndexedDB:', error);
      return {
        success: false,
        story: null,
        error: error.message || 'Gagal mendapatkan cerita'
      };
    }
  }

  /**
   * Synchronizes pending stories with the server
   * @returns {Promise<Object>} - Result of synchronization
   */
  static async syncPendingStories() {
    try {
      // Check if there are stories to sync
      const hasUnsyncedStories = await StoryIDBRepository.hasUnsyncedStories();
      
      if (!hasUnsyncedStories) {
        return {
          success: true,
          message: 'Tidak ada cerita yang perlu disinkronkan'
        };
      }

      // Sync pending stories
      const result = await StoryIDBRepository.syncPendingStories();
      return {
        success: true,
        ...result,
        message: `Sinkronisasi selesai: ${result.synced} berhasil, ${result.failed} gagal`
      };
    } catch (error) {
      console.error('Error syncing stories with server:', error);
      return {
        success: false,
        error: error.message || 'Gagal menyinkronkan cerita dengan server'
      };
    }
  }

  /**
   * Retries synchronization for a failed story
   * @param {string} storyId - ID of the story to retry
   * @returns {Promise<Object>} - Result of the retry operation
   */
  static async retryFailedSync(storyId) {
    try {
      const result = await StoryIDBRepository.retryFailedSync(storyId);
      return {
        success: result,
        message: result 
          ? 'Cerita ditandai untuk sinkronisasi ulang' 
          : 'Cerita tidak ditemukan atau tidak dalam status gagal'
      };
    } catch (error) {
      console.error('Error retrying sync for story:', error);
      return {
        success: false,
        error: error.message || 'Gagal menandai cerita untuk sinkronisasi ulang'
      };
    }
  }

  /**
   * Saves stories from API to IndexedDB
   * @param {Array} stories - Stories from API
   * @returns {Promise<Object>} - Result of the save operation
   */
  static async saveStoriesFromAPI(stories) {
    try {
      const result = await StoryIDBRepository.saveStoriesFromAPI(stories);
      return {
        success: result,
        message: result 
          ? 'Cerita dari API berhasil disimpan ke penyimpanan lokal' 
          : 'Gagal menyimpan cerita dari API'
      };
    } catch (error) {
      console.error('Error saving stories from API to IndexedDB:', error);
      return {
        success: false,
        error: error.message || 'Gagal menyimpan cerita dari API'
      };
    }
  }
}

export default IndexedDBController;
