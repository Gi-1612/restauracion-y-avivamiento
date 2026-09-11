import { handleUpload } from "@vercel/blob/client";
import { exigirSesion } from "../_lib/auth.js";

// El navegador sube el archivo directo a Vercel Blob; esta ruta solo autoriza
// la subida (así los archivos no pasan por nuestra función serverless).
export default async function handler(req, res) {
  const sesion = exigirSesion(req, res);
  if (!sesion) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
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
    res.status(400).json({ error: error.message });
  }
}
