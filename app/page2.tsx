"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  key: string;
  name: string;
  source: "fillet" | "trim";
  species: string[];
  fishPerUnitKg: number;
  price: number;
  machines: string[];
  note?: string;
};

type Ingredient = {
  name: string;
  quantity: number;
  price: number;
};

type ExtraLabour = {
  name: string;
  staff: number;
  hours: number;
  rate: number;
};

type OtherCost = {
  name: string;
  amount: number;
};

export default function FishProductCalculatorBasic() {

  const [productMachineOverrides, setProductMachineOverrides] = useState<Record<string, string[]>>({});
  const [newMachineByProduct, setNewMachineByProduct] = useState<Record<string, string>>({});

  const [fishWeight, setFishWeight] = useState(1000);
  const [filletPct, setFilletPct] = useState(42);
  const [trimPct, setTrimPct] = useState(18);
  const [wastePct, setWastePct] = useState(40);

  const [hourlyRate, setHourlyRate] = useState(15);
  const [operatorAmount, setOperatorAmount] = useState(1);

  const [machineStaffing, setMachineStaffing] = useState<Record<string, number>>({
    filleting: 2,
    mincer: 1,
    mixer: 1,
    former: 1,
    breading: 1,
    packing: 1,
  });

  const [machineHours, setMachineHours] = useState<Record<string, number>>({
    filleting: 8,
    mincer: 6,
    mixer: 4,
    former: 4,
    breading: 5,
    packing: 4,
  });

  const safeFishWeight = Math.max(0, Number(fishWeight) || 0);

  const totals = useMemo(() => {
    const filletKg = safeFishWeight * (filletPct / 100);
    const trimKg = safeFishWeight * (trimPct / 100);
    const wasteKg = safeFishWeight * (wastePct / 100);
    return { filletKg, trimKg, wasteKg };
  }, [safeFishWeight, filletPct, trimPct, wastePct]);

  const getProductMachines = (product: Product) =>
    productMachineOverrides[product.key] || product.machines;

  const updateProductMachine = (product: Product, index: number, newName: string) => {
    const current = getProductMachines(product);
    const oldName = current[index];
    const clean = newName.trim().toLowerCase();

    if (!clean) return;

    const updated = current.map((m, i) => (i === index ? clean : m));

    setProductMachineOverrides((prev) => ({
      ...prev,
      [product.key]: updated,
    }));

    setMachineStaffing((prev) => ({
      ...prev,
      [clean]: prev[oldName] || 0,
    }));

    setMachineHours((prev) => ({
      ...prev,
      [clean]: prev[oldName] || 0,
    }));
  };

  const removeProductMachine = (product: Product, machine: string) => {
    setProductMachineOverrides((prev) => ({
      ...prev,
      [product.key]: getProductMachines(product).filter((m) => m !== machine),
    }));
  };

  const addProductMachine = (product: Product) => {
    const draft = newMachineByProduct[product.key]?.trim().toLowerCase();
    if (!draft) return;

    const current = getProductMachines(product);

    if (current.includes(draft)) return;

    setProductMachineOverrides((prev) => ({
      ...prev,
      [product.key]: [...current, draft],
    }));

    setMachineStaffing((prev) => ({
      ...prev,
      [draft]: 1,
    }));

    setMachineHours((prev) => ({
      ...prev,
      [draft]: 1,
    }));

    setNewMachineByProduct((prev) => ({
      ...prev,
      [product.key]: "",
    }));
  };

  const getMachineLabourTotal = (product: Product) => {
    return getProductMachines(product).reduce((sum, machine) => {
      const staff = machineStaffing[machine] || 0;
      const hours = machineHours[machine] || 0;
      return sum + staff * hours * hourlyRate;
    }, 0) * operatorAmount;
  };
  <div>
  <div className="mb-2 text-sm font-semibold">
    Labour Breakdown
  </div>

  <div className="mb-3 grid grid-cols-4 gap-2 items-end">
    <div>
      <div className="mb-1 text-xs text-slate-500">Hourly Rate (€)</div>
      <input
        type="number"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
        className={inputClass}
      />
    </div>

    <div>
      <div className="mb-1 text-xs text-slate-500">Operators</div>
      <input
        type="number"
        value={operatorAmount}
        onChange={(e) => setOperatorAmount(Math.max(1, Number(e.target.value) || 1))}
        className={inputClass}
      />
    </div>

    <div className="text-sm text-slate-600">
      Labour total: <strong>{formatMoney(currentLabourTotal)}</strong>
    </div>

    <div className="text-sm text-slate-600">
      Labour/unit: <strong>{formatMoney(getProductLabourCostPerUnit(selectedProductData))}</strong>
    </div>
  </div>

  <div className="space-y-2">
    {getProductMachines(selectedProductData).map((machine, i) => (
      <div key={`${machine}-${i}`} className="grid grid-cols-4 gap-2 items-center">
        <input
          value={machine}
          onChange={(e) =>
            updateProductMachine(selectedProductData, i, e.target.value)
          }
          className={inputClass}
          placeholder="Step name"
        />

        <input
          type="number"
          value={machineStaffing[machine] || 0}
          onChange={(e) =>
            setMachineStaffing((prev) => ({
              ...prev,
              [machine]: Number(e.target.value) || 0,
            }))
          }
          className={inputClass}
          placeholder="Staff"
        />

        <input
          type="number"
          value={machineHours[machine] || 0}
          onChange={(e) =>
            setMachineHours((prev) => ({
              ...prev,
              [machine]: Number(e.target.value) || 0,
            }))
          }
          className={inputClass}
          placeholder="Hours"
        />

        <button
          onClick={() => removeProductMachine(selectedProductData, machine)}
          className="rounded bg-red-100 px-3 py-2 text-sm text-red-700"
        >
          Remove
        </button>
      </div>
    ))}

    <div className="mt-3 grid grid-cols-4 gap-2 items-center">
      <input
        value={newMachineByProduct[selectedProductData.key] || ""}
        onChange={(e) =>
          setNewMachineByProduct((prev) => ({
            ...prev,
            [selectedProductData.key]: e.target.value,
          }))
        }
        className={inputClass}
        placeholder="New processing step"
      />

      <button
        onClick={() => addProductMachine(selectedProductData)}
        className="rounded bg-slate-700 px-3 py-2 text-sm text-white"
      >
        + Add Step
      </button>
    </div>
  </div>
</div>