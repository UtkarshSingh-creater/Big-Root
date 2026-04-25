import { useEffect, useState } from "react";
import API from "../../api/index";
import MatchCard from "../../components/connection/MatchCard";

export default function Suggestions() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/user/all")
      .then((res) => setUsers(res.data.users || []))
      .catch(console.error);
  }, []);

  return (
    <div className="mt-4">
      <h3 className="mb-3">Suggestions</h3>

      {users.map((u) => (
        <MatchCard key={u._id} user={u} />
      ))}
    </div>
  );
}