class DocenteCard extends HTMLElement{
    set data(v){ this._d=v; this.render(); }
    render(){
        const d=this._d||{};
        this.innerHTML=`
        
        <article class="card" style="text-align:center">
            <img src="${d.foto||'https://via.placeholder.com/240x140?text=Docente'}"
                style="width:100%;height:140px;object-fit:cover;border-radius:12px" alt="">
            <h4 style="margin:10px 0 4px">${d.nombres||''} ${d.apellidos||''}</h4>
            <div style="font-size:12px;color:#666">${d.email||''}
            </div>
            <div class="badge" style="margin-top:6px">${d.cursosTexto||d.cursoNombre||'—'}
            </div>
        </article>`;
    }
}
customElements.define('docente-card', DocenteCard);

