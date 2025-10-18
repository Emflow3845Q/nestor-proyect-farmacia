import React, { useState, useEffect } from "react";
import {
  FaClinicMedical,
  FaHome,
  FaUserInjured,
  FaPills,
  FaFileMedical,
  FaChartLine,
  FaBoxes,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ activePage }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Usuario",
    role: "Sin rol asignado",
    initials: "U",
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.username || parsedUser.name || parsedUser.email || "Usuario";
      const role = parsedUser.role || "Usuario del sistema";

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaUserInjured />, label: "Pacientes", path: "/pacientes" },
    { icon: <FaPills />, label: "Medicamentos", path: "/medicamentos" },
    { icon: <FaFileMedical />, label: "Órdenes", path: "/ordenes" },
    { icon: <FaChartLine />, label: "Reportes", path: "/reportes" },
    { icon: <FaBoxes />, label: "Inventarios", path: "/inventarios" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleMenuItemClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#08988e] text-white p-4 z-40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaClinicMedical className="text-xl" />
            <span className="text-lg font-semibold">FarmaGestion</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-[#05776f] transition-colors"
          >
            {isMobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#08988e] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
        pt-20 lg:pt-6
        h-screen lg:h-auto
        overflow-y-auto
      `}>
        {/* Logo - oculto en móvil porque está en el header */}
        <div className="hidden lg:block px-6">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
            <FaClinicMedical /> <span>FarmaGestión</span>
          </h2>
        </div>

        {/* Menú */}
        <ul className="space-y-2 flex-1 px-3">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.path}
                onClick={handleMenuItemClick}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                  ${activePage === item.label.toLowerCase()
                    ? "bg-[#05776f] font-semibold shadow-md"
                    : "hover:bg-[#05776f] hover:shadow-sm"
                  }
                  text-base
                `}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Información del usuario SOLO EN MÓVIL */}
        <div className="lg:hidden px-3 pb-4">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#05776f] transition-all w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#08988e] flex items-center justify-center text-base font-semibold flex-shrink-0">
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {user.name}
                </div>
                <div className="text-[#a8e0db] text-xs truncate">
                  {user.role}
                </div>
              </div>
              <svg 
                className={`w-3 h-3 text-[#a8e0db] transition-transform flex-shrink-0 ${showUserDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown del usuario */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="w-3 h-3 flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional para desktop */}
        <div className="hidden lg:block mt-4 px-6 pt-4 border-t border-[#05776f]">
          <p className="text-xs text-[#a8e0db] text-center">
            Sistema de Gestión Farmacéutica
          </p>
        </div>
      </aside>

      {/* Espacio para el header móvil */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;