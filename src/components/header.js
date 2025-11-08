class MainHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
                background-color: #004a7c;
                color: white;
            }

            h1 {
                font-size: 1.5rem;
            }

            nav {
                display: flex;
                gap: 1rem;
            }
    
            button {
                background: transparent;
                border: 1px solid white;
                color: white;
                padding: 0.4rem 0.8rem;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.3s;
            }
    
            button:hover {
                background: white;
                color: #004a7c;
            }
            </style>
    
            <header>
                <h1>Institución ABC</h1>
                <nav>
                    <button onclick="loadPage('home')">Inicio</button>
                    <button onclick="loadPage('cursos')">Cursos</button>
                    <button onclick="loadPage('docentes')">Docentes</button>
                    <button onclick="loadPage('administrativos')">Administrativos</button>
                </nav>
            </header>
    `;
    }
}

customElements.define('main-header', MainHeader);
