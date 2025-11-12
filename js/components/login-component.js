import { getSistema, guardarSesion } from '../localstore.js';

class LoginComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
            <h2>Iniciar sesión</h2>
            <input id="email" type="email" placeholder="Email">
            <input id="password" type="password" placeholder="Contraseña">
            <button id="loginBtn">Ingresar</button>
            </div>
        </div>
        `;

        this.querySelector('#loginBtn').addEventListener('click', () => this.login());
    }

    login() {
        const email = this.querySelector('#email').value;
        const pass = this.querySelector('#password').value;
        const db = getSistema();
        const admin = db.administrativos.find(a => a.email === email && a.password === pass);

        if (admin) {
        guardarSesion(admin);
        alert(`Bienvenido, ${admin.nombres}`);
        location.href = 'admin.html';
        } else {
        alert('Credenciales incorrectas');
        }
    }
}

customElements.define('login-component', LoginComponent);