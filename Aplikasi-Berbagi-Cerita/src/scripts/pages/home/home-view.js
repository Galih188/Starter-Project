import { showFormattedDate } from "../../utils/index";

class HomeView {
  #storiesContainer;
  #mapContainer;

  constructor() {
    this.#storiesContainer = null;
    this.#mapContainer = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <h1>Daftar Cerita</h1>
        <div id="stories-list" class="stories-list"></div>
        <div id="stories-map" style="height: 400px; margin-top: 2rem;"></div>
      </section>
    `;
  }

  bindElements() {
    this.#storiesContainer = document.querySelector("#stories-list");
    this.#mapContainer = document.querySelector("#stories-map");
  }

  showLoading() {
    if (!this.#storiesContainer) this.bindElements();
    this.#storiesContainer.innerHTML = `
      <div class="loader">Loading stories...</div>
    `;
  }

  showStories(stories) {
    if (!this.#storiesContainer) this.bindElements();
    
    if (stories.length === 0) {
      this.#storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada cerita yang ditampilkan.</p>
        </div>
      `;
      return;
    }

    this.#storiesContainer.innerHTML = stories
      .map(
        (story) => `
          <article class="story-item">
            <img src="${story.photoUrl}" alt="Foto oleh ${
          story.name
        }" class="story-img" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Foto+Tidak+Tersedia';" />
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <time datetime="${story.createdAt}">${showFormattedDate(
          story.createdAt,
          "id-ID"
        )}</time>
          </article>
        `
      )
      .join("");
  }

  showError(message) {
    if (!this.#storiesContainer) this.bindElements();
    this.#storiesContainer.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
      </div>
    `;
  }

  renderMap(stories) {
    if (!this.#mapContainer) this.bindElements();

    try {
      // Check if any stories have location data
      const storiesWithLocation = stories.filter(
        (story) => story.lat && story.lon
      );

      if (storiesWithLocation.length === 0) {
        this.#mapContainer.innerHTML =
          "<p>Tidak ada cerita dengan lokasi yang tersedia.</p>";
        return null;
      }

      // Create map instance
      const map = L.map("stories-map");

      // Set default view to Indonesia
      map.setView([-2.5, 118], 5);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );

      // Add markers for stories with location
      const bounds = L.latLngBounds();

      storiesWithLocation.forEach((story) => {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const latlng = L.latLng(lat, lon);
          bounds.extend(latlng);

          L.marker(latlng).addTo(map).bindPopup(`
              <b>${story.name}</b><br>
              ${story.description.substring(0, 50)}...
            `);
        }
      });

      // Fit map to bounds if we have markers
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }

      return map;
    } catch (error) {
      console.error("Error rendering map:", error);
      this.#mapContainer.innerHTML =
        "<p>Gagal memuat peta. Silakan muat ulang halaman.</p>";
      return null;
    }
  }
}

export default HomeView;
