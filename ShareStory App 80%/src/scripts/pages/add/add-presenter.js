class AddStoryPresenter {
  #model;
  #view;
  #photoData;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#photoData = null;
  }

  async init() {
    try {
      // Initialize view
      this.#view.init({
        onPhotoCapture: (photoData) => this.setPhotoData(photoData),
        onSubmit: (data) => this.submitStory(data),
      });

      // Initialize camera lewat view
      await this.#view.initCamera();

      // Initialize map lewat view
      this.#view.initMap();
    } catch (error) {
      console.error("Error initializing add story page:", error);
      this.#view.showErrorMessage(
        "Gagal menginisialisasi halaman. Silakan coba lagi."
      );
    }
  }

  setPhotoData(photoData) {
    this.#photoData = photoData;
  }

  getPhotoData() {
    return this.#photoData;
  }

  async submitStory({ description, lat, lon, fileData }) {
    try {
      this.#view.showLoading();

      let photoData = this.#photoData || fileData;

      if (!photoData) {
        throw new Error("Silakan ambil foto atau pilih file terlebih dahulu");
      }

      // Convert data URL ke File object
      const photoBlob = await fetch(photoData).then((res) => res.blob());
      const photoFile = new File([photoBlob], "photo.jpg", {
        type: "image/jpeg",
      });

      // Submit story lewat model
      const result = await this.#model.postStory({
        description,
        photo: photoFile,
        lat: lat,
        lon: lon,
      });

      this.#view.showSuccessMessage(result.message);

      this.cleanup();

      setTimeout(() => {
        window.location.hash = "/";
      }, 500);
    } catch (error) {
      this.#view.showErrorMessage(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  cleanup() {
    this.#view.cleanupResources();
  }
}

export default AddStoryPresenter;
