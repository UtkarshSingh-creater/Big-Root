import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import RightPanel from "../components/layout/RightPanel";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-white">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-white/10">
        <Sidebar />
      </div>

      {/* CENTER */}
      <div className="flex-1 p-6">
        <Navbar />
        <div className="mt-4">{children}</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 border-l border-white/10 p-4">
        <RightPanel />
      </div>
    </div>
  );
}