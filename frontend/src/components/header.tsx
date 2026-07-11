"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken } from "@/lib/proxy";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Transactions", id: "nav-transactions" },
  { href: "/wallets",   label: "Wallets",       id: "nav-wallets"      },
];

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function NexusLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="10" cy="10" r="3" fill="white" opacity="0.9" />
          <circle cx="4"  cy="4"  r="1.5" fill="white" opacity="0.6" />
          <circle cx="16" cy="4"  r="1.5" fill="white" opacity="0.6" />
          <circle cx="4"  cy="16" r="1.5" fill="white" opacity="0.6" />
          <circle cx="16" cy="16" r="1.5" fill="white" opacity="0.6" />
          <line x1="4" y1="4" x2="8.2" y2="8.2" stroke="white" strokeWidth="1.2" opacity="0.5" />
          <line x1="16" y1="4" x2="11.8" y2="8.2" stroke="white" strokeWidth="1.2" opacity="0.5" />
          <line x1="4" y1="16" x2="8.2" y2="11.8" stroke="white" strokeWidth="1.2" opacity="0.5" />
          <line x1="16" y1="16" x2="11.8" y2="11.8" stroke="white" strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>
      <span className="text-lg font-black tracking-tight text-gray-900">Nexus</span>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-gray-100/50">
      <div className="max-w-8xl mx-auto px-6 lg:px-16 xl:px-40 h-16 flex items-center justify-between">
        {/* Left — logo + nav */}
        <div className="flex items-center gap-8">
          <Link href="/" id="nexus-logo">
            <NexusLogo />
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={link.id}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "text-pink"
                      : "text-gray-500 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-xl bg-pink/8 ring-1 ring-pink/15" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right — status + logout */}
        <div className="flex items-center gap-4">
          {/* Network status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold ring-1 ring-emerald-200/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Stellar Testnet
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors font-medium"
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
