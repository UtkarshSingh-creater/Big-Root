export default function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-6 py-3">
      
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">BigRoots</h1>
        <span className="text-gray-400 text-sm">Admin Panel</span>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="relative">
          <span className="text-xl">💬</span>
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">4</span>
        </div>

        <div className="relative">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs px-1 rounded-full">9</span>
        </div>

        <div className="bg-orange-500 px-3 py-1 rounded-full text-sm">
          ADMIN
        </div>

        <div className="bg-purple-500 w-8 h-8 flex items-center justify-center rounded-full">
          AK
        </div>

      </div>
    </div>
  );
}