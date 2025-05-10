class AboutView {
  getTemplate() {
    return `
        <section class="container">
          <h1>Tentang Aplikasi</h1>
          <br>
          <p>Aplikasi ini dibuat sebagai proyek submission untuk memanfaatkan API publik dan membangun SPA dengan Webpack.</p>
          <p>Aplikasi ini menggunakan arsitektur Single Page Application (SPA) dengan pola Model-View-Presenter (MVP).</p>
          <p>Fitur-fitur yang tersedia:</p>
          <ul>
            <li>Menampilkan daftar cerita dari API</li>
            <li>Menambahkan cerita baru dengan foto dan lokasi</li>
            <li>Autentikasi pengguna (login dan register)</li>
            <li>Visualisasi lokasi cerita pada peta</li>
          </ul>
          <p>Dikembangkan oleh <strong>Nama Anda</strong>.</p>
        </section>
      `;
  }
}

export default AboutView;
