export default function FeedMiddle({ projects, setActiveTab, setSelectedProject }) {
  return (
    <div className="col-span-12 lg:col-span-6 space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <button onClick={() => setActiveTab("upload")} className="bg-slate-100 w-full text-left px-4 py-2 rounded-full text-xs text-slate-500 hover:bg-slate-200">
          Bagikan repository project Anda...
        </button>
      </div>
      {projects.map(proj => (
        <div key={proj.id} className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-sm" onClick={() => setSelectedProject(proj)}>
          <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
          <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
        </div>
      ))}
    </div>
  );
}