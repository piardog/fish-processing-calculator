"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  key: string;
  name: string;
  source: "fillet" | "trim";
  species: string[];
  fishPerUnitKg: number;
  targetMargin: number;
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
  const router = useRouter();

  const [showReportView, setShowReportView] = useState(false);
  const [authStatus, setAuthStatus] = useState<"checking" | "loggedIn" | "loggedOut">("checking");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSpecies, setShowAddSpecies] = useState(false);

  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [fishType, setFishType] = useState("haddock");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fishWeight, setFishWeight] = useState(1000);
  const [filletPct, setFilletPct] = useState(42);
  const [trimPct, setTrimPct] = useState(18);
  const [wastePct, setWastePct] = useState(40);
  const [yieldMode, setYieldMode] = useState("typical");
  const [fishCostPerKg, setFishCostPerKg] = useState(4);
  const [fishSize, setFishSize] = useState("medium");
  const [hourlyRate, setHourlyRate] = useState(15);
  const [operatorAmount, setOperatorAmount] = useState(1);
  const [liveTargetMargin, setLiveTargetMargin] = useState(15);

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
      targetMargin: 20,
      machines: ["filleting", "packing"],
      note: "180g portion",
    },
    {
      key: "breadedFillets",
      name: "Breaded Fillets",
      source: "fillet",
      species: ["haddock"],
      fishPerUnitKg: 0.16,
      targetMargin: 18,
      machines: ["filleting", "breading", "packing"],
      note: "160g fish portion",
    },
    {
      key: "fishFingers",
      name: "Fish Fingers",
      source: "trim",
      species: ["haddock"],
      fishPerUnitKg: 0.025,
      targetMargin: 15,
      machines: ["mincer", "mixer", "former", "breading", "packing"],
      note: "25g fish per finger",
    },
    {
      key: "fishCakes",
      name: "Fish Cakes",
      source: "trim",
      species: ["haddock"],
      fishPerUnitKg: 0.072,
      targetMargin: 12,
      machines: ["mincer", "mixer", "packing"],
      note: "120g cake at 60% fish",
    },
    {
      key: "herringFillets",
      name: "Herring Fillets",
      source: "fillet",
      species: ["herring"],
      fishPerUnitKg: 0.14,
      targetMargin: 18,
      machines: ["filleting", "packing"],
      note: "Fresh packed herring fillets",
    },
    {
      key: "kippers",
      name: "Kippers",
      source: "fillet",
      species: ["herring"],
      fishPerUnitKg: 0.2,
      targetMargin: 22,
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
    targetMargin: 15,
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
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setAuthStatus("loggedOut");
          return;
        }

        setCurrentUserId(session.user.id);

        const { data, error } = await supabase
          .from("scenarios")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setSavedScenarios(data);
        }

        setAuthStatus("loggedIn");
      } catch (err) {
        console.error("Login check failed:", err);
        setAuthStatus("loggedOut");
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    const profile = fishProfiles[fishType as keyof typeof fishProfiles];

    let filletAdj = 0;
    let trimAdj = 0;

    if (fishSize === "small") {
      filletAdj = -3;
      trimAdj = 0;
    } else if (fishSize === "large") {
      filletAdj = +3;
      trimAdj = 0;
    }

    setFilletPct(profile.filletPct + filletAdj);
    if (yieldMode === "typical") {
      const adjustedFillet = Math.max(0, profile.filletPct + filletAdj);
      const adjustedTrim = Math.max(0, profile.trimPct + trimAdj);
      const adjustedWaste = Math.max(0, 100 - adjustedFillet - adjustedTrim);
      setFilletPct(adjustedFillet);
      setTrimPct(adjustedTrim);
      setWastePct(adjustedWaste);
    }
    setFishCostPerKg(profile.fishCostPerKg);
    if (selectedProduct && !productsForSpecies.some((p) => p.key === selectedProduct)) {
      setSelectedProduct("");
    }
  }, [fishType, fishSize, yieldMode]);

  const inputClass = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none";
  const cardClass = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm";
  const safeFishWeight = Math.max(0, Number(fishWeight) || 0);

  const totals = useMemo(() => {
    const filletKg = safeFishWeight * (filletPct / 100);
    const trimKg = safeFishWeight * (trimPct / 100);
    const wasteKg = safeFishWeight * (wastePct / 100);
    return { filletKg, trimKg, wasteKg };
  }, [safeFishWeight, filletPct, trimPct, wastePct]);

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

  const getProductFishCostPerUnit = (product: Product) => {
    return product.fishPerUnitKg * fishCostPerKg;
  };

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

  const getProductBreakEvenPrice = (product: Product) => {
    const fish = getProductFishCostPerUnit(product);
    const ingredient = getProductIngredientTotal(product.key);
    const other = getProductOtherCostTotal(product.key);
    const labour = getProductLabourCostPerUnit(product);
    return fish + ingredient + other + labour;
  };

  const getRequiredSellPrice = (product: Product) => {
    const breakEven = getProductBreakEvenPrice(product);
    return breakEven * (1 + liveTargetMargin / 100);
  };

  const getProductProfitPerUnit = (product: Product) => {
    return getRequiredSellPrice(product) - getProductBreakEvenPrice(product);
  };

  const getProductSafetyMargin = (product: Product) => {
    const breakEven = getProductBreakEvenPrice(product);
    return getRequiredSellPrice(product) - breakEven;
  };

  const getProductMarginPercent = (product: Product) => {
    const requiredSellPrice = getRequiredSellPrice(product);
    if (requiredSellPrice <= 0) return 0;
    return (getProductProfitPerUnit(product) / requiredSellPrice) * 100;
  };

  const getProductBreakEvenStatus = (product: Product) => {
    const safety = getProductSafetyMargin(product);
    const marginPercent = getProductMarginPercent(product);

    if (safety < 0) return { label: "Below break-even", className: "bg-red-100 text-red-800 border-red-200" };
    if (marginPercent < 10) return { label: "Very tight", className: "bg-amber-100 text-amber-800 border-amber-200" };
    return { label: "Safe", className: "bg-green-100 text-green-800 border-green-200" };
  };

  const getSavedScenarioStatusClass = (status: string) => {
    if (status === "Below break-even") return "text-red-700 font-semibold";
    if (status === "Very tight") return "text-amber-700 font-semibold";
    return "text-green-700 font-semibold";
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

  const saveScenario = async () => {
    if (!selectedProductData || !currentUserId) return;

    const scenario = {
      id: Date.now(),
      species: fishProfiles[fishType as keyof typeof fishProfiles].label,
      product: selectedProductData.name,
      weight: safeFishWeight,
      profit: getProductProfitPerUnit(selectedProductData) * getProductUnits(selectedProductData),
      costPerUnit: getProductBreakEvenPrice(selectedProductData),
      requiredSellPrice: getRequiredSellPrice(selectedProductData),
      targetMargin: liveTargetMargin,
      breakEvenPrice: getProductBreakEvenPrice(selectedProductData),
      safetyMargin: getProductSafetyMargin(selectedProductData),
      marginPercent: getProductMarginPercent(selectedProductData),
      status: getProductBreakEvenStatus(selectedProductData).label,
    };
    const { data, error } = await supabase
      .from("scenarios")
      .insert([
        {
          user_id: currentUserId,
          species: scenario.species,
          product: scenario.product,
          weight: scenario.weight,
          profit: scenario.profit,
          cost_per_unit: scenario.costPerUnit,
          required_sell_price: scenario.requiredSellPrice,
          target_margin: scenario.targetMargin,
          break_even_price: scenario.breakEvenPrice,
          safety_margin: scenario.safetyMargin,
          margin_percent: scenario.marginPercent,
          status: scenario.status,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      alert("Failed to save scenario");
      return;
    }

    if (data) {
      setSavedScenarios((prev) => [...data, ...prev]);
    }
  };

  const deleteScenario = async (id: number) => {
    const { error } = await supabase
      .from("scenarios")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
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

    const headers = ["Species", "Product", "Weight (kg)", "Break-even / Unit (€)", "Required Sell Price / Unit (€)", "Safety Margin / Unit (€)", "Profit (€)", "Margin %", "Status"];
    const rows = savedScenarios.map((s) => [
      s.species,
      s.product,
      s.weight,
      (s.break_even_price || s.cost_per_unit || s.costPerUnit || 0).toFixed(2),
      (s.required_sell_price || 0).toFixed(2),
      (s.safety_margin || 0).toFixed(2),
      Number(s.profit || 0).toFixed(2),
      Number(s.margin_percent || 0).toFixed(1),
      s.status || "",
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

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const currentProfitPerUnit = selectedProductData ? getProductProfitPerUnit(selectedProductData) : 0;
  const currentBreakEvenPrice = selectedProductData ? getProductBreakEvenPrice(selectedProductData) : 0;
  const currentSafetyMargin = selectedProductData ? getProductSafetyMargin(selectedProductData) : 0;
  const currentMarginPercent = selectedProductData ? getProductMarginPercent(selectedProductData) : 0;
  const currentBreakEvenStatus = selectedProductData ? getProductBreakEvenStatus(selectedProductData) : null;

  useEffect(() => {
    const product = productsForSpecies.find((p) => p.key === selectedProduct);
    if (product) {
      setLiveTargetMargin(product.targetMargin);
    }
  }, [selectedProduct]);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm text-slate-700">
          Loading calculator...
        </div>
      </div>
    );
  }

  if (authStatus === "loggedOut") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-3">Fish Processing Calculator</h1>
          <p className="text-slate-600 mb-6">
            Please log in to use the calculator.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded bg-slate-900 px-5 py-3 text-white text-sm hover:bg-slate-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentUnits = selectedProductData ? getProductUnits(selectedProductData) : 0;
  const currentLabourTotal = selectedProductData ? getMachineLabourTotal(selectedProductData) + getProductExtraLabourTotal(selectedProductData.key) : 0;

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
              <a href="/tutorial" className="hover:underline">Tutorial</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/disclaimer" className="hover:underline">Disclaimer</a>
              <a href="/contact" className="hover:underline">Contact</a>
              <button onClick={logout} className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-700">Logout</button>
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

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm leading-7 text-slate-200 max-w-3xl">
            <p>
              This tool is currently being tested and refined. If you would like access, or if you have feedback from a fish processing or seafood production background, please contact Dan at info@moonblogger.com.
            </p>
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
            <div className="mt-3 grid gap-3 md:grid-cols-3">
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
              <div>
                <div className="mb-1 text-sm">Fish Purchase Price €/kg</div>
                <input type="number" value={fishCostPerKg} onChange={(e) => setFishCostPerKg(Number(e.target.value) || 0)} className={inputClass} />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold">Yield Settings</div>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => setYieldMode("typical")}
                    className={`rounded px-3 py-2 ${yieldMode === "typical" ? "bg-slate-900 text-white" : "bg-white border"}`}
                  >
                    Use Typical Yields
                  </button>
                  <button
                    onClick={() => setYieldMode("manual")}
                    className={`rounded px-3 py-2 ${yieldMode === "manual" ? "bg-slate-900 text-white" : "bg-white border"}`}
                  >
                    Enter My Own Yields
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <div className="mb-1 text-sm">Fillet %</div>
                  <input
                    type="number"
                    value={filletPct}
                    disabled={yieldMode === "typical"}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setFilletPct(value);
                      setWastePct(Math.max(0, 100 - value - trimPct));
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm">Trim %</div>
                  <input
                    type="number"
                    value={trimPct}
                    disabled={yieldMode === "typical"}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setTrimPct(value);
                      setWastePct(Math.max(0, 100 - filletPct - value));
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm">Waste %</div>
                  <input
                    type="number"
                    value={wastePct}
                    disabled={yieldMode === "typical"}
                    onChange={(e) => setWastePct(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                <div>Fillets: <strong>{totals.filletKg.toFixed(2)} kg</strong></div>
                <div>Trim: <strong>{totals.trimKg.toFixed(2)} kg</strong></div>
                <div>Waste: <strong>{totals.wasteKg.toFixed(2)} kg</strong></div>
              </div>
            </div>

            <div className="mt-2 text-sm text-slate-600">
              Total raw fish cost: <strong>{formatMoney(safeFishWeight * fishCostPerKg)}</strong>
            </div>
            <div className="mt-2 text-xs text-slate-500">▲ = profitable per unit, ▼ = loss per unit</div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-6">
              <strong>Yield Assumptions:</strong><br />
              Fillet %, Trim %, and Waste are estimated based on typical industry yields for each species.<br />
              <br />
              <strong>Fillet %</strong> = usable prime cuts<br />
              <strong>Trim %</strong> = offcuts used for secondary products (fingers, cakes, etc.)<br />
              <strong>Waste</strong> = heads, bones, skin, loss<br />
              <br />
              These values can vary depending on fish size, quality, and processing method.
            </div>

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
                    <div className="mb-1 text-sm">Target Margin %</div>
                    <input
                      type="number"
                      value={newProduct.targetMargin}
                      onChange={(e) => setNewProduct({ ...newProduct, targetMargin: Number(e.target.value) || 0 })}
                      className={inputClass}
                    />
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
                    setNewProduct({ key: "", name: "", source: "trim", species: fishType, fishPerUnitKg: 0, targetMargin: 15, note: "" });
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
                  Units: <strong>{currentUnits}</strong> | Fish cost/unit: <strong>{formatMoney(getProductFishCostPerUnit(selectedProductData))}</strong> | Labour/unit: <strong>{formatMoney(getProductLabourCostPerUnit(selectedProductData))}</strong> | Ingredients/unit: <strong>{formatMoney(getProductIngredientTotal(selectedProductData.key))}</strong> | Other costs/unit: <strong>{formatMoney(getProductOtherCostTotal(selectedProductData.key))}</strong> | Profit/unit: <strong className={currentProfitPerUnit >= 0 ? "text-green-700" : "text-red-700"}>{formatMoney(currentProfitPerUnit)}</strong>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">Break-Even Analysis</h3>
                      <p className="text-sm text-slate-600">
                        This shows the minimum selling price needed before this product starts making money.
                      </p>
                    </div>
                    {currentBreakEvenStatus && (
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${currentBreakEvenStatus.className}`}>
                        {currentBreakEvenStatus.label}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Break-even price/unit</div>
                      <div className="text-lg font-bold text-slate-900">{formatMoney(currentBreakEvenPrice)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Required sell price/unit</div>
                      <div className="text-lg font-bold text-slate-900">{formatMoney(getRequiredSellPrice(selectedProductData))}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Safety margin/unit</div>
                      <div className={`text-lg font-bold ${currentSafetyMargin >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {formatMoney(currentSafetyMargin)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500 mb-2">Target margin %</div>
                      <input
                        type="number"
                        value={liveTargetMargin}
                        onChange={(e) => setLiveTargetMargin(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    If your selling price falls below <strong>{formatMoney(currentBreakEvenPrice)}</strong> per unit, this product is likely to lose money based on the current fish, labour, ingredient, and other cost figures.
                  </div>
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
              <div className="flex flex-wrap gap-2">
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
                      <th>Break-even/Unit</th>
                      <th>Required Sell Price</th>
                      <th>Safety Margin</th>
                      <th>Profit</th>
                      <th>Margin %</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedScenarios.map((s) => (
                      <tr key={s.id} className="border-b">
                        <td className="py-2">{s.species}</td>
                        <td>{s.product}</td>
                        <td>{s.weight}</td>
                        <td>{formatMoney(s.break_even_price || s.cost_per_unit || s.costPerUnit)}</td>
                        <td>{formatMoney(s.required_sell_price || 0)}</td>
                        <td className={(s.safety_margin || 0) >= 0 ? "text-green-700" : "text-red-700"}>{formatMoney(s.safety_margin || 0)}</td>
                        <td>{formatMoney(s.profit)}</td>
                        <td>{Number(s.margin_percent || 0).toFixed(1)}%</td>
                        <td className={getSavedScenarioStatusClass(s.status || "")}>{s.status || ""}</td>
                        <td>
                          <button onClick={() => deleteScenario(s.id)} className="text-xs text-red-600">Delete</button>
                        </td>
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
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-600 text-center">
          © Fish Processing Calculator
        </div>
      </div>
    </div>
  );
}
