import { useState, useRef } from "react";
import { FaImage, FaVideo, FaCalendarAlt, FaPaperPlane } from "react-icons/fa";
import API from "../../api";
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
      // Fast refresh to pull new feed data
      window.location.reload();
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error("Failed to publish post.");
    }
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex-shrink-0">
          {user?.name?.[0] || role[0].toUpperCase()}
        </div>
        <textarea
          placeholder="Start a post, share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[100px] shadow-inner"
        />
      </div>

      {file && (
        <div className="mb-4 ml-16 relative inline-block">
           <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
             <FaImage /> {file.name}
             <button onClick={() => setFile(null)} className="ml-2 text-red-400 hover:text-red-300 font-bold">×</button>
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
            className="flex items-center justify-center p-3 text-slate-400 hover:bg-white/5 hover:text-emerald-400 rounded-full transition-all"
          >
            <FaImage className="text-xl" />
          </button>
          <button 
            title="Add Event"
            onClick={() => notifySoon("Event Scheduling")}
            className="flex items-center justify-center p-3 text-slate-400 hover:bg-white/5 hover:text-emerald-400 rounded-full transition-all"
          >
            <FaCalendarAlt className="text-xl" />
          </button>
        </div>

        <button 
          onClick={handlePost} 
          disabled={loading || (!text.trim() && !file)}
          className="btn-primary py-2 px-6 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : <><FaPaperPlane /> Post</>}
        </button>
      </div>
    </div>
  );
}