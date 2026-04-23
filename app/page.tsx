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
  const [showReportView, setShowReportView] = useState(false);
  const [authChecked, setAuthChecked] = useState(process.env.NODE_ENV === "development");
  const [isUnlocked, setIsUnlocked] = useState(process.env.NODE_ENV === "development");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSpecies, setShowAddSpecies] = useState(false);

  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  const [fishType, setFishType] = useState("haddock");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fishWeight, setFishWeight] = useState(1000);
  const [filletPct, setFilletPct] = useState(42);
  const [trimPct, setTrimPct] = useState(18);
  const [fishCostPerKg, setFishCostPerKg] = useState(4);
  const [fishSize, setFishSize] = useState("medium");
  const [hourlyRate, setHourlyRate] = useState(15);
  const [operatorAmount, setOperatorAmount] = useState(1);

  const [fishProfiles, setFishProfiles] = useState<Record<string, { label: string; filletPct: number; trimPct: number; fishCostPerKg: number }>>({
    haddock: { label: "Haddock", filletPct: 42, trimPct: 18, fishCostPerKg: 4 },
    herring: { label: "Herring", filletPct: 50, trimPct: 8, fishCostPerKg: 2.4 },
    monkfish: { label: "Monkfish", filletPct: 38, trimPct: 12, fishCostPerKg: 9 },
    prawns: { label: "Prawns", filletPct: 30, trimPct: 10, fishCostPerKg: 7 },
  });

  const [newFish, setNewFish] = useState({
    key: "",
    label: "",
    filletPct: 0,
    trimPct: 0,
    fishCostPerKg: 0,
  });

  const [machineStaffing, setMachineStaffing] = useState<Record<string, number>>({
    filleting: 2,
    mincer: 1,
    mixer: 1,
    former: 1,
    breading: 1,
    packing: 1,
    smoking: 1,
    marinating: 1,
  });

  const [machineHours, setMachineHours] = useState<Record<string, number>>({
    filleting: 8,
    mincer: 6,
    mixer: 4,
    former: 4,
    breading: 5,
    packing: 4,
    smoking: 6,
    marinating: 3,
  });

  const baseProducts: Product[] = [
    {
      key: "freshFillets",
      name: "Fresh Fillets",
      source: "fillet",
      species: ["haddock"],
      fishPerUnitKg: 0.18,
      price: 4.5,
      machines: ["filleting", "packing"],
      note: "180g portion",
    },
    {
      key: "breadedFillets",
      name: "Breaded Fillets",
      source: "fillet",
      species: ["haddock"],
      fishPerUnitKg: 0.16,
      price: 3.8,
      machines: ["filleting", "breading", "packing"],
      note: "160g fish portion",
    },
    {
      key: "fishFingers",
      name: "Fish Fingers",
      source: "trim",
      species: ["haddock"],
      fishPerUnitKg: 0.025,
      price: 0.35,
      machines: ["mincer", "mixer", "former", "breading", "packing"],
      note: "25g fish per finger",
    },
    {
      key: "fishCakes",
      name: "Fish Cakes",
      source: "trim",
      species: ["haddock"],
      fishPerUnitKg: 0.072,
      price: 1.6,
      machines: ["mincer", "mixer", "packing"],
      note: "120g cake at 60% fish",
    },
    {
      key: "herringFillets",
      name: "Herring Fillets",
      source: "fillet",
      species: ["herring"],
      fishPerUnitKg: 0.14,
      price: 2.2,
      machines: ["filleting", "packing"],
      note: "Fresh packed herring fillets",
    },
    {
      key: "kippers",
      name: "Kippers",
      source: "fillet",
      species: ["herring"],
      fishPerUnitKg: 0.2,
      price: 3.1,
      machines: ["filleting", "smoking", "packing"],
      note: "Split and smoked herring",
    },
  ];

  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    key: "",
    name: "",
    source: "trim" as "fillet" | "trim",
    species: "haddock",
    fishPerUnitKg: 0,
    price: 0,
    note: "",
  });

  const products = [...baseProducts, ...customProducts];
  const productsForSpecies = products.filter((p) => p.species.includes(fishType));
  const selectedProductData = productsForSpecies.find((p) => p.key === selectedProduct) || null;

  const [productIngredients, setProductIngredients] = useState<Record<string, Ingredient[]>>({
    breadedFillets: [
      { name: "Breadcrumbs", quantity: 1, price: 0.03 },
      { name: "Batter", quantity: 1, price: 0.02 },
      { name: "Packaging", quantity: 1, price: 0.03 },
    ],
    fishFingers: [
      { name: "Breadcrumbs", quantity: 1, price: 0.03 },
      { name: "Batter", quantity: 1, price: 0.02 },
      { name: "Packaging", quantity: 1, price: 0.03 },
    ],
  });
  const [newIngredientByProduct, setNewIngredientByProduct] = useState<Record<string, Ingredient>>({});

  const [productExtraLabour, setProductExtraLabour] = useState<Record<string, ExtraLabour[]>>({
    breadedFillets: [{ name: "Quality Check", staff: 1, hours: 1, rate: 15 }],
  });
  const [newExtraLabourByProduct, setNewExtraLabourByProduct] = useState<Record<string, ExtraLabour>>({});

  const [productOtherCosts, setProductOtherCosts] = useState<Record<string, OtherCost[]>>({
    breadedFillets: [
      { name: "Tray", amount: 0.04 },
      { name: "Label", amount: 0.02 },
    ],
  });
  const [newOtherCostByProduct, setNewOtherCostByProduct] = useState<Record<string, OtherCost>>({});

  const selectedProductIngredients = selectedProductData ? productIngredients[selectedProductData.key] || [] : [];

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      const unlocked = localStorage.getItem("fish_tool_unlocked");
      if (unlocked === "yes") setIsUnlocked(true);
    }

    const raw = localStorage.getItem("fish_scenarios");
    if (raw) {
      try {
        setSavedScenarios(JSON.parse(raw));
      } catch {}
    }

    setAuthChecked(true);
  }, []);

  useEffect(() => {
    const profile = fishProfiles[fishType as keyof typeof fishProfiles];

    // Adjust based on fish size
    let filletAdj = 0;
    let trimAdj = 0;

    if (fishSize === "small") {
      filletAdj = -5;
      trimAdj = +5;
    } else if (fishSize === "large") {
      filletAdj = +5;
      trimAdj = -5;
    }

    setFilletPct(profile.filletPct + filletAdj);
    setTrimPct(profile.trimPct + trimAdj);
    setFishCostPerKg(profile.fishCostPerKg);
    if (selectedProduct && !productsForSpecies.some((p) => p.key === selectedProduct)) {
      setSelectedProduct("");
    }
  }, [fishType, fishSize]);

  const inputClass = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none";
  const cardClass = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm";
  const safeFishWeight = Math.max(0, Number(fishWeight) || 0);

  const totals = useMemo(() => {
    const filletKg = safeFishWeight * (filletPct / 100);
    const trimKg = safeFishWeight * (trimPct / 100);
    return { filletKg, trimKg };
  }, [safeFishWeight, filletPct, trimPct]);

  const calcUnits = (kg: number, perUnit: number) => Math.floor(kg / perUnit);
  const formatMoney = (v: number) => `€${Number(v || 0).toFixed(2)}`;

  const getProductIngredientTotal = (productKey: string) =>
    (productIngredients[productKey] || []).reduce((sum, item) => sum + item.quantity * item.price, 0);

  const getProductOtherCostTotal = (productKey: string) =>
    (productOtherCosts[productKey] || []).reduce((sum, item) => sum + item.amount, 0);

  const getProductExtraLabourTotal = (productKey: string) =>
    (productExtraLabour[productKey] || []).reduce((sum, item) => sum + item.staff * item.hours * item.rate, 0);

  const getProductUnits = (product: Product) =>
    calcUnits(product.source === "fillet" ? totals.filletKg : totals.trimKg, product.fishPerUnitKg);

  const getMachineLabourTotal = (product: Product) => {
    const base = product.machines.reduce((sum, machine) => {
      const staff = machineStaffing[machine] || 0;
      const hours = machineHours[machine] || 0;
      return sum + staff * hours * hourlyRate;
    }, 0);
    return base * operatorAmount;
  };

  const getProductLabourCostPerUnit = (product: Product) => {
    const units = getProductUnits(product);
    const totalLabour = getMachineLabourTotal(product) + getProductExtraLabourTotal(product.key);
    return units > 0 ? totalLabour / units : 0;
  };

  const getProductProfitPerUnit = (product: Product) => {
    const ingredient = getProductIngredientTotal(product.key);
    const other = getProductOtherCostTotal(product.key);
    const labour = getProductLabourCostPerUnit(product);
    return product.price - ingredient - other - labour;
  };

  const updateIngredient = (productKey: string, index: number, field: keyof Ingredient, value: string) => {
    setProductIngredients((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).map((item, i) =>
        i === index ? { ...item, [field]: field === "name" ? value : Number(value) || 0 } : item
      ),
    }));
  };

  const addIngredientToProduct = (productKey: string) => {
    const draft = newIngredientByProduct[productKey];
    if (!draft?.name) return;
    setProductIngredients((prev) => ({
      ...prev,
      [productKey]: [...(prev[productKey] || []), { ...draft }],
    }));
    setNewIngredientByProduct((prev) => ({ ...prev, [productKey]: { name: "", quantity: 0, price: 0 } }));
  };

  const removeIngredientFromProduct = (productKey: string, index: number) => {
    setProductIngredients((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).filter((_, i) => i !== index),
    }));
  };

  const updateExtraLabour = (productKey: string, index: number, field: keyof ExtraLabour, value: string) => {
    setProductExtraLabour((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).map((item, i) =>
        i === index ? { ...item, [field]: field === "name" ? value : Number(value) || 0 } : item
      ),
    }));
  };

  const addExtraLabourToProduct = (productKey: string) => {
    const draft = newExtraLabourByProduct[productKey];
    if (!draft?.name) return;
    setProductExtraLabour((prev) => ({
      ...prev,
      [productKey]: [...(prev[productKey] || []), { ...draft }],
    }));
    setNewExtraLabourByProduct((prev) => ({ ...prev, [productKey]: { name: "", staff: 0, hours: 0, rate: hourlyRate } }));
  };

  const removeExtraLabourFromProduct = (productKey: string, index: number) => {
    setProductExtraLabour((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).filter((_, i) => i !== index),
    }));
  };

  const updateOtherCost = (productKey: string, index: number, field: keyof OtherCost, value: string) => {
    setProductOtherCosts((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).map((item, i) =>
        i === index ? { ...item, [field]: field === "name" ? value : Number(value) || 0 } : item
      ),
    }));
  };

  const addOtherCostToProduct = (productKey: string) => {
    const draft = newOtherCostByProduct[productKey];
    if (!draft?.name) return;
    setProductOtherCosts((prev) => ({
      ...prev,
      [productKey]: [...(prev[productKey] || []), { ...draft }],
    }));
    setNewOtherCostByProduct((prev) => ({ ...prev, [productKey]: { name: "", amount: 0 } }));
  };

  const removeOtherCostFromProduct = (productKey: string, index: number) => {
    setProductOtherCosts((prev) => ({
      ...prev,
      [productKey]: (prev[productKey] || []).filter((_, i) => i !== index),
    }));
  };

  const saveScenario = () => {
    if (!selectedProductData) return;
    const scenario = {
      id: Date.now(),
      species: fishProfiles[fishType as keyof typeof fishProfiles].label,
      product: selectedProductData.name,
      weight: safeFishWeight,
      profit: getProductProfitPerUnit(selectedProductData) * getProductUnits(selectedProductData),
      costPerUnit:
        getProductIngredientTotal(selectedProductData.key) +
        getProductOtherCostTotal(selectedProductData.key) +
        getProductLabourCostPerUnit(selectedProductData),
    };
    const updated = [scenario, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem("fish_scenarios", JSON.stringify(updated));
  };

  const deleteScenario = (id: number) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem("fish_scenarios", JSON.stringify(updated));
  };

  const addFish = () => {
    if (!newFish.key || !newFish.label) return;
    setFishProfiles((prev) => ({
      ...prev,
      [newFish.key]: {
        label: newFish.label,
        filletPct: Number(newFish.filletPct) || 0,
        trimPct: Number(newFish.trimPct) || 0,
        fishCostPerKg: Number(newFish.fishCostPerKg) || 0,
      },
    }));
    setNewFish({ key: "", label: "", filletPct: 0, trimPct: 0, fishCostPerKg: 0 });
    setShowAddSpecies(false);
  };

  const exportToCsv = () => {
    if (savedScenarios.length === 0) {
      alert("Please save at least one scenario before exporting.");
      return;
    }

    const headers = ["Species", "Product", "Weight (kg)", "Profit (€)", "Cost / Unit (€)"];
    const rows = savedScenarios.map((s) => [
      s.species,
      s.product,
      s.weight,
      s.profit.toFixed(2),
      s.costPerUnit.toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fish-production-report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const unlockTool = () => {
    const correctPassword = "danbenny";
    if (passwordInput === correctPassword) {
      setIsUnlocked(true);
      setPasswordError("");
      localStorage.setItem("fish_tool_unlocked", "yes");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const lockTool = () => {
    setIsUnlocked(false);
    setPasswordInput("");
    localStorage.removeItem("fish_tool_unlocked");
  };

  const currentProfitPerUnit = selectedProductData ? getProductProfitPerUnit(selectedProductData) : 0;

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-100" />;
  }
  const currentUnits = selectedProductData ? getProductUnits(selectedProductData) : 0;
  const currentLabourTotal = selectedProductData ? getMachineLabourTotal(selectedProductData) + getProductExtraLabourTotal(selectedProductData.key) : 0;

  if (!isUnlocked && process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-3">Fish Processing Calculator</h1>
          <p className="text-slate-600 mb-2">Enter the password to unlock the tool.</p>
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-blue-900 min-h-[200px]">
            <p>This tool is currently being tested.</p>
            <p>For access or enquiries,</p>
            <p>please contact Dan at info@moonblogger.com.</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={inputClass}
              placeholder="Password"
            />
            {passwordError && <div className="text-sm text-red-600">{passwordError}</div>}
            <button onClick={unlockTool} className="w-full rounded bg-slate-900 px-4 py-2 text-white text-sm hover:bg-slate-700">
              Unlock Tool
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* NAVBAR */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="font-bold text-base sm:text-lg whitespace-nowrap">
              Fish Processing Calculator
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
            <a href="/" className="hover:underline">Home</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/disclaimer" className="hover:underline">Disclaimer</a>
            <a href="/contact" className="hover:underline">Contact</a>
            {process.env.NODE_ENV !== "development" && (
              <button onClick={lockTool} className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-700">Lock</button>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Fish Processing Calculator
          </h1>
          <p className="text-slate-300 max-w-2xl mb-6">
            Calculate fish yields, production output, labour costs, and profit per unit for your seafood products. Built for processors, factories, and production planning.
          </p>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800 p-4 rounded-xl">
              ✔ Calculate fillet & trim yields
            </div>
            <div className="bg-slate-800 p-4 rounded-xl">
              ✔ Track labour & machine costs
            </div>
            <div className="bg-slate-800 p-4 rounded-xl">
              ✔ See profit per product instantly
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-6xl space-y-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Start Point</h2>
            <button onClick={() => setShowAddSpecies((s) => !s)} className="rounded bg-slate-700 px-3 py-2 text-sm text-white">
              {showAddSpecies ? "Hide" : "+ Add Species"}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            <div>
              <div className="mb-1 text-sm">Species</div>
              <select value={fishType} onChange={(e) => setFishType(e.target.value)} className={inputClass}>
                {Object.entries(fishProfiles).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-sm">Product Focus</div>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={inputClass}>
                <option value="">All Products</option>
                {productsForSpecies.map((p) => {
                  const profit = getProductProfitPerUnit(p);
                  const marker = profit >= 0 ? "▲" : "▼";
                  const sign = profit >= 0 ? "+" : "-";
                  return <option key={p.key} value={p.key}>{p.name} ({marker} {sign}{formatMoney(Math.abs(profit))}/unit)</option>;
                })}
              </select>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-sm">Fish Size</div>
              <select value={fishSize} onChange={(e) => setFishSize(e.target.value)} className={inputClass}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-sm">Raw Material Weight (kg)</div>
              <input type="number" value={fishWeight} onChange={(e) => setFishWeight(Number(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">▲ = profitable per unit, ▼ = loss per unit</div>

          {showAddSpecies && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-semibold">Add Species</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-sm">Species Key</div>
                  <input value={newFish.key} onChange={(e) => setNewFish({ ...newFish, key: e.target.value })} className={inputClass} placeholder="e.g. cod" />
                </div>
                <div>
                  <div className="mb-1 text-sm">Label</div>
                  <input value={newFish.label} onChange={(e) => setNewFish({ ...newFish, label: e.target.value })} className={inputClass} placeholder="e.g. Cod" />
                </div>
                <div>
                  <div className="mb-1 text-sm">Fillet %</div>
                  <input type="number" value={newFish.filletPct} onChange={(e) => setNewFish({ ...newFish, filletPct: Number(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <div className="mb-1 text-sm">Trim %</div>
                  <input type="number" value={newFish.trimPct} onChange={(e) => setNewFish({ ...newFish, trimPct: Number(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <div className="mb-1 text-sm">Fish Cost per kg (€)</div>
                  <input type="number" value={newFish.fishCostPerKg} onChange={(e) => setNewFish({ ...newFish, fishCostPerKg: Number(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <button onClick={addFish} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Save Species</button>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Product</h2>
            <button onClick={() => setShowAddProduct((s) => !s)} className="rounded bg-slate-700 px-3 py-2 text-sm text-white">
              {showAddProduct ? "Hide" : "+ Add Product"}
            </button>
          </div>
          {showAddProduct && (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-sm">Species</div>
                  <select value={newProduct.species} onChange={(e) => setNewProduct({ ...newProduct, species: e.target.value })} className={inputClass}>
                    {Object.entries(fishProfiles).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-sm">Product Key</div>
                  <input value={newProduct.key} onChange={(e) => setNewProduct({ ...newProduct, key: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <div className="mb-1 text-sm">Product Name</div>
                  <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <div className="mb-1 text-sm">Source</div>
                  <select value={newProduct.source} onChange={(e) => setNewProduct({ ...newProduct, source: e.target.value as "fillet" | "trim" })} className={inputClass}>
                    <option value="trim">Trim</option>
                    <option value="fillet">Fillet</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-sm">Fish per Unit (kg)</div>
                  <input type="number" value={newProduct.fishPerUnitKg} onChange={(e) => setNewProduct({ ...newProduct, fishPerUnitKg: Number(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <div className="mb-1 text-sm">Sell Price (€)</div>
                  <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm">Note</div>
                <input value={newProduct.note} onChange={(e) => setNewProduct({ ...newProduct, note: e.target.value })} className={inputClass} />
              </div>
              <button
                onClick={() => {
                  if (!newProduct.key || !newProduct.name) return;
                  setCustomProducts((prev) => [
                    ...prev,
                    {
                      ...newProduct,
                      species: [newProduct.species],
                      machines: newProduct.source === "fillet" ? ["filleting", "packing"] : ["mincer", "packing"],
                    },
                  ]);
                  setNewProduct({ key: "", name: "", source: "trim", species: fishType, fishPerUnitKg: 0, price: 0, note: "" });
                }}
                className="rounded bg-green-600 px-3 py-2 text-sm text-white"
              >
                Save Product
              </button>
            </div>
          )}
        </div>

        <div className={`${cardClass} ${selectedProductData ? (currentProfitPerUnit >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50") : ""}`}>
          <h2 className="text-lg font-semibold">Selected Product</h2>
          {!selectedProductData ? (
            <p className="mt-2 text-sm text-slate-600">Select a product to see ingredients and costs.</p>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <div className="font-medium">{selectedProductData.name}</div>
                <div className="text-sm text-slate-500">{selectedProductData.note}</div>
              </div>

              <div className="text-sm text-slate-600">
                Units: <strong>{currentUnits}</strong> | Labour/unit: <strong>{formatMoney(getProductLabourCostPerUnit(selectedProductData))}</strong> | Ingredients/unit: <strong>{formatMoney(getProductIngredientTotal(selectedProductData.key))}</strong> | Other costs/unit: <strong>{formatMoney(getProductOtherCostTotal(selectedProductData.key))}</strong> | Profit/unit: <strong className={currentProfitPerUnit >= 0 ? "text-green-700" : "text-red-700"}>{formatMoney(currentProfitPerUnit)}</strong>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Labour Breakdown</div>
                <div className="mb-3 grid grid-cols-4 gap-2 items-end">
                  <div>
                    <div className="mb-1 text-xs text-slate-500">Hourly Rate (€)</div>
                    <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value) || 0)} className={inputClass} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-slate-500">Operators</div>
                    <input type="number" value={operatorAmount} onChange={(e) => setOperatorAmount(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
                  </div>
                  <div className="text-sm text-slate-600">Labour total: <strong>{formatMoney(currentLabourTotal)}</strong></div>
                  <div className="text-sm text-slate-600">Labour/unit: <strong>{formatMoney(getProductLabourCostPerUnit(selectedProductData))}</strong></div>
                </div>

                <div className="space-y-2">
                  {selectedProductData.machines.map((machine) => (
                    <div key={machine} className="grid grid-cols-3 gap-2 items-center">
                      <div className="capitalize text-sm text-slate-700">{machine}</div>
                      <input type="number" value={machineStaffing[machine] || 0} onChange={(e) => setMachineStaffing((prev) => ({ ...prev, [machine]: Number(e.target.value) || 0 }))} className={inputClass} placeholder="Staff" />
                      <input type="number" value={machineHours[machine] || 0} onChange={(e) => setMachineHours((prev) => ({ ...prev, [machine]: Number(e.target.value) || 0 }))} className={inputClass} placeholder="Hours" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Extra Labour</div>
                {(productExtraLabour[selectedProductData.key] || []).map((item, i) => (
                  <div key={i} className="mt-1 grid grid-cols-5 gap-2 items-center">
                    <input value={item.name} onChange={(e) => updateExtraLabour(selectedProductData.key, i, "name", e.target.value)} className={inputClass} placeholder="Task" />
                    <input type="number" value={item.staff} onChange={(e) => updateExtraLabour(selectedProductData.key, i, "staff", e.target.value)} className={inputClass} placeholder="Staff" />
                    <input type="number" value={item.hours} onChange={(e) => updateExtraLabour(selectedProductData.key, i, "hours", e.target.value)} className={inputClass} placeholder="Hours" />
                    <input type="number" value={item.rate} onChange={(e) => updateExtraLabour(selectedProductData.key, i, "rate", e.target.value)} className={inputClass} placeholder="Rate" />
                    <button onClick={() => removeExtraLabourFromProduct(selectedProductData.key, i)} className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">Remove</button>
                  </div>
                ))}
                <div className="mt-3 grid grid-cols-5 gap-2 items-center">
                  <input value={newExtraLabourByProduct[selectedProductData.key]?.name || ""} onChange={(e) => setNewExtraLabourByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { staff: 0, hours: 0, rate: hourlyRate }), name: e.target.value } }))} className={inputClass} placeholder="Extra labour task" />
                  <input type="number" value={newExtraLabourByProduct[selectedProductData.key]?.staff || 0} onChange={(e) => setNewExtraLabourByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "", hours: 0, rate: hourlyRate }), staff: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Staff" />
                  <input type="number" value={newExtraLabourByProduct[selectedProductData.key]?.hours || 0} onChange={(e) => setNewExtraLabourByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "", staff: 0, rate: hourlyRate }), hours: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Hours" />
                  <input type="number" value={newExtraLabourByProduct[selectedProductData.key]?.rate || hourlyRate} onChange={(e) => setNewExtraLabourByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "", staff: 0, hours: 0 }), rate: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Rate (€)" />
                  <button onClick={() => addExtraLabourToProduct(selectedProductData.key)} className="rounded bg-slate-700 px-3 py-2 text-sm text-white">+ Add Labour</button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Ingredients Breakdown</div>
                {selectedProductIngredients.length === 0 ? (
                  <p className="text-sm text-slate-500">No ingredients added yet</p>
                ) : (
                  <>
                    {selectedProductIngredients.map((item, i) => (
                      <div key={i} className="mt-1 grid grid-cols-4 gap-2 items-center">
                        <input value={item.name} onChange={(e) => updateIngredient(selectedProductData.key, i, "name", e.target.value)} className={inputClass} />
                        <input type="number" value={item.quantity} onChange={(e) => updateIngredient(selectedProductData.key, i, "quantity", e.target.value)} className={inputClass} placeholder="Qty" />
                        <input type="number" value={item.price} onChange={(e) => updateIngredient(selectedProductData.key, i, "price", e.target.value)} className={inputClass} placeholder="Price" />
                        <button onClick={() => removeIngredientFromProduct(selectedProductData.key, i)} className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">Remove</button>
                      </div>
                    ))}
                    <div className="mt-2 text-sm text-slate-700">
                      Ingredients total per unit: <strong>{formatMoney(getProductIngredientTotal(selectedProductData.key))}</strong>
                    </div>
                  </>
                )}

                <div className="mt-3 grid grid-cols-4 gap-2 items-center">
                  <input value={newIngredientByProduct[selectedProductData.key]?.name || ""} onChange={(e) => setNewIngredientByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { quantity: 0, price: 0 }), name: e.target.value } }))} className={inputClass} placeholder="Ingredient name" />
                  <input type="number" value={newIngredientByProduct[selectedProductData.key]?.quantity || 0} onChange={(e) => setNewIngredientByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "", price: 0 }), quantity: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Qty" />
                  <input type="number" value={newIngredientByProduct[selectedProductData.key]?.price || 0} onChange={(e) => setNewIngredientByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "", quantity: 0 }), price: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Price" />
                  <button onClick={() => addIngredientToProduct(selectedProductData.key)} className="rounded bg-green-600 px-3 py-2 text-sm text-white">+ Add Ingredient</button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Other Costs</div>
                {(productOtherCosts[selectedProductData.key] || []).map((item, i) => (
                  <div key={i} className="mt-1 grid grid-cols-3 gap-2 items-center">
                    <input value={item.name} onChange={(e) => updateOtherCost(selectedProductData.key, i, "name", e.target.value)} className={inputClass} />
                    <input type="number" value={item.amount} onChange={(e) => updateOtherCost(selectedProductData.key, i, "amount", e.target.value)} className={inputClass} placeholder="Amount (€)" />
                    <button onClick={() => removeOtherCostFromProduct(selectedProductData.key, i)} className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">Remove</button>
                  </div>
                ))}
                <div className="mt-3 grid grid-cols-3 gap-2 items-center">
                  <input value={newOtherCostByProduct[selectedProductData.key]?.name || ""} onChange={(e) => setNewOtherCostByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { amount: 0 }), name: e.target.value } }))} className={inputClass} placeholder="Other cost name" />
                  <input type="number" value={newOtherCostByProduct[selectedProductData.key]?.amount || 0} onChange={(e) => setNewOtherCostByProduct((prev) => ({ ...prev, [selectedProductData.key]: { ...(prev[selectedProductData.key] || { name: "" }), amount: Number(e.target.value) || 0 } }))} className={inputClass} placeholder="Amount (€)" />
                  <button onClick={() => addOtherCostToProduct(selectedProductData.key)} className="rounded bg-slate-700 px-3 py-2 text-sm text-white">+ Add Other Cost</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Save & Compare</h2>
            <div className="flex gap-2">
              <button onClick={saveScenario} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Save Scenario</button>
              <button onClick={() => setShowReportView((s) => !s)} className="rounded bg-slate-700 px-3 py-2 text-sm text-white">{showReportView ? "Hide Report" : "View Report"}</button>
              <button onClick={exportToCsv} className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">Export</button>
            </div>
          </div>
          {showReportView && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Species</th>
                    <th>Product</th>
                    <th>Weight</th>
                    <th>Profit</th>
                    <th>Cost/Unit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {savedScenarios.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2">{s.species}</td>
                      <td>{s.product}</td>
                      <td>{s.weight}</td>
                      <td>{formatMoney(s.profit)}</td>
                      <td>{formatMoney(s.costPerUnit)}</td>
                      <td><button onClick={() => deleteScenario(s.id)} className="text-xs text-red-600">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          © 2026 Fish Processing Calculator. All rights reserved.
        </div>
      </div>

    </div>
  );
}
