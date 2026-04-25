import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import CreatePost from "../../components/post/CreatePost";
import Feed from "../../features/feed/Feed";
import API from "../../api/index";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("network"); // "network" or "manage"
  
  // Form handling
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      role: "student",
      name: "",
      email: "",         
      password: "",      
      // Faculty specifics
      designation: "",
      department: "",
      qualification: "",
      // Student specifics
      branch: "",
      section: "",
      year: "",
      collegeId: "",
      universityRollNo: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentCollege = localStorage.getItem("college") || "Your College";

  const handleCreateUser = async (e) => {
     e.preventDefault();
     setLoading(true);

     try {
       // Assemble payload targeting exact backend parameters mapping
       const payload = {
           role: formData.role,
           collegeName: currentCollege,
           name: formData.name,
           password: formData.password
       };

       if (formData.role === "student") {
           payload.branch = formData.branch;
           payload.section = formData.section;
           payload.year = formData.year;
           payload.collegeId = formData.collegeId;
           payload.universityRollNo = formData.universityRollNo;
       } else if (formData.role === "faculty") {
           payload.email = formData.email;
           payload.designation = formData.designation;
           payload.department = formData.department;
           payload.qualification = formData.qualification;
       }

       const res = await API.post("/admin/create-user", payload);
       toast.success(res.data.msg || `${formData.role} created successfully!`);
       
       // Purge specific role structures keeping role intact
       setFormData({
         ...formData,
         name: "", email: "", password: "", designation: "", department: "",
         qualification: "", branch: "", section: "", year: "", collegeId: "", universityRollNo: ""
       });
     } catch (err) {
       console.error(err);
       toast.error(err.response?.data?.msg || "Failed to create user.");
     } finally {
       setLoading(false);
     }
  };

  return (
    <Layout>
      <div className="flex bg-[#0b1114]/50 border border-white/5 p-1.5 rounded-xl mb-6 gap-2 backdrop-blur-md">
         <button 
           onClick={() => setActiveTab("network")}
           className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "network" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
         >
            Network Feed
         </button>
         <button 
           onClick={() => setActiveTab("manage")}
           className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "manage" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
         >
            User Management
         </button>
      </div>

      {activeTab === "network" ? (
         <div className="space-y-6 animate-fade-in">
           <CreatePost />
           <Feed />
         </div>
      ) : (
         <div className="card p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Register New Personnel</h2>
            <p className="text-slate-400 text-sm mb-8 tracking-wide">
               Proactively provision accounts mapping directly securely into <span className="text-emerald-500 font-semibold">{currentCollege}</span>'s isolated network infrastructure.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-6">
                
                {/* Role Switcher */}
                <div>
                   <label className="text-xs font-semibold text-emerald-500 tracking-wider uppercase mb-3 block">1. Select Identity Protocol</label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                         <input type="radio" name="role" value="student" checked={formData.role === "student"} onChange={handleChange} className="accent-emerald-500" />
                         Student / Alumnus Account
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                         <input type="radio" name="role" value="faculty" checked={formData.role === "faculty"} onChange={handleChange} className="accent-emerald-500" />
                         Faculty Account
                      </label>
                   </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                {/* Universal Fields */}
                <div>
                   <label className="text-xs font-semibold text-emerald-500 tracking-wider uppercase mb-4 block">2. Standard Inputs</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Full Legal Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0b1114]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Secure Password</label>
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0b1114]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="••••••••" />
                      </div>
                   </div>
                </div>

                {/* Conditional Fields */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/5 shadow-inner">
                   <label className="text-xs font-semibold text-amber-500 tracking-wider uppercase mb-4 block">
                      3. {formData.role === "student" ? "Student / Alumnus" : "Faculty"} Parameters
                   </label>
                   
                   {formData.role === "student" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">Internal College ID</label>
                           <input required type="text" name="collegeId" value={formData.collegeId} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. CS2022_001" />
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">University Roll No</label>
                           <input required type="text" name="universityRollNo" value={formData.universityRollNo} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. 210xxxxxx" />
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">Academic Branch</label>
                           <input required type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. CSE, IT" />
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">Batch Year</label>
                           <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. 1, 2, 3, 4" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-xs text-slate-400 mb-1.5 block">Section</label>
                           <input required type="text" name="section" value={formData.section} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. A, B" />
                        </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                           <label className="text-xs text-slate-400 mb-1.5 block">Verified Email Address</label>
                           <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="faculty@college.edu" />
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">Department</label>
                           <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. Computer Science" />
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 mb-1.5 block">Designation</label>
                           <input required type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. Associate Professor" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-xs text-slate-400 mb-1.5 block">Qualification</label>
                           <input required type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full bg-[#0b1114]/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none" placeholder="e.g. Ph.D. in Machine Learning" />
                        </div>
                      </div>
                   )}
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 transition-colors text-[#0b1114] font-bold rounded-lg shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50 flex justify-center items-center gap-3">
                   {loading ? "Provisioning Database..." : "Commit User to Network"}
                </button>
            </form>
         </div>
      )}

    </Layout>
  );
}