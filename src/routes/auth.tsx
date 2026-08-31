import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, Waves, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type Mode = "signin" | "signup" | "magic";

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  const signInEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created — check your inbox to confirm if required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      void navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      });
      if (error) throw error;
      setMagicSent(true);
      toast.success("Magic link sent — check your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send magic link");
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        toast.success("Signed in with Google");
        void navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="glass-strong glass-sheen glass-noise rounded-3xl p-8"
      >
        <div className="text-center">
          <span className="bg-brand mx-auto grid size-12 place-items-center rounded-2xl text-white">
            <Waves className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">
            {mode === "signup" ? "Create your free account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlock unlimited tasks, saved workflows, and your full history on ariX.tools.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void signInGoogle()}
          className="glass liquid-hover mt-6 flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-4 flex gap-1 rounded-2xl bg-secondary/40 p-1">
          {(
            [
              ["signin", "Sign in"],
              ["signup", "Sign up"],
              ["magic", "Magic link"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                setMagicSent(false);
              }}
              className={
                mode === id
                  ? "bg-brand flex-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                  : "flex-1 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "magic" ? (
          magicSent ? (
            <div className="rounded-2xl bg-secondary/40 p-4 text-center text-sm">
              <Mail className="text-brand mx-auto size-6" />
              <p className="mt-2 font-medium">Check your inbox</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void sendMagicLink(e)} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="glass w-full rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={busy}
                className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Send magic link
              </button>
            </form>
          )
        ) : (
          <form onSubmit={(e) => void signInEmail(e)} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="glass w-full rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="glass w-full rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to process files securely.{" "}
          <Link to="/" className="text-brand font-medium">
            Back to tools
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
