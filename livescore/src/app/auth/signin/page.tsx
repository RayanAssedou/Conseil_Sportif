"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useTranslation } from "@/contexts/LanguageContext";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError(t("auth.passwordsNoMatch"));
          setLoading(false);
          return;
        }
        const { data, error } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo: undefined,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
        } else {
          await supabaseBrowser.auth.signInWithPassword({ email, password });
          router.push("/");
        }
      } else {
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="חמ״ל" width={40} height={40} className="w-10 h-10 object-contain" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">חמ״ל</span>
              <span className="text-2xl font-bold text-text">ספורט</span>
            </div>
          </Link>
          <p className="text-sm text-text-muted mt-2">
            {mode === "signin" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">{t("auth.fullName")}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.fullNamePlaceholder")}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-1">{t("auth.email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">{t("auth.phone")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("auth.phonePlaceholder")}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-1">{t("auth.password")}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                minLength={6}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">{t("auth.confirmPassword")}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  minLength={6}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? t("auth.pleaseWait") : mode === "signin" ? t("auth.signInBtn") : t("auth.createAccountBtn")}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="text-primary font-medium hover:underline"
          >
            {mode === "signin" ? t("auth.signUpLink") : t("auth.signInLink")}
          </button>
        </p>
      </div>
    </div>
  );
}
