"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/admin/Sidebar";

const API = (path: string) => `/api${path}`;
const fetchOpts = { credentials: "include" as RequestCredentials };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch(API("/admin/me"), fetchOpts)
      .then((r) => (r.ok ? r.json() : { authed: false }))
      .then((d) => {
        setAuthed(!!d.authed);
        setCurrentUser(d.username || "");
      })
      .catch(() => setAuthed(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(API("/admin/login"), {
      method: "POST",
      ...fetchOpts,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAuthed(true);
      setCurrentUser(data.username || "admin");
      setUsername("");
      setPassword("");
    } else {
      setLoginError(data.error || "Identifiants incorrects");
    }
  };

  const handleLogout = async () => {
    await fetch(API("/admin/logout"), { method: "POST", ...fetchOpts });
    setAuthed(false);
    setCurrentUser("");
    router.push("/admin");
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 text-slate-900">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Image src="/logo.png" alt="חמ״ל" width={64} height={64} className="w-16 h-16 object-contain mx-auto mb-4" priority />
              <h1 className="text-2xl font-bold text-slate-900">LiveScore Admin</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to manage your site</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-slate-50"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-slate-50"
                  required
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
              >
                Sign In
              </button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-6">
              <Link href="/" className="hover:text-red-600 transition-colors">
                &larr; Back to site
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
      <div className="ml-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
