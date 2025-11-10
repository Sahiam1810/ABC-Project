import { read } from "../js/storage.js";
export function init(root){
    const cursos = read("cursos").filter(c=>c.visibilidad==='publico');
    const docentes = read("docentes");
    const admins = read("administrativos");
    root.querySelector("#metric-cursos").textContent = cursos.length;
    root.querySelector("#metric-docentes").textContent = docentes.length;
    root.querySelector("#metric-admins").textContent = admins.length;
}