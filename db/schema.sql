-- Esquema de la base de datos del sitio de Restauración y Avivamiento.
-- Ejecutar UNA SOLA VEZ desde el editor de consultas de Vercel Postgres
-- (Storage -> tu base de datos -> pestaña "Query").

CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('evento', 'articulo', 'devocional')),
  activa BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cuerpo TEXT,
  imagen_url TEXT,
  fecha DATE,
  hora TEXT,
  lugar TEXT,
  enlace TEXT,
  referencia TEXT,
  versiculo TEXT,
  oracion TEXT,
  aplicacion TEXT,
  audio_url TEXT,
  autor TEXT,
  publicado BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_categoria_idx ON items (categoria_id, publicado, orden);

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT
);

-- Categorías iniciales. "orden" define en qué posición aparecen en la página.
INSERT INTO categorias (slug, nombre, tipo, activa, orden) VALUES
  ('agenda', 'Agenda', 'evento', true, 1),
  ('novedades', 'Novedades', 'articulo', true, 2),
  ('devocionales', 'Devocional del día', 'devocional', true, 3),
  ('misiones', 'Misiones', 'articulo', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Claves de configuración disponibles (quedan vacías hasta que se completen desde /admin).
INSERT INTO configuracion (clave, valor) VALUES
  ('hero_imagen_url', ''),
  ('contacto_direccion', ''),
  ('contacto_mapa_url', ''),
  ('contacto_whatsapp', ''),
  ('contacto_instagram', ''),
  ('contacto_facebook', ''),
  ('contacto_youtube', ''),
  ('ofrendas_url', ''),
  ('ofrendas_titulo', 'Colaborá con la obra')
ON CONFLICT (clave) DO NOTHING;
