// js/components/curso-card.js
class CursoCard extends HTMLElement{
    set data(v){ this._c=v; this.render(); }
    render(){
        const c=this._c||{};
        this.innerHTML=`<article class="card" style="cursor:pointer">
            <img src="${c.foto||'https://via.placeholder.com/320x160?text=Curso'}"
                style="width:100%;height:160px;object-fit:cover;border-radius:12px" alt="">
            <h3 style="margin:10px 0 4px">${c.nombre||''}</h3>
            <small>Docente: ${c.docenteNombre||'—'}</small>
            <p style="margin:8px 0 0;color:#555">
                ${(c.descripcion||'').slice(0,110)}${(c.descripcion||'').length>110?'...':''}
            </p>
        </article>`;
    }
}
customElements.define('curso-card', CursoCard);
