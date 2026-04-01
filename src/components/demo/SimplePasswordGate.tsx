import { useState, type ReactNode } from "react";
import ventusLogo from "@/assets/ventus-logo-blue.png";

const CORRECT_PASSWORD = "ventus2026";
const SESSION_KEY = "demo_password_access";

export default function SimplePasswordGate({ children }: { children: ReactNode }) {
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
    <div className="h-screen w-screen flex items-center justify-center bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-72">
        <img src={ventusLogo} alt="Ventus" className="h-7 mb-2" />
        <input
          type="password"
          autoFocus
          placeholder="Enter password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
        {error && <p className="text-xs text-red-500 -mt-4">Incorrect password</p>}
        <button
          type="submit"
          className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Enter Demo
        </button>
      </form>
    </div>
  );
}
