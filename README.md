# Sistema de Gestión de Tareas — API RESTful

Este proyecto consiste en el desarrollo de una API RESTful para la gestión de tareas, construida utilizando Node.js, Express.js y TypeScript.

El objetivo principal es implementar un backend robusto, escalable y mantenible, aplicando buenas prácticas de desarrollo, tipado estático y una organización clara del código.

---

## Tecnologías

- **Node.js** — entorno de ejecución
- **Express.js** — framework web
- **TypeScript** — tipado estático
- **PostgreSQL** — base de datos relacional (via Docker)
- **TypeORM** — ORM para la conexión y manejo de la BD
- **JWT** — autenticación mediante tokens
- **Docker** — contenerización de la base de datos

---

## Arquitectura

El proyecto está basado en una arquitectura en capas (Layered Architecture), la cual permite una separación clara de responsabilidades:

- **API (routes & middlewares):** maneja la entrada de solicitudes HTTP y define los endpoints.
- **Controllers:** gestionan la interacción entre las solicitudes entrantes y la lógica de negocio.
- **Services:** contienen la lógica de negocio principal y las reglas del sistema.
- **Persistence:** encargada de la comunicación con la base de datos.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

No es necesario instalar PostgreSQL localmente — se levanta automáticamente con Docker.

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/KennyMls11/technical_challenge_instaleap.git
cd technical_challenge_instaleap
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores según tu entorno:

```bash
cp .env.example .env
```

Las variables disponibles están documentadas en `.env.example`.

### 4. Levantar la base de datos

```bash
docker-compose up -d
```

Esto levanta un contenedor de PostgreSQL en segundo plano. Solo necesitas hacerlo una vez (o cada vez que reinicies Docker).

### 5. Ejecutar el proyecto en modo desarrollo

```bash
npm run dev
```

### 6. Verificar que el servidor está corriendo

```
http://localhost:3000/health
```

Debe responder: `{ "status": "ok" }`

---

## Scripts disponibles

- `npm run dev` — ejecuta el proyecto en modo desarrollo con recarga automática.
- `npm run build` — compila el código TypeScript a JavaScript.
- `npm start` — ejecuta la aplicación compilada en modo producción.
