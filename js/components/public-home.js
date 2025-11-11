import { read, initDB } from '../localstore.js';

class PublicHome extends HTMLElement{
    connectedCallback(){ initDB(); this.render(); }
    refresh(){ this.render(); }
    render(){
        const db=read(); const k1=db.cursos.length, k2=db.docentes.length, k3=db.administrativos.length;
        this.innerHTML=`<section class="card" style="margin-bottom:14px">
            <h2>Dashboard</h2>
            <div class="kpis" style="margin-top:10px">
                <div class="card"><b>Cursos activos</b><div style="font-size:28px">${k1}</div></div>
                <div class="card"><b>Docentes</b><div style="font-size:28px">${k2}</div></div>
                <div class="card"><b>Administrativos</b><div style="font-size:28px">${k3}</div></div>
            </div>
            </section>
            <section class="grid">
                <div class="card"><h3>Misión</h3><p>Facilitar el acceso al aprendizaje digital mediante una plataforma intuitiva.</p></div>
                <div class="card"><h3>Visión</h3><p>Ser líderes en gestión académica virtual del ámbito educativo colombiano.</p></div>
            </section>`;
    }
}
customElements.define('public-home',PublicHome);