export default function ProjectModal({ project, onClose, onStar }) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-slate-900">{project.title}</h2>
        <p className="text-xs text-slate-600 mt-2">{project.description}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onStar} className="bg-amber-500 text-white px-3 py-1 rounded text-xs">Star</button>
          <button onClick={onClose} className="bg-slate-200 px-3 py-1 rounded text-xs">Tutup</button>
        </div>
      </div>
    </div>
  );
}