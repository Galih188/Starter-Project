export default class LoginPage {
  async render() {
    return `
        <section class="container">
          <h1>Masuk</h1>
          <form id="login-form">
            <label for="email">Email:</label>
            <input type="email" id="email" required />
  
            <label for="password">Password:</label>
            <input type="password" id="password" required />
  
            <button type="submit">Masuk</button>
          </form>
        </section>
      `;
  }

  async afterRender() {
    const form = document.querySelector("#login-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(
          "https://story-api.dicoding.dev/v1/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        const result = await response.json();

        if (!result.error) {
          localStorage.setItem("token", result.loginResult.token);
          alert("Login berhasil!");
          window.location.hash = "/";
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert("Terjadi kesalahan saat login");
        console.error(err);
      }
    });
  }
}
