import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Calendar,
  Bell,
  Newspaper,
  Settings,
  Check,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  X,
  Play,
  Pause,
  Share2,
  BookOpen,
  ChevronDown,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import { fetchSheet, mapDevocional, mapReunion, mapNovedad, elegirDevocionalDeHoy } from "./lib/sheets";

const LOGO_IGLESIA = "/logo.png";

const HISTORIAL_EJEMPLO = [
  { id: 1, fecha: "13 jul", fechaLabel: "13 jul", mes: "Julio", tema: "Perseverancia", referencia: "Juan 15:5", titulo: "Permanecer en la Vid", versiculo: "\u201cYo soy la vid, vosotros los pámpanos…\u201d", extracto: "El fruto llega como consecuencia de permanecer conectados, no del esfuerzo aislado." },
  { id: 2, fecha: "12 jul", fechaLabel: "12 jul", mes: "Julio", tema: "Perseverancia", referencia: "Hebreos 10:36", titulo: "La Paciencia que Sostiene", versiculo: "\u201cVosotros tenéis necesidad de paciencia…\u201d", extracto: "La promesa se recibe después de haber hecho la voluntad de Dios, no antes." },
  { id: 3, fecha: "10 jul", fechaLabel: "10 jul", mes: "Julio", tema: "Fe", referencia: "Marcos 11:24", titulo: "Pedir Creyendo", versiculo: "\u201cTodo lo que pidiereis orando, creed que lo recibiréis…\u201d", extracto: "La fe no es negar la dificultad, es confiar en Quién la puede resolver." },
  { id: 4, fecha: "8 jul", fechaLabel: "8 jul", mes: "Julio", tema: "Restauración", referencia: "Joel 2:25", titulo: "Los Años que la Oruga Comió", versiculo: "\u201cY os restituiré los años que comió la oruga…\u201d", extracto: "Dios no solo perdona: también restaura lo que el tiempo perdido se llevó." },
  { id: 5, fecha: "29 jun", fechaLabel: "29 jun", mes: "Junio", tema: "Gracia", referencia: "Efesios 2:8", titulo: "Salvos por Gracia", versiculo: "\u201cPorque por gracia sois salvos, por medio de la fe…\u201d", extracto: "No hay mérito propio que alcance: todo es don, y eso nos libera." },
  { id: 6, fecha: "22 jun", fechaLabel: "22 jun", mes: "Junio", tema: "Fe", referencia: "Hebreos 11:1", titulo: "La Certeza de lo que se Espera", versiculo: "\u201cEs, pues, la fe la certeza de lo que se espera…\u201d", extracto: "Creer no es ver primero: es sostenerse en lo que Dios ya prometió." },
  { id: 7, fecha: "15 jun", fechaLabel: "15 jun", mes: "Junio", tema: "Restauración", referencia: "Isaías 61:3", titulo: "Gloria en Vez de Ceniza", versiculo: "\u201c…para ordenar que a los afligidos de Sion se les dé gloria en lugar de ceniza…\u201d", extracto: "Donde hubo pérdida, Dios promete un intercambio: belleza a cambio de ceniza." },
  { id: 8, fecha: "8 jun", fechaLabel: "8 jun", mes: "Junio", tema: "Gracia", referencia: "2 Corintios 12:9", titulo: "Poder en la Debilidad", versiculo: "\u201cBástate mi gracia; porque mi poder se perfecciona en la debilidad…\u201d", extracto: "La debilidad no es un obstáculo para Dios: es el lugar donde su poder se nota más." },
];

const DEVOCIONAL_EJEMPLO = {
  fechaLabel: "Lunes 13 de julio",
  referencia: "Juan 15:5 (RVR1960)",
  titulo: "Permanecer en la Vid",
  versiculo:
    "\u201cYo soy la vid, vosotros los pámpanos; el que permanece en mí… este lleva mucho fruto; porque separados de mí nada podéis hacer.\u201d",
  desarrollo:
    "Jesús se presenta como la vid verdadera: la vida y el fruto no nacen del esfuerzo aislado, sino de mantenerse unidos a Él día a día. Un pámpano no lucha por dar fruto; simplemente permanece conectado, y el fruto llega como consecuencia natural de esa conexión. Muchas veces medimos nuestra vida espiritual por cuánto hacemos, cuando en realidad se mide por cuánto permanecemos.",
  oracion:
    "Señor, quiero permanecer en Vos hoy. Ayudame a no depender de mi propio esfuerzo, sino a mantenerme conectado a tu presencia en cada decisión del día. Que mi vida dé fruto porque está unida a la tuya. Amén.",
  aplicacion:
    "Elegí un momento concreto de tu día (al levantarte, en el trabajo, antes de dormir) para detenerte 2 minutos y recordar que estás unido a Él. No se trata de hacer más, sino de permanecer.",
  audioUrl: "",
};

const REUNIONES_EJEMPLO = [
  { id: 1, titulo: "Culto Central", dia: "Domingo 19/07", hora: "19:00", lugar: "Templo Central", recordar: true },
  { id: 2, titulo: "Escuela para Padres", dia: "Martes 21/07", hora: "20:00", lugar: "Salón Anexo", recordar: false },
  { id: 3, titulo: "Mi Peña Cristiana", dia: "Viernes 24/07", hora: "21:00", lugar: "Patio Central", recordar: true },
  { id: 4, titulo: "Escuela Bíblica Niños", dia: "Sábado 25/07", hora: "16:00", lugar: "Aula 2", recordar: false },
];

const NOVEDADES_EJEMPLO = [
  {
    id: 1,
    titulo: "Inscripciones abiertas: Escuela para Padres",
    cuerpo: "Ya podés anotarte para el próximo ciclo. Cupos limitados.",
    autor: "Equipo de Medios",
    hace: "hace 2 h",
  },
  {
    id: 2,
    titulo: "Nuevo horario de Escuela Bíblica",
    cuerpo: "A partir de agosto, la Escuela Bíblica de niños pasa a las 16:00.",
    autor: "Ministerio de Niños",
    hace: "hace 1 día",
  },
  {
    id: 3,
    titulo: "Se viene Mi Peña Cristiana",
    cuerpo: "Una noche de música, testimonios y comunidad. Traé a un amigo.",
    autor: "Equipo de Medios",
    hace: "hace 2 días",
  },
];

function Flama({ racha }) {
  const intensidad = Math.min(racha / 30, 1);
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-14 h-14 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, rgba(232,163,61,${0.5 + intensidad * 0.4}) 0%, rgba(193,80,46,0) 70%)`,
        }}
      />
      <Flame
        size={30}
        strokeWidth={1.5}
        className="relative"
        style={{ color: `rgb(${232 - intensidad * 20}, ${163 - intensidad * 40}, ${61 - intensidad * 20})` }}
        fill={`rgba(232,163,61,${0.25 + intensidad * 0.5})`}
      />
    </div>
  );
}

function Etiqueta({ children }) {
  return (
    <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#8A94A6" }}>
      {children}
    </span>
  );
}

function ReproductorAudio({ src }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgreso(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onLoaded = () => setDuracion(audio.duration || 0);
    const onPlay = () => setReproduciendo(true);
    const onPause = () => setReproduciendo(false);
    const onEnded = () => {
      setReproduciendo(false);
      setProgreso(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const alternar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (reproduciendo) audio.pause();
    else audio.play().catch(() => {});
  };

  const formatoTiempo = (segundos) => {
    if (!segundos || isNaN(segundos)) return "0:00";
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#241B0E" }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={alternar}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#E8A33D" }}
        aria-label={reproduciendo ? "Pausar audio" : "Reproducir audio"}
      >
        {reproduciendo ? (
          <Pause size={15} style={{ color: "#241B0E" }} fill="#241B0E" />
        ) : (
          <Play size={15} style={{ color: "#241B0E" }} fill="#241B0E" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,163,61,0.2)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progreso}%`, backgroundColor: "#E8A33D" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: "#C9B892" }}>
            Audio del devocional
          </span>
          <span className="text-[10px]" style={{ color: "#C9B892" }}>
            {formatoTiempo(duracion)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SeccionDevocional({ etiqueta, children, cursiva }) {
  return (
    <div>
      <Etiqueta>{etiqueta}</Etiqueta>
      <p
        className={`text-[14px] leading-relaxed mt-1.5 ${cursiva ? "italic" : ""}`}
        style={{ color: cursiva ? "#6B5F47" : "#3D372E" }}
      >
        {children}
      </p>
    </div>
  );
}

function ModalCompartir({ titulo, onCerrar }) {
  const [copiado, setCopiado] = useState(false);
  const opciones = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#3E5C46" },
    { id: "enlace", label: copiado ? "¡Enlace copiado!" : "Copiar enlace", icon: LinkIcon, color: "#3A4150" },
  ];
  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onCerrar}>
      <div
        className="w-full rounded-t-2xl p-5 space-y-4"
        style={{ backgroundColor: "#1B2029" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <Etiqueta>Compartir</Etiqueta>
            <p className="text-[13px] mt-0.5" style={{ color: "#F2ECDD" }}>
              {titulo}
            </p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar">
            <X size={18} style={{ color: "#8A94A6" }} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => (op.id === "enlace" ? setCopiado(true) : null)}
              className="flex flex-col items-center gap-2 rounded-xl py-4"
              style={{ backgroundColor: op.color }}
            >
              <op.icon size={20} style={{ color: "#F2ECDD" }} />
              <span className="text-[11px]" style={{ color: "#F2ECDD" }}>
                {op.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PantallaInicio({ leido, setLeido, racha, devocional, reuniones }) {
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const proximaReunion = reuniones && reuniones.length ? reuniones[0] : null;
  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Etiqueta>{devocional.fechaLabel}</Etiqueta>
          <h1 className="text-xl font-serif mt-1" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
            Devocional del día
          </h1>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Flama racha={racha} />
          <span className="text-[11px]" style={{ color: "#E8A33D" }}>
            {racha} días
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ backgroundColor: "#F7F3EA", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <Etiqueta>{devocional.referencia}</Etiqueta>
            <h2 className="text-lg mt-1" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
              {devocional.titulo}
            </h2>
          </div>
          <button
            onClick={() => setMostrarCompartir(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#EFE7D3" }}
            aria-label="Compartir devocional"
          >
            <Share2 size={14} style={{ color: "#6B5F47" }} />
          </button>
        </div>

        {devocional.audioUrl && <ReproductorAudio src={devocional.audioUrl} />}

        <blockquote
          className="text-[14px] leading-relaxed italic pl-3 border-l-2"
          style={{ color: "#4A4030", borderColor: "#D9B26B" }}
        >
          {devocional.versiculo}
        </blockquote>

        <div className="space-y-3 pt-1 border-t" style={{ borderColor: "#E4DCC8" }}>
          <SeccionDevocional etiqueta="Desarrollo">{devocional.desarrollo}</SeccionDevocional>
          <SeccionDevocional etiqueta="Oración">{devocional.oracion}</SeccionDevocional>
          <SeccionDevocional etiqueta="Aplicación" cursiva>
            {devocional.aplicacion}
          </SeccionDevocional>
        </div>
      </div>

      <button
        onClick={() => setLeido(!leido)}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[14px] font-medium transition-all"
        style={{
          backgroundColor: leido ? "#3E5C46" : "#E8A33D",
          color: leido ? "#DCEBDF" : "#241B0E",
        }}
      >
        <Check size={16} />
        {leido ? "Marcado como leído" : "Marcar como leído"}
      </button>

      {proximaReunion && (
        <div>
          <Etiqueta>Próximo</Etiqueta>
          <div className="mt-2 rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "#1B2029" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2A3140" }}>
              <Calendar size={16} style={{ color: "#E8A33D" }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium" style={{ color: "#F2ECDD" }}>
                {proximaReunion.titulo}
              </p>
              <p className="text-[12px]" style={{ color: "#8A94A6" }}>
                {proximaReunion.dia} · {proximaReunion.hora}
              </p>
            </div>
          </div>
        </div>
      )}

      {mostrarCompartir && (
        <ModalCompartir titulo={devocional.titulo} onCerrar={() => setMostrarCompartir(false)} />
      )}
    </div>
  );
}

function PantallaReuniones({ reuniones, toggleRecordar }) {
  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div>
        <Etiqueta>Agenda</Etiqueta>
        <h1 className="text-xl font-serif mt-1" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
          Reuniones
        </h1>
      </div>
      <div className="space-y-3">
        {reuniones.map((r) => (
          <div
            key={r.id}
            className="rounded-xl p-4 flex items-start justify-between gap-3"
            style={{ backgroundColor: "#1B2029" }}
          >
            <div className="space-y-1.5">
              <p className="text-[14px] font-medium" style={{ color: "#F2ECDD" }}>
                {r.titulo}
              </p>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A94A6" }}>
                <Clock size={12} />
                {r.dia} · {r.hora}
              </div>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A94A6" }}>
                <MapPin size={12} />
                {r.lugar}
              </div>
            </div>
            <button
              onClick={() => toggleRecordar(r.id)}
              className="flex flex-col items-center gap-1 pt-1"
              aria-label="Activar recordatorio"
            >
              <Bell
                size={18}
                fill={r.recordar ? "#E8A33D" : "none"}
                style={{ color: r.recordar ? "#E8A33D" : "#5A6272" }}
              />
              <span className="text-[9px]" style={{ color: r.recordar ? "#E8A33D" : "#5A6272" }}>
                {r.recordar ? "Activo" : "Avisarme"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PantallaNovedades({ novedades, esAdmin, setMostrarForm }) {
  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Etiqueta>Comunidad</Etiqueta>
          <h1 className="text-xl font-serif mt-1" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
            Novedades
          </h1>
        </div>
        {esAdmin && (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E8A33D" }}
          >
            <Plus size={18} style={{ color: "#241B0E" }} />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {novedades.map((n) => (
          <div key={n.id} className="rounded-xl p-4" style={{ backgroundColor: "#1B2029" }}>
            <p className="text-[14px] font-medium" style={{ color: "#F2ECDD" }}>
              {n.titulo}
            </p>
            <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#B7BFCC" }}>
              {n.cuerpo}
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: "#5A6272" }}>
              <span>{n.autor}</span>
              <span>·</span>
              <span>{n.hace}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PantallaHistorial({ historial }) {
  const [temaActivo, setTemaActivo] = useState("Todos");
  const [mesActivo, setMesActivo] = useState("Todos");
  const [expandidoId, setExpandidoId] = useState(null);

  const temas = ["Todos", ...Array.from(new Set(historial.map((d) => d.tema)))];
  const meses = ["Todos", ...Array.from(new Set(historial.map((d) => d.mes)))];

  const filtrados = historial.filter(
    (d) => (temaActivo === "Todos" || d.tema === temaActivo) && (mesActivo === "Todos" || d.mes === mesActivo)
  );

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div>
        <Etiqueta>Archivo</Etiqueta>
        <h1 className="text-xl font-serif mt-1" style={{ color: "#F2ECDD", fontFamily: "'Lora', serif" }}>
          Historial
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {temas.map((t) => (
          <button
            key={t}
            onClick={() => setTemaActivo(t)}
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: temaActivo === t ? "#E8A33D" : "#1B2029",
              color: temaActivo === t ? "#241B0E" : "#8A94A6",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <select
          value={mesActivo}
          onChange={(e) => setMesActivo(e.target.value)}
          className="w-full appearance-none rounded-xl px-3 py-2.5 text-[13px] pr-9"
          style={{ backgroundColor: "#1B2029", color: "#F2ECDD" }}
        >
          {meses.map((m) => (
            <option key={m} value={m}>
              {m === "Todos" ? "Todos los meses" : m}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8A94A6" }} />
      </div>

      <div className="space-y-2.5">
        {filtrados.length === 0 && (
          <p className="text-[13px] text-center py-8" style={{ color: "#5A6272" }}>
            No hay devocionales para este filtro.
          </p>
        )}
        {filtrados.map((d) => {
          const abierto = expandidoId === d.id;
          return (
            <div
              key={d.id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#1B2029" }}
            >
              <button
                onClick={() => setExpandidoId(abierto ? null : d.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#2A3140" }}>
                    <BookOpen size={15} style={{ color: "#E8A33D" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#F2ECDD" }}>
                      {d.titulo}
                    </p>
                    <p className="text-[11px]" style={{ color: "#8A94A6" }}>
                      {d.fechaLabel || d.fecha} · {d.tema} · {d.referencia}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  style={{ color: "#5A6272", transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>
              {abierto && (
                <div className="px-4 pb-4 space-y-2">
                  <blockquote className="text-[13px] italic pl-3 border-l-2" style={{ color: "#C9B892", borderColor: "#E8A33D" }}>
                    {d.versiculo}
                  </blockquote>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#B7BFCC" }}>
                    {d.extracto}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormularioNuevaNovedad({ onCerrar, onPublicar }) {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ backgroundColor: "#12151C" }}>
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={onCerrar} aria-label="Cerrar">
          <X size={20} style={{ color: "#F2ECDD" }} />
        </button>
        <h2 className="text-[15px] font-medium" style={{ color: "#F2ECDD" }}>
          Nueva novedad
        </h2>
      </div>
      <div className="px-5 space-y-3 flex-1">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
          style={{ backgroundColor: "#1B2029", color: "#F2ECDD" }}
        />
        <textarea
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="¿Qué querés anunciar?"
          rows={5}
          className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none resize-none"
          style={{ backgroundColor: "#1B2029", color: "#F2ECDD" }}
        />
      </div>
      <div className="px-5 pb-6">
        <button
          onClick={() => {
            if (titulo.trim()) onPublicar(titulo, cuerpo);
          }}
          className="w-full rounded-xl py-3 text-[14px] font-medium"
          style={{ backgroundColor: "#E8A33D", color: "#241B0E" }}
        >
          Publicar
        </button>
      </div>
    </div>
  );
}

export default function AppRestauracion() {
  const [tab, setTab] = useState("inicio");
  const [leido, setLeido] = useState(false);
  const [racha, setRacha] = useState(6);
  const [devocional, setDevocional] = useState(DEVOCIONAL_EJEMPLO);
  const [historial, setHistorial] = useState(HISTORIAL_EJEMPLO);
  const [reuniones, setReuniones] = useState(REUNIONES_EJEMPLO);
  const [novedades, setNovedades] = useState(NOVEDADES_EJEMPLO);
  const [usandoEjemplo, setUsandoEjemplo] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargarDatos() {
      const [filasDevo, filasReu, filasNov] = await Promise.all([
        fetchSheet("/api/devocionales"),
        fetchSheet("/api/reuniones"),
        fetchSheet("/api/novedades"),
      ]);
      if (!activo) return;
      let huboDatosReales = false;

      if (filasDevo && filasDevo.length) {
        const mapeados = filasDevo.map(mapDevocional).filter((d) => d.titulo);
        if (mapeados.length) {
          const ordenados = [...mapeados].sort((a, b) => (b.fecha || 0) - (a.fecha || 0));
          setHistorial(ordenados);
          setDevocional(elegirDevocionalDeHoy(mapeados) || ordenados[0]);
          huboDatosReales = true;
        }
      }
      if (filasReu && filasReu.length) {
        const mapeados = filasReu.map(mapReunion).filter((r) => r.titulo);
        if (mapeados.length) {
          setReuniones(mapeados.sort((a, b) => (a.fecha || 0) - (b.fecha || 0)));
          huboDatosReales = true;
        }
      }
      if (filasNov && filasNov.length) {
        const mapeados = filasNov.map(mapNovedad).filter((n) => n.titulo).reverse();
        if (mapeados.length) {
          setNovedades(mapeados);
          huboDatosReales = true;
        }
      }
      setUsandoEjemplo(!huboDatosReales);
    }
    cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  const marcarLeido = () => {
    if (!leido) setRacha(racha + 1);
    else setRacha(Math.max(racha - 1, 0));
    setLeido(!leido);
  };

  const toggleRecordar = (id) => {
    setReuniones(reuniones.map((r) => (r.id === id ? { ...r, recordar: !r.recordar } : r)));
  };

  const publicarNovedad = (titulo, cuerpo) => {
    setNovedades([{ id: Date.now(), titulo, cuerpo: cuerpo || "—", autor: "Vos (admin)", hace: "ahora" }, ...novedades]);
    setMostrarForm(false);
  };

  const tabs = [
    { id: "inicio", label: "Inicio", icon: Flame },
    { id: "reuniones", label: "Reuniones", icon: Calendar },
    { id: "novedades", label: "Novedades", icon: Newspaper },
    { id: "historial", label: "Historial", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: "#0B0D12" }}>
      <div
        className="relative w-[375px] h-[720px] rounded-[2.5rem] overflow-hidden border-[6px]"
        style={{ backgroundColor: "#12151C", borderColor: "#000000" }}
      >
        {/* barra superior */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[11px] font-medium" style={{ color: "#F2ECDD" }}>
            9:41
          </span>
          <button
            onClick={() => setEsAdmin(!esAdmin)}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: esAdmin ? "rgba(232,163,61,0.15)" : "rgba(255,255,255,0.06)",
              color: esAdmin ? "#E8A33D" : "#8A94A6",
            }}
          >
            <Settings size={11} />
            {esAdmin ? "Modo admin" : "Modo lector"}
          </button>
        </div>

        {esAdmin && usandoEjemplo && (
          <div className="mx-5 mb-1 px-3 py-1.5 rounded-lg text-[10px] text-center" style={{ backgroundColor: "rgba(193,80,46,0.15)", color: "#E0876A" }}>
            Mostrando contenido de ejemplo — conectá las planillas en config.js
          </div>
        )}

        {/* encabezado con logo */}
        <div className="flex items-center justify-center pt-2 pb-1">
          <img src={LOGO_IGLESIA} alt="Restauración y Avivamiento" className="h-16 w-auto object-contain" />
        </div>

        <div className="overflow-y-auto" style={{ height: "calc(100% - 196px)" }}>
          {tab === "inicio" && (
            <PantallaInicio
              leido={leido}
              setLeido={marcarLeido}
              racha={racha}
              devocional={devocional}
              reuniones={reuniones}
            />
          )}
          {tab === "reuniones" && <PantallaReuniones reuniones={reuniones} toggleRecordar={toggleRecordar} />}
          {tab === "novedades" && (
            <PantallaNovedades novedades={novedades} esAdmin={esAdmin} setMostrarForm={setMostrarForm} />
          )}
          {tab === "historial" && <PantallaHistorial historial={historial} />}
        </div>

        {mostrarForm && (
          <FormularioNuevaNovedad onCerrar={() => setMostrarForm(false)} onPublicar={publicarNovedad} />
        )}

        {/* nav inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-around pt-3 pb-6 border-t"
          style={{ backgroundColor: "#12151C", borderColor: "rgba(255,255,255,0.06)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1">
              <Icon
                size={20}
                strokeWidth={1.8}
                style={{ color: tab === id ? "#E8A33D" : "#5A6272" }}
                fill={tab === id && id === "inicio" ? "rgba(232,163,61,0.3)" : "none"}
              />
              <span className="text-[10px]" style={{ color: tab === id ? "#E8A33D" : "#5A6272" }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
