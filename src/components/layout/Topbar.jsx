import { useState, useEffect } from "react";
import { FaHome, FaUserFriends, FaBriefcase, FaBell, FaSearch, FaCommentDots } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/index";
import socket, { connectSocket } from "../../services/socket";

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
          const notifs = notifRes.data?.notifications || (Array.isArray(notifRes.data) ? notifRes.data : []);
          if (notifs.length) {
             setNotifications(notifs.map(n => ({
                id: n._id || Math.random(),
                initial: n.sender?.name?.[0] || n.message?.[0] || "✦",
                bg: n.type === "connection_request" ? "bg-indigo-500" : "bg-blue-500",
                text: n.type === "connection_request" && n.sender?.name
                   ? `${n.sender.name} sent you a connection request`
                   : n.message,
                time: new Date(n.createdAt || Date.now()).toLocaleDateString(),
                type: n.type || null,
                sender: n.sender?._id || n.sender || null,
                senderName: n.sender?.name || null,
                senderPhoto: n.sender?.profilePhoto || null
             })));
          }
       } catch (err) {
          console.error("Topbar Hydration Failed", err);
       }
    };
    loadData();
    
    // ✅ Connect socket and register user with backend (emits `join` after confirmed connect)
    connectSocket();

    // 1. Listen for real backend WebSocket notifications
    const handleBackendNotification = (data) => {
       const isConnReq = data.type === "connection_request";
       setNotifications(prev => [{ 
         id: data._id || Date.now(), 
         initial: data.senderName?.[0] || data?.message?.[0] || "✦", 
         bg: isConnReq ? "bg-indigo-500" : "bg-blue-500", 
         text: isConnReq && data.senderName
            ? `${data.senderName} sent you a connection request`
            : (data.message || "New activity detected."), 
         time: "Just now",
         type: data.type || null,
         sender: data.sender || null,
         senderName: data.senderName || null,
         senderPhoto: data.senderPhoto || null
       }, ...prev]);
       toast.success(data.message || "New notification!", { icon: "🔔" });
    };

    // 2. Listen for local dashboard broadcast signals (Mock Testing)
    const handleLocalAlert = (e) => {
       setNotifications(prev => [{ id: Date.now(), initial: "🚀", bg: "bg-blue-600", text: e.detail, time: "Just now" }, ...prev]);
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

  const handleRespond = async (nId, senderId, action) => {
     try {
        // Fetch pending incoming requests — /connection/my only returns accepted connections
        const connectionsRes = await API.get("/connection/requests");
        const pendingList = connectionsRes.data?.requests || connectionsRes.data || [];
        const conn = pendingList.find(c => 
           String(c.sender?._id || c.sender) === String(senderId)
        );

        if (!conn) {
           toast.error("Could not find matching request.");
           return;
        }

        await API.post(`/connection/respond/${conn._id}`, { action });
        toast.success(`Request ${action}!`);
        
        // Remove from list
        setNotifications(prev => prev.filter(n => n.id !== nId));

        // Real-time broadcast
        const event = action === "accepted" ? "acceptConnectionRequest" : "rejectConnectionRequest";
        socket.emit(event, { senderId, receiverId: user?._id });

     } catch (e) {
        console.error(e);
        toast.error("Action failed.");
     }
  };

  return (
    <div className="h-[64px] fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 z-50 flex justify-center shadow-sm">
      <div className="max-w-7xl w-full px-4 flex items-center justify-between">
        
        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-4">
          <div className="brand-text text-3xl hidden md:block">BigRoot</div>
          <div className="brand-text text-3xl md:hidden">BR</div>
          <div className="relative ml-2 pb-1">
             <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-inner">
               <FaSearch className="text-blue-500 mr-2" />
               <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search network..." className="bg-transparent focus:outline-none w-56 placeholder-slate-400" />
             </div>
             
             {query && (
               <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 overflow-hidden">
                  {results.length > 0 ? results.map(u => (
                    <div key={u._id} onClick={() => { navigate(`/profile/${u._id}`); setQuery(""); }} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-100 last:border-b-0">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                          {u.profilePhoto ? <img src={u.profilePhoto} className="w-full h-full object-cover" /> : u.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{u.name}</div>
                          <div className="text-[10px] text-blue-600 capitalize font-medium truncate">{u.role}</div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-3 text-xs text-slate-500 text-center font-medium">No results found.</div>
                  )}
               </div>
             )}
          </div>
          <div onClick={() => notifySoon("Search Engine")} className="md:hidden text-blue-500 ml-2 p-2 focus:outline-none text-xl cursor-pointer">
             <FaSearch />
          </div>
        </div>

        {/* RIGHT: Navigation & Profile */}
        <div className="flex items-center h-full">
          <div className="hidden sm:flex h-full gap-2 px-6 border-r border-slate-200">
            {navItems.map((item, index) => (
              <div onClick={item.action} key={index} className="flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 cursor-pointer min-w-[70px] transition-colors group">
                <div className="group-hover:-translate-y-1 transition-transform duration-300">{item.icon}</div>
                <span className="text-[11px] mt-1.5 font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">{item.label}</span>
              </div>
            ))}
          </div>

          {/* ALERTS DROPDOWN */}
          {typeof alertsOpen !== "undefined" && alertsOpen && (
             <div className="absolute top-[64px] right-20 md:right-32 w-96 bg-white border border-slate-200 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="text-slate-800 font-extrabold text-sm tracking-wide">Notifications</h3>
                   <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">All caught up!</div>
                   ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors flex flex-col gap-2">
                           <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center text-white font-bold text-xs shrink-0 flex-col pt-0.5`}>{n.initial}</div>
                              <div className="flex-1">
                                 <div className="text-sm text-slate-700 font-medium">{n.text}</div>
                                 <div className="text-[10px] text-blue-500 font-semibold mt-1">{n.time}</div>
                              </div>
                           </div>
                           
                           {/* ACCEPT / REJECT BUTTONS FOR CONNECTION REQUESTS */}
                           {n.type === "connection_request" && n.sender && (
                              <div className="flex gap-2 mt-1 ml-11">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleRespond(n.id, String(n.sender?._id || n.sender), "accepted"); }}
                                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                 >
                                    ✓ Accept
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleRespond(n.id, String(n.sender?._id || n.sender), "rejected"); }}
                                    className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 hover:border-red-200"
                                 >
                                    ✕ Reject
                                 </button>
                              </div>
                           )}
                        </div>
                      ))
                   )}
                </div>
                {notifications.length > 0 && (
                  <div onClick={() => setNotifications([])} className="p-3 text-center border-t border-slate-100 text-xs text-blue-600 font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                     Mark all as read
                  </div>
                )}
             </div>
          )}

          {/* PROFILE */}
          <div className="relative flex flex-col items-center justify-center ml-6 cursor-pointer group" onClick={() => { setOpen(!open); setAlertsOpen(false); }}>
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-105 transition-transform">
              {user?.name?.[0] || role[0].toUpperCase()}
            </div>
            <span className="text-[11px] mt-1 text-slate-500 group-hover:text-slate-800 transition-colors hidden lg:flex items-center gap-1 font-medium">Me <span className="text-[8px]">▼</span></span>
            
            {open && (
              <div className="absolute right-0 top-[64px] bg-white border border-slate-200 rounded-xl shadow-xl p-5 w-64 text-left z-50">
                <div className="font-extrabold text-slate-800 text-lg">{user?.name || "Demo " + role}</div>
                <div className="text-xs text-blue-600 font-medium capitalize tracking-wide">{role}</div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors w-full text-left flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors w-full text-left"
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