import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "cursos";

export function init(root){
    const form = root.querySelector("#frmCurso");
    const saveBtn = root.querySelector("#save");
    const addBtn = root.querySelector("#addCurso");
    const table = root.querySelector("#dataTable");
    let editIndex = -1;


    const filterBar = document.createElement("div");
    filterBar.className = "card";
    filterBar.innerHTML = `
        <div class="grid grid-3">
            <input id="q" placeholder="Buscar por nombre o etiqueta"/>
            <select id="fVis">
                <option value="">Todas las visibilidades</option>
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
            </select>
            <button class="btn" id="apply">Aplicar filtros</button>
        </div>`;


    const formEl = root.querySelector("#frmCurso");
    if (formEl && formEl.parentNode) {
    formEl.parentNode.insertBefore(filterBar, formEl.nextSibling);
    } else {
        (root.querySelector("section[data-page-root]") || root).appendChild(filterBar);
    }

    if(!isAdmin()){
        // Ocultar formulario, tabla, filtros y botón Añadir para usuarios públicos
        if(form) form.style.display = 'none';
        if(addBtn) addBtn.style.display = 'none';
        filterBar.style.display = 'none';
        const tableParent = table?.closest('.card');
        if(tableParent) tableParent.style.display = 'none';
    }

    function getFilters(){
        return {
            q: filterBar.querySelector("#q").value.trim().toLowerCase(),
            vis: filterBar.querySelector("#fVis").value
        };
    }

    filterBar.querySelector("#apply").addEventListener("click", render);
    
    if(!isAdmin()){
        renderPublicView(root);
    } else {
        render();
    }

    if(addBtn){
        addBtn.addEventListener('click', ()=>{
            if(!isAdmin()){ alert('Solo administradores pueden crear cursos.'); return; }
            showFormModal();
        });
    }

    saveBtn.addEventListener("click", async ()=>{
        if(!isAdmin()) return;
        const imagenInput = root.querySelector("#imagen");
        const imagenFile = imagenInput?.files?.[0];

        try{
            let imagenData = "";
            if(imagenFile){
                // compress image to reduce size before storing
                imagenData = await compressImage(imagenFile, 1000, 0.75);
            }

            const curso = {
                codigo: root.querySelector("#codigo").value.trim(),
                nombre: root.querySelector("#nombre").value.trim(),
                descripcion: root.querySelector("#descripcion").value.trim(),
                docente: root.querySelector("#docente").value.trim(),
                duracion: root.querySelector("#duracion").value.trim(),
                etiquetas: root.querySelector("#etiquetas").value.trim(),
                imagen: imagenData,
                visibilidad: root.querySelector("#visibilidad").value,
                createdAt: new Date().toISOString()
            };
            if(!curso.codigo || !curso.nombre || !curso.docente){
                alert("Código, Nombre y Docente son obligatorios");
                return;
            }

            const docentes = read("docentes");
            const existeDocente = docentes.some(d => d.codigo === curso.docente || d.email === curso.docente);
            if(!existeDocente){
                if(!confirm("El docente no existe. ¿Deseas guardar de todas formas?")) return;
            }
            saveCurso(curso);
        }catch(err){
            console.error(err);
            alert('Error procesando la imagen. Intenta con una imagen más pequeña.');
        }
    });

    function saveCurso(curso){
        const data = read(DB);
        if(editIndex === -1){
            data.push(curso);
        }else{
            data[editIndex] = curso;
            editIndex = -1;
            saveBtn.textContent = "Guardar";
        }
        write(DB, data);
        form.reset();
        hideFormModal();
        render();
    }

    // Compress an image file and return a DataURL. Reduces dimensions and quality to avoid exceeding localStorage.
    function compressImage(file, maxWidth = 1000, quality = 0.75){
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onerror = ()=> reject(new Error('File read error'));
            reader.onload = ()=>{
                const img = new Image();
                img.onload = ()=>{
                    const ratio = img.width / img.height;
                    let targetWidth = img.width;
                    let targetHeight = img.height;
                    if(img.width > maxWidth){
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth / ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img,0,0,targetWidth,targetHeight);
                    try{
                        const dataUrl = canvas.toDataURL('image/jpeg', quality);
                        resolve(dataUrl);
                    }catch(e){
                        reject(e);
                    }
                };
                img.onerror = ()=> reject(new Error('Image load error'));
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function render(){
        const data = read(DB);
        const { q, vis } = getFilters();
        const filtered = data.filter(c => {
            const text = (c.nombre + " " + (c.etiquetas||"")).toLowerCase();
            const okQ = q ? text.includes(q) : true;
            const okV = vis ? c.visibilidad === vis : true;
            return okQ && okV;
        });

        table.innerHTML = filtered.map((c,i)=>`
            <tr>
                <td>${c.codigo}</td>
                <td>${c.nombre}</td>
                <td>${c.docente}</td>
                <td>${c.duracion||"-"}</td>
                <td>${c.imagen ? `<img src="${c.imagen}" width="40" />` : ""}</td>
                <td><span class="badge">${c.visibilidad}</span></td>
                <td>
                    ${isAdmin()?`
                        <button class="btn" data-edit="${i}">Editar</button>
                        <button class="btn danger" data-del="${i}">Eliminar</button>
                    `:""}
                </td>
            </tr>
        `).join("");

        if(!isAdmin()) return;

        table.querySelectorAll("button[data-edit]").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const i = +e.currentTarget.dataset.edit;
                const c = filtered[i];
                const all = read(DB);
                const realIndex = all.findIndex(x => x.codigo === c.codigo);
                editIndex = realIndex;
                root.querySelector("#codigo").value = c.codigo;
                root.querySelector("#nombre").value = c.nombre;
                root.querySelector("#descripcion").value = c.descripcion;
                root.querySelector("#docente").value = c.docente;
                root.querySelector("#duracion").value = c.duracion||"";
                root.querySelector("#etiquetas").value = c.etiquetas||"";
                root.querySelector("#visibilidad").value = c.visibilidad;
                saveBtn.textContent = "Actualizar";
            });
        });

        table.querySelectorAll("button[data-del]").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const i = +e.currentTarget.dataset.del;
                const c = filtered[i];
                const modulos = read("modulos");
                const tieneModulos = modulos.some(m => m.cursoCodigo === c.codigo);
                if(tieneModulos){
                    alert("No se puede eliminar: tiene módulos asociados.");
                    return;
                }
                const data = read(DB);
                const idx = data.findIndex(x => x.codigo === c.codigo);
                data.splice(idx,1);
                write(DB, data);
                render();
            });
        });
    }

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
}

function renderPublicView(root){
    const data = read(DB);
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = data.map(c=>`
        <div class="card-item">
            ${c.imagen ? `<img src="${c.imagen}" alt="${c.nombre}"/>` : `<div style="width:100%;height:140px;background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>`}
            <div class="card-item-body">
                <h4>${c.nombre}</h4>
                <p class="meta"><strong>Docente:</strong> ${c.docente||'-'}</p>
                <p class="meta">${(c.descripcion||'').slice(0,80)}${(c.descripcion||'').length>80?'...':''}</p>
            </div>
        </div>
    `).join('');

    // Attach click handlers to open detail overlay with full course info
    setTimeout(()=>{
        const items = grid.querySelectorAll('.card-item');
        items.forEach((el, idx)=>{
            el.style.cursor = 'pointer';
            el.addEventListener('click', ()=>{
                const c = data[idx];
                const modulos = read('modulos').filter(m=>m.cursoCodigo === c.codigo);
                const modulesHtml = modulos.length ? `<ul>${modulos.map(m=>`<li>${m.codigo} - ${m.nombre}</li>`).join('')}</ul>` : '<p>No hay módulos.</p>';
                const html = `
                    <h3>${c.nombre}</h3>
                    ${c.imagen ? `<img src="${c.imagen}" style="max-width:100%;height:auto;margin-bottom:8px"/>` : ''}
                    <p><strong>Código:</strong> ${c.codigo}</p>
                    <p><strong>Docente:</strong> ${c.docente||'-'}</p>
                    <p><strong>Duración:</strong> ${c.duracion||'-'}</p>
                    <p><strong>Etiquetas:</strong> ${c.etiquetas||'-'}</p>
                    <p>${c.descripcion||''}</p>
                    <h4>Módulos</h4>
                    ${modulesHtml}
                `;
                window.showDetail(html);
            });
        });
    },20);
    
    const section = root.querySelector('section[data-page-root]');
    if(section){
        section.appendChild(grid);
    }
}