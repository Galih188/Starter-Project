export default class RegisterPage {
  async render() {
    return `
        <section class="container">
          <h1>Daftar</h1>
          <form id="register-form">
            <label for="name">Nama:</label>
            <input type="text" id="name" required />
  
            <label for="email">Email:</label>
            <input type="email" id="email" required />
  
            <label for="password">Password:</label>
            <input type="password" id="password" required minlength="8" />
  
            <button type="submit">Daftar</button>
          </form>
        </section>
      `;
  }

  async afterRender() {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(
          "https://story-api.dicoding.dev/v1/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }
        );

        const result = await response.json();

        if (!result.error) {
          alert("Registrasi berhasil! Silakan login.");
          window.location.hash = "/login";
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert("Gagal daftar");
        console.error(err);
      }
    });
  }
}
