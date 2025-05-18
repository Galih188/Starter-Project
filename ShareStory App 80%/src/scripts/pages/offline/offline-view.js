/**
 * View for offline page
 * Handles rendering the UI for offline stories
 */

import { showFormattedDate } from "../../utils/index.js";

class OfflineView {
  getTemplate() {
    return `
      <section class="container offline-page">
        <h1>Manajemen Data Offline</h1>
        
        <div class="sync-info">
          <div class="sync-status">
            <p>Menunggu status sinkronisasi...</p>
          </div>
          <button id="sync-stories-button" class="primary-button">
            <span class="button-text">Sinkronkan Cerita</span>
            <span class="loading-indicator hidden">
              <span class="spinner"></span>
            </span>
          </button>
        </div>
        
        <div class="stories-filter">
          <label for="status-filter">Filter berdasarkan status:</label>
          <select id="status-filter">
            <option value="all" selected>Semua</option>
            <option value="pending">Menunggu Sinkronisasi</option>
            <option value="synced">Tersinkronisasi</option>
            <option value="failed">Gagal Sinkronisasi</option>
          </select>
        </div>
        
        <div id="offline-stories-list" class="stories-list"></div>
      </section>
      
      <div id="toast" class="toast hidden"></div>
    `;
  }

  showLoading() {
    const storiesContainer = document.querySelector("#offline-stories-list");
    storiesContainer.innerHTML = `
      <div class="loader">
        <div class="spinner"></div>
        <p>Memuat cerita...</p>
      </div>
    `;
  }

  showStories(stories) {
    const storiesContainer = document.querySelector("#offline-stories-list");

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada cerita yang tersimpan secara offline.</p>
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = stories
      .map((story) => this._generateStoryItem(story))
      .join("");

    // Setup filter listener
    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this._filterStories(statusFilter.value, stories);
      });
    }
  }

  _generateStoryItem(story) {
    const statusLabel = this._getStatusLabel(story.syncStatus);
    const statusClass = `status-${story.syncStatus}`;

    return `
      <article class="story-item ${statusClass}" data-status="${
      story.syncStatus
    }">
        <div class="story-image-container">
          <img src="${
            story.photoUrl ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }" 
               alt="Foto oleh ${story.name}" 
               class="story-img" 
               loading="lazy" 
               onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Foto+Tidak+Tersedia';" />
        </div>
        <div class="story-content">
          <div class="story-header">
            <h2>${story.name}</h2>
            <span class="story-status ${statusClass}">${statusLabel}</span>
          </div>
          <p class="story-description">${story.description}</p>
          <time datetime="${story.createdAt}">${showFormattedDate(
      story.createdAt,
      "id-ID"
    )}</time>
          
          <div class="story-actions">
            ${this._generateActionButtons(story)}
          </div>
        </div>
      </article>
    `;
  }

  _generateActionButtons(story) {
    let buttons = "";

    // Delete button for all stories
    buttons += `
      <button class="delete-story-button action-button" data-story-id="${story.id}">
        <span class="button-text">Hapus</span>
        <span class="loading-indicator hidden">
          <span class="spinner-small"></span>
        </span>
      </button>
    `;

    // Retry button only for failed stories
    if (story.syncStatus === "failed") {
      buttons += `
        <button class="retry-sync-button action-button" data-story-id="${story.id}">
          <span class="button-text">Coba Lagi</span>
          <span class="loading-indicator hidden">
            <span class="spinner-small"></span>
          </span>
        </button>
      `;
    }

    return buttons;
  }

  _getStatusLabel(status) {
    switch (status) {
      case "synced":
        return "Tersinkronisasi";
      case "pending":
        return "Menunggu Sinkronisasi";
      case "failed":
        return "Gagal Sinkronisasi";
      default:
        return "Status Tidak Diketahui";
    }
  }

  _filterStories(filterValue, stories) {
    const storyItems = document.querySelectorAll(".story-item");

    storyItems.forEach((item) => {
      if (filterValue === "all" || item.dataset.status === filterValue) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });

    // Show empty state if no visible stories
    const visibleStories = Array.from(storyItems).filter(
      (item) => item.style.display !== "none"
    );
    const storiesContainer = document.querySelector("#offline-stories-list");

    if (visibleStories.length === 0) {
      const emptyMessage =
        filterValue === "all"
          ? "Tidak ada cerita yang tersimpan secara offline."
          : `Tidak ada cerita dengan status "${this._getStatusLabel(
              filterValue
            )}".`;

      // Insert empty state after the story items
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state filtered-empty";
      emptyState.innerHTML = `<p>${emptyMessage}</p>`;

      // Remove existing empty state if any
      const existingEmptyState =
        storiesContainer.querySelector(".filtered-empty");
      if (existingEmptyState) {
        existingEmptyState.remove();
      }

      storiesContainer.appendChild(emptyState);
    } else {
      // Remove empty state if stories are visible
      const existingEmptyState =
        storiesContainer.querySelector(".filtered-empty");
      if (existingEmptyState) {
        existingEmptyState.remove();
      }
    }
  }

  updateSyncInfo({ pendingCount, failedCount, totalCount }) {
    const syncInfoContainer = document.querySelector(".sync-status");
    if (!syncInfoContainer) return;

    syncInfoContainer.innerHTML = `
      <p>Total cerita offline: <strong>${totalCount}</strong></p>
      <p>Menunggu sinkronisasi: <strong>${pendingCount}</strong></p>
      <p>Gagal sinkronisasi: <strong>${failedCount}</strong></p>
    `;
  }

  showError(message) {
    const storiesContainer = document.querySelector("#offline-stories-list");
    storiesContainer.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
      </div>
    `;
  }

  showActionLoading(storyId, action) {
    const button = document.querySelector(
      `.${action}-story-button[data-story-id="${storyId}"]`
    );
    if (!button) return;

    const buttonText = button.querySelector(".button-text");
    const loadingIndicator = button.querySelector(".loading-indicator");

    buttonText.classList.add("hidden");
    loadingIndicator.classList.remove("hidden");
    button.disabled = true;
  }

  hideActionLoading(storyId, action) {
    const button = document.querySelector(
      `.${action}-story-button[data-story-id="${storyId}"]`
    );
    if (!button) return;

    const buttonText = button.querySelector(".button-text");
    const loadingIndicator = button.querySelector(".loading-indicator");

    buttonText.classList.remove("hidden");
    loadingIndicator.classList.add("hidden");
    button.disabled = false;
  }

  showSyncLoading() {
    const syncButton = document.getElementById("sync-stories-button");
    if (!syncButton) return;

    const buttonText = syncButton.querySelector(".button-text");
    const loadingIndicator = syncButton.querySelector(".loading-indicator");

    buttonText.textContent = "Menyinkronkan...";
    loadingIndicator.classList.remove("hidden");
    syncButton.disabled = true;
  }

  hideSyncLoading() {
    const syncButton = document.getElementById("sync-stories-button");
    if (!syncButton) return;

    const buttonText = syncButton.querySelector(".button-text");
    const loadingIndicator = syncButton.querySelector(".loading-indicator");

    buttonText.textContent = "Sinkronkan Cerita";
    loadingIndicator.classList.add("hidden");
    syncButton.disabled = false;
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} visible`;

    setTimeout(() => {
      toast.className = `toast ${type} hidden`;
    }, 3000);
  }
}

export default OfflineView;
