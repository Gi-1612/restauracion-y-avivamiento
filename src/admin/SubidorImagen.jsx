import React, { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";

export default function SubidorImagen({ value, onChange, carpeta }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");
    try {
      const nombreArchivo = `${carpeta}/${Date.now()}-${file.name}`.replace(/\s+/g, "-");
      const resultado = await upload(nombreArchivo, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onChange(resultado.url);
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setError(`No se pudo subir la imagen: ${err.message || "error desconocido"}`);
    } finally {
      setSubiendo(false);
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
        {subiendo ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <ImageIcon size={15} />
        )}
        {subiendo ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
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
