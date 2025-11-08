export function loadPage(page) {
    const container = document.getElementById('app');

    fetch(`./src/pages/${page}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar la página');
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
        })
        .catch(error => {
        container.innerHTML = `<h2 style="text-align:center;color:red;">${error.message}</h2>`;
        });
}

  // Hacemos la función global para poder llamarla desde botones HTML
window.loadPage = loadPage;
