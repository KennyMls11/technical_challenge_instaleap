# Bitácora de Desarrollo — Sistema de Gestión de Tareas

---

## Fase 1 — Configuración inicial del proyecto

Se configuró el proyecto base utilizando Node.js v24.14.0, Express.js 5.2.1 y TypeScript v5.9.3, estableciendo una base sólida, tipada y preparada para escalar.

### Justificación de la arquitectura

Se eligió una arquitectura en capas porque permite construir un sistema:

- **Escalable:** se pueden agregar nuevas funcionalidades sin afectar otras partes del sistema.
- **Mantenible:** cada capa tiene una responsabilidad clara, lo que facilita leer y modificar el código.
- **Testeable:** la separación de lógica permite hacer pruebas unitarias de forma aislada.
- **Desacoplado:** reduce la dependencia entre componentes, facilitando cambios futuros (por ejemplo, cambiar la base de datos o el framework).

### Separación de responsabilidades

- **API (routes & middlewares):** maneja la entrada de solicitudes HTTP y define los endpoints del sistema.
- **Controllers:** actúan como intermediarios entre la capa de entrada y la lógica de negocio.
- **Services:** contienen la lógica de negocio principal y las reglas del sistema.
- **Persistence:** encargada de la comunicación con la base de datos, aislando el acceso a datos del resto de la aplicación.

### Enfoque

Desde el inicio, el proyecto fue diseñado con un enfoque cercano a entornos productivos, priorizando buenas prácticas, organización del código y preparación para futuras integraciones como autenticación, base de datos y despliegue.

### Extensiones utilizadas

- **Better Comments:** permite categorizar y resaltar comentarios dentro del código (TODO, FIXME, IMPORTANT), facilitando la lectura, el mantenimiento y la identificación de tareas pendientes o secciones críticas.
- **ESLint:** herramienta fundamental para el análisis estático del código, que ayuda a detectar errores, inconsistencias y malas prácticas en tiempo de desarrollo. Contribuye a mantener un código limpio, consistente y alineado con estándares definidos.
- **SonarQube (SonarLint):** extensión orientada a la detección temprana de problemas de calidad y seguridad en el código. Permite identificar vulnerabilidades, código duplicado y posibles bugs, promoviendo el desarrollo de software más robusto y confiable.

Estas herramientas permiten construir una base sólida desde las primeras etapas del proyecto, reduciendo deuda técnica y facilitando futuras ampliaciones del sistema.

---

## Fase 2 — Gestión de variables de entorno 

### ¿Qué hice y por qué?

Una vez que tuve clara la estructura del proyecto, me enfoqué en la gestión de variables de entorno. Esto fue lo primero que quise resolver antes de tocar cualquier lógica de negocio, porque prácticamente todo lo demás depende de esto: el puerto del servidor, la conexión a la base de datos y la clave secreta para los tokens JWT.

La idea es simple pero importante: los valores sensibles como contraseñas o claves secretas nunca deben ir escritos directamente en el código ni subirse al repositorio. Para eso existe el archivo `.env`, que vive solo en mi máquina local.

### Dependencias agregadas

- **dotenv:** librería que lee el archivo `.env` y carga esas variables en `process.env` de Node.js al arrancar la aplicación.
- **@types/dotenv:** los tipos de TypeScript para `dotenv`, necesarios para que el compilador entienda la librería.

### Archivos involucrados

- `.env` — contiene los valores reales (puerto, credenciales de BD, JWT secret). Este archivo **no va al repositorio**.
- `.env.example` — es una plantilla con las mismas variables pero sin valores sensibles. Este sí va al repo para que cualquier persona que clone el proyecto sepa qué variables necesita configurar.
- `src/config/env.ts` — clase Singleton que carga las variables una sola vez al iniciar la app y las expone al resto del sistema.

### ¿Qué es el patrón Singleton y por qué lo usé aquí?

El Singleton es un patrón de diseño que garantiza que una clase tenga una única instancia durante toda la ejecución del programa. En este caso lo apliqué a la configuración: en vez de llamar a `dotenv.config()` en múltiples archivos (lo cual sería repetitivo y propenso a errores), lo hago una sola vez en `env.ts` y desde ahí cualquier parte del código puede importar esa instancia y acceder a las variables que necesite.

### Cómo funciona el Singleton en la práctica

La clase `EnvConfig` tiene el constructor marcado como `private`, lo que significa que nadie desde afuera puede hacer `new EnvConfig()`. La única forma de obtener la instancia es llamando a `EnvConfig.getInstance()`. La primera vez que se llama, crea el objeto y lo guarda internamente; las siguientes veces simplemente devuelve ese mismo objeto sin crearlo de nuevo.

Al final del archivo exporto directamente la instancia lista para usar:

```ts
export const envConfig = EnvConfig.getInstance();
```

Así, en cualquier otro archivo del proyecto solo necesito importar `envConfig` y acceder a la propiedad que necesite, por ejemplo `envConfig.port` o `envConfig.jwtSecret`.

### Archivos de configuración creados

- **`.gitignore`** — le indica a Git qué archivos ignorar. Agregué `.env`, `node_modules/` y `dist/` para que nunca lleguen al repositorio.
- **`.env.example`** — plantilla pública con todas las variables necesarias pero sin valores reales. Cualquiera que clone el proyecto sabe exactamente qué debe configurar.
- **`.env`** — archivo local con los valores reales para mi entorno de desarrollo. No se sube al repositorio gracias al `.gitignore`.
- **`src/config/env.ts`** — la clase Singleton que centraliza toda la configuración.

### Variables de entorno definidas

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto en el que corre el servidor Express |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) |
| `DB_HOST` | Host donde corre PostgreSQL (en este caso, Docker) |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Clave secreta para firmar y verificar los tokens JWT |
| `JWT_EXPIRES_IN` | Tiempo de vida del token (ej. `1h`) |

---

---

## Fase 3 — Infraestructura base (Docker + TypeORM + Express)

### ¿Qué hice y por qué?

Con las variables de entorno listas, el siguiente paso lógico era levantar la base de datos y conectar todo antes de escribir cualquier lógica de negocio. No tiene sentido construir el CRUD de tareas si primero no tengo claro que la conexión a la BD funciona.

### Docker y docker-compose.yml

Decidí no instalar PostgreSQL directamente en mi máquina. En lugar de eso, lo levanté como un contenedor Docker usando un archivo `docker-compose.yml`. Esto tiene varias ventajas: el entorno queda aislado, cualquier persona que clone el proyecto puede tener la base de datos corriendo con un solo comando (`docker-compose up -d`), y no ensucia mi máquina con instalaciones globales.

El archivo lee las credenciales directamente desde el `.env` usando interpolación de variables — no hay valores hardcodeados. Usé la imagen `postgres:16-alpine` porque es liviana y estable. También configuré un volumen nombrado (`postgres_data`) para que los datos no se pierdan cada vez que se baje el contenedor.

### Dependencias instaladas

En esta fase instalé todas las dependencias que el proyecto va a necesitar:

- **typeorm** — ORM para manejar la conexión y las consultas a PostgreSQL.
- **pg** — driver de PostgreSQL para Node.js, requerido internamente por TypeORM.
- **reflect-metadata** — librería requerida por TypeORM para que sus decoradores funcionen en tiempo de ejecución.
- **bcrypt** — para hashear contraseñas antes de guardarlas en la BD.
- **jsonwebtoken** — para generar y verificar los tokens JWT de autenticación.
- **ajv** — para validar los datos que llegan a la API usando esquemas JSON.
- **swagger-ui-express** y **swagger-jsdoc** — para generar y servir la documentación de la API.

### Ajuste en tsconfig.json

TypeORM usa decoradores de TypeScript (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.) para definir las entidades de la base de datos. Para que esos decoradores funcionen correctamente, es necesario activar dos opciones en el compilador:

- `experimentalDecorators: true` — habilita el soporte de decoradores.
- `emitDecoratorMetadata: true` — permite que TypeORM lea los tipos de las propiedades en tiempo de ejecución.

Sin estas dos opciones, TypeORM simplemente no funciona.

### src/config/database.ts

Creé este archivo como el punto único de configuración de la conexión a la base de datos. Usa la API moderna de TypeORM (`DataSource`) y consume las variables directamente desde `envConfig`, sin acceder a `process.env` en ningún otro lugar.

Dos decisiones importantes aquí:
- `synchronize: true` solo en `development` — esto le dice a TypeORM que cree o actualice las tablas automáticamente según las entidades definidas. En producción esto nunca debe activarse porque podría destruir datos.
- `logging: true` solo en `development` — muestra en consola las queries SQL que genera TypeORM, lo que es útil para depurar pero genera ruido innecesario en producción.

### src/app.ts y src/server.ts

Separé la configuración de Express (`app.ts`) del arranque del servidor (`server.ts`). Esta separación es intencional:

- `app.ts` solo sabe de Express: monta middlewares y rutas. No conoce el puerto ni la base de datos.
- `server.ts` es el punto de entrada real: primero inicializa la conexión a la BD y, solo si eso funciona, levanta el servidor HTTP.

Este orden importa. Si el servidor arrancara antes de que la BD esté lista, podría recibir peticiones sin poder responderlas correctamente. Además, si la conexión falla, `process.exit(1)` garantiza que el proceso termina con un código de error, lo que permite que Docker o cualquier gestor de procesos detecte el fallo y actúe.

También agregué un endpoint `/health` en `app.ts`. Es una práctica estándar en APIs: un endpoint simple que no tiene lógica de negocio y solo responde `{ "status": "ok" }`, usado para verificar que el servidor está corriendo.

---

## Fase 4 — Entidades de base de datos (User y Task)

### ¿Qué hice y por qué?

Con la conexión a la base de datos configurada, el siguiente paso fue definir las entidades: los modelos que TypeORM usa para crear las tablas en PostgreSQL y para hacer las consultas. Sin entidades no hay tablas, y sin tablas no hay nada que guardar.

Creé dos entidades dentro de `src/persistence/entities/`:

### User — `user.entity.ts`

Representa a los usuarios registrados en el sistema. Tiene los campos básicos que pide la prueba: `id`, `nombre`, `email` y `password`. Agregué también `createdAt` y `updatedAt` con los decoradores `@CreateDateColumn` y `@UpdateDateColumn` — TypeORM los gestiona automáticamente y son útiles para saber cuándo se creó o modificó un registro, sin tener que hacerlo manualmente.

El campo `email` tiene `unique: true` para que no puedan existir dos usuarios con el mismo correo. Esto se aplica directamente en la base de datos, no solo en la lógica de la aplicación.

### Task — `task.entity.ts`

Representa las tareas. Tiene los campos que exige la prueba: `id`, `titulo`, `descripcion`, `fecha_vencimiento` y `estado`. Para el estado usé un `enum` de TypeScript (`TaskStatus`) con los tres valores posibles: `pendiente`, `en curso` y `completada`. Esto evita que se guarden valores inválidos en la base de datos.

También incluí `createdAt`, `updatedAt` por las mismas razones que en `User`.

### La relación entre User y Task

Cada tarea pertenece a un único usuario, y un usuario puede tener muchas tareas. Eso se modela con:

- `@ManyToOne` en `Task` → cada tarea apunta a un usuario.
- `@OneToMany` en `User` → cada usuario tiene una lista de tareas.

Agregué `{ onDelete: 'CASCADE' }` en el `@ManyToOne` para que si un usuario se elimina, sus tareas se eliminen también automáticamente. Esto mantiene la integridad de los datos sin tener que hacerlo manualmente desde el código.

También incluí el campo `userId` en `Task` como columna explícita. Esto permite consultar directamente el ID del usuario dueño de una tarea sin necesidad de hacer un JOIN, lo cual es útil para las validaciones de autorización (verificar que el usuario que pide una tarea es el mismo que la creó).

---

## Decisiones tomadas de forma independiente (sin asistencia de IA)

### 1. Uso de TypeORM como ORM

Decidí usar TypeORM para manejar la conexión y las consultas a la base de datos PostgreSQL. Esta fue una decisión propia, tomada por dos razones concretas: primero, es una herramienta con la que ya tengo familiaridad, lo que me permite avanzar más seguro y cometer menos errores en esa capa. Segundo, TypeORM facilita bastante la conexión a la base de datos y la definición de modelos, evitando escribir SQL puro para operaciones comunes como crear, leer, actualizar o eliminar registros. La prueba no exige un ORM específico, pero consideré que esta era la elección más adecuada para el contexto del proyecto.

### 2. PostgreSQL en Docker en lugar de instalación local

Decidí no instalar PostgreSQL directamente en mi máquina, sino levantarlo como un contenedor Docker mediante un archivo `docker-compose.yml`. Esta decisión la tomé porque Docker permite tener un entorno de base de datos limpio, reproducible y fácil de levantar o apagar sin afectar nada más en el sistema. Cualquier persona que clone el repositorio puede tener la base de datos corriendo con un solo comando, sin importar su sistema operativo ni si tiene PostgreSQL instalado. TypeORM se conecta a ese contenedor exactamente igual que si la base de datos estuviera instalada localmente, usando las variables de entorno del archivo `.env`.
