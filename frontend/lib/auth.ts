"use client";

const ACCESS_TOKEN_KEY = "omniscript_token";
const SESSION_COOKIE = "omni_session";

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function saveToken(token: string) {
  saveAccessToken(token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function saveSessionFlag() {
  localStorage.setItem("omniscript_session", "1");
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export function clearSessionFlag() {
  localStorage.removeItem("omniscript_session");
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasSessionFlag() {
  return localStorage.getItem("omniscript_session") === "1";
}

export function clearToken() {
  clearAccessToken();
  clearSessionFlag();
}

export function getToken() {
  return getAccessToken();
}
