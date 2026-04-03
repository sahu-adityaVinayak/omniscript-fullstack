"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { getToken } from "@/lib/auth";
import { getMyProfile, requestPasswordOtp, verifyPasswordOtp } from "@/lib/api";

export default function SecurityPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getMyProfile();
        setEmail(profile.email);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load profile";
        setError(msg);
      }
    }

    void loadProfile();
  }, [router]);

  async function handleRequestOtp() {
    setError("");
    setMessage("");
    setDevOtp("");
    setRequestingOtp(true);

    try {
      const data = await requestPasswordOtp(email);
      setMessage(data.message);
      if (data.dev_otp_code) {
        setDevOtp(data.dev_otp_code);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to request OTP";
      setError(msg);
    } finally {
      setRequestingOtp(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingPassword(true);

    try {
      const data = await verifyPasswordOtp(email, otpCode, newPassword);
      setMessage(data.message);
      setOtpCode("");
      setNewPassword("");
      setDevOtp("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setError(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <main className="shell">
      <TopNav />

      <section className="card hero">
        <h1>Password Security</h1>
        <p>Request an OTP code, verify it, and set a new password securely.</p>
      </section>

      <section className="card form" style={{ marginTop: 16, maxWidth: 760 }}>
        <label htmlFor="security-email" className="muted">Account Email</label>
        <input id="security-email" type="email" value={email} readOnly />

        <button className="btn secondary" type="button" disabled={requestingOtp} onClick={handleRequestOtp}>
          {requestingOtp ? "Sending OTP..." : "Send Verification OTP"}
        </button>

        {devOtp ? (
          <p className="muted" style={{ margin: 0 }}>
            Development OTP (SMTP not configured): <strong>{devOtp}</strong>
          </p>
        ) : null}

        <form className="form" style={{ padding: 0 }} onSubmit={handleResetPassword}>
          <label htmlFor="otp-code" className="muted">OTP Code</label>
          <input
            id="otp-code"
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Enter verification code"
            required
          />

          <label htmlFor="new-password" className="muted">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            placeholder="Enter new password"
          />

          <button className="btn primary" type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>

        {message ? <p style={{ color: "#047857", margin: 0 }}>{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
