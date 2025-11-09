import '../components/header.js';
import Home from '../components/home.js'; 
import { loadPage } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.insertAdjacentHTML('beforebegin', '<main-header></main-header>');
    loadPage('home');
});

Home()
// const routes = {
//     "/": Home,
//     "/home": Home,
//     // aquí luego agregaremos las demás vistas
// };






// import { loadPage } from './router.js';

// document.addEventListener('DOMContentLoaded', () => {
//   loadPage('home'); // Página inicial al abrir el sitio
// });
