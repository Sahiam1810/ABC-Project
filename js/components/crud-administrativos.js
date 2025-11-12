import { read, write, uid } from '../localstore.js';
import { modal } from './modal-component.js';

const formAdmin=adm=>{
    const f=document.createElement('form'); f.className='grid';
    f.innerHTML=`
    <label>
        Identificación<input required name="id" value="${adm?.id||uid()}"></label>
    <label>
        Nombres<input required name="nombres" value="${adm?.nombres||''}"></label>
    <label>
        Apellidos<input required name="apellidos" value="${adm?.apellidos||''}"></label>
    <label>
        Email<input required type="email" name="email" value="${adm?.email||''}"></label>
    <label>
        Teléfono<input name="telefono" value="${adm?.telefono||''}"></label>
    <label>
        Cargo<input name="cargo" value="${adm?.cargo||'Administrador'}"></label>
    <label>
        Contraseña<input required name="password" value="${adm?.password||'12345'}"></label>

    <div class="actions"><button class="btn ok">Guardar</button></div>
`;

    f.onsubmit=e=>{e.preventDefault(); 
        const db=read();
        const data=Object.fromEntries(new FormData(f).entries());
        const i=db.administrativos.findIndex(x=>x.id===data.id);
            i>=0 ? db.administrativos[i]=data : db.administrativos.push(data);
            write(db); modal().hide(); f.dispatchEvent(new CustomEvent('saved',{bubbles:true}));
    };    return f;
};

class CrudAdministrativos extends HTMLElement{
    connectedCallback(){ this.render(); }
    render(){
        const db=read();
        this.innerHTML=`<div class="toolbar">
                            <h3>Administrativos</h3>
                            <button class="btn" id="add">Añadir</button>
                        </div>
                        <table class="table"><thead><tr>
                            <th>Identificación</th><th>Nombre</th><th>Email</th><th>Cargo</th><th>Acciones</th>
                                </tr>
                            </thead><tbody id="rows">
                            </tbody>
                        </table>`;

        const rows=this.querySelector('#rows'); rows.innerHTML='';
        db.administrativos.forEach(a=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${a.id}</td>
                        <td>${a.nombres} ${a.apellidos}</td>
                        <td>${a.email}</td><td>${a.cargo}</td>
                        <td><button class="btn outline e">Editar</button>
                        <button class="btn bad d">Eliminar</button></td>`;

        tr.querySelector('.e').onclick=()=>modal().show('Editar administrativo',formAdmin(a));
        tr.querySelector('.d').onclick=()=>{ 
            if(!confirm('¿Eliminar administrativo?'))return;
            const db2=read(); db2.administrativos=db2.administrativos.filter(x=>x.id!==a.id);
            write(db2); this.render(); this.dispatchEvent(new CustomEvent('db:changed',{bubbles:true}));
        }; rows.append(tr);
    });
    this.querySelector('#add').onclick=()=>{
        const f=formAdmin(); modal().show('Añadir administrativo',f);
        f.addEventListener('saved',()=>{this.render();this.dispatchEvent(new CustomEvent('db:changed',{bubbles:true}))});
    };
    }
}
customElements.define('crud-administrativos',CrudAdministrativos);