import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "docentes";
export function init(root){
    const form = root.querySelector("#frmDocente");
    const saveBtn = root.querySelector("#save");
    const table = root.querySelector("#dataTable");
    let editIndex = -1;

    if(!isAdmin()){
        const banner = document.createElement("div");
        banner.className = "card";
        banner.innerHTML = `<strong>Vista de solo lectura.</strong> Inicia sesión para crear/editar/eliminar.`;
        root.prepend(banner);
        form?.querySelectorAll("input,textarea,select,button").forEach(el=>{ if(el.type !== "button") el.disabled = true; });
    } 

    render();

    saveBtn.addEventListener("click", ()=>{
        if(!isAdmin()) return;
        const docente = {
            codigo: root.querySelector("#codigo").value.trim(),
            identificacion: root.querySelector("#identificacion").value.trim(),
            nombres: root.querySelector("#nombres").value.trim(),
            apellidos: root.querySelector("#apellidos").value.trim(),
            email: root.querySelector("#email").value.trim(),
            area: root.querySelector("#area").value.trim(),
            foto: root.querySelector("#foto").value.trim()
        };
        if(!docente.codigo || !docente.identificacion || !docente.nombres || !docente.apellidos || !docente.email || !docente.area){
            alert("Completa todos los campos obligatorios");
            return;
        }
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
        render();
    });

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