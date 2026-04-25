import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import API from "../../api";


export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const role = localStorage.getItem("role") || "student";
  const collegeName = localStorage.getItem("college") || "";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return setError("Please fill in all fields.");
    setError("");
    setLoading(true);

    try {
      let res;
      const apiRole = role === "alumni" ? "student" : role;

      if (apiRole === "admin") {
        res = await API.post("/auth/admin-login", {
          email: identifier,
          password,
          collegeName
        });
      } else {
        res = await API.post("/auth/login", {
           identifier,
           password,
           role: apiRole,
           collegeName
        });
      }

      login({
        token: res.data.token,
        user: res.data.user,
        uiRole: role
      });

      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8 text-3xl font-extrabold flex items-center gap-2 brand-text">
        BigRoot
      </div>

      <div className="card w-full max-w-[380px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

        <button className="text-slate-400 hover:text-blue-600 mb-6 text-sm font-semibold flex items-center gap-1 transition-all" onClick={() => navigate("/role")}>
          ← Back
        </button>
        <h1 className="text-[32px] leading-10 font-extrabold mb-1 text-slate-800">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6 tracking-wide capitalize">{role} Login</p>

        {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <input
              type="text"
              placeholder={role === "student" || role === "alumni" ? "College ID" : "Email"}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div
            className="text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-700 hover:underline mb-2 transition-colors"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-[16px] shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]">
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>
{/* 
        <div className="flex items-center gap-3 mt-8 mb-6"> */}
          {/* <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">or</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div> */}

        {/* <button className="btn-secondary w-full py-3">
          Request Registration
        </button> */}
      </div>
    </div>
  );
}
