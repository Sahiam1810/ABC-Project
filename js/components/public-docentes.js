import { read } from '../localstore.js';

class PublicDocentes extends HTMLElement{
    connectedCallback(){ this.render(); }
    refresh(){ this.render(); }
    render(){
        const db = read();
        this.innerHTML = `
            <section class="toolbar"><h2>Docentes</h2></section>
            <div class="cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px"></div>`;
        const box = this.querySelector('.cards');

        db.docentes.forEach(d=>{
        const cursos = db.cursos.filter(c=>c.docenteCodigo===d.codigo).map(c=>c.nombre);
        const card = document.createElement('docente-card');
        card.data = { ...d, cursoNombre: (cursos[0]||'Sin curso'), cursosTexto: cursos.join(', ') };
        box.append(card);
    });

    if(!db.docentes.length)
        box.innerHTML = '<div class="card">No hay docentes registrados.</div>';
    }
}
customElements.define('public-docentes', PublicDocentes);

