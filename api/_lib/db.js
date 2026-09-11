import pg from "pg";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let pool;

// Reutilizamos el pool entre invocaciones de la misma función serverless
// (Vercel puede "recalentar" la función y reusar el proceso de Node).
function getPool() {
  if (!pool) {
    if (!connectionString) {
      throw new Error(
        "Falta la variable de entorno POSTGRES_URL. Conectá una base de datos Postgres en Vercel (Storage) o configurala en .env.local para desarrollo."
      );
    }
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}
