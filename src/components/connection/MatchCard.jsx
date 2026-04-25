import { sendConnection } from "../../api/connection";

export default function MatchCard({ user }) {
  return (
    <div className="bg-white/10 p-4 rounded-xl mb-3">

      <div className="flex items-center gap-3">
        <img
          src={user.profilePhoto}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p>{user.name}</p>
          <p className="text-xs text-gray-400">{user.branch}</p>
        </div>
      </div>

      <button
        onClick={() => sendConnection(user._id)}
        className="mt-2 bg-purple-500 px-3 py-1 rounded"
      >
        Connect
      </button>

    </div>
  );
}