Guía para Claude Code

Descripción del proyecto

Este proyecto consiste en el desarrollo de una API RESTful utilizando Node.js, Express.js y TypeScript.

Se implementa una arquitectura en capas con el objetivo de garantizar escalabilidad, mantenibilidad y una clara separación de responsabilidades.

⸻

Arquitectura

El proyecto sigue una arquitectura en capas (Layered Architecture) con separación estricta entre componentes:
	•	API (routes & middlewares): Maneja las solicitudes HTTP y define los endpoints.
	•	Controllers: Gestionan la lógica principal de atención de las peticiones y orquestan los servicios.
	•	Services: Contienen la lógica de negocio y reglas del sistema.
	•	Persistence: Encargada de la comunicación con la base de datos mediante TypeORM.

Reglas de arquitectura
	•	Los controllers no deben contener lógica de negocio compleja.
	•	Los services no deben depender de Express ni de objetos HTTP.
	•	La capa de persistence solo debe manejar acceso a datos.
	•	Mantener separación estricta de responsabilidades entre capas.

⸻

Tecnologías
	•	Lenguaje: TypeScript (uso obligatorio)
	•	Framework: Express.js
	•	Base de datos: PostgreSQL (ejecutada en un contenedor Docker)
	•	ORM: TypeORM
	•	Autenticación: JWT (access token)

⸻

Infraestructura local

La base de datos PostgreSQL se levanta mediante Docker usando docker-compose.yml. No se requiere instalación local de PostgreSQL. TypeORM se conecta a ella mediante las variables de entorno definidas en el archivo .env.

⸻

Configuración de variables de entorno
	•	Usar un archivo .env para gestionar variables sensibles (puerto, credenciales de BD, JWT secret).
	•	Incluir un archivo .env.example en el repositorio como plantilla sin valores sensibles.
	•	Gestionar las variables dentro de la aplicación mediante un patrón Singleton (src/config/env.ts) que las cargue una sola vez al iniciar.

⸻

Validación de entradas

Validar todos los datos que llegan a la API usando AJV con JSONSchema. Asegurarse de que campos como el email tengan formato válido y que los campos requeridos estén presentes antes de llegar al controller.

⸻

Estilo de código
	•	Todo el código debe estar escrito en TypeScript.
	•	Usar nombres claros, descriptivos y coherentes.
	•	El código debe ser autoexplicativo.
	•	Priorizar claridad sobre complejidad.
	•	Mantener consistencia en todo el proyecto.

⸻

Manejo de errores

Todos los errores deben manejarse de forma centralizada mediante un middleware de manejo de errores en Express (error handler global).

Formato de error

Todas las respuestas de error deben tener esta estructura:

{
  "path": "string",
  "message": "string",
  "date": "ISO timestamp",
  "status": number
}

Códigos de estado
	•	400 → Error de solicitud o error general de la aplicación
	•	401 → Error de autenticación (credenciales)
	•	403 → Error de autorización o encriptación
	•	404 → Recurso no encontrado (ej: task)
	•	500 → Error interno (debe evitarse en lo posible)

⸻

Respuestas exitosas

Todas las respuestas exitosas deben estandarizarse mediante un middleware o función helper centralizada.

Formato de respuesta

{
  "message": "string",
  "status": number,
  "data": any (opcional)
}

Códigos de estado
	•	200 → Consulta o actualización exitosa
	•	201 → Creación exitosa

⸻

Autenticación
	•	Implementar autenticación con JWT (access token únicamente, según lo exige la prueba técnica).
	•	El access token debe tener una duración corta (ej. 1h).
	•	Implementar un middleware que lea el token desde la cabecera Authorization: Bearer <token>, verifique su validez y, si es correcto, permita el acceso a las rutas protegidas.
	•	Validar correctamente los tokens y manejar errores asociados.

⸻

Documentación
	•	Swagger: documentar todos los endpoints directamente en el código.
	•	JSDoc: documentar las funciones y clases más importantes.

⸻

Commits
	•	Usar Conventional Commits en todos los commits del proyecto.
	•	Ejemplos: feat: add user login endpoint, fix: correct task validation schema.

⸻

Buenas prácticas
	•	Mantener los controllers livianos.
	•	Centralizar la lógica de negocio en services.
	•	Aislar completamente la lógica de base de datos en persistence.
	•	Estandarizar todas las respuestas (éxito y error).
	•	No exponer detalles internos innecesarios.

⸻

Reglas para generación de código

Al generar código:
	•	Respetar estrictamente la arquitectura definida.
	•	Mantener consistencia en nombres y estructura.
	•	Seguir el formato de errores y respuestas.
	•	No mezclar responsabilidades entre capas.
	•	Priorizar mantenibilidad y legibilidad.
