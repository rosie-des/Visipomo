export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Visipomo</h1>
        <p className="mt-4 text-lg text-foreground/70">
        Where daily focus meets long-term success.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/signup"
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="rounded-full border border-black px-8 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition"
          >
            Log In
          </a>
        </div>
      </div>
    </main>
  );
}

