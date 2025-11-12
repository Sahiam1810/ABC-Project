import { getSession, setSession, initDB } from '../localstore.js';

class LoginFloat extends HTMLElement{
    connectedCallback(){
        this.innerHTML=`<div class="modal" id="m"><div class="box">
        <header><h3>Inicio de sesión</h3>
        <button class="btn outline" id="x">Cerrar</button></header>
        <div>
            <form class="grid" id="f">
            <label>Email<input type="email" name="email" required></label>
            <label>Contraseña<input type="password" name="password" required></label>
            <div class="actions"><button class="btn ok">Ingresar</button></div>
            <small>Admin demo: admin@abc.edu / 12345</small>
            </form>
        </div></div></div>`;
        this.querySelector('#x').onclick=()=>this.close();
        this.querySelector('#f').onsubmit=e=>{
            e.preventDefault(); initDB();
            const fd=Object.fromEntries(new FormData(e.target).entries());
            const { administrativos } = initDB();
            const ok=administrativos.find(a=>a.email===fd.email && a.password===fd.password);
            if(ok){ setSession(ok); location.href='admin.html'; }
            else alert('Credenciales inválidas');
        };
    }
    open(){ this.querySelector('#m').classList.add('show'); }
    close(){ this.querySelector('#m').classList.remove('show'); }
}
customElements.define('login-float',LoginFloat);