// js/components/curso-detail.js
import { read } from '../localstore.js';

class CursoDetail extends HTMLElement{
    connectedCallback(){
        this.innerHTML=`<div class="modal" id="m"><div class="box">
        <header><h3 id="t">Curso</h3>
        <button class="btn outline" id="x">Cerrar</button></header>
        <div id="c"></div></div></div>`;
        this.querySelector('#x').onclick=()=>this.close();
    }
    open(codigo){
        const db=read(); const c=db.cursos.find(x=>x.codigo===codigo);
        if(!c) return;
        const doc=db.docentes.find(d=>d.codigo===c.docenteCodigo);
        const mods=db.modulos.filter(m=>m.cursoCodigo===c.codigo);

        const wrap=document.createElement('div');
        wrap.innerHTML=`<div class="grid">
            <div>
                <img src="${c.foto||'https://via.placeholder.com/640x220?text=Curso'}"
                    style="width:100%;height:220px;object-fit:cover;border-radius:12px">
                    <p style="margin-top:8px">${c.descripcion||''}</p>
                <div class="badge">Docente: ${doc?doc.nombres+' '+doc.apellidos:'—'}</div>
            </div>
            <div>
                <b>Módulos</b>
                <div id="mods" style="display:flex;flex-direction:column;gap:8px;margin-top:6px"></div>
            </div>
            </div>`;

    const modsBox=wrap.querySelector('#mods');
    if(!mods.length) modsBox.innerHTML='<div class="card">Sin módulos.</div>';
    mods.forEach(m=>{
        const item=document.createElement('div');
        item.className='card'; item.style.cursor='pointer';
        item.innerHTML=`<b>${m.nombre}</b><p style="margin:6px 0 0">${m.descripcion||''}</p>
                        <div class="badge">Ver lecciones</div>`;
        item.onclick=()=>this.showLecciones(m,db);
        modsBox.append(item);
    });

    this.querySelector('#t').textContent=c.nombre;
    const cont=this.querySelector('#c'); cont.innerHTML=''; cont.append(wrap);
    this.querySelector('#m').classList.add('show');
    }
    showLecciones(mod,db){
        const list=db.lecciones.filter(l=>l.moduloCodigo===mod.codigo);
        const box=document.createElement('div');
        box.innerHTML=`<h4>Lecciones de ${mod.nombre}</h4>`;
        if(!list.length){ box.innerHTML+=`<div class="card">Sin lecciones.</div>`; }
        list.forEach(l=>{
            const it=document.createElement('div'); it.className='card';
            const media=(l.media||[]).map(u=>`<li><a href="${u}" target="_blank">Recurso</a></li>`).join('');
            it.innerHTML=`<b>${l.titulo}</b> <span class="badge">${l.horas||1} h</span>
                <p style="margin:6px 0">${l.contenido||''}</p>${media?`<ul>${media}</ul>`:''}`;
            box.append(it);
        });
        const c=this.querySelector('#c'); c.innerHTML=''; c.append(box);
    }
    close(){ this.querySelector('#m').classList.remove('show'); }
}
customElements.define('curso-detail', CursoDetail);
