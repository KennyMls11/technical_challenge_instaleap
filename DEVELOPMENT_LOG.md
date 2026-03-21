Se realizó la configuración inicial del proyecto utilizando Node.js v24.14.0, Express.js 5.2.1 y TypeScript v5.9.3, estableciendo una base sólida, tipada y preparada para escalabilidad.

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


Extensiones utilizadas

Better Comments
  Permite categorizar y resaltar comentarios dentro del código (TODO, FIXME, IMPORTANT), facilitando la lectura, el mantenimiento y la identificación de tareas pendientes o secciones críticas.

ESLint
  Herramienta fundamental para el análisis estático del código, que ayuda a detectar errores, inconsistencias y malas prácticas en tiempo de desarrollo.
  Contribuye a mantener un código limpio, consistente y alineado con estándares definidos.

SonarQube (SonarLint)
  Extensión orientada a la detección temprana de problemas de calidad y seguridad en el código.
  Permite identificar vulnerabilidades, código duplicado y posibles bugs, promoviendo el desarrollo de software más robusto y confiable.

Estas herramientas permiten construir una base sólida desde las primeras etapas del proyecto, reduciendo deuda técnica y facilitando futuras ampliaciones del sistema