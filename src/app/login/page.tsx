export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0_0_40px_-10px_rgba(225,6,0,0.25)]">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground">
          Movie Portal
        </h1>
        <p className="mt-2 text-sm text-foreground/50">Please enter your details.</p>

        <form className="mt-8 flex flex-col gap-6">
          <label className="block">
            <span className="block text-sm font-semibold text-foreground/90">E-mail</span>
            <input
              type="email"
              placeholder="Enter your e-mail"
              required
              className="mt-2 w-full border-b border-border bg-transparent pb-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-cinema-red"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-foreground/90">Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              required
              className="mt-2 w-full border-b border-border bg-transparent pb-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-cinema-red"
            />
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-foreground/70">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-transparent accent-cinema-red"
              />
              Remember me
            </label>
            <a href="#" className="font-medium text-cinema-red-bright hover:underline">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-cinema-red py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_20px_-4px_rgba(225,6,0,0.8)] transition-colors hover:bg-cinema-red-bright"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/50">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-semibold text-foreground hover:text-cinema-red-bright">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
