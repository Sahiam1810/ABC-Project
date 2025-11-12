class ModalBox extends HTMLElement{
    connectedCallback(){ this.innerHTML=`<div class="modal" id="m"><div class="box">
            <header><h3 id="t">Modal</h3><button class="btn outline" id="x">Cerrar</button></header>
            <div id="c"></div></div></div>`; 
        this.querySelector('#x').onclick=()=>this.hide();
    }
    show(title,content){ this.querySelector('#t').textContent=title;
        this.querySelector('#c').innerHTML=''; this.querySelector('#c').append(content);
        this.querySelector('#m').classList.add('show');
    }
    hide(){ this.querySelector('#m').classList.remove('show'); this.querySelector('#c').innerHTML=''; }
}
customElements.define('modal-box',ModalBox);
export const modal=()=>document.querySelector('modal-box');
