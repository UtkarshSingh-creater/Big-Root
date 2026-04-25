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
    <div className="h-screen flex items-center justify-center">

      <div className="glass p-8 w-96">

        <h2 className="text-xl mb-6 gradient-text">
          Reset Password
        </h2>

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black/40 border border-white/10 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 bg-black/40 border border-white/10 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button onClick={handleReset} className="btn w-full">
          Update Password
        </button>

      </div>
    </div>
  );
}