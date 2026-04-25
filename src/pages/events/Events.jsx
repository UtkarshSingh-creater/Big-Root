import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaTicketAlt } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Events() {
  const [events] = useState([
    { id: 1, title: "Global Alumni Meetup 2026", date: "Oct 15", time: "18:00 EST", location: "Virtual", attendees: 1450, type: "Meetup" },
    { id: 2, title: "NextGen Web3 Hackathon", date: "Nov 02", time: "09:00 PST", location: "San Francisco, CA", attendees: 320, type: "Hackathon" },
    { id: 3, title: "Career Placement Seminar", date: "Dec 10", time: "13:00 GMT", location: "Virtual", attendees: 84, type: "Seminar" },
    { id: 4, title: "System Design Masterclass", date: "Jan 05", time: "15:00 EST", location: "New York, NY", attendees: 512, type: "Workshop" },
  ]);

  const handleRSVP = (title) => {
    toast.success(`You've RSVP'd for ${title}!`, { icon: '🎟️' });
  };

  return (
    <Layout>
      <div className="card p-6 min-h-[75vh]">
        
        {/* Header Block */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Events & Activities</h1>
          <p className="text-slate-400 text-sm">Join upcoming seminars, hackathons, and networking sessions.</p>
        </div>

        {/* List of Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((evt) => (
             <div key={evt.id} className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:bg-white/[0.05] transition-colors group overflow-hidden flex flex-col">
                
                {/* Event Image Placeholder */}
                <div className="h-32 bg-gradient-to-r from-teal-900 to-black relative">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                   <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded px-3 py-1.5 flex flex-col items-center justify-center border border-white/10 shadow-lg">
                      <span className="text-emerald-400 font-bold leading-none mb-0.5">{evt.date.split(" ")[1]}</span>
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">{evt.date.split(" ")[0]}</span>
                   </div>
                   <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20 shadow-lg capitalize">
                      {evt.type}
                   </div>
                </div>
                
                {/* Context Column */}
                <div className="flex-1 p-5 flex flex-col">
                   <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors cursor-pointer mb-3 leading-snug">{evt.title}</h3>
                   
                   <div className="space-y-2 text-xs font-semibold text-slate-400 flex-1 mb-6">
                      <div className="flex items-center gap-2"><FaClock className="text-emerald-500/70" /> {evt.time}</div>
                      <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-emerald-500/70" /> {evt.location}</div>
                      <div className="flex items-center gap-2"><FaUsers className="text-emerald-500/70" /> {evt.attendees} Registered</div>
                   </div>

                   <button 
                     onClick={() => handleRSVP(evt.title)}
                     className="w-full btn-outline flex items-center justify-center gap-2 py-2.5 text-sm"
                   >
                     <FaTicketAlt /> Reserve Spot
                   </button>
                </div>
             </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
