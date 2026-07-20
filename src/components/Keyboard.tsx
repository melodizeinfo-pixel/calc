import React from "react";
import { motion } from "motion/react";
import { Delete, Hash } from "lucide-react";
import { CalculatorMode } from "../types";

interface KeyboardProps {
  mode: CalculatorMode;
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onFunction: (func: string) => void;
  onConstant: (constant: string) => void;
  onOpenParenthesis: () => void;
  onCloseParenthesis: () => void;
  onClear: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onCalculate: () => void;
  onMemory: (action: "MC" | "MR" | "M+" | "M-" | "MS") => void;
}

export default function Keyboard({
  mode,
  onDigit,
  onOperator,
  onFunction,
  onConstant,
  onOpenParenthesis,
  onCloseParenthesis,
  onClear,
  onClearEntry,
  onBackspace,
  onToggleSign,
  onCalculate,
  onMemory,
}: KeyboardProps) {
  // Common key interactive animation
  const buttonVariants = {
    tap: { scale: 0.94, y: 1 },
    hover: { scale: 1.02 },
  };

  const numberKeys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."];

  // Helper for button classes
  const getButtonClass = (val: string, type: "number" | "operator" | "scientific" | "action" | "equals") => {
    const base =
      "flex items-center justify-center font-semibold rounded-xl text-sm sm:text-base transition-colors py-3 sm:py-4 select-none cursor-pointer border";

    switch (type) {
      case "equals":
        return `${base} bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border-indigo-700 shadow-md col-span-1`;
      case "action":
        return `${base} bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20 font-bold`;
      case "operator":
        return `${base} bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/50`;
      case "scientific":
        return `${base} bg-blue-500/5 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/10 font-mono text-xs sm:text-sm`;
      case "number":
      default:
        return `${base} bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-100 border-slate-250 dark:border-slate-800/80 shadow-xs`;
    }
  };

  const memoryButtons: Array<"MC" | "MR" | "M+" | "M-" | "MS"> = ["MC", "MR", "M+", "M-", "MS"];

  return (
    <div id="calculator-keyboard-container" className="flex flex-col gap-3">
      {/* Memory Panel */}
      {mode !== CalculatorMode.Converter && (
        <div id="memory-buttons-panel" className="grid grid-cols-5 gap-2 px-1">
          {memoryButtons.map((m) => (
            <motion.button
              key={m}
              id={`memory-${m.toLowerCase()}-btn`}
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onMemory(m)}
              className="py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-250 dark:border-slate-800/70 transition-all cursor-pointer"
            >
              {m}
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Keys Grid */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Scientific Section */}
        {mode === CalculatorMode.Scientific && (
          <div
            id="scientific-keys-grid"
            className="grid grid-cols-5 lg:grid-cols-3 gap-2 flex-1 animate-fade-in"
          >
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("sin")}
              className={getButtonClass("sin", "scientific")}
              title="Seno"
            >
              sin
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("cos")}
              className={getButtonClass("cos", "scientific")}
              title="Coseno"
            >
              cos
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("tan")}
              className={getButtonClass("tan", "scientific")}
              title="Tangente"
            >
              tan
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("log")}
              className={getButtonClass("log", "scientific")}
              title="Logaritmo Base 10"
            >
              log
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("ln")}
              className={getButtonClass("ln", "scientific")}
              title="Logaritmo Natural"
            >
              ln
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("sqrt")}
              className={getButtonClass("sqrt", "scientific")}
              title="Raíz Cuadrada (√)"
            >
              √
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onOperator("^")}
              className={getButtonClass("x^y", "scientific")}
              title="Elevar a potencia"
            >
              x<sup>y</sup>
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("fact")}
              className={getButtonClass("n!", "scientific")}
              title="Factorial"
            >
              n!
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onFunction("abs")}
              className={getButtonClass("abs", "scientific")}
              title="Valor Absoluto"
            >
              abs
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onConstant("π")}
              className={getButtonClass("π", "scientific")}
              title="Constante Pi (π)"
            >
              π
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onConstant("e")}
              className={getButtonClass("e", "scientific")}
              title="Constante de Euler (e)"
            >
              e
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onOperator("%")}
              className={getButtonClass("%", "scientific")}
              title="Porcentaje o Módulo"
            >
              mod
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={onOpenParenthesis}
              className={getButtonClass("(", "scientific")}
              title="Paréntesis de Apertura"
            >
              (
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={onCloseParenthesis}
              className={getButtonClass(")", "scientific")}
              title="Paréntesis de Cierre"
            >
              )
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
              onClick={() => onOperator("%")}
              className={getButtonClass("%", "scientific")}
              title="Porcentaje"
            >
              %
            </motion.button>
          </div>
        )}

        {/* Standard Numeric and Operator Section */}
        <div
          id="standard-keys-grid"
          className={`grid grid-cols-4 gap-2 ${
            mode === CalculatorMode.Scientific ? "w-full lg:w-[60%]" : "w-full"
          }`}
        >
          {/* Row 1 */}
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={onClearEntry}
            className={getButtonClass("CE", "action")}
            title="Borrar entrada actual"
          >
            CE
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={onClear}
            className={getButtonClass("C", "action")}
            title="Borrar todo"
          >
            C
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={onBackspace}
            className={getButtonClass("⌫", "action")}
            title="Retroceso"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onOperator("/")}
            className={getButtonClass("/", "operator")}
            title="Dividir"
          >
            ÷
          </motion.button>

          {/* Row 2 */}
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("7")}
            className={getButtonClass("7", "number")}
          >
            7
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("8")}
            className={getButtonClass("8", "number")}
          >
            8
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("9")}
            className={getButtonClass("9", "number")}
          >
            9
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onOperator("*")}
            className={getButtonClass("*", "operator")}
            title="Multiplicar"
          >
            ×
          </motion.button>

          {/* Row 3 */}
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("4")}
            className={getButtonClass("4", "number")}
          >
            4
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("5")}
            className={getButtonClass("5", "number")}
          >
            5
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("6")}
            className={getButtonClass("6", "number")}
          >
            6
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onOperator("-")}
            className={getButtonClass("-", "operator")}
            title="Restar"
          >
            -
          </motion.button>

          {/* Row 4 */}
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("1")}
            className={getButtonClass("1", "number")}
          >
            1
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("2")}
            className={getButtonClass("2", "number")}
          >
            2
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("3")}
            className={getButtonClass("3", "number")}
          >
            3
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onOperator("+")}
            className={getButtonClass("+", "operator")}
            title="Sumar"
          >
            +
          </motion.button>

          {/* Row 5 */}
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={onToggleSign}
            className={getButtonClass("+/-", "operator")}
            title="Alternar Signo Positivo/Negativo"
          >
            ±
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit("0")}
            className={getButtonClass("0", "number")}
          >
            0
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={() => onDigit(".")}
            className={getButtonClass(".", "number")}
          >
            .
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            onClick={onCalculate}
            className={getButtonClass("=", "equals")}
            title="Calcular"
          >
            =
          </motion.button>
        </div>
      </div>
    </div>
  );
}
