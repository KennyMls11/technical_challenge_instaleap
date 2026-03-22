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

## Fase 2 — Gestión de variables de entorno (2026-03-21)

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


## Decisiones tomadas de forma independiente (sin asistencia de IA)

### 1. Uso de TypeORM como ORM

Decidí usar TypeORM para manejar la conexión y las consultas a la base de datos PostgreSQL. Esta fue una decisión propia, tomada por dos razones concretas: primero, es una herramienta con la que ya tengo familiaridad, lo que me permite avanzar más seguro y cometer menos errores en esa capa. Segundo, TypeORM facilita bastante la conexión a la base de datos y la definición de modelos, evitando escribir SQL puro para operaciones comunes como crear, leer, actualizar o eliminar registros. La prueba no exige un ORM específico, pero consideré que esta era la elección más adecuada para el contexto del proyecto.

### 2. PostgreSQL en Docker en lugar de instalación local

Decidí no instalar PostgreSQL directamente en mi máquina, sino levantarlo como un contenedor Docker mediante un archivo `docker-compose.yml`. Esta decisión la tomé porque Docker permite tener un entorno de base de datos limpio, reproducible y fácil de levantar o apagar sin afectar nada más en el sistema. Cualquier persona que clone el repositorio puede tener la base de datos corriendo con un solo comando, sin importar su sistema operativo ni si tiene PostgreSQL instalado. TypeORM se conecta a ese contenedor exactamente igual que si la base de datos estuviera instalada localmente, usando las variables de entorno del archivo `.env`.
