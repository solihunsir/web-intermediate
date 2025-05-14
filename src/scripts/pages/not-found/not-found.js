export default class NotFound {
  async render() {
    return `
            <section class="not-found">
                <h2>404 - Not Found</h2>
                <p>Silahkan kembali ke Home</p>
                <a href="#/" class="btn">Kembali ke Home</a>
            </section>
        `;
  }

  async afterRender() {}
}
