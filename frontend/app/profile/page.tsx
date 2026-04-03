"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { getToken } from "@/lib/auth";
import { getMyProfile, updateMyProfile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getMyProfile();
        setName(profile.name);
        setEmail(profile.email);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load profile";
        setError(msg);
      }
    }

    void loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const profile = await updateMyProfile(name, email);
      setName(profile.name);
      setEmail(profile.email);
      setMessage("Profile updated successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <TopNav />

      <section className="card hero">
        <h1>Your Profile</h1>
        <p>Update your account name and email from here.</p>
      </section>

      <section className="card form" style={{ marginTop: 16, maxWidth: 720 }}>
        <form className="form" style={{ padding: 0 }} onSubmit={handleSubmit}>
          <label htmlFor="profile-name" className="muted">Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />

          <label htmlFor="profile-email" className="muted">Email</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>

          {message ? <p style={{ color: "#047857", margin: 0 }}>{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
