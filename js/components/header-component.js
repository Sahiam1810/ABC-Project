
class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
            <h1>LMS ABC</h1>
            <nav>
            <a href="index.html">Inicio</a>
            <a href="docentes.html">Docentes</a>
            <a href="cursos.html">Cursos</a>
            <button id="loginBtn">Ingresar</button>
            </nav>
        </header>
        `;
    }
}
customElements.define('header-component', HeaderComponent);