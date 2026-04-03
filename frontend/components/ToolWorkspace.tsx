"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, hasSessionFlag } from "@/lib/auth";
import { refreshAccessToken, runTool, type ToolType } from "@/lib/api";

type ToolWorkspaceProps = {
  tool: ToolType;
  title: string;
  subtitle: string;
};

export function ToolWorkspace({ tool, title, subtitle }: ToolWorkspaceProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [output, setOutput] = useState("Result will appear here.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrapAuth() {
      if (getToken()) {
        setReady(true);
        return;
      }

      if (hasSessionFlag()) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          setReady(true);
          return;
        }
      }

      router.replace("/login");
    }

    void bootstrapAuth();
  }, [router]);

  async function handleRun() {
    if (!text.trim()) {
      setError("Please enter text first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await runTool(tool, text);
      setOutput(data.output);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run tool";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!ready ? (
        <section className="card hero">
          <h1>{title}</h1>
          <p>Loading your secure workspace...</p>
        </section>
      ) : null}

      {ready ? (
        <>
          <section className="card hero">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </section>

          <section className="card form" style={{ marginTop: 16 }}>
            <div className="row">
              <div>
                <label htmlFor="input" className="muted">
                  Input Text
                </label>
                <textarea
                  id="input"
                  placeholder="Write or paste text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button className="btn primary" type="button" onClick={handleRun} disabled={loading}>
                    {loading ? "Processing..." : "Run"}
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => {
                      setText("");
                      setOutput("Result will appear here.");
                      setError("");
                    }}
                  >
                    Clear
                  </button>
                </div>
                {error ? <p className="error" style={{ marginTop: 10 }}>{error}</p> : null}
              </div>

              <div>
                <label className="muted">Result</label>
                <div className="card result" style={{ padding: 12, marginTop: 8 }}>
                  {output}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
