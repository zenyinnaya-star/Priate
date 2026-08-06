function Footer() {
  return (
    <footer className="mt-auto border-t border-cinema-red-dim bg-black/80">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
            Internet Movie Rental Company
          </h2>
          <p className="mt-1 text-xs text-foreground/50">
            Bringing the big screen home.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cinema-red-bright">
            Contact Us
          </p>
          <ul className="flex flex-col gap-1 text-sm text-foreground/70 sm:items-end">
            <li>
              <a href="mailto:support@imrc.com" className="transition-colors hover:text-cinema-red-bright">
                support@imrc.com
              </a>
            </li>
            <li>
              <a href="tel:+15551234567" className="transition-colors hover:text-cinema-red-bright">
                (555) 123-4567
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cinema-red-dim/40 px-6 py-4 text-center text-xs text-foreground/40">
        © {new Date().getFullYear()} Internet Movie Rental Company. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
