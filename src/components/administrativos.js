import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "administrativos";
export function init(root){
    const form = root.querySelector("#frmAdmin");
    const saveBtn = root.querySelector("#save");
    const addBtn = root.querySelector("#addAdmin");
    const table = root.querySelector("#dataTable");
    let editIndex = -1;

    if(!isAdmin()){
        const banner = document.createElement("div");
        banner.className = "card";
        root.prepend(banner);
        form?.querySelectorAll("input,textarea,select,button").forEach(el=>{ if(el.type !== "button") el.disabled = true; });
    }

    render();

    if(addBtn){
        addBtn.addEventListener('click', ()=>{
            if(!isAdmin()){ alert('Solo administradores pueden crear administrativos.'); return; }
            showFormModal();
        });
    }

    saveBtn.addEventListener("click", ()=>{
        if(!isAdmin()) return;
        const administrativo = {
            identificacion: root.querySelector("#identificacion").value.trim(),
            nombres: root.querySelector("#nombres").value.trim(),
            apellidos: root.querySelector("#apellidos").value.trim(),
            email: root.querySelector("#email").value.trim(),
            password: root.querySelector("#password").value.trim(),
            telefono: root.querySelector("#telefono").  value.trim(),
            cargo: root.querySelector("#cargo").value.trim()
        };
        if(!administrativo.identificacion || !administrativo.nombres || !administrativo.apellidos || !administrativo.email || !administrativo.password){
            alert("Completa los campos obligatorios");
            return;
        }
        const data = read(DB);
        if(editIndex === -1){
            data.push(administrativo);
        }else{
            data[editIndex] = administrativo;
            editIndex = -1;
            saveBtn.textContent = "Guardar";
        }
        write(DB, data);
        form.reset();
        hideFormModal();
        render();
    });

    function showFormModal(){
        const backdrop = document.getElementById('formBackdrop');
        if(!backdrop) return;
        backdrop.setAttribute('aria-hidden','false');
        backdrop.removeAttribute('inert');
        form.style.display = 'block';
        form.classList.add('floating-form');
        const onClick = (e)=>{ if(e.target === backdrop){ hideFormModal(); } };
        backdrop._onClick = onClick;
        backdrop.addEventListener('click', onClick);
        const onKey = (e)=>{ if(e.key==='Escape') hideFormModal(); };
        document.addEventListener('keydown', onKey);
        backdrop._onKey = onKey;
        setTimeout(()=>{ const first = form.querySelector('input,select,textarea'); first && first.focus(); },50);
    }

    function hideFormModal(){
        const backdrop = document.getElementById('formBackdrop');
        if(!backdrop) return;
        backdrop.setAttribute('aria-hidden','true');
        backdrop.setAttribute('inert','');
        form.classList.remove('floating-form');
        form.style.display = 'none';
        if(backdrop._onClick) backdrop.removeEventListener('click', backdrop._onClick);
        if(backdrop._onKey) document.removeEventListener('keydown', backdrop._onKey);
        delete backdrop._onClick; delete backdrop._onKey;
    }

    function render(){
        const data = read(DB);
        table.innerHTML = data.map((a,i)=>`
            <tr>
                <td>${a.identificacion}</td>
                <td>${a.nombres}</td>
                <td>${a.apellidos}</td>
                <td>${a.email}</td>
                <td>${a.telefono||""}</td>
                <td>${a.cargo||""}</td>
                <td>
                    ${isAdmin()?`<button class="btn" data-edit="${i}">Editar</button>
                    <button class="btn danger" data-del="${i}">Eliminar</button>`:""}
                </td>
            </tr>
        `).join("");

        if(!isAdmin()) return;

        table.querySelectorAll("button[data-edit]").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const i = +e.currentTarget.dataset.edit;
                const a = read(DB)[i];
                root.querySelector("#identificacion").value = a.identificacion;
                root.querySelector("#nombres").value = a.nombres;
                root.querySelector("#apellidos").value = a.apellidos;
                root.querySelector("#email").value = a.email;
                root.querySelector("#password").value = a.password;
                root.querySelector("#telefono").value = a.telefono||"";
                root.querySelector("#cargo").value = a.cargo||"";
                editIndex = i;
                saveBtn.textContent = "Actualizar";
            });
        });

        table.querySelectorAll("button[data-del]").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const i = +e.currentTarget.dataset.del;
                const data = read(DB);
                data.splice(i,1);
                write(DB, data);
                render();
            });
        });
    }
}


