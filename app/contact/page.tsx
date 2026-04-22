export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* NAVBAR */}
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

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Contact</h1>

          <div className="space-y-4 text-slate-700 leading-7">
            <p>
              If you have any questions, feedback, or suggestions about the Fish Processing Calculator, feel free to get in touch.
            </p>

            <p>
              This tool is constantly being improved, and your feedback is always welcome.
            </p>

            {/* EMAIL */}
            <div className="mt-6">
              <div className="text-sm text-slate-500 mb-1">Email</div>
              <div className="font-medium">
                dan@moonblogger.com
              </div>
            </div>

            
          </div>

          {/* BACK BUTTON */}
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

      {/* FOOTER */}
      <div className="bg-white border-t mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Fish Processing Calculator. All rights reserved.
        </div>
      </div>

    </div>
  );
}