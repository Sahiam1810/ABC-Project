import { read } from '../localstore.js';

class PublicCursos extends HTMLElement{
    connectedCallback(){ this.render(); }
    refresh(){ this.render(); }
    render(){
        const db=read();
        const visibles=db.cursos.filter(c=>c.visible!==false);
        this.innerHTML=`<section class="toolbar"><h2>Cursos</h2></section>
            <div class="cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px"></div>`;
        const box=this.querySelector('.cards');
        visibles.forEach(c=>{
            const card=document.createElement('curso-card');
            const doc=db.docentes.find(d=>d.codigo===c.docenteCodigo);
            card.data={...c, docenteNombre: doc?`${doc.nombres} ${doc.apellidos}`:'—'};
            card.onclick=()=>document.querySelector('curso-detail').open(c.codigo);
            box.append(card);
        });
        if(!visibles.length) box.innerHTML='<div class="card">No hay cursos públicos.</div>';
        
        if(!document.querySelector('curso-detail')) document.body.appendChild(document.createElement('curso-detail'));
    }
}
customElements.define('public-cursos',PublicCursos);