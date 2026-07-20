import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  Compass,
  History,
  Moon,
  Sun,
  Layers,
  HelpCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { CalculatorMode, HistoryItem } from "./types";
import { evaluateExpression } from "./utils/mathEvaluator";
import Display from "./components/Display";
import Keyboard from "./components/Keyboard";
import HistorySidebar from "./components/HistorySidebar";
import UnitConverter from "./components/UnitConverter";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("calc_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "light"; // Clean high-contrast light theme by default
  });

  // Mode and expression state
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.Standard);
  const [expression, setExpression] = useState<string>("");
  const [currentInput, setCurrentInput] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDegree, setIsDegree] = useState<boolean>(true);
  const [memoryValue, setMemoryValue] = useState<number | null>(() => {
    const saved = localStorage.getItem("calc_memory");
    return saved ? parseFloat(saved) : null;
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("calc_history");
    if (saved) {
      try {
        return JSON.parse(saved).map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Sync memory & history to local storage
  useEffect(() => {
    if (memoryValue !== null) {
      localStorage.setItem("calc_memory", memoryValue.toString());
    } else {
      localStorage.removeItem("calc_memory");
    }
  }, [memoryValue]);

  useEffect(() => {
    localStorage.setItem("calc_history", JSON.stringify(history));
  }, [history]);

  // Sync dark class on theme change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("calc_theme", theme);
  }, [theme]);

  // CORE STATE MODIFIERS
  const handleDigit = useCallback(
    (digit: string) => {
      setError(null);

      // If a previous result was calculated and we type a digit, start fresh
      if (result !== null) {
        setResult(null);
        setExpression("");
        setCurrentInput(digit === "." ? "0." : digit);
        return;
      }

      // Prevent multiple decimals in the currently active number token
      if (digit === ".") {
        // Split input by space or operator to check the last token
        const tokens = currentInput.split(/[\+\-\*\/\^\(\)]/);
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.includes(".")) return;
        if (!currentInput || /[\+\-\*\/\^]$/.test(currentInput)) {
          setCurrentInput((prev) => prev + "0.");
          return;
        }
      }

      // Avoid double zeros at the beginning
      if (digit === "0" && currentInput === "0") return;
      if (currentInput === "0" && digit !== ".") {
        setCurrentInput(digit);
        return;
      }

      // Max input size guard
      if (currentInput.length > 30) return;

      setCurrentInput((prev) => prev + digit);
    },
    [currentInput, result]
  );

  const handleOperator = useCallback(
    (op: string) => {
      setError(null);
      let baseVal = currentInput;

      // If we have a result, we chaining-continue using the result as baseline
      if (result !== null) {
        baseVal = result;
        setExpression(result + ` ${op} `);
        setResult(null);
        setCurrentInput("");
        return;
      }

      if (!baseVal) {
        // If expression is also empty, start with 0
        if (!expression) {
          setExpression(`0 ${op} `);
          return;
        }
        // If expression ends with an operator, replace it
        if (/[\+\-\*\/\^\%]\s*$/.test(expression)) {
          setExpression((prev) => prev.replace(/[\+\-\*\/\^\%]\s*$/, `${op} `));
          return;
        }
        // Otherwise append operator
        setExpression((prev) => prev + ` ${op} `);
        return;
      }

      setExpression((prev) => prev + baseVal + ` ${op} `);
      setCurrentInput("");
    },
    [currentInput, expression, result]
  );

  const handleFunction = useCallback(
    (func: string) => {
      setError(null);

      if (func === "fact") {
        // Factorial is postfix '!'
        if (result !== null) {
          setExpression(`${result}!`);
          setCurrentInput("");
          setResult(null);
          try {
            const res = evaluateExpression(`${result}!`, isDegree);
            setResult(res.toString());
          } catch (err: any) {
            setError(err.message || "Error");
          }
          return;
        }
        if (!currentInput) {
          setCurrentInput("0!");
        } else {
          setCurrentInput((prev) => prev + "!");
        }
        return;
      }

      // Prefix functions: sin, cos, tan, log, ln, sqrt, abs
      if (result !== null) {
        setCurrentInput(`${func}(${result})`);
        setExpression("");
        setResult(null);
        return;
      }

      if (!currentInput) {
        setCurrentInput(`${func}(`);
      } else {
        // Wrap whatever is currently in input
        setCurrentInput(`${func}(${currentInput})`);
      }
    },
    [currentInput, result, isDegree]
  );

  const handleConstant = useCallback(
    (constant: string) => {
      setError(null);
      if (result !== null) {
        setCurrentInput(constant);
        setExpression("");
        setResult(null);
        return;
      }

      // Check if it should multiply implicitly or just set
      if (currentInput && /[0-9\)]$/.test(currentInput)) {
        setCurrentInput((prev) => prev + " * " + constant);
      } else {
        setCurrentInput((prev) => prev + constant);
      }
    },
    [currentInput, result]
  );

  const handleOpenParenthesis = useCallback(() => {
    setError(null);
    if (result !== null) {
      setCurrentInput("(");
      setExpression("");
      setResult(null);
      return;
    }
    setCurrentInput((prev) => prev + "(");
  }, [result]);

  const handleCloseParenthesis = useCallback(() => {
    setError(null);
    setCurrentInput((prev) => prev + ")");
  }, []);

  const handleClear = useCallback(() => {
    setExpression("");
    setCurrentInput("");
    setResult(null);
    setError(null);
  }, []);

  const handleClearEntry = useCallback(() => {
    setCurrentInput("");
    setError(null);
  }, []);

  const handleBackspace = useCallback(() => {
    if (error) {
      setError(null);
      return;
    }
    if (result !== null) {
      setExpression("");
      setResult(null);
      return;
    }
    setCurrentInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ""));
  }, [error, result]);

  const handleToggleSign = useCallback(() => {
    if (result !== null) {
      const valueNum = parseFloat(result);
      if (!isNaN(valueNum)) {
        setResult((-valueNum).toString());
      }
      return;
    }

    if (!currentInput) {
      setCurrentInput("-");
      return;
    }

    if (currentInput.startsWith("-")) {
      setCurrentInput(currentInput.substring(1));
    } else {
      setCurrentInput("-" + currentInput);
    }
  }, [currentInput, result]);

  const handleCalculate = useCallback(() => {
    if (!currentInput && !expression) return;
    setError(null);

    // Form complete math expression string
    const fullExpr = expression + currentInput;

    // Check if the expression has unbalanced parenthesis, append close ones if helpful
    let openCount = (fullExpr.match(/\(/g) || []).length;
    let closeCount = (fullExpr.match(/\)/g) || []).length;
    let balancedExpr = fullExpr;
    while (openCount > closeCount) {
      balancedExpr += ")";
      closeCount++;
    }

    try {
      const rawResult = evaluateExpression(balancedExpr, isDegree);
      // Format the output
      let finalResString: string;
      if (Math.abs(rawResult) < 1e-9 && rawResult !== 0) {
        finalResString = rawResult.toExponential(6);
      } else if (Math.abs(rawResult) > 1e12) {
        finalResString = rawResult.toExponential(6);
      } else {
        // Standard rounding to 10 decimal places to eliminate floating point noise
        finalResString = (Math.round(rawResult * 1e10) / 1e10).toString();
      }

      setResult(finalResString);
      setExpression(balancedExpr + " =");

      // Save to history list
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression: balancedExpr,
        result: finalResString,
        timestamp: new Date(),
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

      // Set input clean for next trigger
      setCurrentInput("");
    } catch (err: any) {
      setError(err.message || "Error de sintaxis");
    }
  }, [currentInput, expression, isDegree]);

  const handleMemory = useCallback(
    (action: "MC" | "MR" | "M+" | "M-" | "MS") => {
      setError(null);
      const activeValue = parseFloat(result || currentInput || "0");

      switch (action) {
        case "MC":
          setMemoryValue(null);
          break;
        case "MR":
          if (memoryValue !== null) {
            setCurrentInput(memoryValue.toString());
            setResult(null);
          }
          break;
        case "M+":
          if (!isNaN(activeValue)) {
            setMemoryValue((prev) => (prev !== null ? prev + activeValue : activeValue));
          }
          break;
        case "M-":
          if (!isNaN(activeValue)) {
            setMemoryValue((prev) => (prev !== null ? prev - activeValue : -activeValue));
          }
          break;
        case "MS":
          if (!isNaN(activeValue)) {
            setMemoryValue(activeValue);
          }
          break;
      }
    },
    [currentInput, result, memoryValue]
  );

  // Sync converter results back into the calculator display
  const handleLoadValueFromConverter = (val: string) => {
    setCurrentInput(val);
    setResult(null);
    setExpression("");
    setError(null);
    setMode(CalculatorMode.Standard); // Switch back to calculator standard mode
  };

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent keyboard triggers when typing in input boxes (like the unit converter)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        handleDigit(key);
      } else if (key === ".") {
        handleDigit(".");
      } else if (key === "+") {
        handleOperator("+");
      } else if (key === "-") {
        handleOperator("-");
      } else if (key === "*") {
        handleOperator("*");
      } else if (key === "/") {
        handleOperator("/");
      } else if (key === "%") {
        handleOperator("%");
      } else if (key === "^") {
        handleOperator("^");
      } else if (key === "(") {
        handleOpenParenthesis();
      } else if (key === ")") {
        handleCloseParenthesis();
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        handleBackspace();
      } else if (key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleDigit,
    handleOperator,
    handleOpenParenthesis,
    handleCloseParenthesis,
    handleCalculate,
    handleBackspace,
    handleClear,
  ]);

  const handleCopyResultToClipboard = () => {
    const valueToCopy = error || result || currentInput || "0";
    navigator.clipboard.writeText(valueToCopy);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-350 font-sans antialiased pb-12">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

      {/* Header Bar */}
      <header className="relative w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-6 shrink-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <Calculator className="w-5 h-5 stroke-2" />
            </div>
            <div>
              <h1 className="font-sans font-bold tracking-tight text-lg leading-tight text-slate-900 dark:text-white">
                Calculadora
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Estándar, Científica y Conversor</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Help Button */}
            <button
              id="help-toggle-btn"
              onClick={() => setShowHelp((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-all cursor-pointer"
              title="Información de Atajos y Funciones"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Light/Dark Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-all cursor-pointer"
              title="Cambiar Tema"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="relative flex-grow flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Mode Selector Tabs */}
          <div
            id="calculator-mode-selector"
            className="grid grid-cols-3 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-250 dark:border-slate-800 shadow-xs max-w-md mx-auto w-full"
          >
            {[
              { value: CalculatorMode.Standard, label: "Estándar", icon: <Calculator className="w-3.5 h-3.5" /> },
              {
                value: CalculatorMode.Scientific,
                label: "Científica",
                icon: <Compass className="w-3.5 h-3.5" />,
              },
              { value: CalculatorMode.Converter, label: "Conversor", icon: <Layers className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.value}
                id={`mode-tab-${tab.value.toLowerCase()}`}
                onClick={() => {
                  setMode(tab.value);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  mode === tab.value
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Master View Box */}
          <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-xs">
            {/* Left Column: Displays & Inputs (Standard/Scientific Keys OR Unit Converter UI) */}
            <div className="flex-grow p-5 sm:p-7 flex flex-col gap-5">
              {mode === CalculatorMode.Converter ? (
                <motion.div
                  key="converter-mode-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UnitConverter onLoadValue={handleLoadValueFromConverter} />
                </motion.div>
              ) : (
                <div id="calculator-interface-block" className="flex flex-col gap-5">
                  {/* Digital Screen Component */}
                  <Display
                    expression={expression}
                    currentInput={currentInput}
                    result={result}
                    isDegree={isDegree}
                    onToggleDegree={() => setIsDegree((prev) => !prev)}
                    mode={mode}
                    error={error}
                    memoryValue={memoryValue}
                    onCopy={handleCopyResultToClipboard}
                  />

                  {/* Keyboard Component */}
                  <Keyboard
                    mode={mode}
                    onDigit={handleDigit}
                    onOperator={handleOperator}
                    onFunction={handleFunction}
                    onConstant={handleConstant}
                    onOpenParenthesis={handleOpenParenthesis}
                    onCloseParenthesis={handleCloseParenthesis}
                    onClear={handleClear}
                    onClearEntry={handleClearEntry}
                    onBackspace={handleBackspace}
                    onToggleSign={handleToggleSign}
                    onCalculate={handleCalculate}
                    onMemory={handleMemory}
                  />
                </div>
              )}

              {/* Drawer Toggle Button (placed at bottom left row) */}
              {mode !== CalculatorMode.Converter && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span>Calculadora Activa (Modo {isDegree ? "DEG" : "RAD"})</span>
                  </span>

                  <button
                    id="history-toggle-sidebar-btn"
                    onClick={() => setIsHistoryOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isHistoryOpen ? "Ocultar Historial" : "Ver Historial"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Sliding operations log sidebar */}
            {mode !== CalculatorMode.Converter && (
              <HistorySidebar
                history={history}
                onSelectHistoryItem={(item) => {
                  setCurrentInput(item.result);
                  setExpression("");
                  setResult(null);
                  setError(null);
                }}
                onClearHistory={() => setHistory([])}
                isOpen={isHistoryOpen}
                onToggle={() => setIsHistoryOpen((prev) => !prev)}
              />
            )}
          </div>

          {/* Help Overlay Drawer */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Guía de Atajos y Operaciones
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">💻 Atajos de Teclado</h4>
                    <ul className="space-y-1.5 font-medium">
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          0-9
                        </kbd>{" "}
                        /{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          .
                        </kbd>{" "}
                        : Ingresar números y decimal
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          +
                        </kbd>{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          -
                        </kbd>{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          *
                        </kbd>{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          /
                        </kbd>{" "}
                        : Operadores aritméticos
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          Enter
                        </kbd>{" "}
                        /{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          =
                        </kbd>{" "}
                        : Calcular resultado
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          Backspace
                        </kbd>{" "}
                        : Borrar último carácter
                      </li>
                      <li>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                          Esc
                        </kbd>{" "}
                        : Limpiar pantalla completa
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">🔬 Operaciones Científicas</h4>
                    <p className="mb-2 leading-relaxed">
                      Soporte de sintaxis flexible. Puedes escribir números y aplicarles funciones o anidarlas con paréntesis:
                    </p>
                    <ul className="space-y-1.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      <li>• sin(45) + cos(45)</li>
                      <li>• sqrt(144) * log(100)</li>
                      <li>• 5! - abs(-10)</li>
                      <li>• 2 ^ 10 * π</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding block */}
      <footer className="w-full shrink-0 text-center text-xs text-slate-400 py-4 select-none">
        <p>© 2026 Calculadora Premium. Diseñada con precisión y fluidez.</p>
      </footer>
    </div>
  );
}
