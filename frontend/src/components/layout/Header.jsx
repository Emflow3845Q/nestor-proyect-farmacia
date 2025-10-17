import React, { useEffect, useState, useRef } from "react";

const Header = ({ title, subtitle }) => {
  const [user, setUser] = useState({
    name: "Usuario",
    role: "Sin rol asignado",
    initials: "U",
  });

  const [currentDate, setCurrentDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.username || parsedUser.name || parsedUser.email || "Usuario";
      const role = parsedUser.role || "Usuario del sistema";

      // Generar iniciales: si es correo → primeras letras antes del @
      const initials = name.includes("@")
        ? name
            .split("@")[0]
            .split(/[._-]/)
            .map(word => word.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2)
        : name.charAt(0).toUpperCase();

      setUser({ name, role, initials });
    }

    // Establecer fecha actual
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    setCurrentDate(formattedDate);

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="flex justify-between items-center flex-wrap mb-6">
      <div>
        <h3 className="text-gray-500 font-medium">{subtitle || currentDate}</h3>
        <h2 className="text-3xl font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Área clickeable del usuario */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
          onClick={toggleDropdown}
        >
          {/* Círculo con las iniciales */}
          <div className="w-11 h-11 rounded-full bg-[#08988e] text-white flex items-center justify-center text-lg font-semibold">
            {user.initials}
          </div>
          <div>
            <strong className="text-gray-800">{user.name}</strong>
            <br />
            <small className="text-gray-500 text-sm">{user.role}</small>
          </div>
        </div>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;