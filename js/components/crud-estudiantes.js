import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formEstudiantes = (a) => {
    const f = document.createElement('form');
    f.className = 'grid';
//identificación, nombres, apellidos, género, fecha de nacimiento, dirección y teléfono.
    f.innerHTML = `
        <label>Código
            <input name="codigo" value="${a?.codigo || uid()}" required>
        </label>
        <label>Identificacion
        <input name="identificacion" value="${a?.identificacion || ''}" required>
        </label>
        <label>Nombre
        <input name="nombre" value="${a?.nombre || ''}" required>
        </label>
        <label>Apellido
        <input name="apellido" value="${a?.apellido || ''}" required>
        </label>
        <label>Genero
        <input name="genero" value="${a?.genero || ''}" required>
        </label>
        <label>Fecha de nacimiento
        <input name="fechaNacimiento" value="${a?.fechaNacimiento || ''}" required>
        </label>
        <label>Direccion
        <input name="direccion" value="${a?.direccion || ''}" required>
        </label>
        <label>Telefono
        <input name="telefono" value="${a?.telefono || ''}" required>
        </label>
        <div class="actions">
        <button class="btn ok">Guardar</button>
        </div>
    `;

    f.onsubmit = (e) => {
        e.preventDefault();
        const db = read();

        if (!Array.isArray(db.estudiantes)) db.estudiantes = [];

        const data = Object.fromEntries(new FormData(f).entries());
        const i = db.estudiantes.findIndex(x => x.codigo === data.codigo);
        i >= 0 ? db.estudiantes[i] = data : db.estudiantes.push(data);
        write(db);
        modal().hide();
        f.dispatchEvent(new CustomEvent('saved', { bubbles: true }));
    };

    return f;
};

    class CrudEstudiantes extends HTMLElement {
    connectedCallback() { this.render(); }

    render() {
        const db = read();

        const estudiantes = Array.isArray(db.estudiantes) ? db.estudiantes : [];

        this.innerHTML = `
            <div class="toolbar">
                <h3>Estudiantes</h3>
                <button id="add" class="btn">Añadir</button>
            </div>
            <table class="table">
                <thead>
                <tr>
                    <th>Identificacion</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Genero</th>
                    <th>Fecha de nacimiento</th>
                    <th>Direccion</th>
                    <th>Telefono</th>
                </tr>
                </thead>
                <tbody id="rows"></tbody>
            </table>
        `;

    const rows = this.querySelector('#rows');

    estudiantes.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.identificacion}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>${a.genero}</td>
            <td>${a.fechaNacimiento}</td>
            <td>${a.direccion}</td>
            <td>${a.telefono}</td>
            <td>
                <button class="btn outline e">Editar</button>
                <button class="btn bad d">Eliminar</button>
            </td>
            `;

      // Editar
        tr.querySelector('.e').onclick = () => {
            const f = formEstudiantes(a);
            modal().show('Editar estudiante', f);
            f.addEventListener('saved', () => this.render());
        };

      // Eliminar
        tr.querySelector('.d').onclick = () => {
            if (!confirm('¿Eliminar estudiante?')) return;
            const db2 = read();                                
            if (!Array.isArray(db2.estudiantes)) db2.estudiantes = [];
            db2.estudiantes = db2.estudiantes.filter(x => x.codigo !== a.codigo); // o e
            write(db2);
            this.render();
        };

        rows.append(tr);
    });

    // Añadir
        this.querySelector('#add').onclick = () => {
            const f = formEstudiantes();
            modal().show('Añadir Estudiante', f);
            f.addEventListener('saved', () => this.render());
        };
    }
}

customElements.define('crud-estudiantes', CrudEstudiantes);
