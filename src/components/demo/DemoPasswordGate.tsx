import { useState, type ReactNode } from "react";

export default function DemoPasswordGate({ children }: { children: ReactNode }) {
  const [granted, setGranted] = useState(() => sessionStorage.getItem("demo_access") === "true");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (granted) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === "2026demo") {
      sessionStorage.setItem("demo_access", "true");
      setGranted(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50" style={{ fontFamily: "Manrope, sans-serif" }}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900 text-center">Enter Demo Password</h2>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-sm text-red-500 -mt-2">Incorrect password</p>}
        <button type="submit" className="h-10 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Enter
        </button>
      </form>
    </div>
  );
}
