import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "docentes";
export function init(root){
    const form = root.querySelector("#frmDocente");
    const saveBtn = root.querySelector("#save");
    const addBtn = root.querySelector("#addDocente");
    const table = root.querySelector("#dataTable");
    let editIndex = -1;

    if(!isAdmin()){
        // Ocultar formulario, tabla y botón Añadir para usuarios no-admin
        if(form) form.style.display = 'none';
        if(addBtn) addBtn.style.display = 'none';
        const tableParent = table?.closest('.card');
        if(tableParent) tableParent.style.display = 'none';
        renderPublicView(root);
    } else {
        render();
    }

    // Mostrar formulario en modal flotante al hacer click en Añadir
    if(addBtn){
        addBtn.addEventListener('click', ()=>{
            if(!isAdmin()){ alert('Solo administradores pueden crear docentes.'); return; }
            showFormModal();
        });
    }

    saveBtn.addEventListener("click", ()=>{
        if(!isAdmin()) return;
        const fotoInput = root.querySelector("#foto");
        const fotoFile = fotoInput?.files?.[0];
        
        if(fotoFile){
            const reader = new FileReader();
            reader.onload = (e)=>{
                const docente = {
                    codigo: root.querySelector("#codigo").value.trim(),
                    identificacion: root.querySelector("#identificacion").value.trim(),
                    nombres: root.querySelector("#nombres").value.trim(),
                    apellidos: root.querySelector("#apellidos").value.trim(),
                    email: root.querySelector("#email").value.trim(),
                    area: root.querySelector("#area").value.trim(),
                    foto: e.target.result
                };
                if(!docente.codigo || !docente.identificacion || !docente.nombres || !docente.apellidos || !docente.email || !docente.area){
                    alert("Completa todos los campos obligatorios");
                    return;
                }
                saveDocente(docente);
            };
            reader.readAsDataURL(fotoFile);
        } else {
            const docente = {
                codigo: root.querySelector("#codigo").value.trim(),
                identificacion: root.querySelector("#identificacion").value.trim(),
                nombres: root.querySelector("#nombres").value.trim(),
                apellidos: root.querySelector("#apellidos").value.trim(),
                email: root.querySelector("#email").value.trim(),
                area: root.querySelector("#area").value.trim(),
                foto: ""
            };
            if(!docente.codigo || !docente.identificacion || !docente.nombres || !docente.apellidos || !docente.email || !docente.area){
                alert("Completa todos los campos obligatorios");
                return;
            }
            saveDocente(docente);
        }
    });

    function saveDocente(docente){
        const data = read(DB);
        if(editIndex === -1){
            data.push(docente);
        }else{
            data[editIndex] = docente;
            editIndex = -1;
            saveBtn.textContent = "Guardar";
        }
        write(DB, data);
        form.reset();
        hideFormModal();
        render();
    }

    function showFormModal(){
        const backdrop = document.getElementById('formBackdrop');
        if(!backdrop) return;
        backdrop.setAttribute('aria-hidden','false');
        backdrop.removeAttribute('inert');
        form.style.display = 'block';
        form.classList.add('floating-form');
        // close when clicking backdrop
        const onClick = (e)=>{ if(e.target === backdrop){ hideFormModal(); } };
        backdrop._onClick = onClick;
        backdrop.addEventListener('click', onClick);
        // esc to close
        const onKey = (e)=>{ if(e.key==='Escape') hideFormModal(); };
        document.addEventListener('keydown', onKey);
        backdrop._onKey = onKey;
        // focus first input
        setTimeout(()=>{ const first = form.querySelector('input,select,textarea'); first && first.focus(); },50);
    }

    function hideFormModal(){
        const backdrop = document.getElementById('formBackdrop');
        if(!backdrop) return;
        backdrop.setAttribute('aria-hidden','true');
        backdrop.setAttribute('inert','');
        form.classList.remove('floating-form');
        form.style.display = 'none';
        // remove handlers
        if(backdrop._onClick) backdrop.removeEventListener('click', backdrop._onClick);
        if(backdrop._onKey) document.removeEventListener('keydown', backdrop._onKey);
        delete backdrop._onClick; delete backdrop._onKey;
    }

    function render(){
        const data = read(DB);
        table.innerHTML = data.map((d,i)=>`
            <tr>
                <td>${d.codigo}</td>
                <td>${d.identificacion}</td>
                <td>${d.nombres} ${d.apellidos}</td>
                <td>${d.email}</td>
                <td>${d.area}</td>
                <td>${d.foto ? `<img src="${d.foto}" width="40" />` : ""}</td>
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
                const d = read(DB)[i];
                root.querySelector("#codigo").value = d.codigo;
                root.querySelector("#identificacion").value = d.identificacion;
                root.querySelector("#nombres").value = d.nombres;
                root.querySelector("#apellidos").value = d.apellidos;
                root.querySelector("#email").value = d.email;
                root.querySelector("#area").value = d.area;
                root.querySelector("#foto").value = d.foto||"";
                editIndex = i;
                saveBtn.textContent = "Actualizar";
            });
        });

        table.querySelectorAll("button[data-del]").forEach(btn=>{
            btn.addEventListener("click", (e)=>{
                const i = +e.currentTarget.dataset.del;
                const cursos = read("cursos");
                const docente = read(DB)[i];
                const asociado = cursos.some(c => c.docente === docente.codigo || c.docente === docente.email);
                if(asociado){
                    alert("No se puede eliminar: el docente está asociado a un curso.");
                    return;
                }
                const data = read(DB);
                data.splice(i,1);
                write(DB, data);
                render();
            });
        });
    }
}

function renderPublicView(root){
    const data = read(DB);
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = data.map(d=>`
        <div class="card-item">
            ${d.foto ? `<img src="${d.foto}" alt="${d.nombres} ${d.apellidos}"/>` : `<div style="width:100%;height:140px;background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;">Sin foto</div>`}
            <div class="card-item-body">
                <h4>${d.nombres} ${d.apellidos}</h4>
                <p class="meta"><strong>Área:</strong> ${d.area||'-'}</p>
                <p class="meta"><strong>Email:</strong> ${d.email||'-'}</p>
            </div>
        </div>
    `).join('');
    
    const section = root.querySelector('section[data-page-root]');
    if(section){
        section.appendChild(grid);
    }
}