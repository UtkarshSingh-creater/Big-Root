import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { FaUserPlus, FaCheck, FaSearch } from "react-icons/fa";
import API from "../../api/index";
import { sendConnection, getConnections } from "../../api/connection";
import toast from "react-hot-toast";

export default function Networking() {
  const [connections, setConnections] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safely grab current user to filter out self
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, connectionsRes] = await Promise.all([
          API.get("/post/feed"),
          getConnections()
        ]);
        
        // Backend missing User Search Route: Extract unique authors from the global network Feed
        const globalPosts = feedRes.data?.posts || [];
        const allUsersMap = [...new Map(globalPosts.map(p => [p.author?._id || p.author?.id, p.author])).values()];
        const allUsers = allUsersMap.filter(u => u != null);
        
        const myConnParams = connectionsRes.data || []; // Note: typical Node response returns array directly or inside data
        
        // Remove currently logged in user from network view
        setConnections(allUsers.filter(u => u._id !== currentUser._id && u.id !== currentUser.id));
        setMyConnections(myConnParams);
      } catch (e) {
         console.error("Failed to fetch network:", e);
         toast.error("Failed to load network components");
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleConnection = async (userId) => {
    try {
      await sendConnection(userId);
      toast.success("Connection request sent!");
      
      // Optimistic update of local connection array mappings via push mechanism
      setMyConnections([...myConnections, { recipient: { _id: userId }, status: "pending" }]);
    } catch(e) {
      console.error(e);
      toast.error(e.response?.data?.msg || "Failed to send connection");
    }
  };

  const getStatus = (userId) => {
     // Validate arrays based on active user mapped connection architecture (assuming mapped object with .recipient or .sender)
     // Fallback UI status check based on how standard backend populates pending vs connected vs none
     const conn = myConnections.find(c => 
       (c.recipient?._id === userId || c.sender?._id === userId || c.recipient === userId || c.sender === userId)
     );
     if (!conn) return "connect";
     return conn.status || "pending";
  };

  return (
    <Layout>
      <div className="card p-6 min-h-[70vh]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Network</h1>
            <p className="text-slate-400 text-sm">Grow your roots and connect with alumni.</p>
          </div>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search people..." 
              className="bg-[#0b1114]/50 border border-white/10 text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-full md:w-64"
            />
          </div>
        </div>

        {loading ? (
           <div className="text-center py-10 text-emerald-500 font-medium tracking-wide">Loading connections...</div>
        ) : connections.length === 0 ? (
           <div className="text-center py-10 text-slate-500 font-medium">No new connections found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((person) => {
              const status = getStatus(person._id || person.id);
              return (
              <div key={person._id || person.id} className="relative p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:bg-white/[0.05] transition-colors group flex items-center gap-4">
                 
                 <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg flex-shrink-0 overflow-hidden">
                    {person.profilePhoto ? (
                      <img src={person.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (person.name?.[0] || "?").toUpperCase()
                    )}
                 </div>

                 <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate group-hover:text-emerald-400 transition-colors cursor-pointer">{person.name || "Unknown"}</h3>
                    <div className="text-xs text-slate-400 truncate mt-0.5 capitalize">{person.role || "Member"}</div>
                    <div className="text-[10px] text-emerald-500/80 font-medium mt-1">{person.college || ""}</div>
                 </div>

                 <div>
                    {status === "connected" ? (
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 text-slate-300 text-xs font-semibold cursor-default">
                        <FaCheck /> Connected
                      </button>
                    ) : status === "pending" || status === "requested" ? (
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-default">
                        Pending
                      </button>
                    ) : (
                      <button onClick={() => toggleConnection(person._id || person.id)} className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#0b1114] text-xs font-bold transition-colors">
                        <FaUserPlus /> Connect
                      </button>
                    )}
                 </div>
              </div>
            )})}
          </div>
        )}

      </div>
    </Layout>
  );
}
