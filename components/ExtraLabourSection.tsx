import type { Dispatch, SetStateAction } from "react";

type ExtraLabour = {
  name: string;
  staff: number;
  hours: number;
  rate: number;
};

type Props = {
  selectedProductKey: string;
  selectedExtraLabour: ExtraLabour[];
  newExtraLabourByProduct: Record<string, ExtraLabour>;
  setNewExtraLabourByProduct: Dispatch<
    SetStateAction<Record<string, ExtraLabour>>
  >;
  updateExtraLabour: (
    productKey: string,
    index: number,
    field: keyof ExtraLabour,
    value: string
  ) => void;
  addExtraLabourToProduct: (productKey: string) => void;
  removeExtraLabourFromProduct: (productKey: string, index: number) => void;
  getExtraLabourTotal: (productKey: string) => number;
  formatMoney: (value: number) => string;
  inputClass: string;
};

export default function ExtraLabourSection({
  selectedProductKey,
  selectedExtraLabour,
  newExtraLabourByProduct,
  setNewExtraLabourByProduct,
  updateExtraLabour,
  addExtraLabourToProduct,
  removeExtraLabourFromProduct,
  getExtraLabourTotal,
  formatMoney,
  inputClass,
}: Props) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">Extra Labour</div>

      <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-semibold text-slate-500">
        <div>Task</div>
        <div>Staff</div>
        <div>Hours</div>
        <div>Rate (€)</div>
        <div></div>
      </div>

      {selectedExtraLabour.length === 0 ? (
        <p className="text-sm text-slate-500">No extra labour added yet</p>
      ) : (
        <>
          {selectedExtraLabour.map((item, i) => (
            <div
              key={i}
              className="mt-1 grid grid-cols-5 gap-2 items-center"
            >
              <input
                value={item.name}
                onChange={(e) =>
                  updateExtraLabour(
                    selectedProductKey,
                    i,
                    "name",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Task"
              />

              <input
                type="number"
                value={item.staff || ""}
                onChange={(e) =>
                  updateExtraLabour(
                    selectedProductKey,
                    i,
                    "staff",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Staff"
              />

              <input
                type="number"
                value={item.hours || ""}
                onChange={(e) =>
                  updateExtraLabour(
                    selectedProductKey,
                    i,
                    "hours",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Hours"
              />

              <input
                type="number"
                value={item.rate || ""}
                onChange={(e) =>
                  updateExtraLabour(
                    selectedProductKey,
                    i,
                    "rate",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Rate (€)"
              />

              <button
                onClick={() =>
                  removeExtraLabourFromProduct(selectedProductKey, i)
                }
                className="rounded bg-red-100 px-3 py-2 text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-2 text-sm text-slate-700">
            Extra labour total:{" "}
            <strong>{formatMoney(getExtraLabourTotal(selectedProductKey))}</strong>
          </div>
        </>
      )}

      <div className="mt-3 grid grid-cols-5 gap-2 items-center">
        <input
          value={newExtraLabourByProduct[selectedProductKey]?.name || ""}
          onChange={(e) =>
            setNewExtraLabourByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  staff: 0,
                  hours: 0,
                  rate: 0,
                }),
                name: e.target.value,
              },
            }))
          }
          className={inputClass}
          placeholder="Task"
        />

        <input
          type="number"
          value={newExtraLabourByProduct[selectedProductKey]?.staff || ""}
          onChange={(e) =>
            setNewExtraLabourByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                  hours: 0,
                  rate: 0,
                }),
                staff: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Staff"
        />

        <input
          type="number"
          value={newExtraLabourByProduct[selectedProductKey]?.hours || ""}
          onChange={(e) =>
            setNewExtraLabourByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                  staff: 0,
                  rate: 0,
                }),
                hours: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Hours"
        />

        <input
          type="number"
          value={newExtraLabourByProduct[selectedProductKey]?.rate || ""}
          onChange={(e) =>
            setNewExtraLabourByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                  staff: 0,
                  hours: 0,
                }),
                rate: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Rate (€)"
        />

        <button
          onClick={() => addExtraLabourToProduct(selectedProductKey)}
          className="rounded bg-green-600 px-3 py-2 text-sm text-white"
        >
          + Add Labour
        </button>
      </div>
    </div>
  );
}