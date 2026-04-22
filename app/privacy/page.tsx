export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-lg">Fish Processing Calculator</div>
          <div className="flex gap-4 text-sm">
            <a href="/" className="hover:underline">Home</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/disclaimer" className="hover:underline">Disclaimer</a>
			<a href="/contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="space-y-4 text-slate-700 leading-7">
            <p>
              Fish Processing Calculator respects your privacy. This page explains what information may be collected when you use this website.
            </p>

            <p>
              This website may use cookies, analytics, and third-party services such as advertising providers to improve the site and measure usage.
            </p>

            <p>
              If third-party advertising is used, those providers may use cookies to serve ads based on your visit to this and other websites.
            </p>

            <p>
              Any calculations or values you enter into the tool are used only within the website experience unless otherwise stated.
            </p>

            <p>
              You can disable cookies in your browser settings if you prefer not to allow them.
            </p>

            <p>
              By continuing to use this site, you agree to this Privacy Policy.
            </p>
          </div>

          <div className="mt-8">
            <a
              href="/"
              className="inline-block rounded bg-slate-900 px-4 py-2 text-white text-sm hover:bg-slate-700"
            >
              ← Back to Calculator
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white border-t mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Fish Processing Calculator. All rights reserved.
        </div>
      </div>
    </div>
  );
}