const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexus_token");
}

export function setToken(token: string): void {
  localStorage.setItem("nexus_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("nexus_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    throw new AuthError();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>("POST", "/admin/login", { username, password }),
  getTransactions: () => request<any[]>("GET", "/admin/transactions"),
  getWallets: (phone?: string) =>
    request<any[]>("GET", `/admin/wallets${phone ? `?phone=${phone}` : ""}`),
};
