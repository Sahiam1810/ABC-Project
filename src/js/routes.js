import { isAdmin } from "./auth.js";

const PAGE_MODULES = {
  dashboard: () => import("../components/dashboard.js"),
  docentes: () => import("../components/docentes.js"),
  cursos: () => import("../components/cursos.js"),
  administrativos: () => import("../components/administrativos.js"),
  modulos: () => import("../components/modulos.js"),
  lecciones: () => import("../components/lecciones.js"),
  explorar: () => import("../components/explorar.js"),
};

// Only the administrativos section requires an admin session to access the CRUD.
const PROTECTED = new Set(["administrativos"]);

export async function loadPage(page){
  const container = document.getElementById("app");
  const pageUrl = new URL(`./src/pages/${page}.html`, window.location.href);
  try{
    if(PROTECTED.has(page) && !isAdmin()){
      container.innerHTML = `<section class="card"><h3>Acceso restringido</h3><p>Debes iniciar sesión como administrativo para acceder a esta sección.</p><p><a class="btn" href="./src/pages/login.html">Ir a Login</a></p></section>`;
      return;
    }
    const resp = await fetch(pageUrl.href);
    if(!resp.ok) throw new Error("No se pudo cargar la página");
    const html = await resp.text();
    container.innerHTML = html;

    const importer = PAGE_MODULES[page];
    if(importer){
      const mod = await importer();
      if(typeof mod.init === "function"){
        await mod.init(container);
      }
    }
  }catch(err){
    container.innerHTML = `<div class="card" style="color:#c62828">${err.message}</div>`;
    console.error(err);
  }
}
window.loadPage = loadPage;
