export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-wrap gap-4 text-sm items-center">
            <a href="/" className="font-bold hover:underline">
              Fish Processing Calculator
            </a>
            <a href="/tutorial" className="hover:underline">
              Tutorial
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold mb-4">
            How the Fish Processing Calculator Works
          </h1>

          <p className="text-slate-700 mb-6">
            The Fish Processing Calculator helps seafood processors work out fish yields,
            labour costs, production costs, and profit before production begins.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">1. Start Point</h2>
          <p className="text-slate-700">
            Choose the fish species, product, fish size, raw material weight, and purchase price.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">2. Yield Settings</h2>
          <p className="text-slate-700">
            Use typical yields or enter your own fillet, trim, and waste percentages.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">3. Product Costing</h2>
          <p className="text-slate-700">
            Add labour, machine time, ingredients, packaging, and other costs for each product.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">4. Profit Calculation</h2>
          <p className="text-slate-700">
            The calculator compares total production cost against selling price to show profit or loss per unit.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">5. Save & Compare</h2>
          <p className="text-slate-700">
            Save scenarios to the cloud, compare reports, and export them as CSV files.
          </p>
        </div>
      </div>
    </main>
  );
}