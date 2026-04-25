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
      <div className="flex bg-white border border-slate-200 p-1.5 rounded-xl mb-6 gap-2 shadow-sm">
         <button 
           onClick={() => setActiveTab("network")}
           className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "network" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
         >
            Network Feed
         </button>
         <button 
           onClick={() => setActiveTab("manage")}
           className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "manage" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
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
         <div className="card p-8 animate-fade-in shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Register New Personnel</h2>
            <p className="text-slate-500 text-sm mb-8 tracking-wide font-medium">
               Proactively provision accounts mapping directly securely into <span className="text-blue-600 font-bold">{currentCollege}</span>'s isolated network infrastructure.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-6">
                
                {/* Role Switcher */}
                <div>
                   <label className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-3 block">1. Select Identity Protocol</label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                         <input type="radio" name="role" value="student" checked={formData.role === "student"} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                         Student / Alumnus Account
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                         <input type="radio" name="role" value="faculty" checked={formData.role === "faculty"} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
                         Faculty Account
                      </label>
                   </div>
                </div>

                <div className="h-px bg-slate-200 w-full"></div>

                {/* Universal Fields */}
                <div>
                   <label className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-4 block">2. Standard Inputs</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Full Legal Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Secure Password</label>
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="••••••••" />
                      </div>
                   </div>
                </div>

                {/* Conditional Fields */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
                   <label className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-4 block">
                      3. {formData.role === "student" ? "Student / Alumnus" : "Faculty"} Parameters
                   </label>
                   
                   {formData.role === "student" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Internal College ID</label>
                           <input required type="text" name="collegeId" value={formData.collegeId} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. CS2022_001" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">University Roll No</label>
                           <input required type="text" name="universityRollNo" value={formData.universityRollNo} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. 210xxxxxx" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Academic Branch</label>
                           <input required type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. CSE, IT" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Batch Year</label>
                           <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. 1, 2, 3, 4" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Section</label>
                           <input required type="text" name="section" value={formData.section} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. A, B" />
                        </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Verified Email Address</label>
                           <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="faculty@college.edu" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Department</label>
                           <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. Computer Science" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Designation</label>
                           <input required type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. Associate Professor" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Qualification</label>
                           <input required type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-400" placeholder="e.g. Ph.D. in Machine Learning" />
                        </div>
                      </div>
                   )}
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 btn-primary rounded-xl mt-4 flex justify-center items-center gap-3">
                   {loading ? "Provisioning Database..." : "Commit User to Network"}
                </button>
            </form>
         </div>
      )}

    </Layout>
  );
}