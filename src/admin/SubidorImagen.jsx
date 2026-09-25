import React, { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";

const TAMANO_MAXIMO = 8 * 1024 * 1024; // 8 MB

export default function SubidorImagen({ value, onChange, carpeta }) {
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (file.size > TAMANO_MAXIMO) {
      setError(
        `Esa foto pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es 8 MB. Probá achicarla o sacarle una captura de pantalla y subir eso.`
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setSubiendo(true);
    setProgreso(0);
    try {
      const nombreArchivo = `${carpeta}/${Date.now()}-${file.name}`.replace(/\s+/g, "-");
      const subida = upload(nombreArchivo, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        onUploadProgress: (p) => setProgreso(Math.round(p.percentage)),
      });
      const tiempoLimite = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("La subida está tardando demasiado. Probá con mejor señal o una foto más liviana.")), 45000)
      );
      const resultado = await Promise.race([subida, tiempoLimite]);
      onChange(resultado.url);
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setError(err.message || "No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setSubiendo(false);
      setProgreso(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: "#FAF5EA" }}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            aria-label="Quitar imagen"
          >
            <X size={14} style={{ color: "#2A2620" }} />
          </button>
        </div>
      )}
      <label
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-[13px] cursor-pointer"
        style={{ borderColor: "rgba(0,0,0,0.15)", color: "#8A7F6A" }}
      >
        {subiendo ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
        {subiendo ? `Subiendo... ${progreso}%` : value ? "Cambiar imagen" : "Subir imagen"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={manejarArchivo}
          disabled={subiendo}
        />
      </label>
      {error && (
        <p className="text-[12px]" style={{ color: "#C1523A" }}>
          {error}
        </p>
      )}
    </div>
  );
}
