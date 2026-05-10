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

      <section className="bg-slate-900 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            How the Fish Processing Calculator Works
          </h1>
          <p className="text-slate-300 text-lg leading-8">
            The Fish Processing Calculator helps seafood processors, factories,
            fishermen, trawler owners, and production managers estimate fish
            yields, production costs, labour costs, break-even pricing, and
            required selling prices before production begins.
          </p>
        </div>
      </section>

      <section className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {[
            {
              title: "1. Start Point",
              text: "Begin by choosing the fish species, product type, fish size, raw material weight, and fish purchase price per kg. The calculator then estimates the available fillets, trim, and waste using either standard industry yields or your own custom figures.",
            },
            {
              title: "2. Yield Settings",
              text: "Use typical industry yield estimates or enter your own custom percentages for fillets, trim, and waste. This helps test different fish grades, sizes, and production outcomes.",
            },
            {
              title: "3. Product Costing",
              text: "Each product can have its own production setup. Add labour, machine time, ingredients, packaging, and other production costs. The calculator works out fish cost, labour cost, ingredient cost, and total production cost per unit.",
            },
            {
              title: "4. Break-Even Analysis",
              text: "The calculator shows the break-even price per unit, required selling price, safety margin, and target margin percentage. This helps determine whether a product is commercially viable before production begins.",
            },
            {
              title: "5. Target Margin Planning",
              text: "Adjust the Target Margin % live to test different pricing scenarios. The calculator instantly recalculates the required selling price needed to achieve that margin.",
            },
            {
              title: "6. Labour Breakdown",
              text: "The Labour Breakdown section estimates staff required, machine hours used, hourly labour rates, and extra labour tasks. This gives a clearer picture of real production costs.",
            },
            {
              title: "7. Ingredients & Other Costs",
              text: "Add ingredients, packaging, labels, trays, and other production costs. Each product can have its own custom cost structure.",
            },
            {
              title: "8. Save & Compare",
              text: "Save production scenarios to the cloud and compare different production runs. Reports can also be exported as CSV files for management reporting, production planning, costing reviews, and pricing analysis.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-3 text-slate-900">
                {item.title}
              </h2>
              <p className="text-slate-700 leading-7">{item.text}</p>
            </div>
          ))}

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              Example Use Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-3 text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3">Fish fillets</div>
              <div className="rounded-xl bg-slate-50 p-3">Fish fingers</div>
              <div className="rounded-xl bg-slate-50 p-3">Fish cakes</div>
              <div className="rounded-xl bg-slate-50 p-3">Smoked products</div>
              <div className="rounded-xl bg-slate-50 p-3">Breaded products</div>
              <div className="rounded-xl bg-slate-50 p-3">Yield analysis</div>
              <div className="rounded-xl bg-slate-50 p-3">Break-even pricing</div>
              <div className="rounded-xl bg-slate-50 p-3">Product viability testing</div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Important Note</h2>
            <p className="leading-7">
              All figures produced by the calculator are estimates only. Actual
              yields and production costs may vary depending on fish quality,
              species, processing method, labour efficiency, and production
              conditions. The calculator should be used as a planning and
              estimation tool only.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}