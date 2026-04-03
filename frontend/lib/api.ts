import { clearAccessToken, getAccessToken, saveAccessToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type ToolType = "detector" | "paraphraser" | "humanizer";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
};

type RequestOptions = {
  skipRefresh?: boolean;
};

export async function request<T>(path: string, init?: RequestInit, options?: RequestOptions): Promise<T> {
  const token = typeof window !== "undefined" ? getAccessToken() : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    }
  });

  if (response.status === 401 && !options?.skipRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, init, { skipRefresh: true });
    }
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const err = await response.json();
      message = err.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; token_type: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  }, { skipRefresh: true });
}

export async function signup(name: string, email: string, password: string) {
  return request<{ id: number; email: string; name: string }>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  }, { skipRefresh: true });
}

export async function runTool(tool: ToolType, text: string) {
  const pathMap: Record<ToolType, string> = {
    detector: "/api/v1/tools/detect",
    paraphraser: "/api/v1/tools/paraphrase",
    humanizer: "/api/v1/tools/humanize"
  };

  return request<{ output: string }>(pathMap[tool], {
    method: "POST",
    body: JSON.stringify({ text })
  });
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const data = await request<{ access_token: string; token_type: string }>(
      "/api/v1/auth/refresh",
      { method: "POST" },
      { skipRefresh: true }
    );
    saveAccessToken(data.access_token);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/api/v1/auth/logout", { method: "POST" }, { skipRefresh: true });
  } finally {
    clearAccessToken();
  }
}

export async function getMyProfile() {
  return request<UserProfile>("/api/v1/users/me", { method: "GET" });
}

export async function updateMyProfile(name: string, email: string) {
  return request<UserProfile>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify({ name, email })
  });
}

export async function requestPasswordOtp(email: string) {
  return request<{ message: string; dev_otp_code?: string }>("/api/v1/users/password/request-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function verifyPasswordOtp(email: string, otpCode: string, newPassword: string) {
  return request<{ message: string }>("/api/v1/users/password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword })
  });
}
