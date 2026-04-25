import { useState, useRef } from "react";
import { FaImage, FaCalendarAlt, FaPaperPlane } from "react-icons/fa";
import API from "../../api";
import socket from "../../services/socket";
import { getConnections } from "../../api/connection";
import toast from "react-hot-toast";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role") || "student";
  
  const notifySoon = (feature) => toast(`${feature} is coming soon to BigRoot!`, { icon: "🚀" });

  const handlePost = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("media", file);

    try {
      await API.post("/post/create", formData);
      setText("");
      setFile(null);

      // 🔔 Emit newPost to socket so backend notifies all connections in real-time
      try {
        const connRes = await getConnections();
        const myConns = Array.isArray(connRes.data)
          ? connRes.data
          : (connRes.data?.connections || []);

        // Collect IDs of accepted connections
        const connectedIds = myConns
          .filter(c => c.status === "connected" || c.status === "accepted")
          .map(c => {
            const other = c.recipient?._id === (user?._id || user?.id)
              ? c.sender?._id
              : c.recipient?._id;
            return other;
          })
          .filter(Boolean);

        if (connectedIds.length > 0) {
          socket.emit("newPost", {
            connections: connectedIds,
            user: user?.name || "Someone",
          });
        }
      } catch (socketErr) {
        console.warn("Could not emit newPost socket event:", socketErr);
      }

      // Trigger feed refresh without hard reload
      window.dispatchEvent(new CustomEvent("feed-refresh"));
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error("Failed to publish post.");
    }
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
          {user?.name?.[0] || role[0].toUpperCase()}
        </div>
        <textarea
          placeholder="Start a post, share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none min-h-[100px] font-medium"
        />
      </div>

      {file && (
        <div className="mb-4 ml-16 relative inline-block">
           <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-2 font-semibold">
             <FaImage /> {file.name}
             <button onClick={() => setFile(null)} className="ml-2 text-red-500 hover:text-red-600 font-bold">×</button>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center ml-16">
        <div className="flex gap-2">
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files[0])} 
            className="hidden" 
            accept="image/*,video/*"
          />
          
          <button 
            title="Add Media"
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center justify-center p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all"
          >
            <FaImage className="text-xl" />
          </button>
          <button 
            title="Add Event"
            onClick={() => notifySoon("Event Scheduling")}
            className="flex items-center justify-center p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all"
          >
            <FaCalendarAlt className="text-xl" />
          </button>
        </div>

        <button 
          onClick={handlePost} 
          disabled={loading || (!text.trim() && !file)}
          className="btn-primary py-2 px-6 flex items-center gap-2 shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : <><FaPaperPlane /> Post</>}
        </button>
      </div>
    </div>
  );
}