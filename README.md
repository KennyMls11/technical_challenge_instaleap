# technical_challenge_instaleap
Inicialización del proyecto

Se realizó la configuración inicial del proyecto utilizando Node.js v24.14.0, Express.js 5.2.1 y TypeScript v5.9.3, estableciendo una base sólida, tipada y preparada para escalabilidad.

Configuración inicial
Inicialización del proyecto con `npm init`
Instalación de dependencias principales:
Express para la creación del servidor HTTP
Instalación de dependencias de desarrollo:
  * TypeScript para tipado estático
  * ts-node-dev para ejecución en entorno de desarrollo
  * Tipos de Node y Express (`@types/node`, `@types/express`)
* Configuración de `tsconfig.json` orientada a entorno backend
* Definición de scripts de ejecución para desarrollo y producción

Arquitectura del proyecto

Se implementó una arquitectura en capas (Layered Architecture) con el objetivo de mantener una clara separación de responsabilidades y facilitar la mantenibilidad del sistema.

Estructura base

```
src/
  api/
    routes/
    middlewares/
  controllers/
  services/
  persistence/
  app.ts
  server.ts
```

Justificación de la arquitectura

La elección de una arquitectura en capas responde a la necesidad de construir un sistema:

Escalable: Permite agregar nuevas funcionalidades sin afectar otras partes del sistema.
Mantenible: Cada capa tiene una responsabilidad clara, facilitando la lectura y modificación del código.
Testeable: La separación de lógica permite realizar pruebas unitarias de manera aislada.
Desacoplado: Reduce la dependencia entre componentes, facilitando cambios futuros (por ejemplo, cambiar la base de datos o framework).

Separación de responsabilidades

API (routes & middlewares)
  Maneja la entrada de solicitudes HTTP y define los endpoints del sistema.

Controllers
  Actúan como intermediarios entre la capa de entrada y la lógica de negocio.

Services
  Contienen la lógica de negocio principal y reglas del sistema.

Persistence
  Encargada de la comunicación con la base de datos, aislando el acceso a datos del resto de la aplicación.

 Enfoque
Desde el inicio, el proyecto fue diseñado con un enfoque cercano a entornos productivos, priorizando buenas prácticas, organización del código y preparación para futuras integraciones como autenticación, base de datos y despliegue.
