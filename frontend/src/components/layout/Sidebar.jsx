import React from "react";
import {
  FaClinicMedical,
  FaHome,
  FaUserInjured,
  FaPills,
  FaFileMedical,
  FaChartLine,
  FaBoxes,
} from "react-icons/fa";

const Sidebar = ({ activePage }) => {
  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaUserInjured />, label: "Pacientes", path: "/pacientes" },
    { icon: <FaPills />, label: "Medicamentos", path: "/medicamentos" },
    { icon: <FaFileMedical />, label: "Órdenes", path: "/ordenes" },
    { icon: <FaChartLine />, label: "Reportes", path: "/reportes" },
    { icon: <FaBoxes />, label: "Inventarios", path: "/inventarios" },
];

  return (
    <aside className="w-64 bg-[#08988e] text-white flex flex-col p-6">
      <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
        <FaClinicMedical /> <span>FarmaGestión</span>
      </h2>
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.path}
              className={`flex items-center gap-2 p-2 rounded transition ${
                activePage === item.label.toLowerCase()
                  ? "bg-[#05776f] font-semibold"
                  : "hover:bg-[#05776f]"
              }`}
            >
              {item.icon} {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;