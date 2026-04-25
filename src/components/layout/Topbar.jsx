import { useState, useEffect } from "react";
import { FaHome, FaUserFriends, FaBriefcase, FaBell, FaSearch, FaCommentDots } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/index";
import socket from "../../services/socket";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role") || "student";
  
  useEffect(() => {
    const loadData = async () => {
       try {
          // 1. Backend lacks /user/all -> Extract active Network profiles from Feed instead for Search Discovery!
          const [feedRes, notifRes] = await Promise.all([
             API.get("/post/feed"),
             API.get("/notification")
          ]);
          
          if (feedRes.data && feedRes.data.posts) {
             // Deduplicate authors to build global Search Network
             const uniqueUsers = [...new Map(feedRes.data.posts.map(post => [post.author?._id || post.author?.id, post.author])).values()];
             setAllUsers(uniqueUsers.filter(u => u && u._id !== user?._id));
          }

          // 2. Pre-populate stored remote notifications instead of faking them
          if (notifRes.data && Array.isArray(notifRes.data)) {
             setNotifications(notifRes.data.map(n => ({
                id: n._id || Math.random(),
                initial: n.message?.[0] || "✦",
                bg: "bg-emerald-500",
                text: n.message,
                time: new Date(n.createdAt || Date.now()).toLocaleDateString()
             })));
          }
       } catch (err) {
          console.error("Topbar Hydration Failed", err);
       }
    };
    loadData();
    
    // Connect Socket 
    socket.connect();
    
    // Explicit Backend Integration Handshake
    if (user?._id || user?.id) {
       socket.emit("join", user._id || user.id);
    }

    // 1. Listen for real backend WebSocket notifications
    const handleBackendNotification = (data) => {
       setNotifications(prev => [{ 
         id: Date.now(), 
         initial: data?.message?.[0] || "✦", 
         bg: "bg-emerald-500", 
         text: data.message || "New activity detected.", 
         time: "Just now" 
       }, ...prev]);
       toast.success(data.message || "New notification!", { icon: "🔔" });
    };

    // 2. Listen for local dashboard broadcast signals (Mock Testing)
    const handleLocalAlert = (e) => {
       setNotifications(prev => [{ id: Date.now(), initial: "🚀", bg: "bg-emerald-600", text: e.detail, time: "Just now" }, ...prev]);
       toast.success("Broadcast alert registered!", { icon: "🔔" });
    };

    socket.on("notification", handleBackendNotification);
    window.addEventListener("new-alert", handleLocalAlert);
    
    return () => {
       socket.off("notification", handleBackendNotification);
       window.removeEventListener("new-alert", handleLocalAlert);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const filtered = allUsers.filter(u => u.name?.toLowerCase().includes(query.toLowerCase()) && u._id !== user?._id);
    setResults(filtered.slice(0, 5));
  }, [query, allUsers]);

  const notifySoon = (feature) => toast(`${feature} is coming soon to BigRoot!`, { icon: "🚀" });

  const navItems = [
    { icon: <FaHome className="text-2xl" />, label: "Home", action: () => navigate(`/dashboard/${role}`) },
    { icon: <FaUserFriends className="text-2xl" />, label: "My Network", action: () => navigate("/network") },
    { icon: <FaBriefcase className="text-2xl" />, label: "Opportunities", action: () => navigate("/opportunities") },
    { icon: <FaCommentDots className="text-2xl" />, label: "Messaging", action: () => navigate("/messaging") },
    { icon: <FaBell className="text-2xl" />, label: "Alerts", action: () => { setAlertsOpen(!alertsOpen); setOpen(false); } },
  ];

  return (
    <div className="h-[64px] fixed top-0 w-full bg-[#0b1114]/90 backdrop-blur-xl border-b border-white/10 z-50 flex justify-center shadow-lg">
      <div className="max-w-7xl w-full px-4 flex items-center justify-between">
        
        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-4">
          <div className="brand-text text-3xl hidden md:block">BigRoot</div>
          <div className="brand-text text-3xl md:hidden">BR</div>
          <div className="relative ml-2 pb-1">
             <div className="hidden md:flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-white focus-within:ring-1 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all shadow-inner">
               <FaSearch className="text-emerald-500 mr-2" />
               <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search network..." className="bg-transparent focus:outline-none w-56 placeholder-slate-500" />
             </div>
             
             {query && (
               <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-[#151f24] border border-white/10 rounded-xl shadow-2xl p-2 z-50 overflow-hidden">
                  {results.length > 0 ? results.map(u => (
                    <div key={u._id} onClick={() => { navigate(`/profile/${u._id}`); setQuery(""); }} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-b border-white/5 last:border-b-0">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                          {u.profilePhoto ? <img src={u.profilePhoto} className="w-full h-full object-cover" /> : u.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-emerald-400 capitalize truncate">{u.role}</div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-3 text-xs text-slate-400 text-center font-medium">No results found.</div>
                  )}
               </div>
             )}
          </div>
          <div onClick={() => notifySoon("Search Engine")} className="md:hidden text-emerald-500 ml-2 p-2 focus:outline-none text-xl cursor-pointer">
             <FaSearch />
          </div>
        </div>

        {/* RIGHT: Navigation & Profile */}
        <div className="flex items-center h-full">
          <div className="hidden sm:flex h-full gap-2 px-6 border-r border-white/10">
            {navItems.map((item, index) => (
              <div onClick={item.action} key={index} className="flex flex-col items-center justify-center text-slate-400 hover:text-emerald-400 cursor-pointer min-w-[70px] transition-colors group">
                <div className="group-hover:-translate-y-1 transition-transform duration-300">{item.icon}</div>
                <span className="text-[11px] mt-1.5 font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">{item.label}</span>
              </div>
            ))}
          </div>

          {/* ALERTS DROPDOWN */}
          {alertsOpen && (
             <div className="absolute top-[64px] right-20 md:right-32 w-96 bg-[#151f24] border border-emerald-500/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                   <h3 className="text-white font-bold text-sm tracking-wide">Notifications</h3>
                   <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">All caught up!</div>
                   ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors flex gap-3">
                           <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center text-white font-bold text-xs shrink-0 flex-col pt-0.5`}>{n.initial}</div>
                           <div>
                              <div className="text-sm text-slate-200 font-medium">{n.text}</div>
                              <div className="text-[10px] text-emerald-500 font-semibold mt-1">{n.time}</div>
                           </div>
                        </div>
                      ))
                   )}
                </div>
                {notifications.length > 0 && (
                  <div onClick={() => setNotifications([])} className="p-3 text-center border-t border-white/10 text-xs text-emerald-400 font-bold cursor-pointer hover:bg-white/5 transition-colors">
                     Mark all as read
                  </div>
                )}
             </div>
          )}

          {/* PROFILE */}
          <div className="relative flex flex-col items-center justify-center ml-6 cursor-pointer group" onClick={() => { setOpen(!open); setAlertsOpen(false); }}>
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              {user?.name?.[0] || role[0].toUpperCase()}
            </div>
            <span className="text-[11px] mt-1 text-slate-400 group-hover:text-white transition-colors hidden lg:flex items-center gap-1 font-medium">Me <span className="text-[8px]">▼</span></span>
            
            {open && (
              <div className="absolute right-0 top-[64px] card border border-emerald-500/20 p-5 w-64 text-left backdrop-blur-2xl">
                <div className="font-bold text-white text-lg">{user?.name || "Demo " + role}</div>
                <div className="text-xs text-emerald-400 font-medium capitalize tracking-wide">{role}</div>
                
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sm font-semibold text-slate-300 hover:text-white transition-colors w-full text-left flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}