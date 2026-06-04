export default function SidebarLeft({ user, setActiveTab, skillsList = [], endorseSkill }) {
  return (
    <div className="lg:col-span-3 space-y-4">
      {/* ... bagian atas ... */}
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
        <h4 className="text-xs font-bold text-slate-700 mb-2">SKILL TERATAS</h4>
        {/* Tanda ?.map() mencegah error jika skillsList kosong */}
        {skillsList?.map((skill, i) => (
          <div key={i} className="flex justify-between items-center text-xs text-slate-600 mb-1">
            <span>{skill.name}</span>
            <button 
              onClick={() => endorseSkill(skill.name)} 
              className="bg-slate-100 px-2 rounded-full font-bold hover:bg-slate-200"
            >
              +{skill.endorsements}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}