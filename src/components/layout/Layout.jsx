import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const notifySoon = (feature) => toast(`${feature} is coming soon to BigRoot!`, { icon: "🚀" });

  return (
    <div className="min-h-screen">
      <Topbar />

      <main className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 flex justify-center gap-8">
        {/* LEFT PANEL */}
        <div className="hidden md:block w-[240px] shrink-0">
          <Sidebar />
        </div>

        {/* FEED / CENTER */}
        <div className="flex-1 max-w-[650px] overflow-hidden rounded-xl">
          {children}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="card p-6 sticky top-28">
            <h3 className="mb-6 text-slate-800 font-extrabold text-base flex items-center justify-between">
              Grow Your Roots <span className="text-blue-600 text-sm">ⓘ</span>
            </h3>

            <button onClick={() => navigate("/events")} className="w-full mb-4 btn-secondary flex items-center justify-center gap-2 group">
              <span className="text-lg group-hover:rotate-90 transition-transform">+</span> Build Connection
            </button>

            <button onClick={() => navigate("/opportunities")} className="w-full mb-4 btn-secondary flex items-center justify-center gap-2 group">
              <span className="text-lg group-hover:rotate-90 transition-transform">+</span> Find Companies
            </button>

            <button onClick={() => navigate("/events")} className="w-full btn-outline flex items-center justify-center gap-2 py-3 mb-4">
               Event Directory
            </button>

            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("new-alert", { detail: "Global Broadcast: " + new Date().toLocaleTimeString() }))} 
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-lg shadow-blue-500/10"
            >
               Broadcast Signal (Push Alert)
            </button>

            <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center flex flex-wrap justify-center gap-x-4 gap-y-2">
              <a href="#" className="hover:text-blue-600 transition-colors">About</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Accessibility</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
              <p className="w-full mt-2 font-medium tracking-wide">BigRoot © 2026</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}