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

## Fase 5 — Manejo de errores y respuestas estandarizadas

### ¿Qué hice y por qué?

Antes de escribir cualquier endpoint decidí implementar el manejo de errores y el formato de respuestas. Esto no fue una sugerencia del asistente — fue una decisión propia basada en cómo diseñé el proyecto desde el inicio: en el `CLAUDE.md` ya había definido que todos los errores debían seguir un formato fijo y que todas las respuestas exitosas debían estandarizarse. No tiene sentido construir endpoints si no tengo claro cómo van a responder cuando algo sale bien o cuando algo falla.

### Clases de error — `src/api/errors/AppError.ts`

Creé una clase base `AppError` que extiende el `Error` nativo de JavaScript y le agrega el código de estado HTTP. De ella heredan cuatro clases específicas:

- `NotFoundError` → 404, cuando no se encuentra un recurso (ej. una tarea que no existe).
- `AuthenticationError` → 401, cuando las credenciales son inválidas o el token no está presente.
- `AuthorizationError` → 403, cuando el usuario no tiene permisos para esa acción.
- `ValidationError` → 400, cuando los datos enviados no son válidos.

Esta estructura permite lanzar errores descriptivos desde cualquier capa del sistema (`throw new NotFoundError()`) y el middleware los captura y procesa automáticamente.

### Middleware de errores — `src/api/middlewares/errorHandler.ts`

Este middleware global captura cualquier error que se lance en la aplicación y responde con el formato que definí desde el principio:

```json
{
  "path": "/ruta/del/endpoint",
  "message": "descripción del error",
  "date": "2026-03-22T...",
  "status": 404
}
```

Está registrado al final de todos los middlewares en `app.ts`. Eso es un requisito de Express: el middleware de errores siempre va de último, y debe recibir exactamente 4 parámetros (`error, req, res, next`) para que Express lo reconozca como tal.

### Helper de respuestas — `src/api/helpers/response.ts`

Creé la función `sendSuccess()` para estandarizar todas las respuestas exitosas. El campo `data` solo se incluye en la respuesta si se pasa un valor — así evito que aparezca `"data": undefined` en respuestas que no retornan datos (como un DELETE).

---

## Uso de Asistentes de IA

---

### Uso 1 — Configuración de infraestructura base

**Prompt utilizado:**
> "Actúa como un desarrollador backend senior experto en Node.js, TypeScript y configuración de infraestructura, priorizando simplicidad, claridad y buenas prácticas sin sobreingeniería. Estoy desarrollando una API RESTful para un sistema de gestión de tareas como prueba técnica, usando Node.js, Express, TypeScript, arquitectura en capas y PostgreSQL con TypeORM. Ayúdame a configurar la infraestructura base: crear el docker-compose.yml para levantar PostgreSQL en Docker, instalar las dependencias que vienen (TypeORM, pg, bcrypt, jsonwebtoken, ajv, swagger) y configurar la conexión de TypeORM a la base de datos."

**Qué se aceptó y por qué:**

Se aceptó el plan general de implementación: la estructura del `docker-compose.yml`, los ajustes en `tsconfig.json` (`experimentalDecorators` y `emitDecoratorMetadata`), el contenido de `src/config/database.ts`, y la lógica de `src/app.ts` y `src/server.ts`. Todo esto fue correcto y coherente con la arquitectura que yo había definido desde el inicio. En particular, el orden de inicialización en `server.ts` — primero la base de datos, luego el servidor HTTP — fue una decisión que validé y entendí antes de aceptarla.

**Qué se rechazó o modificó:**

La instalación de dependencias la ejecuté yo manualmente desde la terminal, tanto las de producción como los tipos de TypeScript. El asistente propuso correr los comandos de forma automática, pero preferí hacerlo yo para tener control directo sobre lo que se instalaba y verificar que no hubiera errores en el proceso.

También levanté la base de datos y arranqué el servidor por mi cuenta:
```bash
docker-compose up -d
npm run dev
```

**Verificación realizada:**

Confirmé que el servidor arrancara correctamente y que el endpoint `/health` respondiera `{ "status": "ok" }` en `http://localhost:3000/health`. También verifiqué que TypeORM lograra conectarse al contenedor de PostgreSQL y que los mensajes de consola fueran los esperados.

---

### Uso 2 — Diseño de entidades de base de datos

**Prompt utilizado:**
> "Ayúdame a diseñar las entidades principales: Entidad User con los campos id, nombre, email, password. Entidad Task con los campos id, titulo, descripcion, fecha_vencimiento, estado y su relación con User. Quiero que definas las entidades usando TypeORM en TypeScript, establezcas correctamente la relación OneToMany / ManyToOne, e incluyas buenas prácticas básicas como timestamps si lo consideras útil."

**Qué se aceptó y por qué:**

Se aceptaron ambas entidades tal como fueron generadas. La estructura es correcta: `@PrimaryGeneratedColumn`, `@Column` con sus opciones, `@CreateDateColumn` y `@UpdateDateColumn` para los timestamps automáticos, el `enum TaskStatus` para los estados de la tarea, y la relación `@OneToMany` / `@ManyToOne` bien establecida entre `User` y `Task`. También se aceptó `{ onDelete: 'CASCADE' }` en el `@ManyToOne` y el campo `userId` explícito en `Task`, decisiones que revisé y entendí antes de incorporarlas.

**Qué se rechazó o modificó:**

Se rechazó el siguiente fragmento sugerido para agregar dentro de `user.entity.ts`:

```ts
import bcrypt from 'bcrypt';

@BeforeInsert()
async hashPassword() {
  this.password = await bcrypt.hash(this.password, 10);
}
```

Lo rechacé porque mete lógica de negocio (el hasheo de la contraseña) directamente en la entidad, que pertenece a la capa de persistencia. En la arquitectura que definí desde el inicio, esa responsabilidad le corresponde al `AuthService`. Dejarlo en la entidad estaría mezclando capas, lo cual viola directamente las reglas que establecí. Además, si en algún momento necesito cambiar la librería de hasheo o los parámetros de bcrypt, no debería tener que modificar una entidad de base de datos para eso.

**Verificación realizada:**

Revisé que la relación entre entidades estuviera correctamente configurada en ambos lados (`tasks` en `User` y `user` en `Task`), que el enum tuviera exactamente los tres valores que exige la prueba (`pendiente`, `en curso`, `completada`), y que `unique: true` estuviera aplicado sobre el campo `email` para garantizar integridad a nivel de base de datos.

---

### Uso 3 — Manejo de errores y respuestas estandarizadas

**Prompt utilizado:**
> "Antes de los endpoints necesitamos el manejo de errores centralizado y las respuestas estandarizadas — todo lo demás los va a usar."

**Qué se aceptó y por qué:**

Le indiqué a Claude que implementara el manejo de errores antes de cualquier endpoint, porque desde el principio definí en el `CLAUDE.md` que todos los errores deben manejarse de forma centralizada y que todas las respuestas deben seguir un formato fijo. Esta no fue una sugerencia del asistente — fue una decisión de arquitectura que tomé desde el inicio del proyecto y que simplemente le pedí que ejecutara.

Se aceptó la estructura de clases de error (`AppError` como base, con las subclases `NotFoundError`, `AuthenticationError`, `AuthorizationError` y `ValidationError`) porque respeta exactamente los códigos de estado que yo definí: 400, 401, 403 y 404. El middleware `errorHandler` también se aceptó tal como fue generado, porque sigue el formato de error que establecí desde el comienzo (`path`, `message`, `date`, `status`). Lo mismo aplica para la función `sendSuccess()`, que respeta el formato de respuesta exitosa que diseñé previamente.

**Verificación realizada:**

Revisé que el `errorHandler` recibiera los 4 parámetros requeridos por Express para ser reconocido como middleware de errores (`error, req, res, next`), y confirmé que está registrado al final de todos los middlewares en `app.ts`. También verifiqué que `sendSuccess()` incluye el campo `data` solo cuando se pasa un valor, evitando propiedades innecesarias en la respuesta.

---

### Uso 4 — Capa de autenticación completa

**Prompt utilizado:**
> "si" (aprobando el plan previamente presentado para implementar register, login y middleware JWT)

El plan fue construido de forma conjunta: yo indiqué el orden lógico (repository → service → validator → controller → routes → middleware), las restricciones de arquitectura (services sin Express, controllers livianos, persistence solo acceso a datos) y los requisitos específicos de la prueba (solo access token, sin refresh token). Claude lo organizó y ejecutó siguiendo esas directrices.

**Qué se aceptó y por qué:**

Se aceptaron los seis archivos generados:

- **`user.repository.ts`** — usa el patrón `.extend()` de TypeORM, que es la forma idiomática de agregar métodos al repositorio base sin introducir clases adicionales innecesarias. `findByEmail` retorna `User | null` y `createUser` recibe el password ya hasheado — sin lógica de negocio en la capa de datos.

- **`auth.service.ts`** — contiene toda la lógica de negocio sin importar nada de Express. El hasheo con bcrypt ocurre aquí (no en la entidad, como fue rechazado anteriormente). El mensaje de error en el login es intencionalmente genérico para ambos casos (email no existe / contraseña incorrecta) — esto previene que alguien pueda saber si un email está registrado o no. La función `toPublicData` garantiza que el campo `password` nunca salga en ninguna respuesta.

- **`auth.validator.ts`** — usa AJV con `ajv-formats` para validar el formato de email. Los validadores se compilan una sola vez al importar el módulo, no en cada request. Los errores se pasan a `next()` como `ValidationError`, que el `errorHandler` global ya sabe manejar.

- **`auth.controller.ts`** — completamente liviano. Solo extrae datos del body (ya validados por AJV), llama al servicio y responde con `sendSuccess()`. Todo error va a `next(error)`.

- **`auth.routes.ts`** — define los dos endpoints con sus validadores como middlewares encadenados e incluye los comentarios `@swagger` para la documentación automática.

- **`auth.middleware.ts`** — lee el header `Authorization: Bearer <token>`, verifica el JWT con `jwt.verify()` y adjunta `req.user` con el id y email del usuario autenticado. Extiende el tipo `Request` de Express mediante `declare global` para que TypeScript reconozca la propiedad `user` sin errores de tipos.

**Qué se rechazó o modificó:**

La instalación de `ajv-formats` (dependencia adicional requerida para validar el formato de email) la ejecuté yo manualmente:
```bash
npm install ajv-formats
```

**Verificación realizada:**

Revisé que la cadena de responsabilidades fuera correcta en cada archivo: el repositorio no sabe de bcrypt, el service no sabe de Express, el controller no tiene lógica de negocio, y el middleware JWT no toca la base de datos. También confirmé que `auth.middleware.ts` esté disponible para usarse en las rutas de tasks en el siguiente paso, y que `app.ts` quedara actualizado con `authRouter` montado en `/api/v1/auth`.

---

## Fase 7 — CRUD de tareas

Con la autenticación lista, el siguiente bloque fue implementar las operaciones básicas sobre tareas: crear, listar, obtener, actualizar y eliminar. Esta es la funcionalidad central del challenge.

### ¿Qué construí y por qué en ese orden?

Seguí el mismo orden de capas que en la autenticación, de adentro hacia afuera: primero los datos, luego la lógica, luego la validación, luego el controller, y por último las rutas.

**`task.repository.ts`** — Acá definí cinco métodos: obtener todas las tareas de un usuario, buscar una tarea por ID, crear una tarea nueva, actualizar campos específicos de una tarea existente, y eliminar una tarea. Igual que con el repositorio de usuarios, usé el patrón `.extend()` de TypeORM para no crear clases innecesarias. El método `updateTask` recibe un objeto `Partial<>`, es decir, solo los campos que cambiaron — así no tengo que reescribir todos los datos si solo cambio el título.

**`task.service.ts`** — Acá está toda la lógica de negocio. Lo más importante de este archivo es la verificación de propiedad: antes de retornar, actualizar o eliminar una tarea, el servicio verifica que esa tarea le pertenezca al usuario autenticado. Si no existe lanza un `NotFoundError` (404), y si existe pero es de otro usuario lanza un `AuthorizationError` (403). Esta distinción es intencional: no es lo mismo que algo no exista a que no tengas permiso para verlo.

**`task.validator.ts`** — Usé AJV igual que en la autenticación. Para la creación, los tres campos son obligatorios (`titulo`, `descripcion`, `fecha_vencimiento`). Para la actualización, todos son opcionales, pero agregué `minProperties: 1` para que no tenga sentido enviar un body vacío y que eso pase como una actualización válida.

**`task.controller.ts`** — Completamente liviano, igual que el de auth. Extrae el `userId` de `req.user` (que el middleware JWT ya inyectó), extrae el resto de datos del body o de los params, llama al servicio y responde.

**`task.routes.ts`** — Acá apliqué el middleware `authenticate` a nivel de router completo con `taskRouter.use(authenticate)`, lo que significa que todos los endpoints de tareas requieren token JWT. No tuve que poner el middleware en cada ruta individualmente.

**`app.ts`** — Monté el `taskRouter` en `/api/v1/tasks` y eliminé el comentario que lo marcaba como "próximo paso".

### Dependencias utilizadas

No fue necesario instalar dependencias nuevas para esta fase. Todo se construyó sobre las herramientas ya configuradas: TypeORM, AJV, Express y los tipos de error propios del proyecto.

---

### Uso 5 — CRUD de tareas completo

**Prompt utilizado:**
> "empecemos con el CRUD de tareas"

La estructura de implementación fue acordada en la sesión anterior: repository → service → validator → controller → routes → app.ts. Claude ejecutó ese orden y respetó las restricciones de arquitectura ya establecidas (services sin Express, controllers livianos, persistence solo acceso a datos).

**Qué se aceptó y por qué:**

- **`task.repository.ts`** — métodos claros y aislados, cada uno con una sola responsabilidad. `updateTask` usa `Partial<Pick<>>` para que solo se actualicen los campos enviados sin romper los existentes.

- **`task.service.ts`** — la verificación de propiedad antes de cada operación es la pieza más importante de este archivo. La separación entre 404 (no existe) y 403 (existe pero no es tuya) es una decisión deliberada y correcta: no son el mismo error y no deben tratarse igual.

- **`task.validator.ts`** — la restricción `minProperties: 1` en el schema de actualización evita que un body vacío pase como una petición válida.

- **`task.controller.ts`** — sigue el mismo patrón del controller de auth: sin lógica, sin condiciones, solo orquestación.

- **`task.routes.ts`** — aplicar `authenticate` a nivel de router en lugar de en cada ruta individual es más limpio y menos propenso a errores (si olvidás proteger una ruta individual, queda expuesta).

- **`app.ts`** — se eliminó el comentario `// app.use('/api/v1/tasks', taskRoutes); // próximo paso` y se reemplazó por la línea activa.

**Qué se rechazó o modificó:**

Nada en esta fase. La implementación respetó todas las restricciones arquitectónicas definidas desde el inicio del proyecto.

---

## Fase 8 — Pruebas de los endpoints con Postman

Con el CRUD de tareas implementado, el siguiente paso fue probar todos los endpoints de forma manual usando Postman para verificar que el sistema respondiera correctamente en cada escenario posible.

### Flujo de prueba

El orden fue el siguiente: primero registrar un usuario nuevo, luego hacer login para obtener el token JWT, y después ejecutar cada endpoint de tareas usando ese token en el header `Authorization: Bearer <token>`.

### Escenarios probados

Se verificaron tanto los casos exitosos como los casos de error:

- **Registro de usuario** → `201` con datos del usuario (sin password)
- **Login con credenciales correctas** → `200` con `accessToken`
- **Crear tarea** → `201` con todos los campos incluyendo `estado` y `fecha_vencimiento`
- **Listar tareas** → `200` con array de tareas del usuario autenticado
- **Obtener tarea por ID** → `200` con la tarea específica
- **Actualizar tarea** → `200` con el campo `estado` modificado a `"en curso"`
- **Eliminar tarea** → `200` con mensaje de confirmación
- **Request sin token** → `401`
- **Token inválido** → `401`
- **Tarea inexistente** → `404`
- **Email ya registrado** → `400`
- **Contraseña incorrecta en login** → `401`
- **Body vacío en update** → `400`
- **Fecha con formato inválido** → `400`

---

## Decisiones tomadas de forma independiente (sin asistencia de IA)

### 1. Uso de TypeORM como ORM

Decidí usar TypeORM para manejar la conexión y las consultas a la base de datos PostgreSQL. Esta fue una decisión propia, tomada por dos razones concretas: primero, es una herramienta con la que ya tengo familiaridad, lo que me permite avanzar más seguro y cometer menos errores en esa capa. Segundo, TypeORM facilita bastante la conexión a la base de datos y la definición de modelos, evitando escribir SQL puro para operaciones comunes como crear, leer, actualizar o eliminar registros. La prueba no exige un ORM específico, pero consideré que esta era la elección más adecuada para el contexto del proyecto.

### 2. PostgreSQL en Docker en lugar de instalación local

Decidí no instalar PostgreSQL directamente en mi máquina, sino levantarlo como un contenedor Docker mediante un archivo `docker-compose.yml`. Esta decisión la tomé porque Docker permite tener un entorno de base de datos limpio, reproducible y fácil de levantar o apagar sin afectar nada más en el sistema. Cualquier persona que clone el repositorio puede tener la base de datos corriendo con un solo comando, sin importar su sistema operativo ni si tiene PostgreSQL instalado. TypeORM se conecta a ese contenedor exactamente igual que si la base de datos estuviera instalada localmente, usando las variables de entorno del archivo `.env`.
