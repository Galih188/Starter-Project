class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async fetchStories() {
    try {
      this.#view.showLoading();
      const stories = await this.#model.getStories();
      this.#view.showStories(stories);

      // Render map jika ada stories dengan lokasi
      const storiesWithLocation = stories.filter(
        (story) => story.lat && story.lon
      );

      if (storiesWithLocation.length > 0) {
        // Gunakan timeout yang lebih panjang untuk memastikan map container siap
        setTimeout(() => {
          this.#view.renderMap(stories);
        }, 300);
      } else {
        // Tampilkan pesan jika tidak ada cerita dengan lokasi
        const mapContainer = document.querySelector("#stories-map");
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
              <p>Tidak ada cerita dengan lokasi yang tersedia.</p>
            </div>
          `;
        }
      }
    } catch (error) {
      this.#view.showError("Gagal memuat cerita. " + error.message);
    }
  }
}

export default HomePresenter;
