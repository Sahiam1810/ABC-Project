import { read, write } from "../js/storage.js";

const DB_NAME = "administrativos";

// Función para recargar datos
function loadData() {
    const data = read(DB_NAME);
    const table = document.getElementById("dataTable");
    let rows = "";

    data.forEach((admin, i) => {
    rows += `
        <tr>
            <td>${admin.identificacion}</td>
            <td>${admin.nombres}</td>
            <td>${admin.apellidos}</td>
            <td>${admin.email}</td>
            <td>${admin.telefono}</td>
            <td>${admin.cargo}</td>
            <td>
                <button class="btnEliminar" data-index="${i}">Eliminar</button>
            </td>
        </tr>
    `;
});

table.innerHTML = rows;

  // Activar botones de eliminar
    document.querySelectorAll(".btnEliminar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            const administrativos = read(DB_NAME);
            administrativos.splice(index, 1);
            write(DB_NAME, administrativos);
            loadData();
        });
    });
}

// Ejecutar después de cargar la página
window.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save");
    if (!saveBtn) return; // previene error si se carga en otra vista

    loadData();

    saveBtn.addEventListener("click", (event) => {
    event.preventDefault();

        const identificacion = document.getElementById("identificacion").value;
        const nombres = document.getElementById("nombres").value;
        const apellidos = document.getElementById("apellidos").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("telefono").value;
        const cargo = document.getElementById("cargo").value;

        const administrativos = read(DB_NAME);
        administrativos.push({ identificacion, nombres, apellidos, email, telefono, cargo });
        write(DB_NAME, administrativos);

        alert("✅ Administrativo guardado correctamente.");
        document.getElementById("frmAdmin").reset();
        loadData();
    });
});


