export default function LogConsole({ logs }) {
  return (
    <div className="fixed bottom-0 w-full bg-slate-950 p-2 font-mono text-[10px] text-emerald-400 border-t border-slate-800">
      {logs.map((log, i) => <div key={i}>{log.text}</div>)}
    </div>
  );
}