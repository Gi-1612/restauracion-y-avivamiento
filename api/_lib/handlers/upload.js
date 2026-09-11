import { handleUpload } from "@vercel/blob/client";
import { exigirSesion } from "../auth.js";

// El navegador sube el archivo directo a Vercel Blob; esta ruta solo autoriza
// la subida (así los archivos no pasan por nuestra función serverless).
export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      error: "Falta conectar el almacenamiento de imágenes (Blob) en Vercel, o falta hacer un redeploy después de conectarlo.",
    });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"],
        addRandomSuffix: true,
        maximumSizeInBytes: 8 * 1024 * 1024,
      }),
    });
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error en /api/admin/upload:", error);
    res.status(400).json({ error: error.message, stack: error.stack });
  }
}
