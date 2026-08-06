import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cinema-red-dim bg-black/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cinema-red shadow-[0_0_10px_2px_rgba(225,6,0,0.7)]" />
          <span className="text-lg font-bold uppercase tracking-[0.2em] text-foreground">
            Internet Movies Rental
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-cinema-red-bright hover:underline"
        >
          Portal
        </Link>
      </nav>
    </header>
  );
}
