# 📘 Proyecto de Desarrollo de un LMS ABC

**Autor:** Sahiam Valentina Esteban  
**Grupo:** J1  
**Institución:** Campuslands  

---

## 🎯 Descripción del Proyecto

La **Institución Educativa ABC** busca mejorar la calidad de su educación implementando un **LMS (Learning Management System)** propio que permita a la comunidad educativa (estudiantes, docentes y administrativos) acceder de forma práctica a la información y potenciar la experiencia de aprendizaje.

El sistema desarrollado ofrece módulos para la **gestión de docentes, cursos, módulos, lecciones y administrativos**, además de una interfaz pública para visualizar cursos y docentes disponibles.

El proyecto cumple con los lineamientos del reto del programa, implementando un **Producto Mínimo Viable (MVP)** funcional con autenticación, CRUDs y persistencia de datos local.

---

## 🧰 Stack Tecnológico

- **Lenguajes:**  
  - HTML5  
  - CSS3  
  - JavaScript (ES6+)

- **Arquitectura:**  
  - **Web Components** (para modularizar vistas y lógica)  
  - **LocalStorage / SessionStorage** (para persistencia de datos sin backend)

- **Diseño UI/UX:**  
  - Paleta de colores: `#DCD0FF` y `#E3E4FA`  
  - Diseño responsivo, moderno e intuitivo  
  - Experiencia de usuario fluida y consistente entre vistas pública y administrativa  

---

## ⚙️ Requerimientos

- Conexión a internet (solo para acceder al entorno y recursos de referencia).
- Navegador web moderno (Google Chrome, Edge, Firefox o Safari).
- Dispositivo con resolución mínima de 1024x768 px.

---

## 🚀 Ejecución del Proyecto

1. Clonar o descargar este repositorio:
   ```bash
   git clone https://github.com/<usuario>/<repositorio>.git

   Abrir el archivo index.html con Live Server (VSCode) o directamente desde el navegador.

    Para acceder como administrador:

    Email: admin@abc.edu

    Contraseña: 12345


## 📍 Enlace de despliegue:

Puedes visitar la pagina desde el siguiente enlace:

https://abcprojectjs.netlify.app/


## Estructura del proyecto:

ABC-Project/

│

├── index.html  

├── admin.html  

│
├── /assets


│   ├── estilos.css  

│   └── /images/             
│
├── /js/

│   ├── main.js  

│   ├── main-admin.js     

│   ├── localstore.js        

│   │
│   ├── /components/   

│   │   ├── header-component.js

│   │   ├── public-header.js

│   │   ├── footer-component.js

│   │   ├── login-float.js

│   │   ├── modal-component.js

│   │   ├── admin-dashboard.js

│   │   ├── crud-docentes.js

│   │   ├── crud-cursos.js

│   │   ├── crud-modulos.js

│   │   ├── crud-lecciones.js

│   │   ├── crud-administrativos.js

│   │   ├── docente-card.js

│   │   ├── curso-card.js

│   │   ├── curso-detail.js

│   │   ├── crud-card.js

│   │   ├── crud-detail.js

│   │   ├── login-component.js

│   │   ├── public-cursos.js

│   │   ├── public-docentes.js

│       ├── public-home.js
│       
└── README.md


## wireframes

Puedes ver los wireframes desde este enlace:

https://drive.google.com/file/d/1vETG9idyIdevjgPXs9I_3NjcLH0LAA-W/view?usp=sharing


## Funcionalidades principales

| Módulo                         | Descripción                                                      |
| :----------------------------- | :--------------------------------------------------------------- |
| **Login**                      | Autenticación mediante email y contraseña con sessionStorage.    |
| **Gestión de Docentes**        | CRUD completo con validación y visualización pública.            |
| **Gestión de Cursos**          | CRUD con relación directa a docentes y validación de asignación. |
| **Gestión de Módulos**         | Asociados a cursos, cada uno contiene lecciones.                 |
| **Gestión de Lecciones**       | Contienen contenido y material multimedia.                       |
| **Gestión de Administrativos** | CRUD independiente para el personal administrativo.              |
| **Persistencia Local**         | Guardado automático en LocalStorage y recarga persistente.       |


## Persistencia de datos

Los datos se almacenan en localStorage bajo la clave sistemaCursos, con estructura:

{

  "administrativos": [],

  "docentes": [],

  "cursos": [],

  "modulos": [],

  "lecciones": []

}

Cada registro se identifica mediante un código único (uid) generado al momento de crearse.

## Buenas practicas aplicadas

Modularización del código en múltiples componentes.

Uso de Web Components reutilizables.


Validación de relaciones (por ejemplo, curso no se crea sin docente).

Consistencia de estilos y paleta visual.

Control de sesión con sessionStorage.