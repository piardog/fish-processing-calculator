import type { Dispatch, SetStateAction } from "react";

type OtherCost = {
  name: string;
  amount: number;
};

type Props = {
  selectedProductKey: string;
  selectedOtherCosts: OtherCost[];
  newOtherCostByProduct: Record<string, OtherCost>;
  setNewOtherCostByProduct: Dispatch<
    SetStateAction<Record<string, OtherCost>>
  >;
  updateOtherCost: (
    productKey: string,
    index: number,
    field: keyof OtherCost,
    value: string
  ) => void;
  addOtherCostToProduct: (productKey: string) => void;
  removeOtherCostFromProduct: (productKey: string, index: number) => void;
  getProductOtherCostTotal: (productKey: string) => number;
  formatMoney: (value: number) => string;
  inputClass: string;
};

export default function OtherCostsSection({
  selectedProductKey,
  selectedOtherCosts,
  newOtherCostByProduct,
  setNewOtherCostByProduct,
  updateOtherCost,
  addOtherCostToProduct,
  removeOtherCostFromProduct,
  getProductOtherCostTotal,
  formatMoney,
  inputClass,
}: Props) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">Other Costs</div>

      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-slate-500">
        <div>Cost Name</div>
        <div>Amount (€)</div>
        <div></div>
      </div>

      {selectedOtherCosts.length === 0 ? (
        <p className="text-sm text-slate-500">No other costs added yet</p>
      ) : (
        <>
          {selectedOtherCosts.map((item, i) => (
            <div
              key={i}
              className="mt-1 grid grid-cols-3 gap-2 items-center"
            >
              <input
                value={item.name}
                onChange={(e) =>
                  updateOtherCost(
                    selectedProductKey,
                    i,
                    "name",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Other cost"
              />

              <input
                type="number"
                value={item.amount || ""}
                onChange={(e) =>
                  updateOtherCost(
                    selectedProductKey,
                    i,
                    "amount",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Amount (€)"
              />

              <button
                onClick={() =>
                  removeOtherCostFromProduct(selectedProductKey, i)
                }
                className="rounded bg-red-100 px-3 py-2 text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-2 text-sm text-slate-700">
            Other costs total per unit:{" "}
            <strong>
              {formatMoney(getProductOtherCostTotal(selectedProductKey))}
            </strong>
          </div>
        </>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 items-center">
        <input
          value={newOtherCostByProduct[selectedProductKey]?.name || ""}
          onChange={(e) =>
            setNewOtherCostByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  amount: 0,
                }),
                name: e.target.value,
              },
            }))
          }
          className={inputClass}
          placeholder="Other cost name"
        />

        <input
          type="number"
          value={newOtherCostByProduct[selectedProductKey]?.amount || ""}
          onChange={(e) =>
            setNewOtherCostByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                }),
                amount: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Amount (€)"
        />

        <button
          onClick={() => addOtherCostToProduct(selectedProductKey)}
          className="rounded bg-slate-700 px-3 py-2 text-sm text-white"
        >
          + Add Other Cost
        </button>
      </div>
    </div>
  );
}