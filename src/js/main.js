import '../components/header.js';
import { loadPage } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.insertAdjacentHTML('beforebegin', '<main-header></main-header>');
    loadPage('home');
});

