# Restauración y Avivamiento — Web App

Landing page de la iglesia + panel de administración (`/admin`) para cargar
la agenda, novedades, devocionales y las categorías que quieras, sin tocar
código. Está lista para publicarse en Vercel de forma gratuita.

## Configuración inicial (una sola vez)

El sitio necesita una base de datos y un lugar para guardar las fotos que
subas. Los dos se conectan desde el panel de Vercel, sin escribir código.

1. **Base de datos** — En tu proyecto de Vercel: pestaña **Storage** →
   **Create Database** → elegí **Postgres** → seguí los pasos para
   conectarla al proyecto. Vercel agrega solo las variables de entorno que
   necesita (`POSTGRES_URL`, etc.).
2. **Cargar las tablas** — Dentro de esa base de datos, andá a la pestaña
   **Query** (o "Data" → consola SQL) y pegá todo el contenido del archivo
   [`db/schema.sql`](db/schema.sql) de este proyecto. Ejecutalo una sola vez.
3. **Almacenamiento de imágenes** — Otra vez en **Storage** → **Create
   Database** (o "Create Store") → elegí **Blob** → conectala al proyecto.
4. **Clave de seguridad** — En **Settings → Environment Variables**, agregá
   una variable llamada `ADMIN_JWT_SECRET` con cualquier texto largo y al
   azar (por ejemplo, generado en https://1password.com/password-generator/,
   sin necesidad de guardarlo en ningún lado más que ahí). Esto es lo que
   protege el login del panel.
5. **Volver a publicar** — Después de agregar las variables, hacé un
   "Redeploy" del proyecto en Vercel para que las tome.
6. **Crear tu usuario** — Entrá a `tusitio.vercel.app/admin`. La primera vez
   te va a pedir crear el primer administrador (nombre, email y
   contraseña). Después de eso, esa pantalla se desactiva sola y para sumar
   a alguien más se hace desde **Administradores** dentro del panel.

## Usar el panel (`/admin`)

- **Categorías**: activar/desactivar secciones del sitio, o crear una nueva
  (por ejemplo "Misiones") eligiendo si es de tipo Evento, Artículo o
  Devocional.
- Dentro de cada categoría: cargar, editar, publicar/ocultar o eliminar
  publicaciones, con foto incluida.
- **Apariencia**: la foto de fondo de la portada y los datos de contacto /
  redes sociales.
- **Ofrendas**: el link y el texto del botón para colaborar (si se deja
  vacío, no se muestra).
- **Administradores**: invitar a más personas o cambiar tu propia
  contraseña.

## Si más adelante contratás un developer

Puede correr el proyecto en su computadora con:

```
npm install
npm run dev
```

Y generar la versión de producción con:

```
npm run build
```

Para desarrollo local hace falta además una base Postgres propia y correr
`vercel dev` (o un servidor equivalente) en el puerto 3000, que es a donde
`npm run dev` redirige las llamadas a `/api`.

## Contenido

- `src/App.jsx` — el sitio público (portada, y una sección por cada
  categoría activa)
- `src/admin/` — el panel de administración
- `api/` — funciones del servidor (login, categorías, publicaciones,
  configuración, subida de imágenes)
- `db/schema.sql` — la estructura de la base de datos
- `public/` — el logo y los íconos de la app
- Configuración de Tailwind CSS y PWA (para que se pueda "agregar a inicio"
  en el celular)
