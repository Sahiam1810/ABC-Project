import { read } from "../js/storage.js";
export function init(root){
    const input = root.querySelector("#search");
    const cards = root.querySelector("#cards");

    function stats(codigoCurso){
        const modulos = read("modulos").filter(m => m.cursoCodigo === codigoCurso);
        const lecciones = read("lecciones").filter(l => modulos.some(m => m.codigo === l.moduloCodigo));
        return { mods: modulos.length, lecs: lecciones.length };
    }

    function render(){
        const cursos = read("cursos").filter(c => c.visibilidad === "publico");
        const q = (input.value||"").trim().toLowerCase();
        const filtrados = cursos.filter(c => q ? (c.nombre + " " + (c.etiquetas||"")).toLowerCase().includes(q) : true);
        cards.innerHTML = filtrados.map(c => {
            const {mods, lecs} = stats(c.codigo);
            return `<div class="card course">
                <h3>${c.nombre}</h3>
                <div class="meta">Docente: ${c.docente} • Duración: ${c.duracion||"-"}h</div>
                <p>${c.descripcion||""}</p>
                <div class="meta">Módulos: ${mods} • Lecciones: ${lecs}</div>
                <div class="meta">Etiquetas: ${(c.etiquetas||"").split(',').map(x=>x.trim()).filter(Boolean).map(x=>`<span class="badge">${x}</span>`).join(' ')}</div>
            </div>`;
        }).join("");
    }

    input.addEventListener("input", render);
    render();
}