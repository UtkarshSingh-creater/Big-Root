// src/components/ResumeUpload.jsx

import { useState } from "react";
import { parseResume } from "../../utils/resumeParser";

export default function ResumeUpload() {
  const [skills, setSkills] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const res = await parseResume(file);
    setSkills(res.skills || []);
  };

  return (
    <div className="card space-y-3">
      <input type="file" onChange={handleFile} />

      <div className="flex gap-2 flex-wrap">
        {skills.map((s, i) => (
          <span key={i} className="px-3 py-1 bg-purple-500/20 rounded-lg">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}