"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/header";
import { api, isAuthenticated, AuthError } from "@/lib/proxy";

interface WalletUser {
  id: string;
  phone: string;
  public_key: string;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy public key"
      className="shrink-0 text-gray-300 hover:text-primary transition-colors"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function WalletCard({ user, index }: { user: WalletUser; index: number }) {
  return (
    <div
      className="stat-card animate-slide-up group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-pink/20 border border-primary/15 flex items-center justify-center text-primary font-bold text-sm">
            {user.phone.slice(-2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user.phone}</p>
            <p className="text-[11px] text-gray-400">{formatDate(user.created_at)}</p>
          </div>
        </div>
        {/* Live dot */}
        <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
      </div>

      {/* Public key */}
      <div className="bg-gray-50/70 rounded-xl px-3.5 py-3 border border-gray-100/60 group-hover:border-primary/15 transition-colors">
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label">Stellar Public Key</p>
          <CopyButton text={user.public_key} />
        </div>
        <code className="text-[11px] text-gray-600 break-all font-mono leading-relaxed">
          {user.public_key}
        </code>
      </div>

      {/* Stellar explorer link */}
      <a
        href={`https://stellar.expert/explorer/testnet/account/${user.public_key}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-1 text-[11px] text-primary hover:text-pink transition-colors font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        View on stellar.expert
      </a>
    </div>
  );
}

function EmptyWallets({ searched }: { searched: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-40 h-40 mb-6 animate-float">
        <Image
          src="/illustrations/ussd-phone-hero.png"
          alt="No wallets"
          fill
          className="object-contain drop-shadow-xl"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">
        {searched ? "No wallets matched" : "No wallets yet"}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs text-center leading-relaxed">
        {searched
          ? "Try a different phone number or clear the search."
          : "Wallets are created when users register via USSD. They'll appear here instantly."}
      </p>
    </div>
  );
}

export default function WalletsPage() {
  const router = useRouter();
  const [users, setUsers]       = useState<WalletUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const fetchWallets = useCallback(
    async (phone?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getWallets(phone);
        setUsers(data);
      } catch (err: any) {
        if (err instanceof AuthError) { router.replace("/login"); return; }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    fetchWallets();
  }, [router, fetchWallets]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveSearch(searchPhone);
    fetchWallets(searchPhone || undefined);
  }

  function handleClear() {
    setSearchPhone("");
    setActiveSearch("");
    fetchWallets();
  }

  return (
    <>
      <Header />

      <main className="max-w-8xl mx-auto px-6 lg:px-16 xl:px-40 py-10">
        {/* ── Page header with illustration ── */}
        <div className="relative glass-card rounded-2xl p-6 mb-8 overflow-hidden border-primary/15 animate-slide-up">
          {/* BG network texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <Image src="/illustrations/network-constellation.png" alt="" fill className="object-cover" />
          </div>

          <div className="relative flex items-center gap-5">
            {/* Floating USDC illustration */}
            <div className="hidden sm:block relative w-20 h-20 shrink-0 animate-float">
              <Image
                src="/illustrations/usdc-transfer.png"
                alt="Wallets"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Custodial Wallets</p>
              <h1 className="page-title mb-1">Wallets</h1>
              <p className="text-sm text-gray-500">
                Every registered phone number maps to an AES-256-GCM encrypted Stellar keypair.
              </p>
            </div>

            {users.length > 0 && (
              <div className="hidden lg:block glass-card-dark rounded-xl px-4 py-3 shrink-0">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Registered</p>
                <p className="text-white text-xl font-bold">{users.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-lg animate-slide-up delay-100">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              id="wallet-search"
              type="text"
              placeholder="Search by phone (2348012345678)"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" id="wallet-search-btn" className="btn-primary">
            Search
          </button>
          {activeSearch && (
            <button type="button" onClick={handleClear} className="btn-ghost">
              Clear
            </button>
          )}
        </form>

        {/* ── Results ── */}
        {loading && (
          <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-pink/30 border-t-pink animate-spin" style={{ animationDirection: "reverse" }} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-5 font-medium">Loading wallets…</p>
          </div>
        )}

        {error && !loading && (
          <div className="glass-card rounded-2xl py-14 text-center animate-fade-in">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <EmptyWallets searched={!!activeSearch} />
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u, i) => (
              <WalletCard key={u.id} user={u} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
