export default function Home() {
    const container = document.createElement("div");
    container.classList.add("p-6");

    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-4">Bienvenido</h1>
        <p>Panel principal del sistema administrativo.</p>
        <p class="mt-2 text-gray-600">
            Usa el menú superior o la barra lateral para navegar entre las secciones.
        </p>
    `;

    return container;
}

