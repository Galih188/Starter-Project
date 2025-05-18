/**
 * Offline page for managing locally stored stories
 */

import OfflineView from "./offline-view.js";
import OfflinePresenter from "./offline-presenter.js";
import IndexedDBController from "../../data/idb-controller.js";

export default class OfflinePage {
  #presenter;
  #view;

  constructor() {
    this.#view = new OfflineView();
    this.#presenter = new OfflinePresenter({
      view: this.#view,
      idbController: IndexedDBController,
    });
  }

  async render() {
    return this.#view.getTemplate();
  }

  async afterRender() {
    await this.#presenter.init();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Cleanup event listeners when page changes
    const syncButton = document.getElementById("sync-stories-button");
    if (syncButton) {
      syncButton.addEventListener("click", async () => {
        await this.#presenter.syncPendingStories();
      });
    }
  }

  cleanup() {
    // Remove event listeners when leaving the page
    this.#presenter.cleanup();
  }
}
