import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import toast from "react-hot-toast";
import BackButton from "../../components/common/BackButton";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const collegeName = localStorage.getItem("college");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/auth/forgot-password", {
        identifier,
        role: role === "alumni" ? "student" : role,
        collegeName,
      });

      toast.success("Redirecting to secure reset page...");
      
      // Navigate seamlessly within the app using the generated token route
      if (res.data.resetUrl) {
         const pathParams = new URL(res.data.resetUrl).pathname;
         navigate(pathParams);
      } else {
         toast.success("Reset link sent");
      }
      
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      <BackButton />

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-white p-10 w-full max-w-[400px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl relative z-10 border border-slate-100">
        
        <div className="text-center mb-8">
           <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-blue-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
             </svg>
           </div>
           <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
             Forgot Password
           </h2>
           <p className="text-sm text-slate-500 mt-2 font-medium">Enter your details to receive a secure reset link.</p>
        </div>

        <div className="space-y-5">
           <div className="relative">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Identifier</label>
             <input
               placeholder="Email / College ID"
               onChange={(e) => setIdentifier(e.target.value)}
               className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-300"
             />
           </div>

           <button onClick={handleSubmit} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
             Reset Password
           </button>
        </div>

      </div>
    </div>
  );
}