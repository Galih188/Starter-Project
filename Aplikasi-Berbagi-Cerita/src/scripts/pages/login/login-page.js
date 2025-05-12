import LoginView from "./login-view.js";
import LoginPresenter from "./login-presenter.js";
import LoginModel from "./login-model.js";

export default class LoginPage {
  #view;
  #presenter;

  constructor() {
    this.#view = new LoginView();
    const model = new LoginModel();
    this.#presenter = new LoginPresenter({ model, view: this.#view });
  }

  async render() {
    return this.#view.getTemplate();
  }

  async afterRender() {
    this.#presenter.init();
  }
}
