# Contribuir a Outward Sign

¡Gracias por su interés en contribuir a Outward Sign! Este proyecto está construido por católicos para la comunidad católica, y damos la bienvenida a las contribuciones de desarrolladores que quieren ayudar a las parroquias a celebrar liturgias hermosas.

## Tabla de Contenidos

- [Comenzando](#comenzando)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Comprendiendo el Código](#comprendiendo-el-código)
- [Encontrando Problemas en los que Trabajar](#encontrando-problemas-en-los-que-trabajar)
- [Flujo de Trabajo de Contribución](#flujo-de-trabajo-de-contribución)
- [Estándares de Código](#estándares-de-código)
- [Requisitos de Pruebas](#requisitos-de-pruebas)
- [Pautas para Pull Requests](#pautas-para-pull-requests)
- [Obteniendo Ayuda](#obteniendo-ayuda)

---

## Comenzando

### Requisitos Previos

Antes de comenzar, asegúrese de tener:

- **Node.js** (v18 o superior)
- Gestor de paquetes **npm** o **pnpm**
- **Git** para control de versiones
- Una **cuenta de GitHub**
- **Supabase CLI** (para trabajo de base de datos)
- Conocimientos básicos de **TypeScript**, **React** y **Next.js**

### Stack Tecnológico

Outward Sign está construido con tecnologías web modernas:

- **Frontend:** Next.js 15+ con App Router, React, TypeScript
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Componentes UI:** Primitivos Radix UI con shadcn/ui
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Pruebas:** Playwright para pruebas de extremo a extremo
- **Despliegue:** Vercel

---

## Configuración del Entorno de Desarrollo

### 1. Fork y Clonar el Repositorio

Haga fork del repositorio en GitHub, luego clone su fork:

```
git clone https://github.com/SU-USUARIO/outwardsign.git
cd outwardsign
git remote add upstream https://github.com/CatholicOS/outwardsign.git
```

### 2. Instalar Dependencias

```
npm install
```

### 3. Configurar Variables de Entorno

Cree un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=url_de_su_proyecto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=su_clave_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=su_clave_service_role
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Contacte a los mantenedores para credenciales de base de datos de desarrollo o configure su propio proyecto Supabase.

### 4. Ejecutar Migraciones de Base de Datos

```
npx supabase login
npx supabase link --project-ref referencia-de-su-proyecto
npx supabase db push
```

### 5. Iniciar el Servidor de Desarrollo

```
npm run dev
```

Visite http://localhost:3000 para ver la aplicación en funcionamiento.

---

## Comprendiendo el Código

### Estructura del Proyecto

```
outwardsign/
├── src/
│   ├── app/              # Páginas Next.js App Router
│   │   ├── (main)/       # Rutas autenticadas
│   │   ├── documentation/# Documentación pública
│   │   └── api/          # Rutas API
│   ├── components/       # Componentes React
│   ├── lib/              # Utilidades y server actions
│   │   ├── actions/      # Server actions (operaciones de base de datos)
│   │   ├── auth/         # Utilidades de autenticación
│   │   └── supabase/     # Cliente Supabase
│   └── types/            # Definiciones de tipos TypeScript
├── supabase/
│   └── migrations/       # Archivos de migración de base de datos
├── tests/                # Pruebas Playwright
├── docs/                 # Documentación para desarrolladores
└── CLAUDE.md             # Guía principal de desarrollo
```

### Archivos Clave para Leer

Antes de contribuir, familiarícese con:

1. **[CLAUDE.md](https://github.com/CatholicOS/outwardsign/blob/main/CLAUDE.md)** - Guía principal de desarrollo con patrones de arquitectura
2. **[docs/FORMS.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/FORMS.md)** - Patrones de implementación de formularios
3. **[docs/MODULE_CHECKLIST.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/MODULE_CHECKLIST.md)** - Guía para crear nuevos módulos
4. **[docs/TESTING_GUIDE.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/TESTING_GUIDE.md)** - Patrones y requisitos de pruebas

### Arquitectura de Módulos

Outward Sign está organizado en **módulos** (Bodas, Funerales, Bautismos, Misas, etc.). Cada módulo sigue un patrón consistente de 9 archivos:

1. Página de Lista (Servidor)
2. Componente Cliente de Lista
3. Página de Creación (Servidor)
4. Página de Vista (Servidor)
5. Página de Edición (Servidor)
6. Componente Envoltorio de Formulario
7. Componente de Formulario Unificado
8. Componente Cliente de Vista
9. Componente de Acciones de Formulario

Vea el **módulo de Bodas** (`src/app/(main)/weddings/`) como la implementación de referencia.

---

## Encontrando Problemas en los que Trabajar

### Buenos Primeros Issues

Busque issues etiquetados como `good first issue` en nuestra [página de GitHub Issues](https://github.com/CatholicOS/outwardsign/issues). Estas son tareas amigables para principiantes con requisitos claros.

### Áreas que Necesitan Ayuda

- **Contenido Bilingüe:** Mejorando traducciones al español
- **Documentación:** Escribiendo guías de usuario y tutoriales
- **Pruebas:** Agregando cobertura de pruebas para características
- **Corrección de Errores:** Abordando errores reportados
- **Nuevas Características:** Implementando nuevos módulos de sacramentos
- **Accesibilidad:** Mejorando navegación por teclado y soporte de lector de pantalla

### Antes de Comenzar

1. **Verifique issues existentes** para evitar trabajo duplicado
2. **Comente en el issue** para que otros sepan que está trabajando en él
3. **Haga preguntas** si los requisitos no están claros
4. **Discuta su enfoque** para cambios grandes antes de codificar

---

## Flujo de Trabajo de Contribución

### 1. Crear una Rama de Características

Actualice su rama main y cree una nueva rama:

```
git checkout main
git pull upstream main
git checkout -b feature/nombre-de-su-caracteristica
```

Convenciones de nomenclatura de ramas:
- feature/ para nuevas características
- fix/ para correcciones de errores
- docs/ para actualizaciones de documentación
- test/ para agregar pruebas

### 2. Hacer Sus Cambios

- Escriba código limpio y legible
- Siga patrones y convenciones existentes
- Agregue comentarios para lógica compleja
- Actualice la documentación si es necesario

### 3. Probar Sus Cambios

```
npm run dev
npm test
npm run type-check
npm run lint
```

### 4. Hacer Commit de Sus Cambios

```
git add .
git commit -m "Mensaje de commit descriptivo"
```

Formato de mensaje de commit:
- Use tiempo presente ("Add feature" no "Added feature")
- Sea específico y descriptivo
- Referencie números de issue cuando sea aplicable

Ejemplos:
- Add Baptism module following wedding pattern
- Fix date picker validation in event form
- Update Spanish translations for petition templates

### 5. Push a Su Fork

```
git push origin feature/nombre-de-su-caracteristica
```

### 6. Crear un Pull Request

1. Vaya a su fork en GitHub
2. Haga clic en "New Pull Request"
3. Seleccione su rama de características
4. Complete la plantilla de PR con:
   - Descripción de cambios
   - Números de issues relacionados
   - Capturas de pantalla (para cambios de UI)
   - Pasos de prueba

---

## Estándares de Código

### TypeScript

- Use TypeScript para todos los archivos nuevos
- Defina tipos e interfaces apropiados
- Evite tipos `any`
- Exporte tipos desde archivos de server actions

### Componentes React

- **Server Components por defecto** - Solo use `'use client'` cuando sea necesario
- Siga los patrones de componentes establecidos
- Use tipos de props apropiados
- Mantenga componentes enfocados y con un solo propósito

### Estilos

- Use clases de utilidad Tailwind CSS
- Siga diseño responsivo mobile-first
- Use tokens de color semánticos (nunca colores hardcoded)
- Soporte modo oscuro automáticamente con variables CSS
- **Nunca modifique estilos de inputs de formulario** (font-family, borders, backgrounds)

### Base de Datos

- Cree archivos de migración para todos los cambios de base de datos
- Use políticas de Row Level Security (RLS)
- Siga convenciones de nomenclatura:
  - Tablas: plural (ej., `weddings`, `baptisms`)
  - Columnas: singular (ej., `note`, no `notes`)
- Agregue índices apropiados para rendimiento

### Soporte Bilingüe

- Todo el texto orientado al usuario debe soportar inglés y español
- Agregue traducciones al archivo de constantes
- Siga el patrón en contenido bilingüe existente

---

## Requisitos de Pruebas

### Qué Probar

- Flujos de usuario (crear, editar, eliminar)
- Validación de formularios
- Autenticación y permisos
- Persistencia de datos
- Navegación y enrutamiento

### Escribiendo Pruebas

Ejemplo de archivo de prueba (tests/weddings.spec.ts):

```
import { test, expect } from '@playwright/test'

test('should create a new wedding', async ({ page }) => {
  await page.goto('/weddings/create')

  await page.getByLabel('Bride Name').fill('Maria Garcia')
  await page.getByLabel('Groom Name').fill('Juan Rodriguez')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page).toHaveURL(/\/weddings\/[a-f0-9-]+$/)
})
```

Vea [TESTING_GUIDE.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/TESTING_GUIDE.md) para documentación completa de pruebas.

---

## Pautas para Pull Requests

### Antes de Enviar

- [ ] El código sigue las convenciones del proyecto
- [ ] Las pruebas pasan localmente
- [ ] TypeScript compila sin errores
- [ ] Las verificaciones de lint pasan
- [ ] Los cambios están documentados
- [ ] El contenido bilingüe está completo
- [ ] La UI es responsiva y accesible

### Plantilla de Descripción de PR

Al crear un pull request, incluya:

**Descripción:** Breve descripción de los cambios

**Issue Relacionado:** Fixes #123

**Tipo de Cambio:**
- Corrección de error
- Nueva característica
- Actualización de documentación
- Refactorización

**Capturas de Pantalla:** Agregar capturas de pantalla para cambios de UI si aplica

**Pasos de Prueba:**
1. Ir a...
2. Hacer clic en...
3. Verificar que...

**Lista de Verificación:**
- Pruebas agregadas/actualizadas
- Documentación actualizada
- Sigue estándares de código
- Soporte bilingüe incluido

### Proceso de Revisión

1. Los mantenedores revisarán su PR
2. Aborde cualquier cambio solicitado
3. Una vez aprobado, su PR será fusionado
4. Su contribución será acreditada en las notas de lanzamiento

---

## Obteniendo Ayuda

### ¿Preguntas Sobre Contribuir?

- **GitHub Discussions:** Haga preguntas y discuta ideas
- **GitHub Issues:** Reporte errores o sugiera características
- **Documentación:** Revise la carpeta docs/ para guías detalladas
- **CLAUDE.md:** Revise la guía principal de desarrollo

### ¿Preguntas de Desarrollo?

Si está atascado en:
- Configurar su entorno
- Entender la arquitectura
- Implementar una característica
- Escribir pruebas

Abra una GitHub Discussion o comente en el issue relevante. ¡Los mantenedores y la comunidad están aquí para ayudar!

### Código de Conducta

Sea respetuoso, colaborativo y constructivo. Todos estamos trabajando juntos para ayudar a las parroquias a celebrar liturgias hermosas.

---

## Reconocimiento

Los contribuyentes son reconocidos en:
- Lista de contribuyentes de GitHub
- Notas de lanzamiento
- Documentación del proyecto

Su trabajo ayuda a parroquias alrededor del mundo a celebrar los sacramentos hermosamente. ¡Gracias por contribuir a Outward Sign!

---

**¿Listo para contribuir?** ¡Encuentre un [good first issue](https://github.com/CatholicOS/outwardsign/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) y comience hoy!
