import { showFormattedDate } from "../../utils/index";

class HomeView {
  getTemplate() {
    return `
      <section class="container">
        <h1>Daftar Cerita</h1>
        <div id="stories-list" class="stories-list"></div>
        <div id="stories-map" style="height: 400px; margin-top: 2rem;"></div>
      </section>
    `;
  }

  showLoading() {
    const storiesContainer = document.querySelector("#stories-list");
    storiesContainer.innerHTML = `
      <div class="loader">Loading stories...</div>
    `;
  }

  showStories(stories) {
    const storiesContainer = document.querySelector("#stories-list");
    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada cerita yang ditampilkan.</p>
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = stories
      .map(
        (story) => `
          <article class="story-item">
            <img src="${story.photoUrl}" alt="Foto oleh ${
          story.name
        }" class="story-img" />
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
    const storiesContainer = document.querySelector("#stories-list");
    storiesContainer.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
      </div>
    `;
  }

  renderMap(stories) {
    const map = L.map("stories-map").setView([-2.5, 118], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );

    // Add markers for stories with location
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon]).addTo(map).bindPopup(`
            <b>${story.name}</b><br>
            ${story.description.substring(0, 50)}...
          `);
      }
    });
  }
}

export default HomeView;
