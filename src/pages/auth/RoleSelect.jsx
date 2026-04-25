import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUserTie } from "react-icons/fa";

export default function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    { id: "student", label: "Student", icon: <FaUserGraduate className="text-2xl mb-2" /> },
    { id: "alumni", label: "Alumni", icon: <FaUserTie className="text-2xl mb-2" /> },
    { id: "faculty", label: "Faculty", icon: <FaChalkboardTeacher className="text-2xl mb-2" /> },
    { id: "admin", label: "Admin", icon: <FaUserShield className="text-2xl mb-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="absolute top-8 left-8 text-3xl font-extrabold flex items-center gap-2 brand-text">
        BigRoot
      </div>

      <div className="card w-full max-w-lg p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>

        <button className="text-slate-400 hover:text-emerald-400 mb-6 text-sm font-semibold flex items-center gap-1 transition-all" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Identify Yourself</h1>
          <p className="text-muted">Select your role to access your personalized network</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 relative z-10">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => {
                localStorage.setItem("role", role.id);
                navigate("/login");
              }}
              className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 transform hover:-translate-y-1 text-slate-300 hover:text-white group"
            >
              <div className="text-emerald-500 group-hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{role.icon}</div>
              <span className="font-semibold tracking-wide">{role.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}