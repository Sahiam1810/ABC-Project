export const DB_NAME = 'sistemaCursos';
export const SESSION_KEY = 'loginActual';


const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const getJSON = (k) => {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); }
    catch { return null; }
};


export function initDB() {
    let db = getJSON(DB_NAME);
    if (!db) {
        db = {
            administrativos: [
                {
                    id: '2410',
                    email: 'admin@abc.edu',
                    password: '12345',
                    nombres: 'Admin',
                    apellidos: 'Principal',
                    telefono: '0000',
                    cargo: 'Administrador'
                }
            ],
            docentes: [],
            cursos: [],
            modulos: [],
            lecciones: []
    };
    setJSON(DB_NAME, db);
    }
    return db;
}


export function read() {
    return getJSON(DB_NAME) || initDB();
}

export function write(db) {
    setJSON(DB_NAME, db);
    return true;
}


export function setSession(usuario) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
}

export function isLoggedIn() {
    return !!sessionStorage.getItem(SESSION_KEY);
}

export function logout() {
    sessionStorage.removeItem(SESSION_KEY);
}


export const uid = () => Math.random().toString(36).slice(2, 9);


export const getSistema = read;          
export const guardarSesion = setSession;  
export const getUsuarioActual = getSession;
export const verificarSesion = isLoggedIn;