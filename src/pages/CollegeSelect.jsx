import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";

const colleges = [
  "Ajay Kumar Garg Engineering College",
  "KIET Group of Institutions",
  "IMS Engineering College",
  "ABES Engineering College",
  "ABES Institute of Technology",
  "SRM Institute of Science and Technology (Delhi-NCR Campus)",
  "NITRA Technical Campus",
  "HRIT Group of Institutions",
  "Amity University Noida",
  "Jaypee Institute of Information Technology",
  "JSS Academy of Technical Education",
  "Maharishi University of Information Technology",
  "Symbiosis International University (Noida Campus)",
  "Galgotias University",
  "Galgotias College of Engineering and Technology",
  "GL Bajaj Institute of Technology and Management",
  "Noida Institute of Engineering and Technology",
  "Sharda University",
  "Greater Noida Institute of Technology",
  "Dronacharya College of Engineering",
  "ITS Engineering College",
  "Gautam Buddha University",
  "Delhi Technological University",
  "Netaji Subhas University of Technology",
  "Indira Gandhi Delhi Technical University for Women",
  "Jamia Millia Islamia",
  "University of Delhi",
  "Guru Gobind Singh Indraprastha University",
  "Indian Institute of Technology Delhi"
];

export default function CollegeSelect() {
  const [college, setCollege] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!college) return alert("Please select a college to continue");
    localStorage.setItem("college", college);
    navigate("/role");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="absolute top-8 left-8 text-3xl font-extrabold flex items-center gap-2 brand-text">
        BigRoot
      </div>

      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-muted">Select your college to join your exclusive network</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaGraduationCap className="text-emerald-500" />
            </div>
            <select
              onChange={(e) => setCollege(e.target.value)}
              className="input-field w-full pl-12"
              defaultValue=""
            >
              <option value="" disabled className="text-black">Choose your college</option>
              {colleges.map((c, i) => (
                <option key={i} value={c} className="text-black">{c}</option>
              ))}
            </select>
          </div>

          <button onClick={handleNext} className="btn-primary w-full shadow-lg shadow-emerald-500/20">
            Continue All Network Access
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>By clicking Continue, you agree to the BigRoot User Agreement and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}