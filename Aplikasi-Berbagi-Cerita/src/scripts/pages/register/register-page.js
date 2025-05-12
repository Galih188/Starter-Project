import RegisterView from "./register-view.js";
import RegisterPresenter from "./register-presenter.js";
import RegisterModel from "./register-model.js";

export default class RegisterPage {
  #view;
  #presenter;

  constructor() {
    this.#view = new RegisterView();
    const model = new RegisterModel();
    this.#presenter = new RegisterPresenter({ model, view: this.#view });
  }

  async render() {
    return this.#view.getTemplate();
  }

  async afterRender() {
    this.#presenter.init();
  }
}
