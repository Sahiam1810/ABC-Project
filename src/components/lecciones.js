import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "lecciones";
export function init(root){
    const form = root.querySelector("#frmLeccion");
    const saveBtn = root.querySelector("#save");
    const table = root.querySelector("#dataTable");
    const ddlModulo = root.querySelector("#moduloCodigo");
    let editIndex = -1;

    function loadModulos(){
        const modulos = read("modulos");
        ddlModulo.innerHTML = `<option value="">-- Selecciona módulo --</option>` +
            modulos.map(m=>`<option value="${m.codigo}">${m.codigo} - ${m.nombre}</option>`).join("");
    }

    if(!isAdmin()){
        const banner = document.createElement("div");
        banner.className = "card";
        banner.innerHTML = `<strong>Vista de solo lectura.</strong> Inicia sesión para crear/editar/eliminar.`;
        root.prepend(banner);
        // Ocultar formulario y tabla para usuarios públicos
        if(form) form.style.display = 'none';
        const tableParent = table?.closest('.card');
        if(tableParent) tableParent.style.display = 'none';
    }

    loadModulos();
    
    if(!isAdmin()){
        renderPublicView(root);
    } else {
        render();
    }

    saveBtn.addEventListener("click", ()=>{
        if(!isAdmin()) return;
        const multimediaInput = root.querySelector("#multimedia");
        const multimediaFile = multimediaInput?.files?.[0];
        
        if(multimediaFile){
            const reader = new FileReader();
            reader.onload = (e)=>{
                const leccion = {
                    id: cryptoRandom(),
                    titulo: root.querySelector("#titulo").value.trim(),
                    intensidad: root.querySelector("#intensidad").value.trim(),
                    moduloCodigo: ddlModulo.value,
                    contenido: root.querySelector("#contenido").value.trim(),
                    multimedia: e.target.result
                };
                if(!leccion.titulo || !leccion.intensidad || !leccion.moduloCodigo){
                    alert("Título, Intensidad y Módulo son obligatorios");
                    return;
                }
                saveLeccion(leccion);
            };
            reader.readAsDataURL(multimediaFile);
        } else {
            const leccion = {
                id: cryptoRandom(),
                titulo: root.querySelector("#titulo").value.trim(),
                intensidad: root.querySelector("#intensidad").value.trim(),
                moduloCodigo: ddlModulo.value,
                contenido: root.querySelector("#contenido").value.trim(),
                multimedia: ""
            };
            if(!leccion.titulo || !leccion.intensidad || !leccion.moduloCodigo){
                alert("Título, Intensidad y Módulo son obligatorios");
                return;
            }
            saveLeccion(leccion);
        }
    });

    function saveLeccion(leccion){
        const data = read(DB);
        if(editIndex === -1){
            data.push(leccion);
        }else{
            leccion.id = data[editIndex].id;
            data[editIndex] = leccion;
            editIndex = -1;
            saveBtn.textContent = "Guardar";
        }
        write(DB, data);
        form.reset();
        render();
    }

    function render(){
        const data = read(DB);
        table.innerHTML = data.map((l,i)=>`
            <tr>
                <td>${l.titulo}</td>
                <td>${l.intensidad}</td>
                <td>${l.moduloCodigo}</td>
                <td>${l.multimedia ? `<img src="${l.multimedia}" width="40" />` : ""}</td>
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
                const l = read(DB)[i];
                root.querySelector("#titulo").value = l.titulo;
                root.querySelector("#intensidad").value = l.intensidad;
                ddlModulo.value = l.moduloCodigo;
                root.querySelector("#contenido").value = l.contenido||"";
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

    function cryptoRandom(){
        try{ return crypto.randomUUID(); }catch{ return 'L'+Math.random().toString(36).slice(2); }
    }
}

function renderPublicView(root){
    const data = read(DB);
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = data.map(l=>`
        <div class="card-item">
            <img src="${l.multimedia || 'https://via.placeholder.com/400x140?text=' + l.titulo}" alt="${l.titulo}"/>
            <div class="card-item-body">
                <h4>${l.titulo}</h4>
                <p class="meta"><strong>Intensidad:</strong> ${l.intensidad||'-'}</p>
                <p class="meta"><strong>Módulo:</strong> ${l.moduloCodigo||'-'}</p>
            </div>
        </div>
    `).join('');
    
    const section = root.querySelector('section[data-page-root]');
    if(section){
        section.appendChild(grid);
    }
}