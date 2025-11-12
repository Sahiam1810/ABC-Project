import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formMod=(m)=>{
    const db=read(); const f=document.createElement('form'); f.className='grid';
    const cOpts=db.cursos.map(c=>`<option ${m?.cursoCodigo===c.codigo?'selected':''} value="${c.codigo}">${c.nombre}</option>`).join('');
    f.innerHTML=`
    
    <label>Código<input name="codigo" value="${m?.codigo||uid()}" required>
    </label>
    <label>Nombre<input name="nombre" value="${m?.nombre||''}" required>
    </label>
    <label>Descripción<textarea name="descripcion">${m?.descripcion||''}</textarea>
    </label>
    <label>Curso<select name="cursoCodigo" required><option value="">—</option>${cOpts}</select>
    </label>
    <div class="actions"><button class="btn ok">Guardar</button>
    </div>
    `;

    f.onsubmit=e=>{e.preventDefault();const db2=read();
        const data=Object.fromEntries(new FormData(f).entries());
        const i=db2.modulos.findIndex(x=>x.codigo===data.codigo);
        i>=0?db2.modulos[i]=data:db2.modulos.push(data); write(db2);
        modal().hide(); f.dispatchEvent(new CustomEvent('saved',{bubbles:true}));
    }; return f;
};

class CrudModulos extends HTMLElement{
    connectedCallback(){ this.render(); }
    render(){
        const db=read();
        this.innerHTML=`
        <div class="toolbar">
            <h3>Módulos</h3>
                <button id="add" class="btn">Añadir</button></div>
                <table class="table">
                    <thead><tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Curso</th>
                        <th>Acciones</th>
                    </tr></thead>
                    <tbody id="rows"></tbody>
                </table>`;

        const rows=this.querySelector('#rows');
        db.modulos.forEach(m=>{
            const c=db.cursos.find(x=>x.codigo===m.cursoCodigo);
            const tr=document.createElement('tr');
            tr.innerHTML=`
            <td>${m.codigo}</td>
            <td>${m.nombre}</td>
            <td>${c?c.nombre:'—'}</td>
            <td>
                <button class="btn outline e">Editar</button>
                <button class="btn bad d">Eliminar</button>
            </td>
            `;
            
            tr.querySelector('.e').onclick=()=>modal().show('Editar módulo',formMod(m));
            tr.querySelector('.d').onclick=()=>{ if(!confirm('¿Eliminar módulo?'))return;
                const db2=read(); db2.modulos=db2.modulos.filter(x=>x.codigo!==m.codigo);
                db2.lecciones=db2.lecciones.filter(l=>l.moduloCodigo!==m.codigo); write(db2); this.render();
        }; rows.append(tr);
        });
        this.querySelector('#add').onclick=()=>{
            const f=formMod(); modal().show('Añadir módulo',f); f.addEventListener('saved',()=>this.render());
        };
    }
}
customElements.define('crud-modulos',CrudModulos);
