export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ================= NAVBAR ================= */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            TweetSafeAI
          </h1>

          <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#how" className="hover:text-blue-600 transition">
              How it Works
            </a>
            <a href="/login" className="hover:text-blue-600 transition">
              Login
            </a>
            <a
              href="/register"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Take Control of Your Tweets with AI
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Analyze your tweets using intelligent criteria. Flag content for deletion,
            review it yourself, and decide what stays or goes — you remain in control.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              Get Started
            </a>

            <a
              href="/login"
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-16">
            Powerful Features Built for Control
          </h3>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="p-8 rounded-2xl bg-gray-50 shadow-sm hover:shadow-lg transition">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold mb-3">
                AI-Driven Analysis
              </h4>
              <p className="text-gray-600">
                Automatically scan your tweets based on custom criteria you define.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 shadow-sm hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚠️</div>
              <h4 className="text-xl font-semibold mb-3">
                Smart Flagging
              </h4>
              <p className="text-gray-600">
                Tweets are marked for review — never automatically deleted.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 shadow-sm hover:shadow-lg transition">
              <div className="text-4xl mb-4">♻️</div>
              <h4 className="text-xl font-semibold mb-3">
                Reusable Criteria
              </h4>
              <p className="text-gray-600">
                Save deletion rules and reuse them whenever you need.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-16">
            How It Works
          </h3>

          <div className="grid md:grid-cols-3 gap-12">

            <div>
              <div className="text-5xl mb-4">1️⃣</div>
              <h4 className="text-xl font-semibold mb-3">Connect Your Account</h4>
              <p className="text-gray-700">
                Securely connect your X account to fetch your tweets.
              </p>
            </div>

            <div>
              <div className="text-5xl mb-4">2️⃣</div>
              <h4 className="text-xl font-semibold mb-3">Set Your Criteria</h4>
              <p className="text-gray-700">
                Define keywords, patterns, or conditions for flagging.
              </p>
            </div>

            <div>
              <div className="text-5xl mb-4">3️⃣</div>
              <h4 className="text-xl font-semibold mb-3">Review & Delete</h4>
              <p className="text-gray-700">
                Review flagged tweets and delete them directly on X when ready.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 px-6 bg-white text-center">
        <h3 className="text-3xl font-bold mb-6">
          Ready to clean up your timeline?
        </h3>

        <a
          href="/register"
          className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-600 transition"
        >
          Start Now
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-100 py-10 px-6 text-center text-gray-600 text-sm">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4">
            © 2026 TweetSafeAI. All rights reserved.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
