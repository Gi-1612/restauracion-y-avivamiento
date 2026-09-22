import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import AdminLogin from "./AdminLogin";
import AdminSetup from "./AdminSetup";
import AdminLayout from "./AdminLayout";
import AdminInicio from "./AdminInicio";
import AdminCategorias from "./AdminCategorias";
import AdminItems from "./AdminItems";
import AdminApariencia from "./AdminApariencia";
import AdminOfrendas from "./AdminOfrendas";
import AdminAdministradores from "./AdminAdministradores";

export default function AdminApp() {
  const [estado, setEstado] = useState({ cargando: true, sesion: null, requiereSetup: false });

  useEffect(() => {
    api
      .get("/api/admin/me")
      .then((datos) => {
        if (datos.autenticado) {
          setEstado({ cargando: false, sesion: datos, requiereSetup: false });
        } else {
          setEstado({ cargando: false, sesion: null, requiereSetup: datos.requiereConfiguracionInicial });
        }
      })
      .catch(() => setEstado({ cargando: false, sesion: null, requiereSetup: false }));
  }, []);

  if (estado.cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF5EA" }}>
        <p style={{ color: "#8A7F6A" }}>Cargando...</p>
      </div>
    );
  }

  const { sesion, requiereSetup } = estado;

  return (
    <Routes>
      <Route
        path="login"
        element={
          sesion ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLogin onAutenticado={(datos) => setEstado((e) => ({ ...e, sesion: datos }))} />
          )
        }
      />
      <Route
        path="configuracion-inicial"
        element={
          sesion ? (
            <Navigate to="/admin" replace />
          ) : requiereSetup ? (
            <AdminSetup onAutenticado={(datos) => setEstado((e) => ({ ...e, sesion: datos, requiereSetup: false }))} />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          sesion ? (
            <AdminLayout
              sesion={sesion}
              setSesion={(datos) => setEstado((e) => ({ ...e, sesion: datos }))}
              onSalir={() => setEstado((e) => ({ ...e, sesion: null }))}
            />
          ) : (
            <Navigate to={requiereSetup ? "/admin/configuracion-inicial" : "/admin/login"} replace />
          )
        }
      >
        <Route index element={<AdminInicio />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="categorias/:slug" element={<AdminItems />} />
        <Route path="apariencia" element={<AdminApariencia />} />
        <Route path="ofrendas" element={<AdminOfrendas />} />
        <Route path="administradores" element={<AdminAdministradores />} />
      </Route>
    </Routes>
  );
}
