import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import PostCard from "../../components/post/PostCard";
import { FaUserPlus, FaCheck, FaSpinner, FaArrowLeft } from "react-icons/fa";
import API from "../../api/index";
import { sendConnection, getConnections } from "../../api/connection";
import { getUserProfileById } from "../../api/user";
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
    // If the user clicks on their own profile maliciously mapped or indirectly, push them back to their edit page natively
    if (id === currentUser._id || id === currentUser.id) {
       navigate("/profile", { replace: true });
       return;
    }

    const fetchPublicData = async () => {
      try {
        const [profileRes, connRes] = await Promise.all([
          getUserProfileById(id).catch((err) => {
             console.error("Profile fetch error:", err);
             return { data: null };
          }),
          getConnections().catch(() => ({ data: [] }))
        ]);

        if (!profileRes.data || !profileRes.data.user) {
           toast.error("User profile could not be found");
           setLoading(false);
           return;
        }

        setProfile(profileRes.data.user);
        
        // Use posts from profile endpoint if available (paginated/embedded), otherwise fetch explicit posts
        if (profileRes.data.posts) {
           setPosts(profileRes.data.posts);
        } else {
           try {
              const explicitUserPosts = await API.get(`/post/user/${id}`);
              setPosts(explicitUserPosts.data?.posts || []);
           } catch (e) {
              setPosts([]);
           }
        }

        // Handle array returned directly vs nested data object
        const myConns = Array.isArray(connRes.data) ? connRes.data : (connRes.data.connections || []);

        // Filter Connection Params
        const establishedConn = myConns.find(c => 
          (c.recipient?._id === id || c.sender?._id === id || c.recipient === id || c.sender === id)
        );
        if (establishedConn) {
           setConnectionStatus(establishedConn.status || "pending");
        }

      } catch (e) {
        console.error(e);
        toast.error("Failed to load public data");
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
      setConnectionStatus("pending");
    } catch(e) {
      toast.error(e.response?.data?.msg || "Failed to send connection");
    }
  };

  if (loading) return (
    <Layout>
      <div className="card p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-emerald-500 flex items-center gap-2 font-bold tracking-wide">
           <FaSpinner className="animate-spin text-xl" /> Generating user profile...
        </div>
      </div>
    </Layout>
  );

  if (!profile) return (
    <Layout>
      <div className="card p-8 text-center text-slate-400 font-semibold min-h-[50vh] flex flex-col justify-center items-center">
         <div>Profile Not Found</div>
         <button onClick={() => navigate(-1)} className="mt-4 text-emerald-500 hover:text-emerald-400 flex items-center gap-2 transition-colors">
            <FaArrowLeft /> Go Back
         </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="card overflow-hidden mb-6">
        {/* Cover Graphic */}
        <div className="h-32 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-emerald-900/40 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="p-8 relative">
          
          {/* Avatar Area */}
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#151f24] shadow-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
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
              <p className="text-emerald-500 font-medium tracking-wide capitalize">{profile.role}</p>
            </div>

            <div>
               {connectionStatus === "connected" ? (
                 <button className="flex items-center gap-2 px-6 py-2.5 rounded bg-white/5 text-slate-300 font-semibold cursor-default">
                   <FaCheck /> Connected
                 </button>
               ) : connectionStatus === "pending" || connectionStatus === "requested" ? (
                 <button className="flex items-center gap-2 px-6 py-2.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold cursor-default">
                   Pending
                 </button>
               ) : (
                 <button onClick={handleConnect} className="flex items-center gap-2 px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#0b1114] font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-colors">
                   <FaUserPlus /> Connect
                 </button>
               )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
             <label className="block text-xs font-semibold text-emerald-400 mb-2 tracking-wide uppercase">About Me</label>
             <p className="text-slate-300 leading-relaxed min-h-[60px]">
                {profile.about || "No biography available yet."}
             </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-8">
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">College Identity</label>
               <div className="text-white font-medium">{profile.college || "N/A"}</div>
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Auth Directory</label>
               <div className="text-white font-medium text-sm">{profile.email || profile.identifier || "hidden"}</div>
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
