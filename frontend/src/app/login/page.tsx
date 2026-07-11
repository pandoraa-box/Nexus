"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setToken } from "@/lib/proxy";
import { loginAdmin } from "../actions";

function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function NetworkOrbit() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 6" />
      {/* Middle ring */}
      <circle cx="100" cy="100" r="55" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 5" />
      {/* Inner ring */}
      <circle cx="100" cy="100" r="30" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {/* Center node */}
      <circle cx="100" cy="100" r="8" fill="white" opacity="0.9" />
      <circle cx="100" cy="100" r="14" fill="rgba(255,255,255,0.15)" />
      {/* Orbiting nodes */}
      <circle cx="100" cy="20" r="5" fill="#EC1886" opacity="0.9" />
      <circle cx="170" cy="130" r="4" fill="rgba(255,255,255,0.7)" />
      <circle cx="30"  cy="130" r="4" fill="rgba(255,255,255,0.7)" />
      <circle cx="155" cy="45"  r="3" fill="#4FB4E3" opacity="0.8" />
      <circle cx="45"  cy="45"  r="3" fill="#4FB4E3" opacity="0.8" />
      {/* Connection lines */}
      <line x1="100" y1="20"  x2="100" y2="92" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="170" y1="130" x2="113" y2="107" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="30"  y1="130" x2="87"  y2="107" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const token = await loginAdmin(formData);
      setToken(token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-[#004f7c] via-primary to-primary-light">
        {/* Background image */}
        <Image
          src="/illustrations/network-constellation.png"
          alt="Stellar network"
          fill
          className="object-cover opacity-30 mix-blend-luminosity"
        />

        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-pink/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* Orbit SVG */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-64 animate-spin-slow opacity-60">
          <NetworkOrbit />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center ring-1 ring-white/30">
              <ShieldIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Nexus</span>
          </div>

          {/* Main copy */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-1 bg-pink rounded-full" />
              <span className="text-pink-light text-xs font-semibold uppercase tracking-widest">Operations Dashboard</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              USSD-to-Stellar<br />
              <span className="text-primary-light">Remittances</span>
            </h1>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm">
              Monitor real-time transactions, manage custodial wallets,
              and oversee the Nexus USDC network — all from one place.
            </p>

            {/* Stats strip */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Network",  value: "Stellar" },
                { label: "Currency", value: "USDC"    },
                { label: "Daily Max",value: "1K USDC" },
              ].map((s) => (
                <div key={s.label} className="glass-card-dark rounded-xl p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-white text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center gap-2 animate-slide-up delay-300">
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <StarIcon />
                </div>
              ))}
            </div>
            <span className="text-white/50 text-xs">MVP on Stellar Testnet · Drips / Grantfox</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Decorative phone illustration — top right corner */}
        <div className="hidden xl:block absolute top-8 right-8 w-28 opacity-25 animate-float pointer-events-none">
          <Image
            src="/illustrations/usdc-transfer.png"
            alt=""
            width={112}
            height={140}
            className="object-contain"
          />
        </div>

        <div className="w-full max-w-sm animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Nexus</h1>
            </div>
            <p className="text-gray-400 text-sm">Operations Dashboard</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to Nexus</h2>
            <p className="text-sm text-gray-400 mb-7">Admin access required.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="input-field"
                  placeholder="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className="btn-pink w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    <ShieldIcon className="w-4 h-4" />
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Nexus · USSD-to-Stellar MVP · Stellar Testnet
          </p>
        </div>
      </div>
    </div>
  );
}
