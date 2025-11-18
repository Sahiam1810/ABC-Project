import { read, write, getSession, logout, initDB } from '../localstore.js';
import './crud-administrativos.js'; import './crud-docentes.js';
import './crud-cursos.js'; import './crud-modulos.js'; import './crud-lecciones.js';
import './crud-estudiantes.js'

class AdminDashboard extends HTMLElement{
    connectedCallback(){
        initDB(); const u=getSession();
        if(!u){ location.href='index.html'; return; }
        this.render(); this.mount();
    }
    render(){
        this.innerHTML=`
        <header class="app">
        <nav class="toolbar">
            <h1>Panel LMS ABC</h1>
            <div class="user"><span class="badge">${getSession().email}</span>
            <button id="out" class="btn outline">Salir</button></div>
        </nav>
        </header>

        <main>
        <section class="kpis">
            <div class="card"><b>Cursos activos</b><div id="kCursos" style="font-size:26px">0</div></div>
            <div class="card"><b>Docentes</b><div id="kDoc" style="font-size:26px">0</div></div>
            <div class="card"><b>Administrativos</b><div id="kAdm" style="font-size:26px">0</div></div>
        </section>

        <div class="tabs">
            <span class="tab active" data-tab="cursos">Cursos</span>
            <span class="tab" data-tab="modulos">Módulos</span>
            <span class="tab" data-tab="lecciones">Lecciones</span>
            <span class="tab" data-tab="docentes">Docentes</span>
            <span class="tab" data-tab="admins">Administrativos</span>
            <span class="tab" data-tab="estudiantes">Estudiantes</span>
        </div>

        <section class="grid">
            <div class="card" id="panel"></div>
            <div class="card">
            <b>Misión</b>
            <p>Facilitar el acceso al aprendizaje digital en la institución...</p>
            <hr />
            <b>Visión</b>
            <p>Ser plataforma líder en gestión académica y aprendizaje virtual...</p>
            </div>
        </section>
    </main>`;
}
mount(){
    this.querySelector('#out').onclick=()=>{logout();location.href='index.html'}
    this.tabs=[...this.querySelectorAll('.tab')];
    this.tabs.forEach(t=>t.onclick=()=>this.open(t.dataset.tab,t));
    this.open('cursos',this.tabs[0]); this.updateKpis();
}
updateKpis(){
    const db=read();
    this.querySelector('#kCursos').textContent=db.cursos.length;
    this.querySelector('#kDoc').textContent=db.docentes.length;
    this.querySelector('#kAdm').textContent=db.administrativos.length;
}
open(tab,el){
    this.tabs.forEach(t=>t.classList.remove('active')); el.classList.add('active');
    const host=this.querySelector('#panel'); host.innerHTML='';
    const map={
        cursos:'crud-cursos',
        modulos:'crud-modulos',
        lecciones:'crud-lecciones',
        docentes:'crud-docentes',
        admins:'crud-administrativos',
        estudiantes: 'crud-estudiantes'
    };
    host.append(document.createElement(map[tab]));
    host.firstElementChild.addEventListener('db:changed',()=>this.updateKpis());
    }
}
customElements.define('admin-dashboard',AdminDashboard);