# Programación de Misas

Crea horarios recurrentes de Misas y asigna roles litúrgicos sistemáticamente.

## Descripción General

El sistema de Programación de Misas ayuda a las parroquias a gestionar sus horarios regulares de Misa y asignar ministros litúrgicos eficientemente. En lugar de crear registros individuales de Misa uno por uno, la Programación de Misas te permite definir plantillas recurrentes y generar automáticamente Misas para semanas o meses a la vez.

## Comprender el Sistema de Programación de Misas

La Programación de Misas consta de cinco componentes interconectados:

### 1. Plantillas de Horarios de Misa

**Plantillas de horario de Misa recurrentes semanales**

Define el horario regular de Misa de tu parroquia (ej., "Sábado 5:00 PM Vigilia", "Domingo 9:00 AM", "Lunes 12:00 PM Misa Diaria"). Cada plantilla puede incluir presidentes predeterminados, ubicaciones y duración esperada.

### 2. Tipos de Misa

**Categorización de diferentes celebraciones de Misa**

Define tipos como "Misa Dominical", "Misa Diaria", "Día Santo", "Misa de Funeral", "Misa de Boda". Los Tipos de Misa ayudan a organizar y filtrar Misas, y pueden tener configuraciones o requisitos específicos.

### 3. Roles de Misa

**Definiciones de roles litúrgicos específicos de la parroquia**

Define los roles litúrgicos necesarios en tu parroquia (ej., "Lector", "MESC", "Monaguillo", "Cantor", "Ujier"). Cada rol puede tener una descripción y marcarse como activo o inactivo.

### 4. Plantillas de Roles de Misa

**Conjuntos de configuración de roles reutilizables**

Crea plantillas que definan qué roles se necesitan para diferentes contextos litúrgicos. Por ejemplo:
- "Roles de Misa Dominical" (2 Lectores, 4 MESC, 2 Monaguillos, 1 Cantor, 4 Ujieres)
- "Roles de Misa Diaria" (1 Lector, 2 MESC, 1 Servidor)
- "Roles de Misa Vigilia" (similar a Dominical pero con cantidades diferentes)

### 5. Miembros de Roles de Misa

**Directorio de personas disponibles para servir en roles litúrgicos**

Rastrea qué feligreses sirven en qué roles, incluyendo sus preferencias de disponibilidad, fechas de indisponibilidad e historial de asignaciones. Este es el puente entre los roles mismos y las personas que los llenan.

## Crear Tu Horario de Misas

### Paso 1: Definir Tipos de Misa

1. Navega a **Programación de Misas** > **Tipos de Misa**
2. Haz clic en **Nuevo Tipo de Misa**
3. Crea tipos para tu parroquia:
   - Misa Dominical
   - Misa Diaria (Entre semana)
   - Día Santo
   - Liturgia Especial
   - Misa de Funeral (si se rastrea separadamente)
4. Cada tipo puede tener descripción y estado activo

### Paso 2: Definir Roles de Misa

1. Navega a **Programación de Misas** > **Roles de Misa**
2. Haz clic en **Nuevo Rol**
3. Crea roles que tu parroquia usa:
   - Lector (Lector)
   - MESC (Ministro Extraordinario de la Sagrada Comunión)
   - Monaguillo
   - Cantor
   - Ministro de Música
   - Ujier
   - Sacristán
   - Cualquier otro rol específico de tu parroquia

### Paso 3: Crear Plantillas de Roles

1. Navega a **Programación de Misas** > **Plantillas de Roles de Misa**
2. Haz clic en **Nueva Plantilla**
3. Nombra la plantilla (ej., "Roles de Misa Dominical")
4. Agrega roles necesarios:
   - Selecciona rol (ej., Lector)
   - Especifica cantidad (ej., 2)
   - Repite para todos los roles
5. Guarda plantilla

**Plantillas de Ejemplo:**

**Roles de Misa Dominical:**
- Lector: 2
- MESC: 4
- Monaguillo: 2
- Cantor: 1
- Ujier: 4

**Roles de Misa Diaria:**
- Lector: 1
- MESC: 2
- Monaguillo: 1

### Paso 4: Crear Plantillas de Horarios de Misa

1. Navega a **Programación de Misas** > **Plantillas de Horarios de Misa**
2. Haz clic en **Nueva Plantilla**
3. Ingresa información de plantilla:
   - **Nombre** - "Sábado 5:00 PM Vigilia" o "Domingo 9:00 AM Misa"
   - **Descripción** - Detalles adicionales
   - **Día de la Semana** - Qué día ocurre esta Misa
   - **Activo** - Si está actualmente en uso

4. Agrega horarios de Misa (instancias específicas):
   - **Hora** - 5:00 PM, 9:00 AM, etc.
   - **Tipo de Día** - "Día De" o "Vigilia (Día Anterior)"
   - **Presidente Predeterminado** - Asigna si es consistente
   - **Ubicación Predeterminada** - Edificio de iglesia o capilla
   - **Duración** - Duración esperada en minutos (opcional)
   - **Homilista Predeterminado** - Si es diferente del presidente

5. Guarda plantilla

**Ejemplo:**
- Nombre de Plantilla: "Misa del Sábado por la Tarde"
- Día de la Semana: Sábado
- Hora de Misa: 5:00 PM, Día De
- Ubicación Predeterminada: Iglesia Principal
- Duración: 60 minutos

### Paso 5: Agregar Miembros de Roles

1. Navega a **Programación de Misas** > **Miembros de Roles**
2. Ve directorio de personas que sirven
3. Para cada persona, haz clic en **Gestionar Membresías**
4. Agrégalos a roles que sirven:
   - Selecciona rol (ej., Lector)
   - Opcionalmente establece preferencias (si tu parroquia rastrea esto)
   - Guardar

Este directorio conecta personas con los roles que llenan.

## Generar Misas desde Plantillas

Una vez configuradas las plantillas, genera Misas recurrentes:

### Método 1: Generador de Horario de Misas (Recomendado)

1. Navega a **Programación de Misas** > **Programar Misas**
2. Selecciona rango de fechas (ej., próximos 3 meses)
3. Selecciona qué plantillas usar
4. El sistema genera registros de Misa para todas las fechas
5. Cada Misa incluye:
   - Fecha y hora de plantilla
   - Presidente predeterminado de plantilla
   - Ubicación de plantilla
   - Tipo de Misa (si está configurado)
   - Marcador de posición para asignaciones de roles

### Método 2: Creación Manual de Misa

1. Navega a **Misas** > **Nueva Misa**
2. Selecciona del menú desplegable de plantilla
3. La plantilla pre-llena campos
4. Ajusta según sea necesario
5. Guarda Misa individual

## Asignar Ministros a Misas Programadas

Después de generar Misas, asigna personas a roles:

### Asignación Manual

1. Abre registro individual de Misa
2. Ve a sección "Ministros" o "Roles"
3. Para cada rol:
   - Selecciona persona de Miembros de Roles
   - Confirma asignación
4. Guardar

### Asignación Masiva (Si Está Disponible)

Algunas parroquias usan herramientas adicionales para:
- Auto-asignar basado en disponibilidad
- Rotar asignaciones equitativamente
- Respetar fechas de indisponibilidad
- Equilibrar carga de trabajo

Consulta con tu administrador parroquial sobre características de asignación masiva.

## Directorio de Miembros de Roles de Misa

### Propósito

El directorio de Miembros de Roles muestra todas las personas que sirven en roles litúrgicos, facilitando:
- Contactar ministros
- Ver quién sirve en cada rol
- Rastrear disponibilidad y preferencias
- Ver historial de asignaciones

### Usar el Directorio

1. Navega a **Programación de Misas** > **Miembros de Roles**
2. Busca personas por nombre
3. Haz clic en persona para ver:
   - Información de contacto
   - Roles que sirven
   - Asignaciones actuales
   - Preferencias de disponibilidad (si se rastrean)

### Gestionar Información de Miembros

Para cada persona que sirve:
- Agrégalos a roles apropiados
- Actualiza información de contacto
- Rastrea preferencias de disponibilidad
- Registra fechas de indisponibilidad
- Ve historial de asignaciones

## Flujos de Trabajo Comunes

### Configurar un Nuevo Horario Parroquial

1. **Semana 1: Definir Estructura**
   - Crea Tipos de Misa
   - Crea Roles de Misa
   - Construye Plantillas de Roles

2. **Semana 2: Crear Plantillas**
   - Crea Plantillas de Horarios de Misa para todas las Misas recurrentes
   - Prueba generar Misas para un mes
   - Verifica que plantillas funcionen correctamente

3. **Semana 3: Construir Directorio**
   - Agrega todos los ministros a Miembros de Roles
   - Asígnalos a roles apropiados
   - Recopila preferencias de disponibilidad

4. **Semana 4: Lanzar**
   - Genera Misas para 3-6 meses
   - Comienza a asignar ministros
   - Entrena personal en sistema

### Preparación Mensual de Misas

1. **Principio de Mes**
   - Genera próximos 2-3 meses de Misas (si aún no se hizo)
   - Revisa liturgias especiales (Días Santos, Solemnidades)

2. **Mitad de Mes**
   - Asigna ministros a Misas próximas
   - Confirma presidentes para todas las Misas
   - Envía recordatorios a ministros asignados

3. **Fin de Mes**
   - Finaliza asignaciones para próximo mes
   - Imprime horarios para sacristía
   - Publica horario de ministros

### Manejar Cambios

**Cambio de Presidente:**
1. Abre Misa(s) afectada(s)
2. Actualiza campo de presidente
3. Guardar

**Cambio de Necesidad de Rol:**
1. Actualiza Plantilla de Roles
2. Regenera Misas afectadas, o
3. Ajusta manualmente Misas individuales

**Persona No Disponible:**
1. Abre Miembros de Roles para persona
2. Agrega fecha de indisponibilidad
3. Reasigna sus Misas próximas

## Plantillas de Horarios de Misa en Detalle

### Estructura de Plantilla

Cada plantilla representa un horario de Misa recurrente:

- **Nombre** - Nombre descriptivo para uso del personal
- **Día de la Semana** - Qué día ocurre esta Misa
- **Activo** - ¿Actualmente en uso?
- **Elementos** - Horarios de Misa específicos dentro de la plantilla

### Elementos de Plantilla

Cada elemento dentro de una plantilla especifica:

- **Hora** - Hora específica (ej., 9:00 AM)
- **Tipo de Día** - "Día De" o "Vigilia (Día Anterior)"
- **Presidente** - Sacerdote celebrante predeterminado
- **Ubicación** - Dónde se celebra la Misa
- **Duración** - Duración en minutos
- **Homilista** - Quién predica (si no es el presidente)

**Ejemplo:**

Plantilla: "Misas del Sábado por la Tarde"
- Día de la Semana: Sábado
- Elementos:
  - 4:00 PM, Vigilia, P. Smith, Iglesia Principal, 60 min
  - 5:30 PM, Vigilia, P. Jones, Capilla, 45 min

### Vigilia vs. Día De

- **Día De** - Misa en el día litúrgico actual
- **Vigilia (Día Anterior)** - Misa en la víspera cumpliendo la obligación del día siguiente

Ejemplo: Misa del Sábado 5:00 PM establecida en "Vigilia" cuenta como Misa Dominical.

## Plantillas de Roles de Misa en Detalle

### Propósito

Las Plantillas de Roles definen la configuración "estándar" de ministros para diferentes tipos de Misa, facilitando:
- Aplicar necesidades de rol consistentes en Misas similares
- Configurar rápidamente nuevas Misas
- Ajustar cantidades de roles sistemáticamente

### Crear Plantillas Efectivas

**Piensa en tus tipos de Misa:**

- **Misa Dominical** - Complemento completo (múltiples lectores, MESC, servidores, ujieres)
- **Misa Diaria** - Mínimo (1 lector, 1-2 MESC, 1 servidor)
- **Día Santo** - Similar a Dominical
- **Liturgia Especial** - Necesidades personalizadas

**Incluye todos los roles necesarios:**
- No olvides roles menos obvios (ujieres, sacristanes)
- Considera variaciones estacionales (más servidores en Navidad/Pascua)
- Ten en cuenta prácticas únicas de tu parroquia

### Aplicar Plantillas

Al crear o editar una Misa:
1. Selecciona plantilla de roles
2. El sistema puebla todos los roles con cantidades correctas
3. Comienza a asignar personas a cada espacio
4. Ajusta si esta Misa específica tiene necesidades diferentes

## Mejores Prácticas

### Gestión de Plantillas

- **Nombres Descriptivos** - "Sábado 5PM Vigilia" no "Plantilla 1"
- **Mantén Plantillas Actualizadas** - Cuando cambia horario, actualiza plantillas
- **Archiva Plantillas Antiguas** - Marca inactivas en lugar de eliminar
- **Documenta Predeterminados** - Anota por qué ciertos presidentes/ubicaciones son predeterminados

### Gestión de Roles

- **Nombres de Rol Consistentes** - Usa mismo nombre en todas las plantillas
- **Descripciones Claras** - Explica qué hace cada rol
- **Estado Activo** - Marca roles no usados inactivos
- **Revisa Anualmente** - Asegura que lista de roles coincida con necesidades actuales

### Prácticas de Programación

- **Planifica con Anticipación** - Genera 3-6 meses de Misas
- **Tiempo de Amortiguación** - No esperes hasta último minuto para asignar ministros
- **Confirma Temprano** - Contacta ministros con bastante anticipación
- **Rastrea Cambios** - Documenta cuándo/por qué ocurren cambios de presidente

### Gestión de Ministros

- **Mantén Directorio Actual** - Actualiza info de contacto regularmente
- **Respeta Disponibilidad** - Honra fechas de indisponibilidad y preferencias
- **Asignación Equilibrada** - Distribuye asignaciones equitativamente
- **Agradece Ministros** - Reconoce regularmente su servicio

## Integración con Otros Módulos

### Módulo de Misas

Todas las Misas programadas aparecen en el módulo principal de Misas:
- Edita Misas individuales según sea necesario
- Anula predeterminados de plantilla para fechas específicas
- Agrega intenciones de Misa
- Genera guiones y materiales de Misa

### Calendario

Misas programadas aparecen en calendario parroquial:
- Ve todas las Misas en vista de calendario
- Exporta a sistemas de calendario externos
- Ve Misas junto con otros eventos

### Módulo de Personas

Los ministros son personas en el directorio parroquial:
- La información de contacto viene de Personas
- Puede ver perfil completo de persona
- Las actualizaciones al registro de persona se reflejan en Miembros de Roles

## Informes y Vistas

### Informe de Horario de Misas

Ve Misas próximas:
- Filtra por rango de fechas, tipo de Misa, presidente
- Ve qué Misas carecen de asignaciones de ministros
- Identifica brechas en horario

### Informe de Asignación de Ministros

Rastrea asignaciones de ministros:
- Quién está asignado a qué Misas
- Frecuencia y distribución de asignaciones
- Identifica ministros sobre/sub-utilizados

### Informe de Cobertura de Roles

Asegura que todos los roles estén cubiertos:
- Qué Misas faltan ministros
- Qué roles son más difíciles de llenar
- Prioridades de reclutamiento

## Preguntas Frecuentes

**P: ¿Tengo que usar el sistema de Programación de Misas?**
R: No, puedes crear registros individuales de Misa manualmente en el módulo de Misas. La Programación de Misas es para parroquias con horarios recurrentes que quieren automatización.

**P: ¿Puedo editar Misas generadas desde plantillas?**
R: ¡Sí! Una vez generada, cada Misa es un registro independiente. Edita según sea necesario sin afectar la plantilla.

**P: ¿Qué pasa si cambio una plantilla después de generar Misas?**
R: Las Misas previamente generadas no se ven afectadas. La plantilla solo afecta la generación futura de Misas.

**P: ¿Puede una persona tener múltiples roles?**
R: Sí, agrégalos a múltiples roles en el directorio de Miembros de Roles. Al asignar, aparecerán en menús desplegables para todos sus roles.

**P: ¿Cómo manejo Días Santos que no están en el horario regular?**
R: Crea una plantilla específica para Días Santos anuales, o crea esas Misas manualmente con el Tipo de Misa apropiado.

**P: ¿Pueden diferentes Misas usar diferentes plantillas de roles?**
R: Sí, aplica la plantilla de roles apropiada al crear o editar cada Misa.

**P: ¿Qué pasa si un presidente está enfermo y no puede celebrar una Misa programada?**
R: Abre el registro de Misa y cambia el presidente. También puedes enviar notificaciones (fuera de Outward Sign) a ministros y feligreses afectados.

**P: ¿Con cuánta anticipación debo programar Misas?**
R: La mayoría de parroquias generan 3-6 meses a la vez. Algunas van más lejos para planificación anual.

## Características Relacionadas

- [Gestión de Misas](./mass-liturgies) - Trabaja con celebraciones individuales de Misa
- [Intenciones de Misa](./mass-intentions) - Rastrea solicitudes de intenciones de Misa
- [Calendario](../user-guides/events) - Ve todos los eventos parroquiales incluyendo Misas
- [Gestión de Personas](../user-guides/people) - Directorio parroquial
- [Guía de Personal](../user-guides/staff-guide) - Guía completa para personal parroquial

## ¿Necesitas Ayuda?

Contacta a tu administrador parroquial o visita [outwardsign.church](https://outwardsign.church) para soporte.
