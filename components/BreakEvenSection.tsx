type Props = {
  currentBreakEvenPrice: number;
  currentSafetyMargin: number;
  currentBreakEvenStatus: {
    label: string;
    className: string;
  } | null;
  liveTargetMargin: number;
  setLiveTargetMargin: (value: number) => void;
  getRequiredSellPrice: () => number;
  formatMoney: (value: number) => string;
  inputClass: string;
};

export default function BreakEvenSection({
  currentBreakEvenPrice,
  currentSafetyMargin,
  currentBreakEvenStatus,
  liveTargetMargin,
  setLiveTargetMargin,
  getRequiredSellPrice,
  formatMoney,
  inputClass,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold">
            Break-Even Analysis
          </h3>

          <p className="text-sm text-slate-600">
            This shows the minimum selling price needed before this product starts making money.
          </p>
        </div>

        {currentBreakEvenStatus && (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${currentBreakEvenStatus.className}`}
          >
            {currentBreakEvenStatus.label}
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">
            Break-even price/unit
          </div>

          <div className="text-lg font-bold text-slate-900">
            {formatMoney(currentBreakEvenPrice)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">
            Required sell price/unit
          </div>

          <div className="text-lg font-bold text-slate-900">
            {formatMoney(getRequiredSellPrice())}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">
            Safety margin/unit
          </div>

          <div
            className={`text-lg font-bold ${
              currentSafetyMargin >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatMoney(currentSafetyMargin)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500 mb-2">
            Target margin %
          </div>

          <input
            type="number"
            value={liveTargetMargin}
            onChange={(e) => setLiveTargetMargin(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-600">
        If your selling price falls below{" "}
        <strong>{formatMoney(currentBreakEvenPrice)}</strong>{" "}
        per unit, this product is likely to lose money based on the current fish,
        labour, ingredient, and other cost figures.
      </div>
    </div>
  );
}