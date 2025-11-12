import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formDoc=d=>{
    const f=document.createElement('form'); f.className='grid';
    f.innerHTML=`
    
    <label>Código<input name="codigo" value="${d?.codigo||uid()}" required>
    </label>
    <label>Identificación<input name="identificacion" value="${d?.identificacion||''}" required>
    </label>
    <label>Nombres<input name="nombres" value="${d?.nombres||''}" required>
    </label>
    <label>Apellidos<input name="apellidos" value="${d?.apellidos||''}" required>
    </label>
    <label>Email<input type="email" name="email" value="${d?.email||''}" required>
    </label>
    <label>Foto (URL)<input name="foto" value="${d?.foto||''}">
    </label>
    <label>Área<input name="area" value="${d?.area||''}" required>
    </label>
    <div class="actions"><button class="btn ok">Guardar</button></div>`;
    
    f.onsubmit=e=>{e.preventDefault();const db=read();
        const data=Object.fromEntries(new FormData(f).entries());
        const i=db.docentes.findIndex(x=>x.codigo===data.codigo);
            i>=0?db.docentes[i]=data:db.docentes.push(data); write(db);
        modal().hide(); f.dispatchEvent(new CustomEvent('saved',{bubbles:true}));
    }; return f;
};

class CrudDocentes extends HTMLElement{
    connectedCallback(){ this.render(); }
    render(){
        const db=read();
        this.innerHTML=`<div class="toolbar"><h3>Docentes</h3>
            <button id="add" class="btn">Añadir</button></div>
            <table class="table"><thead><tr>
            <th>Código</th><th>Nombre</th><th>Email</th><th>Área</th><th>Acciones</th>
            </tr></thead><tbody id="rows"></tbody></table>`;
        const rows=this.querySelector('#rows');
        db.docentes.forEach(d=>{
            const tr=document.createElement('tr');
            tr.innerHTML=`<td>${d.codigo}</td><td>${d.nombres} ${d.apellidos}</td>
                        <td>${d.email}</td><td>${d.area}</td>
                        <td><button class="btn outline e">Editar</button>
                        <button class="btn bad d">Eliminar</button></td>`;

            tr.querySelector('.e').onclick=()=>modal().show('Editar docente',formDoc(d));
            tr.querySelector('.d').onclick=()=>{ 
                const db2=read();
                const usado=db2.cursos.some(c=>c.docenteCodigo===d.codigo);
                if(usado){ alert('No se puede eliminar: docente asignado a un curso'); return; }
                if(confirm('¿Eliminar docente?')){ db2.docentes=db2.docentes.filter(x=>x.codigo!==d.codigo); write(db2); this.render(); }
        };

        rows.append(tr);
        });
        this.querySelector('#add').onclick=()=>{
            const f=formDoc(); modal().show('Añadir docente',f);
            f.addEventListener('saved',()=>this.render());
        };
    }
}

customElements.define('crud-docentes',CrudDocentes);
