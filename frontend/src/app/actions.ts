"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const result = await request<{ token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  return result.token;
}

export async function fetchTransactions(token: string) {
  return request<any[]>("/admin/transactions", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchWallets(token: string, phone?: string) {
  const qs = phone ? `?phone=${phone}` : "";
  return request<any[]>(`/admin/wallets${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
