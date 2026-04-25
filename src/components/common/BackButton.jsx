import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-6 left-6 glass px-4 py-2 hover:scale-105 transition"
    >
      ← Back
    </button>
  );
}