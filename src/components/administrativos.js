import { read, write } from "../js/storage.js";

const DB = "administrativos";
let editIndex = -1; // -1 significa modo creación

// Ejecutar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    const btnSave = document.querySelector('#save');
    const dataTable = document.querySelector('#dataTable');

    if (!btnSave) return; // si el formulario no está en esta página

    // Cargar lista inicial
    loadData();

    // Delegación de eventos para editar/eliminar en la tabla
    dataTable.addEventListener('click', (e) => {
        const target = e.target;
        const idx = target.closest('[data-index]')?.dataset.index;

        // Eliminar
        if (target.classList.contains('btn-delete')) {
            e.preventDefault();
            const index = Number(idx);
            if (Number.isNaN(index)) return;
            const items = read(DB) || [];
            items.splice(index, 1);
            write(DB, items);
            loadData();
            return;
        }

        // Editar
        if (target.classList.contains('btn-edit')) {
            e.preventDefault();
            const index = Number(idx);
            const items = read(DB) || [];
            const item = items[index];
            if (!item) return;
            // Llenar formulario con los datos
            document.getElementById('identificacion').value = item.identificacion || '';
            document.getElementById('nombres').value = item.nombres || '';
            document.getElementById('apellidos').value = item.apellidos || '';
            document.getElementById('email').value = item.email || '';
            document.getElementById('telefono').value = item.telefono || '';
            document.getElementById('cargo').value = item.cargo || '';
            editIndex = index;
            btnSave.value = 'Actualizar';
            return;
        }
    });

    // Guardar o actualizar
    btnSave.addEventListener('click', (event) => {
        event.preventDefault();

        const identificacion = document.getElementById('identificacion')?.value?.trim() || '';
        const nombres = document.getElementById('nombres')?.value?.trim() || '';
        const apellidos = document.getElementById('apellidos')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const telefono = document.getElementById('telefono')?.value?.trim() || '';
        const cargo = document.getElementById('cargo')?.value?.trim() || '';

        // Validación mínima
        if (!identificacion || !nombres) {
            alert('Por favor complete al menos identificación y nombres.');
            return;
        }

        const items = read(DB) || [];

        if (editIndex >= 0) {
            // Actualizar registro existente
            items[editIndex] = { identificacion, nombres, apellidos, email, telefono, cargo };
            write(DB, items);
            alert('✅ Administrativo actualizado correctamente.');
            editIndex = -1;
            btnSave.value = 'Guardar';
        } else {
            // Nuevo registro
            items.push({ identificacion, nombres, apellidos, email, telefono, cargo });
            write(DB, items);
            alert('✅ Administrativo guardado correctamente.');
        }

        // Reset formulario y recargar tabla
        const form = document.querySelector('form');
        if (form) form.reset();
        loadData();
    });
});

// Función para recargar datos en la tabla
function loadData() {
    const data = read(DB) || [];
    const dataTable = document.querySelector('#dataTable');
    if (!dataTable) return;

    dataTable.innerHTML = data.map((admin, i) => {
        return `
            <tr data-index="${i}">
                <td>${admin.identificacion || ''}</td>
                <td>${admin.nombres || ''}</td>
                <td>${admin.apellidos || ''}</td>
                <td>${admin.email || ''}</td>
                <td>${admin.telefono || ''}</td>
                <td>${admin.cargo || ''}</td>
                <td>
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}


