"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/header";
import { api, isAuthenticated, AuthError } from "@/lib/proxy";

interface Transaction {
  id: string;
  from_phone: string;
  to_phone: string;
  amount_stroops: number;
  tx_hash: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

function formatAmount(stroops: number): string {
  return (stroops / 10_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, { pill: string; dot: string }> = {
  completed: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  pending:   { pill: "bg-amber-50  text-amber-700  ring-amber-600/15",     dot: "bg-amber-400"  },
  failed:    { pill: "bg-red-50    text-red-700    ring-red-600/15",       dot: "bg-red-500"    },
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || { pill: "bg-gray-50 text-gray-600 ring-gray-500/15", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ─ Animated counter ─ */
function AnimatedNumber({ value }: { value: string }) {
  return (
    <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
      {value}
    </p>
  );
}

/* ─ Stat card with icon slot ─ */
function StatCard({
  label, value, icon, accent = "blue",
}: {
  label: string; value: string; icon: React.ReactNode; accent?: "blue" | "pink" | "green";
}) {
  const accents = {
    blue:  "from-primary/10 to-primary-light/10 text-primary border-primary/15",
    pink:  "from-pink/10  to-pink-light/10  text-pink  border-pink/15",
    green: "from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-200/50",
  };
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <p className="section-label">{label}</p>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accents[accent]} border flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <AnimatedNumber value={value} />
    </div>
  );
}

/* ─ Empty state with illustration ─ */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-44 h-44 mb-6 animate-float">
        <Image
          src="/illustrations/usdc-transfer.png"
          alt="No transactions yet"
          fill
          className="object-contain drop-shadow-lg"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">No transactions yet</h3>
      <p className="text-sm text-gray-400 max-w-xs text-center leading-relaxed">
        Once someone dials the USSD code and sends money, it will appear here in real time.
      </p>
    </div>
  );
}

/* ─ Africa map banner ─ */
function AfricaBanner() {
  return (
    <div className="relative glass-card rounded-2xl overflow-hidden mb-8 flex items-center gap-6 p-6 border-primary/15 animate-slide-up delay-200">
      {/* Background network image */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Image src="/illustrations/network-constellation.png" alt="" fill className="object-cover" />
      </div>

      {/* Africa map illustration */}
      <div className="relative shrink-0 w-24 h-24 animate-float-slow">
        <Image
          src="/illustrations/africa-map.png"
          alt="Africa remittance map"
          fill
          className="object-contain"
        />
      </div>

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Live Network</p>
        <h2 className="text-lg font-bold text-gray-900 mb-1">USSD Remittances Across Africa</h2>
        <p className="text-sm text-gray-500">Transactions settle on Stellar in seconds, confirmed via SMS.</p>
      </div>

      {/* Ping indicator */}
      <div className="relative ml-auto shrink-0">
        <div className="w-3 h-3 rounded-full bg-emerald-400">
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [txs, setTxs]       = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const loadTxs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions();
      setTxs(data);
    } catch (err: any) {
      if (err instanceof AuthError) { router.replace("/login"); return; }
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    loadTxs();
  }, [router, loadTxs]);

  const completed    = txs.filter((t) => t.status === "completed");
  const totalVolume  = completed.reduce((s, t) => s + t.amount_stroops, 0);
  const successRate  = txs.length > 0 ? `${((completed.length / txs.length) * 100).toFixed(0)}%` : "—";

  return (
    <>
      <Header />

      <main className="max-w-8xl mx-auto px-6 lg:px-16 xl:px-40 py-10">
        {/* ── Africa banner ── */}
        <AfricaBanner />

        {/* ── Page title row ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor all USSD-initiated USDC transfers
            </p>
          </div>
          <button
            id="refresh-btn"
            onClick={() => loadTxs(true)}
            disabled={refreshing}
            className="btn-primary disabled:opacity-60"
          >
            <RefreshIcon spinning={refreshing} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Total Transactions"
            value={String(txs.length)}
            accent="blue"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
            }
          />
          <StatCard
            label="Total Volume"
            value={`${formatAmount(totalVolume)} USDC`}
            accent="pink"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            }
          />
          <StatCard
            label="Success Rate"
            value={successRate}
            accent="green"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            }
          />
        </div>

        {/* ── Table section ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink" />
            </span>
            Recent Activity
          </h2>

          {/* Loading */}
          {loading && (
            <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-24 animate-fade-in">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-pink/30 border-t-pink animate-spin" style={{ animationDirection: "reverse" }} />
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-5 font-medium">Loading transactions…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="glass-card rounded-2xl py-14 text-center animate-fade-in">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && txs.length === 0 && <EmptyState />}

          {/* Data table */}
          {!loading && txs.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100/80">
                      {["Date", "From", "To", "Amount", "Status", "Explorer"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 ${i >= 3 ? "text-right" : "text-left"} whitespace-nowrap`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {txs.map((tx) => (
                      <tr
                        key={tx.id}
                        className="group transition-colors hover:bg-primary/3"
                      >
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                          {tx.from_phone}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                          {tx.to_phone}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                          {formatAmount(tx.amount_stroops)}{" "}
                          <span className="text-gray-400 font-normal text-xs">USDC</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {tx.tx_hash ? (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${tx.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:text-pink font-mono text-xs transition-colors group-hover:underline underline-offset-2"
                            >
                              {tx.tx_hash.slice(0, 8)}…
                              <ExternalLinkIcon />
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="px-6 py-3.5 border-t border-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">{txs.length} total record{txs.length !== 1 ? "s" : ""}</p>
                <a
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-pink flex items-center gap-1 transition-colors"
                >
                  View all on stellar.expert
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
