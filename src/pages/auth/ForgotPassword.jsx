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
    <div className="h-screen flex items-center justify-center relative">

      <BackButton />

      <div className="glass p-8 w-96">

        <h2 className="text-xl mb-6 gradient-text">
          Forgot Password
        </h2>

        <input
          placeholder="Email / College ID"
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded"
        />

        <button onClick={handleSubmit} className="btn w-full">
          Send Reset Link
        </button>

      </div>
    </div>
  );
}