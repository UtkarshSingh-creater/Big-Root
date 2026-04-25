import Suggestions from "../../features/suggestions/Suggestions";

export default function RightPanel() {
  return (
    <div className="space-y-4">

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="mb-3 font-semibold">Quick Actions</h3>

        <button className="w-full mb-2 bg-purple-500 p-2 rounded">
          + Add Event
        </button>

        <button className="w-full mb-2 bg-purple-500 p-2 rounded">
          + Add Company
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3>Notifications</h3>
        <p className="text-gray-400 text-sm mt-2">
          No new notifications
        </p>
      </div>

      {/* AI Suggestions */}
      <Suggestions />

    </div>
  );
}