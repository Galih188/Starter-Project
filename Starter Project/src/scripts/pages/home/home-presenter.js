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

      // Render map if there are stories with location
      const storiesWithLocation = stories.filter(
        (story) => story.lat && story.lon
      );
      if (storiesWithLocation.length > 0) {
        setTimeout(() => {
          this.#view.renderMap(stories);
        }, 100); // Small delay to ensure the map container is ready
      }
    } catch (error) {
      this.#view.showError("Gagal memuat cerita. " + error.message);
    }
  }
}

export default HomePresenter;
