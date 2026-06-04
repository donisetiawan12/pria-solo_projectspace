export default function AuthModal({ onClose, authMode, setAuthMode }) {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-sm p-6 text-[#c9d1d9]">
        <button onClick={onClose} className="float-right text-slate-400">✕</button>
        <h2 className="text-lg font-bold text-white mb-4">ProjectSpace Hub</h2>
        <div className="flex gap-2 mb-4 border-b border-[#30363d] pb-2 text-xs">
          <button onClick={() => setAuthMode("login")} className={authMode === "login" ? "text-white font-bold" : "text-gray-500"}>Sign In</button>
          <button onClick={() => setAuthMode("register")} className={authMode === "register" ? "text-white font-bold" : "text-gray-500"}>Register</button>
        </div>
        <p className="text-xs">Form input akan segera aktif!</p>
      </div>
    </div>
  );
}