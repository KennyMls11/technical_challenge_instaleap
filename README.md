# technical_challenge_instaleap
Descripción del proyecto

Este proyecto consiste en el desarrollo de una API RESTful para la gestión de tareas, construida utilizando Node.js, Express.js y TypeScript.

El objetivo principal es implementar un backend robusto, escalable y mantenible, aplicando buenas prácticas de desarrollo, tipado estático y una organización clara del código.

Arquitectura

El proyecto está basado en una arquitectura en capas (Layered Architecture), la cual permite una separación clara de responsabilidades entre los distintos componentes del sistema.

- API (routes & middlewares): Maneja la entrada de solicitudes HTTP y define los endpoints de la aplicación.
- Controllers: Gestionan la interacción entre las solicitudes entrantes y la lógica de negocio.
- Services: Contienen la lógica de negocio principal y las reglas del sistema.
-  Persistence: Encargada de la comunicación con la base de datos.

Esta arquitectura permite escalar el sistema de manera ordenada, facilita el mantenimiento del código y mejora la capacidad de realizar pruebas unitarias, al mantener cada componente desacoplado.


Instalación local

Sigue los siguientes pasos para ejecutar el proyecto en un entorno local.

1. Clonar el repositorio

```bash
git clone https://github.com/KennyMls11/technical_challenge_instaleap.git
cd technical_challenge_instaleap
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores según tu entorno:

```bash
cp .env.example .env
```

Las variables disponibles están documentadas en `.env.example`.

4. Ejecutar el proyecto en modo desarrollo

```bash
npm run dev
```

5. Acceder a la API

Una vez iniciado el servidor, la API estará disponible en:

```
http://localhost:3000
```

Scripts disponibles

- `npm run dev`: Ejecuta el proyecto en modo desarrollo con recarga automática.
- `npm run build`: Compila el código TypeScript a JavaScript.
- `npm start`: Ejecuta la aplicación en entorno de producción.

