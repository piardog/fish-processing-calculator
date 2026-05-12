import type { Dispatch, SetStateAction } from "react";

type Ingredient = {
  name: string;
  quantity: number;
  price: number;
};

type Props = {
  selectedProductKey: string;
  selectedProductIngredients: Ingredient[];
  newIngredientByProduct: Record<string, Ingredient>;
  setNewIngredientByProduct: Dispatch<
    SetStateAction<Record<string, Ingredient>>
  >;
  updateIngredient: (
    productKey: string,
    index: number,
    field: keyof Ingredient,
    value: string
  ) => void;
  addIngredientToProduct: (productKey: string) => void;
  removeIngredientFromProduct: (productKey: string, index: number) => void;
  getProductIngredientTotal: (productKey: string) => number;
  formatMoney: (value: number) => string;
  inputClass: string;
};

export default function IngredientsSection({
  selectedProductKey,
  selectedProductIngredients,
  newIngredientByProduct,
  setNewIngredientByProduct,
  updateIngredient,
  addIngredientToProduct,
  removeIngredientFromProduct,
  getProductIngredientTotal,
  formatMoney,
  inputClass,
}: Props) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">Ingredients Breakdown</div>

      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-semibold text-slate-500">
        <div>Ingredient</div>
        <div>Qty per Unit</div>
        <div>Cost (€)</div>
        <div></div>
      </div>

      {selectedProductIngredients.length === 0 ? (
        <p className="text-sm text-slate-500">No ingredients added yet</p>
      ) : (
        <>
          {selectedProductIngredients.map((item, i) => (
            <div
              key={i}
              className="mt-1 grid grid-cols-4 gap-2 items-center"
            >
              <input
                value={item.name}
                onChange={(e) =>
                  updateIngredient(
                    selectedProductKey,
                    i,
                    "name",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ingredient"
              />

              <input
                type="number"
                value={item.quantity || ""}
                onChange={(e) =>
                  updateIngredient(
                    selectedProductKey,
                    i,
                    "quantity",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Qty per Unit"
              />

              <input
                type="number"
                value={item.price || ""}
                onChange={(e) =>
                  updateIngredient(
                    selectedProductKey,
                    i,
                    "price",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Cost (€)"
              />

              <button
                onClick={() =>
                  removeIngredientFromProduct(selectedProductKey, i)
                }
                className="rounded bg-red-100 px-3 py-2 text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-2 text-sm text-slate-700">
            Ingredients total per unit:{" "}
            <strong>
              {formatMoney(getProductIngredientTotal(selectedProductKey))}
            </strong>
          </div>
        </>
      )}

      <div className="mt-3 grid grid-cols-4 gap-2 items-center">
        <input
          value={newIngredientByProduct[selectedProductKey]?.name || ""}
          onChange={(e) =>
            setNewIngredientByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  quantity: 0,
                  price: 0,
                }),
                name: e.target.value,
              },
            }))
          }
          className={inputClass}
          placeholder="Ingredient name"
        />

        <input
          type="number"
          value={newIngredientByProduct[selectedProductKey]?.quantity || ""}
          onChange={(e) =>
            setNewIngredientByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                  price: 0,
                }),
                quantity: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Qty per Unit"
        />

        <input
          type="number"
          value={newIngredientByProduct[selectedProductKey]?.price || ""}
          onChange={(e) =>
            setNewIngredientByProduct((prev) => ({
              ...prev,
              [selectedProductKey]: {
                ...(prev[selectedProductKey] || {
                  name: "",
                  quantity: 0,
                }),
                price: Number(e.target.value) || 0,
              },
            }))
          }
          className={inputClass}
          placeholder="Cost (€)"
        />

        <button
          onClick={() => addIngredientToProduct(selectedProductKey)}
          className="rounded bg-green-600 px-3 py-2 text-sm text-white"
        >
          + Add Ingredient
        </button>
      </div>
    </div>
  );
}