import { read, write } from "../js/storage.js";
import { isAdmin } from "../js/auth.js";
const DB = "lecciones";
export function init(root){
    const form = root.querySelector("#frmLeccion");
    const saveBtn = root.querySelector("#save");
    const table = root.querySelector("#dataTable");
    const addBtn = root.querySelector("#addLeccion");
    const ddlModulo = root.querySelector("#moduloCodigo");
    let editIndex = -1;

    function loadModulos(){
        const modulos = read("modulos");
        ddlModulo.innerHTML = `<option value="">-- Selecciona módulo --</option>` +
            modulos.map(m=>`<option value="${m.codigo}">${m.codigo} - ${m.nombre}</option>`).join("");
    }

    if(!isAdmin()){
        // Ocultar formulario, tabla y botón Añadir para usuarios públicos
        if(form) form.style.display = 'none';
        if(addBtn) addBtn.style.display = 'none';
        const tableParent = table?.closest('.card');
        if(tableParent) tableParent.style.display = 'none';
    }

    loadModulos();
    
    if(!isAdmin()){
        renderPublicView(root);
    } else {
        render();
    }

    if(addBtn){
        addBtn.addEventListener('click', ()=>{
            if(!isAdmin()){ alert('Solo administradores pueden crear lecciones.'); return; }
            showFormModal();
        });
    }

    saveBtn.addEventListener("click", async ()=>{
        if(!isAdmin()) return;
        const imagenInput = root.querySelector("#imagen");
        const imagenFile = imagenInput?.files?.[0];
        const videoInput = root.querySelector("#videoFile");
        const videoFile = videoInput?.files?.[0];

        try{
            let imagenData = "";
            if(imagenFile){
                imagenData = await compressImage(imagenFile, 1200, 0.7);
            }

            let videoData = "";
            if(videoFile){
                // Limit naive localStorage persistence for videos: only accept small files (<= 1MB) into DataURL
                const MAX_BYTES = 1024 * 1024; // 1MB
                if(videoFile.size > MAX_BYTES){
                    if(!confirm('El video es mayor a 1MB y podría no guardarse en el almacenamiento local. ¿Deseas continuar sin guardarlo?')){
                        return;
                    }
                } else {
                    videoData = await new Promise((res, rej)=>{
                        const r = new FileReader();
                        r.onerror = ()=> rej(new Error('File read error'));
                        r.onload = ()=> res(r.result);
                        r.readAsDataURL(videoFile);
                    });
                }
            }

            const leccion = {
                id: cryptoRandom(),
                titulo: root.querySelector("#titulo").value.trim(),
                intensidad: root.querySelector("#intensidad").value.trim(),
                moduloCodigo: ddlModulo.value,
                contenido: root.querySelector("#contenido").value.trim(),
                multimedia: imagenData,
                video: videoData
            };
            if(!leccion.titulo || !leccion.intensidad || !leccion.moduloCodigo){
                alert("Título, Intensidad y Módulo son obligatorios");
                return;
            }
            saveLeccion(leccion);
        }catch(err){
            console.error(err);
            alert('Error procesando los archivos multimedia. Prueba con archivos más pequeños.');
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
        hideFormModal();
        render();
    }

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
        table.innerHTML = data.map((l,i)=>`
            <tr>
                <td>${l.titulo}</td>
                <td>${l.intensidad}</td>
                <td>${l.moduloCodigo}</td>
                <td>${l.multimedia ? `<img src="${l.multimedia}" width="40" />` : (l.video? '🎬' : '')}</td>
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
    grid.innerHTML = data.map(l=>`
        <div class="card-item">
            ${l.multimedia ? `<img src="${l.multimedia}" alt="${l.titulo}"/>` : (l.video? '<div style="width:100%;height:140px;background:#222;color:#fff;display:flex;align-items:center;justify-content:center">Video</div>' : `<div style="width:100%;height:140px;background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;">Sin multimedia</div>`)}
            <div class="card-item-body">
                <h4>${l.titulo}</h4>
                <p class="meta"><strong>Intensidad:</strong> ${l.intensidad||'-'}</p>
                <p class="meta"><strong>Módulo:</strong> ${l.moduloCodigo||'-'}</p>
            </div>
        </div>
    `).join('');

    // Hook clicks to open detail overlay and, for admins, provide upload controls inside the detail
    setTimeout(()=>{
        const items = grid.querySelectorAll('.card-item');
        items.forEach((el, idx)=>{
            el.style.cursor = 'pointer';
            el.addEventListener('click', ()=>{
                const l = data[idx];
                const html = `
                    <h3>${l.titulo}</h3>
                    ${l.multimedia ? `<img src="${l.multimedia}" style="max-width:100%;height:auto;margin-bottom:8px"/>` : ''}
                    ${l.video ? `<video controls style="max-width:100%;display:block;margin-bottom:8px"><source src="${l.video}"></video>` : ''}
                    <p><strong>Intensidad:</strong> ${l.intensidad||'-'}</p>
                    <p><strong>Módulo:</strong> ${l.moduloCodigo||'-'}</p>
                    <p>${l.contenido||''}</p>
                    ${isAdmin()? `
                        <hr/>
                        <h4>Adjuntar / actualizar multimedia</h4>
                        <label>Imagen (PNG/JPG)</label>
                        <input id="detail_imagen" type="file" accept="image/png,image/jpeg" />
                        <div id="preview_imagen" style="margin-top:8px"></div>
                        <label style="margin-top:8px">Video (MP4)</label>
                        <input id="detail_video" type="file" accept="video/mp4,video/*" />
                        <div id="preview_video" style="margin-top:8px"></div>
                        <div style="text-align:right;margin-top:10px">
                            <button class="btn" id="saveMedia">Guardar multimedia</button>
                        </div>
                    ` : ''}
                `;
                window.showDetail(html);

                // After overlay content is added, wire preview and save only for admins
                setTimeout(async ()=>{
                    try{
                        const auth = await import('../js/auth.js');
                        if(!auth.isAdmin()) return;
                    }catch(e){ /* ignore - if we cannot import, assume not admin */ }

                    const detailImagen = document.getElementById('detail_imagen');
                    const previewImagen = document.getElementById('preview_imagen');
                    const detailVideo = document.getElementById('detail_video');
                    const previewVideo = document.getElementById('preview_video');
                    const saveBtn = document.getElementById('saveMedia');

                    if(detailImagen){
                        detailImagen.addEventListener('change', (ev)=>{
                            const f = ev.target.files && ev.target.files[0];
                            if(!f) return; 
                            const r = new FileReader();
                            r.onload = ()=>{ previewImagen.innerHTML = `<img src="${r.result}" style="max-width:100%;height:auto"/>`; };
                            r.readAsDataURL(f);
                        });
                    }
                    if(detailVideo){
                        detailVideo.addEventListener('change', (ev)=>{
                            const f = ev.target.files && ev.target.files[0];
                            if(!f) return;
                            const url = URL.createObjectURL(f);
                            previewVideo.innerHTML = `<video controls style="max-width:100%;display:block"><source src="${url}"></video>`;
                        });
                    }

                    if(saveBtn){
                        saveBtn.addEventListener('click', async ()=>{
                            // get selected files
                            const imgFile = detailImagen?.files?.[0];
                            const vidFile = detailVideo?.files?.[0];
                            let imgData = l.multimedia || '';
                            let vidData = l.video || '';
                            try{
                                if(imgFile){ imgData = await compressImage(imgFile, 1200, 0.7); }
                                if(vidFile){
                                    const MAX_BYTES = 1024 * 1024; // 1MB
                                    if(vidFile.size <= MAX_BYTES){
                                        vidData = await new Promise((res, rej)=>{
                                            const r = new FileReader(); r.onerror = ()=> rej(new Error('read')); r.onload = ()=> res(r.result); r.readAsDataURL(vidFile);
                                        });
                                    } else {
                                        if(!confirm('El video es mayor a 1MB y puede no guardarse en localStorage. ¿Deseas continuar sin guardarlo?')){
                                            return;
                                        }
                                    }
                                }

                                // Update lesson in storage
                                const all = read(DB);
                                const idx = all.findIndex(x=>x.id === l.id);
                                if(idx !== -1){
                                    all[idx].multimedia = imgData;
                                    if(vidData) all[idx].video = vidData;
                                    write(DB, all);
                                    alert('Multimedia guardada.');
                                    window.hideDetail();
                                } else {
                                    alert('No se encontró la lección para actualizar.');
                                }
                            }catch(err){
                                console.error(err);
                                alert('Error guardando archivos. Usa archivos más pequeños.');
                            }
                        });
                    }
                },60);
            });
        });
    },20);
    
    const section = root.querySelector('section[data-page-root]');
    if(section){
        section.appendChild(grid);
    }
}