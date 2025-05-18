/**
 * Presenter for offline page
 * Handles the logic for displaying and managing offline stories
 */

class OfflinePresenter {
  #view;
  #idbController;
  #eventListeners = [];

  constructor({ view, idbController }) {
    this.#view = view;
    this.#idbController = idbController;
  }

  async init() {
    try {
      // Initialize IndexedDB and load stories
      await this.#idbController.init();
      await this.loadStories();

      // Add listeners for story actions
      this._setupEventListeners();
    } catch (error) {
      console.error("Error initializing offline presenter:", error);
      this.#view.showError("Gagal memuat data offline. " + error.message);
    }
  }

  async loadStories() {
    try {
      this.#view.showLoading();

      // Get all stories from IndexedDB
      const { success, stories, error } =
        await this.#idbController.getStories();

      if (!success) {
        throw new Error(error);
      }

      // Update the UI with the stories
      this.#view.showStories(stories);

      // Update the sync info
      this._updateSyncInfo(stories);
    } catch (error) {
      this.#view.showError("Gagal memuat cerita offline. " + error.message);
    }
  }

  _updateSyncInfo(stories) {
    const pendingStories = stories.filter(
      (story) => story.syncStatus === "pending"
    ).length;
    const failedStories = stories.filter(
      (story) => story.syncStatus === "failed"
    ).length;

    this.#view.updateSyncInfo({
      pendingCount: pendingStories,
      failedCount: failedStories,
      totalCount: stories.length,
    });
  }

  _setupEventListeners() {
    // Listen for delete buttons
    document.addEventListener("click", this._handleDeleteClick.bind(this));
    this.#eventListeners.push({
      type: "click",
      handler: this._handleDeleteClick.bind(this),
    });

    // Listen for retry sync buttons
    document.addEventListener("click", this._handleRetrySyncClick.bind(this));
    this.#eventListeners.push({
      type: "click",
      handler: this._handleRetrySyncClick.bind(this),
    });
  }

  async _handleDeleteClick(event) {
    const deleteButton = event.target.closest(".delete-story-button");
    if (!deleteButton) return;

    const storyId = deleteButton.dataset.storyId;
    if (!storyId) return;

    if (confirm("Apakah Anda yakin ingin menghapus cerita ini?")) {
      await this._deleteStory(storyId);
    }
  }

  async _handleRetrySyncClick(event) {
    const retryButton = event.target.closest(".retry-sync-button");
    if (!retryButton) return;

    const storyId = retryButton.dataset.storyId;
    if (!storyId) return;

    await this._retrySync(storyId);
  }

  async _deleteStory(storyId) {
    try {
      this.#view.showActionLoading(storyId, "delete");

      const { success, error } = await this.#idbController.deleteStory(storyId);

      if (!success) {
        throw new Error(error);
      }

      // Reload stories after deletion
      this.#view.showToast("Cerita berhasil dihapus");
      await this.loadStories();
    } catch (error) {
      this.#view.showToast("Gagal menghapus cerita: " + error.message, "error");
      this.#view.hideActionLoading(storyId, "delete");
    }
  }

  async _retrySync(storyId) {
    try {
      this.#view.showActionLoading(storyId, "retry");

      const { success, error } = await this.#idbController.retryFailedSync(
        storyId
      );

      if (!success) {
        throw new Error(error);
      }

      this.#view.showToast("Cerita ditandai untuk sinkronisasi ulang");
      await this.loadStories();
    } catch (error) {
      this.#view.showToast(
        "Gagal menandai cerita untuk sinkronisasi: " + error.message,
        "error"
      );
      this.#view.hideActionLoading(storyId, "retry");
    }
  }

  async syncPendingStories() {
    try {
      this.#view.showSyncLoading();

      const { success, synced, failed, error } =
        await this.#idbController.syncPendingStories();

      if (!success) {
        throw new Error(error);
      }

      if (synced > 0 || failed > 0) {
        this.#view.showToast(
          `Sinkronisasi selesai: ${synced} berhasil, ${failed} gagal`
        );
      } else {
        this.#view.showToast("Tidak ada cerita yang perlu disinkronkan");
      }

      // Reload stories after sync
      await this.loadStories();
    } catch (error) {
      this.#view.showToast(
        "Gagal menyinkronkan cerita: " + error.message,
        "error"
      );
    } finally {
      this.#view.hideSyncLoading();
    }
  }

  cleanup() {
    // Remove event listeners when leaving the page
    this.#eventListeners.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler);
    });
    this.#eventListeners = [];
  }
}

export default OfflinePresenter;
