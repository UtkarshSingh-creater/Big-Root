import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../../api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      if (password !== confirm) {
         return toast.error("Passwords do not match");
      }
      await API.post(`/auth/reset-password/${token}`, {
        newPassword: password,
        confirmPassword: confirm,
      });

      toast.success("Password updated");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-white p-10 w-full max-w-[400px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl relative z-10 border border-slate-100">
        
        <div className="text-center mb-8">
           <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-blue-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
           </div>
           <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
             Secure Reset
           </h2>
           <p className="text-sm text-slate-500 mt-2 font-medium">Create a strong new password</p>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all pr-12 font-medium placeholder-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="relative">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
             <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all pr-12 font-medium placeholder-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button onClick={handleReset} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
            Update Password
          </button>
        </div>

      </div>
    </div>
  );
}