import { useState, type ReactNode } from "react";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";

const CORRECT_PASSWORD = "ventus2026";
const SESSION_KEY = "demo_password_access";

interface Props {
  children: ReactNode;
  bullets?: string[];
}

export default function SimplePasswordGate({ children, bullets }: Props) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
        <img src={ventusLogo} alt="Ventus AI" className="h-16 md:h-20 w-auto" />

        {bullets && bullets.length === 3 && (
          <div className="grid grid-cols-3 items-center gap-x-8 whitespace-nowrap">
            <div className="flex items-center gap-3 justify-end">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[18px] md:text-[20px] font-semibold text-slate-700 tracking-tight">{bullets[0]}</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[18px] md:text-[20px] font-semibold text-slate-700 tracking-tight">{bullets[1]}</span>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[18px] md:text-[20px] font-semibold text-slate-700 tracking-tight">{bullets[2]}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-72">
          <input
            type="password"
            autoFocus
            placeholder="Enter password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
          {error && <p className="text-xs text-red-500 -mt-2">Incorrect password</p>}
          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Enter Demo
          </button>
        </form>
      </div>
    </div>
  );
}
