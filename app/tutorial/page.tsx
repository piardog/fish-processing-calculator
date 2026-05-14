export default function TutorialPage() {
  const sections = [
    {
      title: "1. Start Point",
      text:
        `🐟 Select a fish species and product type.

🐟 If your product does not already exist, first add a new species if needed, then create a new product using the Add or Remove Product section.

🐟 Enter the raw material weight in kg and the fish purchase price per kg.

🐟 Add ingredients, machinery, labour, packaging, and other production costs specific to your process.

🐟 The calculator will then estimate fillets, trim, waste, units produced, break-even pricing, margins, and estimated profitability using either the example figures or your own custom figures.`,
    },
    {
      title: "2. Yield Settings",
      text:
        "Choose whether to use the example industry yields provided in the calculator or enter your own custom fillet, trim, and waste percentages based on your own factory experience and processing methods.",
    },
    {
      title: "3. Machinery, Labour & Ingredients",
      text:
        "Add machinery hours, labour requirements, ingredients, packaging, and any additional production costs related to the selected product. This helps provide a more accurate production cost and break-even analysis.",
    },
    {
      title: "4. Break-Even & Profitability",
      text:
        "The calculator automatically estimates break-even price per unit, required selling price, expected margins, and estimated profitability using the figures you enter.",
    },
    {
      title: "5. Save & Compare",
      text:
        "Save scenarios to compare different species, products, raw material costs, and production methods side-by-side. The Save & Compare section displays Species, Product, Weight, Break-even per Unit, Required Sell Price, Safety Margin, Profit, Margin %, and Status.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Tutorial</h1>

          <a
            href="/"
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Back to Calculator
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-3">
            Fish Processing Calculator Tutorial
          </h2>

          <p className="text-slate-700 leading-7">
            This tutorial explains the basic workflow for creating products,
            entering production figures, estimating yields, and comparing
            profitability scenarios using the Fish Processing Calculator.
          </p>
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-3">{section.title}</h3>

            <p className="whitespace-pre-line text-slate-700 leading-7">
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
