import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formCurso = (c) => {
    const db = read();
    const f = document.createElement('form');
    f.className = 'grid';

    const tieneDocentes = db.docentes.length > 0;
    const docOpts = db.docentes
        .map(d => `<option ${c?.docenteCodigo===d.codigo?'selected':''} value="${d.codigo}">
            ${d.nombres} ${d.apellidos}
    </option>`).join('');

    f.innerHTML = 
    `
        <label>Código
        <input name="codigo" value="${c?.codigo||uid()}" required>
        </label>
        <label>Nombre
        <input name="nombre" value="${c?.nombre||''}" required>
        </label>
        <label>Descripción
        <textarea name="descripcion">${c?.descripcion||''}</textarea>
        </label>
        <label>Docente
            <select name="docenteCodigo" required>
                <option value="">— Selecciona un docente —</option>
                ${docOpts}
            </select>
        </label>
            <label>Imagen (URL)
                <input name="foto" value="${c?.foto||''}">
            </label>
            <label>Visibilidad
                <select name="visible">
                    <option ${c?.visible!==false?'selected':''} value="true">Público</option>
                    <option ${c?.visible===false?'selected':''} value="false">Oculto</option>
                </select>
            </label>
                ${!tieneDocentes ? `<div class="badge">No hay docentes. Crea uno antes de guardar.</div>`:''}
                <div class="actions"><button class="btn ok">Guardar</button></div>
    `;

    f.onsubmit = (e) => {
        e.preventDefault();
        const db2 = read();
        const data = Object.fromEntries(new FormData(f).entries());
        if (!data.docenteCodigo) { alert('Debes seleccionar un docente.'); return; }
        data.visible = data.visible === 'true';

        const i = db2.cursos.findIndex(x => x.codigo === data.codigo);
        i >= 0 ? db2.cursos[i] = data : db2.cursos.push(data);
        write(db2);
        modal().hide();
        f.dispatchEvent(new CustomEvent('saved', { bubbles:true }));
    };

    return f;
};

class CrudCursos extends HTMLElement{
    connectedCallback(){ this.render(); }
    render(){
        const db = read();
        const tieneDocentes = db.docentes.length > 0;

    this.innerHTML = `
        <div class="toolbar">
            <h3>Cursos</h3>
            <div>
            <button id="add" class="btn">Crear curso</button>

            </div>
        </div>
    ${!tieneDocentes ? `
        <div class="card" style="margin-bottom:10px">
            Para crear cursos debes registrar al menos <b>un docente</b> en la pestaña <b>Docentes</b>.
        </div>` : ''
    }
        <table class="table">
            <thead><tr>
                <th>Código</th><th>Nombre</th><th>Docente</th><th>Visibilidad</th><th>Acciones</th>
                </tr></thead>
            <tbody id="rows"></tbody>
        </table>
    `;

    const rows = this.querySelector('#rows');
    db.cursos.forEach(c=>{
        const doc = db.docentes.find(d=>d.codigo===c.docenteCodigo);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.codigo}</td>
            <td>${c.nombre}</td>
            <td>${doc?`${doc.nombres} ${doc.apellidos}`:'— (no asignado)'}</td>
            <td>${c.visible?'<span class="badge">Público</span>':'<span class="badge">Oculto</span>'}</td>
            <td>
                <button class="btn outline e">Editar</button>
                <button class="btn bad d">Eliminar</button>
            </td>`;
        tr.querySelector('.e').onclick = () => modal().show('Editar curso', formCurso(c));
        tr.querySelector('.d').onclick = () => {
            if(!confirm('¿Eliminar curso?')) return;
            const db2 = read();
            db2.cursos = db2.cursos.filter(x=>x.codigo!==c.codigo);
            db2.modulos = db2.modulos.filter(m=>m.cursoCodigo!==c.codigo);
            db2.lecciones = db2.lecciones.filter(l=>l.cursoCodigo!==c.codigo);
            write(db2);
            this.render();
        };
        rows.append(tr);
    });

    const add = this.querySelector('#add');
    if (add) add.onclick = () => {
      const dbNow = read(); // lee el estado actual
        if (!dbNow.docentes.length) {
            alert('⚠️ Debes crear un docente antes de poder crear un curso.');
            return;
        }
        const f = formCurso();
        modal().show('Crear curso', f);
        f.addEventListener('saved', () => this.render());
    };
    
    }
}
customElements.define('crud-cursos', CrudCursos);

