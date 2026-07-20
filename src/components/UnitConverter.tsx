import React, { useState, useEffect } from "react";
import { Scale, Ruler, Thermometer, Box, Grid3X3, Copy, Check, ArrowRightLeft, ArrowUpRight } from "lucide-react";
import { UnitCategory } from "../types";
import { CONVERSION_DATA, convertUnits } from "../utils/unitConverter";

interface UnitConverterProps {
  onLoadValue: (val: string) => void;
}

export default function UnitConverter({ onLoadValue }: UnitConverterProps) {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("cm");
  const [result, setResult] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-align units on category change
  useEffect(() => {
    const units = CONVERSION_DATA[category].units;
    if (units.length >= 2) {
      setFromUnit(units[0].value);
      setToUnit(units[1].value);
    }
  }, [category]);

  // Recalculate conversions on inputs update
  useEffect(() => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const converted = convertUnits(parsed, fromUnit, toUnit, category);
      // Format number beautifully (round to max 8 decimals to avoid floating point issues)
      const rounded = Math.round(converted * 100000000) / 100000000;
      setResult(rounded);
    } else {
      setResult(0);
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoriesList: { value: UnitCategory; label: string; icon: React.ReactNode }[] = [
    { value: "length", label: "Longitud", icon: <Ruler className="w-4 h-4" /> },
    { value: "weight", label: "Masa / Peso", icon: <Scale className="w-4 h-4" /> },
    { value: "temperature", label: "Temperatura", icon: <Thermometer className="w-4 h-4" /> },
    { value: "area", label: "Área", icon: <Grid3X3 className="w-4 h-4" /> },
    { value: "volume", label: "Volumen", icon: <Box className="w-4 h-4" /> },
  ];

  const activeCategoryData = CONVERSION_DATA[category];

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div id="unit-converter-panel" className="flex flex-col gap-5 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Category Tabs */}
      <div id="converter-tabs" className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
        {categoriesList.map((cat) => (
          <button
            key={cat.value}
            id={`tab-category-${cat.value}`}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              category === cat.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3">
        {/* Source Box */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">De:</label>
          <div className="flex rounded-xl border border-slate-250 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <input
              id="converter-input-val"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-1/2 p-3 bg-transparent text-sm sm:text-base font-semibold font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden border-r border-slate-200 dark:border-slate-800/80"
              placeholder="Valor"
            />
            <select
              id="converter-select-from"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-1/2 p-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              {activeCategoryData.units.map((unit) => (
                <option key={unit.value} value={unit.value} className="dark:bg-slate-900">
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
          <button
            id="converter-swap-units-btn"
            onClick={swapUnits}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
            title="Intercambiar unidades"
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90 md:rotate-0" />
          </button>
        </div>

        {/* Destination Box */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">A:</label>
          <div className="flex rounded-xl border border-slate-250 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div className="w-1/2 p-3 bg-slate-100/40 dark:bg-slate-900/40 text-sm sm:text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 select-all border-r border-slate-200 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap">
              {result}
            </div>
            <select
              id="converter-select-to"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-1/2 p-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              {activeCategoryData.units.map((unit) => (
                <option key={unit.value} value={unit.value} className="dark:bg-slate-900">
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 justify-between items-center">
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <span>Relación de escala para conversiones en tiempo real.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="converter-copy-result-btn"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resultado</span>
              </>
            )}
          </button>

          <button
            id="converter-load-to-calc-btn"
            onClick={() => onLoadValue(result.toString())}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer"
            title="Enviar este valor a la calculadora estándar"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Enviar a Calculadora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
