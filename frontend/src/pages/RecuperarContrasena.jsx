import React, { useState } from "react";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Ingresa un correo válido");
      return;
    }
    alert(`Simulación: se envió un enlace de recuperación a\n${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] px-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-7 text-center">
        {/* Ícono SVG */}
        <svg
          className="w-14 h-14 mx-auto mb-3"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
            fill="#5cc3b6"
          />
          <path
            d="M17 8V7a5 5 0 10-10 0v1"
            stroke="#5cc3b6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="3"
            y="8"
            width="18"
            height="13"
            rx="2"
            stroke="#e6eef0"
            strokeWidth="1.5"
            fill="#fff"
          />
        </svg>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          Ingresa tu correo electrónico para recibir un enlace de recuperación.
        </p>

        <form onSubmit={enviar}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="📧 Correo electrónico"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5cc3b6]"
          />
          <button
            type="submit"
            className="w-full bg-[#5cc3b6] hover:bg-[#48a399] text-white font-semibold py-2 rounded-lg transition"
          >
            Enviar enlace
          </button>
        </form>

        <a
          href="/"
          className="block mt-4 text-sm text-gray-700 hover:underline"
        >
          ← Volver al login
        </a>

        <p className="text-xs text-gray-400 mt-3">
          Esto es una plantilla estática — el botón simula el envío.
        </p>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
