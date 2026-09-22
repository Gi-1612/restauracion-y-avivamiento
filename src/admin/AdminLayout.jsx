import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FolderKanban,
  Image as ImageIcon,
  HandCoins,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { api } from "./api";

const NAV = [
  { to: "/admin", label: "Inicio", icon: LayoutGrid, fin: true },
  { to: "/admin/categorias", label: "Categorías", icon: FolderKanban },
  { to: "/admin/apariencia", label: "Apariencia", icon: ImageIcon },
  { to: "/admin/ofrendas", label: "Ofrendas", icon: HandCoins },
  { to: "/admin/administradores", label: "Administradores", icon: Users },
];

export default function AdminLayout({ sesion, setSesion, onSalir }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const nombre = sesion.nombre;

  const cerrarSesion = async () => {
    await api.post("/api/admin/logout");
    onSalir();
    navigate("/admin/login");
  };

  const Nav = ({ enMobile }) => (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, fin }) => (
        <NavLink
          key={to}
          to={to}
          end={fin}
          onClick={() => enMobile && setMenuAbierto(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${isActive ? "" : ""}`
          }
          style={({ isActive }) => ({
            backgroundColor: isActive ? "rgba(232,163,61,0.12)" : "transparent",
            color: isActive ? "#E8A33D" : "#5C5240",
          })}
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex" style={{ backgroundColor: "#F2E9D6" }}>
      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r px-4 py-6"
        style={{ borderColor: "rgba(0,0,0,0.06)", backgroundColor: "#FAF5EA" }}
      >
        <div className="px-2 pb-6">
          <p className="text-[15px]" style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>
            Panel
          </p>
          <p className="text-[11px]" style={{ color: "#A89A82" }}>
            Restauración y Avivamiento
          </p>
        </div>
        <Nav />
        <div className="mt-auto pt-6 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 text-[12px]"
            style={{ color: "#A89A82" }}
          >
            <ExternalLink size={13} />
            Ver el sitio
          </a>
          <div className="border-t pt-3 px-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <p className="text-[12px] font-medium" style={{ color: "#2A2620" }}>
              {nombre}
            </p>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 mt-1.5 text-[12px]"
              style={{ color: "#8A7F6A" }}
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar mobile */}
      <div
        className="md:hidden flex items-center justify-between px-5 h-14 border-b sticky top-0 z-30"
        style={{ backgroundColor: "#FAF5EA", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <p style={{ color: "#2A2620", fontFamily: "'Lora', serif" }}>Panel</p>
        <button onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú">
          {menuAbierto ? <X size={20} style={{ color: "#2A2620" }} /> : <Menu size={20} style={{ color: "#2A2620" }} />}
        </button>
      </div>
      {menuAbierto && (
        <div className="md:hidden px-4 py-4 space-y-4 border-b" style={{ backgroundColor: "#FAF5EA", borderColor: "rgba(0,0,0,0.06)" }}>
          <Nav enMobile />
          <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <span className="text-[12px]" style={{ color: "#8A7F6A" }}>
              {nombre}
            </span>
            <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A7F6A" }}>
              <LogOut size={13} />
              Salir
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 px-5 py-8 sm:px-8 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <Outlet context={{ sesion, setSesion }} />
        </div>
      </main>
    </div>
  );
}
