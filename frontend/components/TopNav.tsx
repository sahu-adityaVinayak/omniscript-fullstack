"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { getMyProfile, logout } from "@/lib/api";

const dropdownLinks = [
  { href: "/detector", label: "AI Detector" },
  { href: "/paraphraser", label: "Paraphraser" },
  { href: "/humanizer", label: "Humanizer" },
  { href: "/profile", label: "Profile" },
  { href: "/security", label: "Security" }
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("My Account");
  const [email, setEmail] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncToken = () => {
      setToken(getToken());
    };

    syncToken();
    window.addEventListener("storage", syncToken);
    window.addEventListener("focus", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("focus", syncToken);
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setDisplayName("My Account");
        setEmail("");
        return;
      }

      try {
        const profile = await getMyProfile();
        setDisplayName(profile.name || "My Account");
        setEmail(profile.email || "");
      } catch {
        setDisplayName("My Account");
        setEmail("");
      }
    }

    void loadProfile();
  }, [token]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="topbar card">
      <Link href="/dashboard" className="brand">
        <span className="brand-dot" />
        OmniScript
      </Link>

      <p className="muted" style={{ margin: 0 }}>AI writing workspace</p>

      {token ? (
        <div className="profile-menu" ref={menuRef}>
          <button className="btn secondary profile-trigger" type="button" onClick={() => setIsOpen(!isOpen)}>
            <span className="profile-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <span className="profile-meta">
              <strong>{displayName}</strong>
              <small>{email || "Signed in"}</small>
            </span>
          </button>

          {isOpen ? (
            <>
              <button className="drawer-overlay" type="button" onClick={() => setIsOpen(false)} aria-label="Close menu" />
              <aside className="profile-drawer card">
                <div className="drawer-head">
                  <span className="profile-avatar">{displayName.charAt(0).toUpperCase()}</span>
                  <div className="profile-meta">
                    <strong>{displayName}</strong>
                    <small>{email || "Signed in"}</small>
                  </div>
                </div>

                <nav className="drawer-nav" aria-label="Profile Menu">
                  {dropdownLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`dropdown-link ${pathname === link.href ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <button
                  className="dropdown-link danger"
                  type="button"
                  onClick={async () => {
                    await logout();
                    setToken(null);
                    setIsOpen(false);
                    router.push("/login");
                  }}
                >
                  Logout
                </button>
              </aside>
            </>
          ) : null}
        </div>
      ) : (
        <Link className="btn secondary" href="/login">
          Login
        </Link>
      )}
    </div>
  );
}
