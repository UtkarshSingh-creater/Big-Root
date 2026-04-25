import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { FaUserPlus, FaCheck, FaSearch, FaTimes, FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api/index";
import { sendConnection, getConnections, respondToConnection } from "../../api/connection";
import { getAllUsers } from "../../api/user";
import socket from "../../services/socket";
import toast from "react-hot-toast";

export default function Networking() {
  const [users, setUsers] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Safely grab current user to filter out self
  const currentUser = (() => {
    try {
      const u = localStorage.getItem("user");
      if (!u || u === "undefined" || u === "null") return {};
      const parsed = JSON.parse(u);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  })();
  const currentUserId = currentUser?._id || currentUser?.id || "";

  const fetchData = async () => {
    try {
      const [usersRes, connectionsRes] = await Promise.all([
        getAllUsers(),
        getConnections()
      ]);
      
      setUsers(usersRes.data || []);
      setMyConnections(connectionsRes.data || []);
    } catch (e) {
       console.error("Failed to fetch network:", e);
       toast.error("Failed to load network components");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for connection response updates
    const handleNotification = (data) => {
      if (data.type === "connection_response" || data.type === "connection_request") {
        fetchData();
      }
    };
    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, []);

  const handleSendConnection = async (userId) => {
    try {
      await sendConnection(userId);
      toast.success("Connection request sent!");

      // 🔔 Emit real-time socket event
      socket.emit("sendConnectionRequest", {
        senderId: currentUserId,
        receiverId: userId,
      });

      fetchData();
    } catch(e) {
      console.error(e);
      toast.error(e.response?.data?.msg || "Failed to send connection");
    }
  };

  const handleRespond = async (connectionId, action, otherUserId) => {
    try {
      await respondToConnection(connectionId, action);
      toast.success(`Request ${action === "accepted" ? "accepted" : "rejected"}!`);
      
      // 🔔 Emit real-time response using the specific event names the backend expects
      const eventName = action === "accepted" ? "acceptConnectionRequest" : "rejectConnectionRequest";
      socket.emit(eventName, {
        senderId: otherUserId, // The original sender of the request
        receiverId: currentUserId, // Me (the one who responded)
        status: action
      });

      fetchData();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.msg || "Failed to respond to request");
    }
  };

  const getStatus = (userId) => {
     const conn = myConnections.find(c => {
       const sId = c.sender?._id || c.sender;
       const rId = c.receiver?._id || c.receiver;
       return String(sId) === String(userId) || String(rId) === String(userId);
     });
     if (!conn) return { status: "connect" };
     
     // Check if I am the receiver and it's pending
     const rId = conn.receiver?._id || conn.receiver;
     const isIncoming = String(rId) === String(currentUserId);
     
     return { 
       status: conn.status, 
       isIncoming, 
       connectionId: conn._id 
     };
  };

  // Filter incoming pending requests
  const incomingRequests = myConnections.filter(c => {
    const rId = c.receiver?._id || c.receiver;
    return String(rId) === String(currentUserId) && c.status === "pending";
  });

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
              className="bg-[#0b1114]/50 border border-white/10 text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-full md:w-64"
            />
          </div>
        </div>

        {loading ? (
           <div className="text-center py-10 text-blue-500 font-medium tracking-wide">Loading connections...</div>
        ) : (
          <div className="space-y-8">
            
            {/* Incoming Requests Section */}
            {incomingRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Pending Requests ({incomingRequests.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingRequests.map((conn) => {
                    const person = conn.sender;
                    if (!person) return null; // Skip if sender data is missing
                    return (
                      <div key={conn._id} className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
                          {person.profilePhoto ? <img src={person.profilePhoto} className="w-full h-full object-cover" /> : (person.name?.[0] || "?")}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{person.name || "Unknown"}</h3>
                          <p className="text-xs text-slate-400 capitalize">{person.role || "Member"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRespond(conn._id, "accepted", person._id || person.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button 
                            onClick={() => handleRespond(conn._id, "rejected", person._id || person.id)}
                            className="bg-white/10 hover:bg-red-500/20 text-white p-2 rounded-lg transition-colors"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discovery Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">People you may know</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.length === 0 ? (
                  <div className="text-slate-500 text-sm italic col-span-full">No other users found.</div>
                ) : (
                  users.map((person) => {
                    const { status, isIncoming } = getStatus(person._id || person.id);
                    
                    return (
                    <div key={person._id || person.id} className="relative p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:bg-white/[0.05] transition-colors group flex items-center gap-4">
                      
                      <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg flex-shrink-0 overflow-hidden">
                          {person.profilePhoto ? (
                            <img src={person.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (person.name?.[0] || "?").toUpperCase()
                          )}
                      </div>

                      <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors cursor-pointer">{person.name || "Unknown"}</h3>
                          <div className="text-xs text-slate-400 truncate mt-0.5 capitalize">{person.role || "Member"}</div>
                          <div className="text-[10px] text-blue-500/80 font-medium mt-1">{person.collegeName || ""}</div>
                      </div>

                      <div>
                          {status === "accepted" ? (
                            <button 
                              onClick={() => navigate(`/messaging?chat=${person._id || person.id}`)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                              <FaCommentDots /> Message
                            </button>
                          ) : status === "pending" ? (
                            <button className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold cursor-default ${
                              isIncoming ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {isIncoming ? "Request Received" : "Pending"}
                            </button>
                          ) : (
                            <button onClick={() => handleSendConnection(person._id || person.id)} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/10">
                              <FaUserPlus /> Connect
                            </button>
                          )}
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
