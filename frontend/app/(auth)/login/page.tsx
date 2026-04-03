"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { login, signup } from "@/lib/api";
import { getToken, saveSessionFlag, saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await signup(name, email, password);
      }
      const data = await login(email, password);
      saveToken(data.access_token);
      saveSessionFlag();
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <TopNav />

      <section className="card form auth-card">
        <div className="mode-switch">
          <button
            className={`btn ${mode === "login" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`btn ${mode === "signup" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <h1 style={{ margin: 0 }}>{mode === "login" ? "Login" : "Create account"}</h1>
        <p className="muted" style={{ margin: 0 }}>
          Use your OmniScript account to access all tools securely.
        </p>

        <form onSubmit={handleSubmit} className="form" style={{ padding: 0 }}>
          {mode === "signup" ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          ) : null}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
          />

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <button
          className="btn secondary"
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </section>
    </main>
  );
}
