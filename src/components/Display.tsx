import React, { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { CalculatorMode } from "../types";

interface DisplayProps {
  expression: string;
  currentInput: string;
  result: string | null;
  isDegree: boolean;
  onToggleDegree: () => void;
  mode: CalculatorMode;
  error: string | null;
  memoryValue: number | null;
  onCopy: () => void;
}

export default function Display({
  expression,
  currentInput,
  result,
  isDegree,
  onToggleDegree,
  mode,
  error,
  memoryValue,
  onCopy,
}: DisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamically size the text based on the length of currentInput or error
  const getFontSizeClass = (text: string) => {
    if (text.length > 18) return "text-xl sm:text-2xl";
    if (text.length > 12) return "text-2xl sm:text-3xl";
    if (text.length > 8) return "text-3xl sm:text-4xl";
    return "text-4xl sm:text-5xl";
  };

  const activeText = error || result || currentInput || "0";

  return (
    <div
      id="calculator-display-container"
      className="relative w-full rounded-2xl bg-slate-900 dark:bg-slate-950 p-4 sm:p-6 shadow-inner flex flex-col justify-between border border-slate-800 h-44 sm:h-48 overflow-hidden select-all"
    >
      {/* Top Indicators Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wider">
        <div className="flex items-center gap-2">
          {/* Mode Indicator */}
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
            {mode === CalculatorMode.Standard
              ? "Estándar"
              : mode === CalculatorMode.Scientific
              ? "Científica"
              : "Conversor"}
          </span>

          {/* Memory Indicator */}
          {memoryValue !== null && (
            <span
              title={`Valor en Memoria: ${memoryValue}`}
              className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 text-[10px] flex items-center gap-1 border border-amber-800/50"
            >
              M
            </span>
          )}
        </div>

        {/* DEG / RAD toggle & Clipboard Operations */}
        <div className="flex items-center gap-3">
          {mode === CalculatorMode.Scientific && (
            <button
              id="deg-rad-toggle-btn"
              onClick={onToggleDegree}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold transition-colors cursor-pointer"
              title="Cambiar entre Grados (DEG) y Radianes (RAD)"
            >
              {isDegree ? "DEG" : "RAD"}
            </button>
          )}

          <button
            id="copy-to-clipboard-btn"
            onClick={handleCopyClick}
            disabled={!!error || !activeText}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copiar resultado"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Formula/Expression Area */}
      <div
        id="display-expression-log"
        className="text-right text-sm sm:text-base text-slate-400 font-mono font-medium truncate mt-2 h-6"
      >
        {expression || <span className="opacity-0">0</span>}
      </div>

      {/* Main Value Display */}
      <div className="text-right mt-1 flex flex-col justify-end flex-grow">
        {error ? (
          <div
            id="display-error-msg"
            className="text-rose-400 font-sans font-semibold text-xl sm:text-2xl flex items-center justify-end gap-1.5 animate-pulse"
          >
            <Info className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : (
          <div
            id="display-numerical-value"
            className={`font-mono font-bold text-white tracking-tight break-all select-all transition-all duration-150 ${getFontSizeClass(
              activeText
            )}`}
          >
            {activeText}
          </div>
        )}
      </div>

      {/* Subtle bottom shadow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
    </div>
  );
}
