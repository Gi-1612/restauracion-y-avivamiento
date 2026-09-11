import React from "react";
import { Loader2, X } from "lucide-react";

export function Modal({ titulo, onCerrar, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#1B2029" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium" style={{ color: "#F2ECDD" }}>
            {titulo}
          </h2>
          <button onClick={onCerrar} aria-label="Cerrar">
            <X size={20} style={{ color: "#F2ECDD" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Campo({ etiqueta, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] font-medium" style={{ color: "#B7BFCC" }}>
        {etiqueta}
      </span>
      {children}
    </label>
  );
}

const claseInput =
  "w-full rounded-lg px-3 py-2.5 text-[14px] outline-none border border-transparent focus:border-[#E8A33D]";

export function Input(props) {
  return <input {...props} className={`${claseInput} ${props.className || ""}`} style={{ backgroundColor: "#12151C", color: "#F2ECDD", ...props.style }} />;
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`${claseInput} resize-none ${props.className || ""}`}
      style={{ backgroundColor: "#12151C", color: "#F2ECDD", ...props.style }}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${claseInput} ${props.className || ""}`} style={{ backgroundColor: "#12151C", color: "#F2ECDD" }}>
      {children}
    </select>
  );
}

export function Boton({ variante = "primario", cargando, children, className, ...props }) {
  const estilos = {
    primario: { backgroundColor: "#E8A33D", color: "#241B0E" },
    secundario: { backgroundColor: "rgba(255,255,255,0.06)", color: "#F2ECDD" },
    peligro: { backgroundColor: "rgba(224,135,106,0.15)", color: "#E0876A" },
  };
  return (
    <button
      {...props}
      disabled={cargando || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium disabled:opacity-60 ${className || ""}`}
      style={estilos[variante]}
    >
      {cargando && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Interruptor({ activo, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!activo)}
      disabled={disabled}
      aria-pressed={activo}
      className="w-10 h-6 rounded-full relative shrink-0 transition-colors disabled:opacity-50"
      style={{ backgroundColor: activo ? "#E8A33D" : "rgba(255,255,255,0.15)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{ backgroundColor: "#12151C", left: activo ? "18px" : "2px" }}
      />
    </button>
  );
}

export function Tarjeta({ children, className }) {
  return (
    <div className={`rounded-xl p-5 ${className || ""}`} style={{ backgroundColor: "#1B2029" }}>
      {children}
    </div>
  );
}

export function Alerta({ tipo = "error", children }) {
  const colores = {
    error: { backgroundColor: "rgba(224,135,106,0.12)", color: "#E0876A" },
    ok: { backgroundColor: "rgba(62,92,70,0.2)", color: "#8FCB9C" },
  };
  return (
    <div className="rounded-lg px-3 py-2.5 text-[13px]" style={colores[tipo]}>
      {children}
    </div>
  );
}
