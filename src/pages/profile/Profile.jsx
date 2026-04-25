import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/user";
import Layout from "../../components/layout/Layout";
import { FaCamera, FaSave, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data.user);
      setName(res.data.user.name || "");
      setAbout(res.data.user.about || "");
      setEmail(res.data.user.email || res.data.user.identifier || "");
      setSkills(Array.isArray(res.data.user.domain) ? res.data.user.domain.join(", ") : "");
    } catch (e) {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("about", about);
      formData.append("email", email);

      const domainArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      domainArray.forEach(d => {
         formData.append("domain", d);
      });

      if (file) formData.append("profilePhoto", file);

      const res = await updateProfile(formData);
      setUser(res.data.user || res.data); // update current user based on res payload
      
      // Update local storage user just in case
      if (res.data.user) {
         localStorage.setItem("user", JSON.stringify(res.data.user));
         window.dispatchEvent(new Event("storage")); // Trigger topbar refresh hook if possible
      }

      toast.success("Profile updated successfully");
      setFile(null);
      setPreview(null);
      await fetchProfile();
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
       setFile(selectedFile);
       setPreview(URL.createObjectURL(selectedFile));
    }
  };

  if (!user) return (
    <Layout>
      <div className="card p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-blue-500 flex items-center gap-2 font-bold tracking-wide">
           <FaSpinner className="animate-spin text-xl" /> Fetching profile...
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="card overflow-hidden">
        
        {/* Cover Graphic */}
        <div className="h-32 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-900/40 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="p-8 relative">
          
          {/* Avatar Area */}
          <div className="absolute -top-16 left-8">
            <div className="group relative w-32 h-32 rounded-full border-4 border-[#151f24] shadow-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
               {preview || user.profilePhoto ? (
                 <img src={preview || user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 user.name?.[0]?.toUpperCase() || "?"
               )}

               {/* Camera Overlay */}
               <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                 <div className="flex flex-col items-center justify-center text-white">
                    <FaCamera className="text-2xl mb-1" />
                    <span className="text-xs font-semibold">Change</span>
                 </div>
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </label>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-16 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-blue-500 font-medium tracking-wide capitalize">{user.role}</p>
            </div>
            
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="btn-primary flex items-center gap-2 py-2.5 px-6 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Edit Form Matrix */}
          <div className="space-y-6">
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
               <label className="block text-xs font-semibold text-blue-500 mb-2 tracking-wide uppercase">Display Name</label>
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
               />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
               <label className="block text-xs font-semibold text-blue-500 mb-2 tracking-wide uppercase">Email Address</label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
               />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
               <label className="block text-xs font-semibold text-blue-500 mb-2 tracking-wide uppercase">Skills / Domains (Comma Separated)</label>
               <input
                 type="text"
                 value={skills}
                 onChange={(e) => setSkills(e.target.value)}
                 placeholder="e.g. Web Development, Machine Learning, UI/UX Design"
                 className="w-full bg-black/30 border border-white/10 text-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
               />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
               <label className="block text-xs font-semibold text-blue-500 mb-2 tracking-wide uppercase">About Me</label>
               <textarea
                 value={about}
                 onChange={(e) => setAbout(e.target.value)}
                 rows="4"
                 placeholder="Write something about your background and goals..."
                 className="w-full bg-black/30 border border-white/10 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all leading-relaxed resize-none"
               />
            </div>

            {/* Readonly Info fields extracted for mockup style mapping */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-8">
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Fixed Identity: College</label>
                 <div className="text-slate-300 font-medium">{user.collegeName || user.college || "Your College"}</div>
               </div>
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">System Identifier</label>
                 <div className="text-slate-500 font-medium text-sm">{user._id || "N/A"}</div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}