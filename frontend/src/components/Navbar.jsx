export default function Navbar({ setActiveTab, setShowAuthModal }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
        <div className="font-black text-lg cursor-pointer" onClick={() => setActiveTab("feed")}>
          Project<span className="text-linkedin-blue">Space</span>
        </div>
        <button onClick={() => setShowAuthModal(true)} className="bg-linkedin-blue text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-[#004182]">
          Masuk
        </button>
      </div>
    </nav>
  );
}