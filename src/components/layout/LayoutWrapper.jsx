export default function LayoutWrapper({ children }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white relative">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full top-0 left-0" />
      {children}
    </div>
  );
}