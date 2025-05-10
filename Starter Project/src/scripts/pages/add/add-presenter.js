class AddStoryPresenter {
  #model;
  #view;
  #stream;
  #photoData;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#stream = null;
    this.#photoData = null;
  }

  async init() {
    try {
      const video = document.getElementById("camera");
      const canvas = document.getElementById("snapshot");
      const takePhotoBtn = document.getElementById("take-photo");
      const latInput = document.getElementById("lat");
      const lonInput = document.getElementById("lon");
      const form = document.getElementById("story-form");

      // Initialize camera
      this.#stream = await this.#view.initCamera();
      video.srcObject = this.#stream;

      // Setup photo capture
      takePhotoBtn.addEventListener("click", () => {
        this.#photoData = this.#view.capturePhoto(video, canvas);
      });

      // Initialize map
      const map = this.#view.initMap();
      this.#view.handleMapClick(map, latInput, lonInput);

      // Setup form submission
      form.addEventListener("submit", (e) => this.#handleSubmit(e));
    } catch (error) {
      console.error("Error initializing add story page:", error);
      this.#view.showErrorMessage("Gagal menginisialisasi kamera atau peta");
    }
  }

  async #handleSubmit(e) {
    e.preventDefault();

    try {
      this.#view.showLoading();

      const description = document.getElementById("description").value;
      const lat = document.getElementById("lat").value || null;
      const lon = document.getElementById("lon").value || null;

      if (!this.#photoData) {
        throw new Error("Silakan ambil foto terlebih dahulu");
      }

      // Convert data URL to File object
      const photoBlob = await fetch(this.#photoData).then((res) => res.blob());
      const photoFile = new File([photoBlob], "photo.jpg", {
        type: "image/jpeg",
      });

      // Submit story
      const result = await this.#model.postStory({
        description,
        photo: photoFile,
        lat: lat,
        lon: lon,
      });

      this.#view.showSuccessMessage(result.message);

      // Redirect to home page
      window.location.hash = "/";
    } catch (error) {
      this.#view.showErrorMessage(error.message);
    } finally {
      this.#view.hideLoading();

      // Stop camera stream
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
      }
    }
  }
}

export default AddStoryPresenter;
