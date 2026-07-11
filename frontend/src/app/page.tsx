import Link from "next/link";
import Image from "next/image";

/* ── Icons ── */
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function DollarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function GaugeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10" /><path d="M2 12a10 10 0 0 1 10-10" /><path d="M12 12 8 8" /><circle cx="12" cy="12" r="2" /></svg>;
}
function ArrowRight() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

/* ── Nexus wordmark ── */
function NexusMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="10" cy="10" r="3" fill="white" opacity="0.95" />
          <circle cx="4" cy="4" r="1.5" fill="white" opacity="0.55" />
          <circle cx="16" cy="4" r="1.5" fill="white" opacity="0.55" />
          <circle cx="4" cy="16" r="1.5" fill="white" opacity="0.55" />
          <circle cx="16" cy="16" r="1.5" fill="white" opacity="0.55" />
          <line x1="4" y1="4" x2="8.2" y2="8.2" stroke="white" strokeWidth="1.1" opacity="0.45" />
          <line x1="16" y1="4" x2="11.8" y2="8.2" stroke="white" strokeWidth="1.1" opacity="0.45" />
          <line x1="4" y1="16" x2="8.2" y2="11.8" stroke="white" strokeWidth="1.1" opacity="0.45" />
          <line x1="16" y1="16" x2="11.8" y2="11.8" stroke="white" strokeWidth="1.1" opacity="0.45" />
        </svg>
      </div>
      <span className="text-lg font-black tracking-tight">Nexus</span>
    </div>
  );
}

const features = [
  { icon: PhoneIcon, title: "Any phone, zero data", desc: "Dial a USSD code from any feature phone. No app, no internet, no data bundle needed." },
  { icon: DollarIcon, title: "USDC on Stellar", desc: "Settlements complete in seconds on Stellar. Recipients always get exactly $1 per USDC." },
  { icon: ShieldIcon, title: "AES-256 encrypted wallets", desc: "Every keypair is locked at rest. Only the user's PIN can authorise a transfer." },
  { icon: GaugeIcon, title: "Daily safety cap", desc: "Up to 1,000 USDC per day per wallet — enough for real transfers, with limits built in." },
];

const steps = [
  { num: "01", title: "Dial",        desc: "Dial *347*123# from any phone." },
  { num: "02", title: "Authenticate", desc: "Enter your 4–6 digit PIN." },
  { num: "03", title: "Pick & amount", desc: "Choose a recipient phone and amount." },
  { num: "04", title: "Confirm",     desc: "Review once, then confirm." },
  { num: "05", title: "Done + SMS",  desc: "Settles on Stellar. Both phones get a text." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ════════════════════════ NAV ════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <NexusMark />
          <div className="flex items-center gap-3">

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors shadow-sm"
            >
              Dashboard <ArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      {/* Dark full-bleed panel */}
      <section className="relative bg-[#0a1628] overflow-hidden">
        {/* Background: network constellation */}
        <Image
          src="/illustrations/network-constellation.png"
          alt=""
          fill
          priority
          className="object-cover opacity-20 pointer-events-none select-none"
        />

        {/* Subtle colour bleed */}
        <div className="absolute top-0 left-0 w-[700px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-pink/15 rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-0 grid lg:grid-cols-[1fr_auto] gap-0 items-end">

          {/* ── Left copy ── */}
          <div className="pb-16 lg:pb-24 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium mb-8 animate-fade-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live on Stellar Testnet
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.02] mb-6 animate-slide-up">
              Send USDC<br />
              from{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-light">any phone</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-pink rounded-full" />
              </span>
              .
            </h1>

            <p className="text-lg text-white/55 leading-relaxed max-w-lg mb-10 animate-slide-up delay-100">
              Nexus routes USDC across Africa via USSD — the menu on any mobile phone.
              No smartphone. No data. No wallet address. Just dial, pick, confirm.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 animate-slide-up delay-200">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5"
              >
                <ShieldIcon /> Open Dashboard
              </Link>

            </div>

            {/* Trust line */}
            <div className="mt-10 flex items-center gap-6 animate-slide-up delay-300">
              {["No smartphone needed", "Settles in ~3s", "USDC always = $1"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                  <CheckIcon /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: hero illustration, flush bottom ── */}
          <div className="hidden lg:block relative w-[480px] h-[440px] animate-slide-up delay-200 self-end">
            <Image
              src="/illustrations/nexus-hero-dark.png"
              alt="USSD phone sending USDC on Stellar"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Stats strip — inside dark panel, at the very bottom */}
        <div className="relative border-t border-white/8">
          <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Network",   value: "Stellar Testnet" },
              { label: "Currency",  value: "USDC"            },
              { label: "Daily Max", value: "1,000 USDC"      },
              { label: "Speed",     value: "~3 seconds"      },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-white/80 text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ AFRICA MAP ════════════════════════ */}
      <section className="py-28 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Map illustration */}
          <div className="relative order-last lg:order-first animate-float-slow">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-primary/6 blur-3xl" />
            </div>
            <Image
              src="/illustrations/africa-map.png"
              alt="Remittance connections across Africa"
              width={560}
              height={560}
              className="relative w-full max-w-md mx-auto"
            />
          </div>

          {/* Copy + feature list */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pink mb-3">Coverage</p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-4">
              Built for the way<br />Africa sends money.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Across Nigeria, Ghana, Kenya and beyond, USSD reaches everyone —
              feature phones included. Nexus turns that reach into instant USDC
              settlements on Stellar.
            </p>

            <div className="space-y-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all group"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary/14 transition-colors">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{f.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-pink mb-3">How it works</p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Five steps, all in USSD</h2>
            <p className="text-gray-500 text-base mt-3 leading-relaxed">
              You never leave the USSD menu. No app store, no account form, no wallet setup.
            </p>
          </div>

          <div className="grid sm:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all hover:-translate-y-1"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <p className="text-4xl font-black text-primary/12 mb-4 leading-none">{s.num}</p>
                <p className="text-sm font-bold text-gray-900 mb-1.5">{s.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <section className="relative bg-[#0a1628] py-24 overflow-hidden">
        <Image
          src="/illustrations/network-constellation.png"
          alt=""
          fill
          className="object-cover opacity-20 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-pink/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-4">Want to try it out?</h2>
            <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md">
              Deploy on Stellar Testnet, spin up the backend, and dial in from the
              Africa&apos;s Talking simulator — the whole stack runs locally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <ShieldIcon /> Open Admin Dashboard
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white rounded-xl text-sm font-bold ring-1 ring-white/15 hover:bg-white/8 transition-all"
              >
                GitHub <ArrowRight />
              </a>
            </div>
          </div>

          {/* USDC transfer illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-56 h-56 animate-float">
              <Image
                src="/illustrations/usdc-transfer.png"
                alt="USDC transfer"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NexusMark />
            <span className="text-gray-300 text-sm">— MVP for Drips / Grantfox</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link href="/login" className="hover:text-primary transition-colors">Admin</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="text-gray-200">·</span>
            <span>Stellar Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
