class AboutPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  // Untuk future enhancement, presenter bisa mengambil data dari model jika diperlukan
  // Misalnya data statistik aplikasi, versi, dsb
}

export default AboutPresenter;
