import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { FaBuilding, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Opportunities() {
  const [jobs, setJobs] = useState([
    { id: 1, title: "Senior Frontend Engineer", company: "TechNova Solutions", location: "Remote", type: "Full-time", salary: "$120k - $150k", posted: "2 hours ago", match: 94 },
    { id: 2, title: "Backend Systems Developer", company: "DataFlow Systems", location: "Bangalore, India", type: "Full-time", salary: "₹18L - ₹25L", posted: "5 hours ago", match: 88 },
    { id: 3, title: "UI/UX Product Designer", company: "Creative Studios", location: "Mumbai, India", type: "Contract", salary: "₹8L - ₹12L", posted: "1 day ago", match: 76 },
    { id: 4, title: "Machine Learning Intern", company: "AI Research Labs", location: "Remote", type: "Internship", salary: "Stipend", posted: "2 days ago", match: 91 },
  ]);

  const handleApply = (title) => {
    toast.success(`Application sent for ${title}!`, { icon: '✅' });
  };

  return (
    <Layout>
      <div className="card p-6 min-h-[75vh]">
        
        {/* Header Block */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Opportunities</h1>
          <p className="text-slate-400 text-sm mb-6">Discover career paths posted directly by verified Alumni parameters.</p>
          
          <div className="flex flex-col md:flex-row gap-3">
             <div className="relative flex-1">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Search role, company or skills..." 
                 className="bg-black/30 border border-white/10 text-sm rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-full"
               />
             </div>
             <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-colors">
               <FaFilter /> Filters
             </button>
          </div>
        </div>

        {/* List of Jobs */}
        <div className="space-y-4">
          {jobs.map(job => (
             <div key={job.id} className="p-5 rounded-2xl border border-white/5 bg-gradient-to-r from-transparent to-black/10 hover:border-blue-500/30 transition-colors group flex flex-col md:flex-row gap-4 md:items-center">
                
                {/* Visual Graphic Base */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-900/40 rounded-xl border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FaBuilding className="text-blue-500 text-2xl" />
                </div>
                
                {/* Context Column */}
                <div className="flex-1 min-w-0">
                   <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors cursor-pointer">{job.title}</h3>
                   <div className="text-blue-500 font-medium text-sm mb-2">{job.company}</div>
                   
                   <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                      <span className="flex items-center gap-1"><FaBriefcase /> {job.type}</span>
                      <span className="flex items-center gap-1 text-slate-300"><FaMoneyBillWave className="text-blue-500/70" /> {job.salary}</span>
                   </div>
                </div>

                {/* Applying Interactors */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 mt-2 md:mt-0">
                   <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                      {job.match}% Match
                   </div>
                   <button 
                     onClick={() => handleApply(job.title)}
                     className="btn-primary py-2 px-6 shadow-lg shadow-blue-500/10 active:scale-95 transition-transform text-sm"
                   >
                     Easy Apply
                   </button>
                   <div className="hidden md:block text-[10px] text-slate-500">{job.posted}</div>
                </div>
             </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
