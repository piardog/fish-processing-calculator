"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/");
      } else {
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  const signUp = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created. Please check your email to confirm it.");
    }

    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          Checking login...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">
          Fish Processing Calculator
        </h1>

        <p className="text-slate-600 mb-6">
          Log in to access the calculator.
        </p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded bg-slate-900 px-4 py-3 text-white text-sm hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Login"}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-3 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
          >
            Create Account
          </button>

          {message && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
