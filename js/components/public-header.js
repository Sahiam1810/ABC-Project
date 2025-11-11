class PublicHeader extends HTMLElement{
    connectedCallback(){
        this.innerHTML=`<header class="app">
            <nav class="toolbar" style="max-width:1100px;margin:auto">
            <h1>LMS ABC</h1>
            <div style="display:flex;gap:10px;align-items:center">
                <a class="tab active" data-go="home">Inicio</a>
                <a class="tab" data-go="docentes">Docentes</a>
                <a class="tab" data-go="cursos">Cursos</a>
                <button id="login" class="btn outline">Ingresar</button>
            </div>
        </nav>
        </header>`;
        this.tabs=[...this.querySelectorAll('.tab')];
        this.tabs.forEach(t=>t.onclick=()=>this.navigate(t.dataset.go,t));
        this.querySelector('#login').onclick=()=>document.querySelector('login-float').open();
    }
    navigate(route,el){
        this.tabs.forEach(t=>t.classList.remove('active')); el.classList.add('active');
        document.querySelectorAll('[data-route]').forEach(v=>{
            v.style.display = v.getAttribute('data-route')===route?'block':'none';
            if(v.refresh) v.refresh(); // re-render si existe
        });
    }
}
customElements.define('public-header',PublicHeader);