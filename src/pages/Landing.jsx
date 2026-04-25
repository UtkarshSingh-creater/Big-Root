import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ThreeScene from "../components/ThreeScene";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen relative overflow-hidden flex items-center justify-center">

      {/* 3D background */}
      <ThreeScene />

      {/* glow */}
      <div className="bg-glow-purple top-[-100px] left-[-100px]" />
      <div className="bg-glow-blue bottom-[-100px] right-[-100px]" />

      <div className="text-center relative z-10 max-w-3xl">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold gradient-text"
        >
          Next Gen Alumni Network
        </motion.h1>

        <p className="text-gray-400 mt-4">
          Connect students, alumni & faculty with AI-powered networking
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/college")}
          className="btn mt-8"
        >
          Get Started 🚀
        </motion.button>

        {/* floating cards */}
        <div className="flex gap-6 justify-center mt-16">

          {/* <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="glass p-4"
          >
            📊 Analytics
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="glass p-4"
          >
            🤖 AI Matching
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="glass p-4"
          >
            💬 Networking
          </motion.div> */}

        </div>

      </div>
    </div>
  );
}