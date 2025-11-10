import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "modulos";
export function init(root){
    const form = root.querySelector("#frmModulo");
    const saveBtn = root.querySelector("#save");
    const table = root.querySelector("#dataTable");
    const ddlCurso = root.querySelector("#cursoCodigo");
    let editIndex = -1;

    function loadCursos(){
        const cursos = read("cursos");
        ddlCurso.innerHTML = `<option value="">-- Selecciona curso --</option>` +
            cursos.map(c=>`<option value="${c.codigo}">${c.codigo} - ${c.nombre}</option>`).join("");
    }

    if(!isAdmin()){
        const banner = document.createElement("div");
        banner.className = "card";
        banner.innerHTML = `<strong>Vista de solo lectura.</strong> Inicia sesión para crear/editar/eliminar.`;
        root.prepend(banner);
        if(form) form.style.display = 'none';
        const tableParent = table?.closest('.card');
        if(tableParent) tableParent.style.display = 'none';
    }

    loadCursos();
    
    if(!isAdmin()){
        renderPublicView(root);
    } else {
        render();
    }

    saveBtn.addEventListener("click", ()=>{
        if(!isAdmin()) return;
        const imagenInput = root.querySelector("#imagen");
        const imagenFile = imagenInput?.files?.[0];
        
        if(imagenFile){
            const reader = new FileReader();
            reader.onload = (e)=>{
                const modulo = {
                    codigo: root.querySelector("#codigo").value.trim(),
                    cursoCodigo: ddlCurso.value,
                    nombre: root.querySelector("#nombre").value.trim(),
                    descripcion: root.querySelector("#descripcion").value.trim(),
                    imagen: e.target.result
                };
                if(!modulo.codigo || !modulo.cursoCodigo || !modulo.nombre){
                    alert("Código, Curso y Nombre son obligatorios");
                    return;
                }
                saveModulo(modulo);
            };
            reader.readAsDataURL(imagenFile);
        } else {
            const modulo = {
                codigo: root.querySelector("#codigo").value.trim(),
                cursoCodigo: ddlCurso.value,
                nombre: root.querySelector("#nombre").value.trim(),
                descripcion: root.querySelector("#descripcion").value.trim(),
                imagen: ""
            };
            if(!modulo.codigo || !modulo.cursoCodigo || !modulo.nombre){
                alert("Código, Curso y Nombre son obligatorios");
                return;
            }
            saveModulo(modulo);
        }
    });

    function saveModulo(modulo){
        const data = read(DB);
        if(editIndex === -1){
            data.push(modulo);
        }else{
            data[editIndex] = modulo;
            editIndex = -1;
            saveBtn.textContent = "Guardar";
        }
        write(DB, data);
        form.reset();
        render();
    }

    function render(){
        const data = read(DB);
        table.innerHTML = data.map((m,i)=>`
            <tr>
                <td>${m.codigo}</td>
                <td>${m.cursoCodigo}</td>
                <td>${m.nombre}</td>
                <td>${m.descripcion||""}</td>
                <td>${m.imagen ? `<img src="${m.imagen}" width="40" />` : ""}</td>
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
                const m = read(DB)[i];
                root.querySelector("#codigo").value = m.codigo;
                ddlCurso.value = m.cursoCodigo;
                root.querySelector("#nombre").value = m.nombre;
                root.querySelector("#descripcion").value = m.descripcion||"";
                editIndex = i;
                saveBtn.textContent = "Actualizar";
            });
        });

        table.querySelectorAll("button[data-del]").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const i = +e.currentTarget.dataset.del;
                const lecciones = read("lecciones");
                const m = read(DB)[i];
                const tiene = lecciones.some(l => l.moduloCodigo === m.codigo);
                if(tiene){
                    alert("No se puede eliminar: el módulo tiene lecciones asociadas.");
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
    grid.innerHTML = data.map(m=>`
        <div class="card-item">
            <img src="${m.imagen || 'https://via.placeholder.com/400x140?text=' + m.nombre}" alt="${m.nombre}"/>
            <div class="card-item-body">
                <h4>${m.nombre}</h4>
                <p class="meta"><strong>Curso:</strong> ${m.cursoCodigo||'-'}</p>
                <p class="meta">${(m.descripcion||'').slice(0,80)}${(m.descripcion||'').length>80?'...':''}</p>
            </div>
        </div>
    `).join('');
    
    const section = root.querySelector('section[data-page-root]');
    if(section){
        section.appendChild(grid);
    }
}