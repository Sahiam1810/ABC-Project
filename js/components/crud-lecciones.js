import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formLec=l=>{
    const db=read(); const f=document.createElement('form'); f.className='grid';
    const cOpts=db.cursos.map(c=>`<option ${l?.cursoCodigo===c.codigo?'selected':''} value="${c.codigo}">${c.nombre}</option>`).join('');
    const mOpts=db.modulos.filter(m=>!l?.cursoCodigo || m.cursoCodigo===l.cursoCodigo)

        .map(m=>`<option ${l?.moduloCodigo===m.codigo?'selected':''} value="${m.codigo}">${m.nombre}</option>`).join('');

    f.innerHTML=`
    <label>Código<input name="codigo" value="${l?.codigo||uid()}" required>
    </label>
    <label>Título<input name="titulo" value="${l?.titulo||''}" required>
    </label>
    <label>Intensidad (h)<input type="number" name="horas" value="${l?.horas||1}" required>
    </label>
    <label>Contenido<textarea name="contenido">${l?.contenido||''}</textarea>
    </label>
    <label>Curso<select name="cursoCodigo" id="cSel" required><option value="">—</option>${cOpts}</select>
    </label>
    <label>Módulo<select name="moduloCodigo" id="mSel" required>${mOpts}</select>
    </label>
    <label>Multimedia (URL separadas por coma)<textarea name="media">${(l?.media||[]).join(',')}</textarea>
    </label>
    <div class="actions"><button class="btn ok">Guardar</button>
    </div>
    `;
    f.querySelector('#cSel').onchange=e=>{
        const db3=read(); const list=db3.modulos.filter(m=>m.cursoCodigo===e.target.value);
        f.querySelector('#mSel').innerHTML=list.map(m=>`<option value="${m.codigo}">${m.nombre}</option>`).join('');
    };
    f.onsubmit=e=>{e.preventDefault();const db2=read();
        const data=Object.fromEntries(new FormData(f).entries());
        data.media=(data.media||'').split(',').map(x=>x.trim()).filter(Boolean);
        const i=db2.lecciones.findIndex(x=>x.codigo===data.codigo);
            i>=0?db2.lecciones[i]=data:db2.lecciones.push(data); write(db2);
            modal().hide(); f.dispatchEvent(new CustomEvent('saved',{bubbles:true}));
    }; return f;
};

class CrudLecciones extends HTMLElement{
    connectedCallback(){ this.render(); }
    render(){
        const db=read();
        this.innerHTML=`
        <div class="toolbar"><h3>Lecciones</h3>
            <button id="add" class="btn">Añadir</button></div>
                <table class="table">
                    <thead><tr>
                        <th>Código</th>
                        <th>Título</th>
                        <th>Curso</th>
                        <th>Módulo</th>
                        <th>Acciones</th>
                    </tr></thead>
                    <tbody id="rows"></tbody>
                </table>`;

        const rows=this.querySelector('#rows');
        db.lecciones.forEach(l=>{
        const c=db.cursos.find(x=>x.codigo===l.cursoCodigo);
        const m=db.modulos.find(x=>x.codigo===l.moduloCodigo);
        const tr=document.createElement('tr');
        tr.innerHTML=`
        
            <td>${l.codigo}</td>
            <td>${l.titulo}</td>
            <td>${c?c.nombre:'—'}</td>
            <td>${m?m.nombre:'—'}</td>

            <td><button class="btn outline e">Editar</button>
            <button class="btn bad d">Eliminar</button></td>
            `;

            tr.querySelector('.e').onclick=()=>modal().show('Editar lección',formLec(l));
            tr.querySelector('.d').onclick=()=>{ if(!confirm('¿Eliminar lección?'))return;
            const db2=read(); db2.lecciones=db2.lecciones.filter(x=>x.codigo!==l.codigo); write(db2); this.render();
            }; rows.append(tr);
        });
        
        this.querySelector('#add').onclick=()=>{
            const f=formLec(); modal().show('Añadir lección',f); f.addEventListener('saved',()=>this.render());
        };
    }
}
customElements.define('crud-lecciones',CrudLecciones);
