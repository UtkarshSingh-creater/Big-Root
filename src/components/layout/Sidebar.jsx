import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import API from "../../api/index";
import { getConnections } from "../../api/connection";

export default function Sidebar() {
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [metrics, setMetrics] = useState({ connections: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  // Fallbacks if data fails
  const localUser = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role") || "student";
  const college = localStorage.getItem("college") || "Your College";

  useEffect(() => {
     const fetchSidebarState = async () => {
         try {
             // Dispatch parallel loads across required backend ecosystems
             const [profRes, connRes, postRes] = await Promise.all([
                 API.get("/user/profile"),
                 getConnections(),
                 API.get("/post/my-posts").catch(() => ({ data: { posts: [] } }))
             ]);

             if (profRes.data && profRes.data.user) {
                 setProfileData(profRes.data.user);
                 // Dynamically override synced localstorage
                 localStorage.setItem("user", JSON.stringify(profRes.data.user)); 
             }

             setMetrics({
                 connections: connRes.data?.length || 0,
                 posts: postRes.data?.posts?.length || 0
             });

         } catch (e) {
             console.error("Failed mounting async sidebar state", e);
         } finally {
             setLoading(false);
         }
     };
     fetchSidebarState();
  }, []);

  const notifySoon = (feature) => toast(`${feature} is coming soon to BigRoot!`, { icon: "🚀" });
  
  const displayUser = profileData || localUser;

  return (
    <div className="flex flex-col gap-6 sticky top-28">
      {/* Identity Card */}
      <div className="card overflow-hidden relative">
        {/* Cover Photo */}
        <div className="h-20 bg-gradient-to-tr from-[#112a21] to-[#041c14] relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        
          {/* Profile Info */}
          <div className="relative px-5 pb-5 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white text-3xl font-bold flex flex-col items-center justify-center rounded-full border-4 border-[#151f24] absolute -top-10 left-1/2 transform -translate-x-1/2 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden">
              {displayUser?.profilePhoto ? (
                 <img src={displayUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 displayUser?.name?.[0]?.toUpperCase() || role[0].toUpperCase()
              )}
            </div>
            
            <div className="mt-12">
              <h2 onClick={() => navigate("/profile/" + (displayUser?._id || displayUser?.id))} className="text-white font-bold text-lg hover:text-emerald-400 transition-colors cursor-pointer">
                {displayUser?.name || "Member"}
              </h2>
              <p className="text-xs text-emerald-500/80 mb-2 capitalize font-medium">{displayUser?.role || role} {displayUser?.collegeName ? `at ${displayUser.collegeName}` : `at ${college}`}</p>
            </div>
          </div>

        {/* Stats */}
        <div className="border-t border-white/10 py-3">
          <div onClick={() => navigate("/network")} className="px-5 py-1.5 text-xs hover:bg-white/5 cursor-pointer flex justify-between group transition-colors">
            <span className="text-slate-400 group-hover:text-white transition-colors">Network Connections</span>
            <span className="text-emerald-400 font-bold">{loading ? "..." : metrics.connections}</span>
          </div>
          <div className="px-5 py-1.5 text-xs hover:bg-white/5 cursor-pointer flex justify-between group transition-colors">
            <span className="text-slate-400 group-hover:text-white transition-colors">Total Posts Authored</span>
            <span className="text-emerald-400 font-bold">{loading ? "..." : metrics.posts}</span>
          </div>
        </div>

        {/* Premium / Items */}
        <div onClick={() => notifySoon("Premium Upgrades")} className="border-t border-white/10 px-5 py-3.5 text-xs hover:bg-white/5 cursor-pointer transition-colors">
          <span className="text-white font-semibold flex items-center gap-2">
            <span className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">■</span> Try Premium Network
          </span>
        </div>
        
        <div onClick={() => notifySoon("Saved Signals Workspace")} className="border-t border-white/10 px-5 py-3.5 text-xs hover:bg-white/5 cursor-pointer flex items-center gap-2 text-white font-semibold transition-colors">
          <span className="text-emerald-500 text-sm">🔖</span> Saved Signals
        </div>
      </div>

      {/* Navigation Card */}
      <div className="card p-5 text-xs font-semibold text-emerald-500">
        <div onClick={() => notifySoon("Groups")} className="hover:text-emerald-400 transition-colors cursor-pointer mb-3">Groups</div>
        <div onClick={() => notifySoon("Events Mapping")} className="hover:text-emerald-400 transition-colors cursor-pointer flex justify-between items-center group mb-3">
          <span>Events</span>
          <span className="text-white hover:text-emerald-400 text-lg font-light hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-all">+</span>
        </div>
        <div onClick={() => notifySoon("Followed Hashtags")} className="hover:text-emerald-400 transition-colors cursor-pointer mt-1">Followed Hashtags</div>
        
        <div onClick={() => notifySoon("Discovery Engine")} className="mt-5 pt-4 border-t border-white/10 text-slate-400 text-center hover:bg-white/5 hover:text-white p-3 -mx-5 -mb-5 cursor-pointer transition-colors shadow-inner">
          Discover more
        </div>
      </div>
    </div>
  );
}