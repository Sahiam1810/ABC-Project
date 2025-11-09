export function loadPage(page) {
    const container = document.getElementById('app');

    fetch(`./src/pages/${page}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar la página');
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;

        // 👇 Nueva parte: re-ejecuta los scripts que vienen dentro del HTML
        const scripts = container.querySelectorAll("script[type='module'], script:not([type])");
        scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.type = "module";
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
            oldScript.remove();
        });
    })
    .catch(error => {
        container.innerHTML = `<h2 style="text-align:center;color:red;">${error.message}</h2>`;
    });
}

window.loadPage = loadPage;






// export function loadPage(page) {
//     const container = document.getElementById('app');

//     fetch(`./src/pages/${page}.html`) // ../pages
//         .then(response => {
//             if (!response.ok) throw new Error('Error al cargar la página');
//             return response.text();
//         })
//         .then(html => {
//             container.innerHTML = html;
//         })
//         .catch(error => {
//         container.innerHTML = `<h2 style="text-align:center;color:red;">${error.message}</h2>`;
//         });
// }

//   // Hacemos la función global para poder llamarla desde botones HTML
// window.loadPage = loadPage;
