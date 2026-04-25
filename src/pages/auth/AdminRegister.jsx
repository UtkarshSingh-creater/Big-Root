import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";

export default function AdminRegister() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const collegeName = localStorage.getItem("college");

  // 🔥 STEP 1: SEND OTP
  const handleSendOTP = async () => {
    try {
      await api.post("/auth/send-otp", { email, collegeName });
      toast.success("OTP sent to email");
      setStep(2); // 👉 move to step 2
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error sending OTP");
    }
  };

  // 🔥 STEP 2: VERIFY + REGISTER
  const handleVerify = async () => {
    try {
      await api.post("/auth/verify-otp-register", {
        email,
        otp,
        name,
        password,
        collegeName,
      });

      toast.success("Admin registered successfully 🎉");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid OTP");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center relative">

      <BackButton />

      <div className="glass p-8 w-96">

        <h2 className="text-xl mb-6 gradient-text">
          Admin Registration
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded"
            />

            <button onClick={handleSendOTP} className="btn w-full">
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-3 bg-black/40 border border-white/10 rounded"
            />

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-3 bg-black/40 border border-white/10 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded"
            />

            <button onClick={handleVerify} className="btn w-full">
              Verify & Register
            </button>

            {/* optional resend */}
            <p
              onClick={handleSendOTP}
              className="text-sm text-gray-400 mt-3 cursor-pointer hover:text-purple-400"
            >
              Resend OTP
            </p>
          </>
        )}

      </div>
    </div>
  );
}