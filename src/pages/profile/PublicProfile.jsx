import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import PostCard from "../../components/post/PostCard";
import { FaUserPlus, FaCheck, FaSpinner, FaArrowLeft, FaCommentDots } from "react-icons/fa";
import API from "../../api/index";
import { sendConnection, getConnections } from "../../api/connection";
import { getUserProfileById } from "../../api/user";
import socket from "../../services/socket";
import toast from "react-hot-toast";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connect");
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (id === currentUser._id || id === currentUser.id) {
       navigate("/profile", { replace: true });
       return;
    }

    const fetchPublicData = async () => {
      try {
        const [profileRes, connRes] = await Promise.all([
          getUserProfileById(id).catch(() => ({ data: null })),
          getConnections().catch(() => ({ data: [] }))
        ]);

        if (!profileRes.data || !profileRes.data.user) {
           toast.error("User profile could not be found");
           setLoading(false);
           return;
        }

        setProfile(profileRes.data.user);
        setPosts(profileRes.data.posts || []);
        
        // Use connectionStatus from backend if available, otherwise fallback to frontend check
        if (profileRes.data.connectionStatus) {
           setConnectionStatus(profileRes.data.connectionStatus);
        } else {
           const myConns = Array.isArray(connRes.data) ? connRes.data : (connRes.data.connections || []);
           const establishedConn = myConns.find(c => 
             (c.sender?._id === id || c.sender === id || c.receiver?._id === id || c.receiver === id)
           );
           if (establishedConn) {
              setConnectionStatus(establishedConn.status);
           }
        }

      } catch (e) {
        console.error(e);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [id, currentUser._id, currentUser.id, navigate]);

  const handleConnect = async () => {
    try {
      await sendConnection(id);
      toast.success("Connection request sent!");
      setConnectionStatus("pending_sent");
      socket.emit("sendConnectionRequest", {
        senderId: currentUser._id || currentUser.id,
        receiverId: id,
      });
    } catch(e) {
      toast.error(e.response?.data?.msg || "Failed to send connection");
    }
  };

  const handleRespond = async (action) => {
    try {
      const connRes = await getConnections();
      const myConns = Array.isArray(connRes.data) ? connRes.data : (connRes.data.connections || []);
      const conn = myConns.find(c => String(c.sender?._id || c.sender) === String(id) && c.status === "pending");

      if (!conn) {
        toast.error("Process interrupted. Try reloading.");
        return;
      }

      await API.post(`/connection/respond/${conn._id}`, { action });
      toast.success(`Connection ${action}!`);
      setConnectionStatus(action === "accepted" ? "connected" : "connect");

      const event = action === "accepted" ? "acceptConnectionRequest" : "rejectConnectionRequest";
      socket.emit(event, { senderId: id, receiverId: currentUser._id });
    } catch (e) {
      toast.error("Failed to respond.");
    }
  };

  if (loading) return (
    <Layout>
      <div className="card p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-blue-500 flex items-center gap-2 font-bold tracking-wide">
           <FaSpinner className="animate-spin text-xl" /> Generating user profile...
        </div>
      </div>
    </Layout>
  );

  if (!profile) return (
    <Layout>
      <div className="card p-8 text-center text-slate-400 font-semibold min-h-[50vh] flex flex-col justify-center items-center">
         <div>Profile Not Found</div>
         <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:text-blue-400 flex items-center gap-2 transition-colors">
            <FaArrowLeft /> Go Back
         </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-900/40 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="p-8 relative">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#151f24] shadow-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
               {profile.profilePhoto ? (
                 <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 profile.name?.[0]?.toUpperCase() || "?"
               )}
            </div>
          </div>

          <div className="mt-16 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-blue-500 font-medium tracking-wide capitalize">{profile.role}</p>
            </div>

            <div>
               {connectionStatus === "connected" || connectionStatus === "accepted" ? (
                 <button 
                  onClick={() => navigate(`/messaging?chat=${id}`)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                 >
                   <FaCommentDots /> Message
                 </button>
               ) : connectionStatus === "pending" || connectionStatus === "pending_sent" ? (
                 <button className="flex items-center gap-2 px-6 py-2.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold cursor-default">
                   Pending
                 </button>
               ) : connectionStatus === "pending_received" ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond("accepted")} className="flex items-center gap-2 px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all">
                      Accept
                    </button>
                    <button onClick={() => handleRespond("rejected")} className="flex items-center gap-2 px-6 py-2.5 rounded bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
                      Reject
                    </button>
                  </div>
               ) : (
                 <button onClick={handleConnect} className="flex items-center gap-2 px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors">
                   <FaUserPlus /> Connect
                 </button>
               )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
             <label className="block text-xs font-semibold text-blue-500 mb-2 tracking-wide uppercase">About Me</label>
             <p className="text-slate-300 leading-relaxed min-h-[60px]">
                {profile.about || "No biography available yet."}
             </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-8">
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">College Identity</label>
               <div className="text-white font-medium">{profile.collegeName || profile.college || "N/A"}</div>
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Auth Directory</label>
               <div className="text-white font-medium text-sm">{profile.email || "hidden@college.edu"}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Timeline Activity ({posts.length})</div>
      
      {posts.length === 0 ? (
         <div className="card p-8 text-center text-slate-400 font-medium border-dashed border-2 border-white/5">
           No posts published yet.
         </div>
      ) : (
         <div className="space-y-4">
           {posts.map(post => (
              <PostCard key={post._id} post={post} />
           ))}
         </div>
      )}
    </Layout>
  );
}
