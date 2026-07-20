import React from "react";
import { Trash2, History, CornerDownLeft, Clock } from "lucide-react";
import { HistoryItem } from "../types";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistorySidebar({
  history,
  onSelectHistoryItem,
  onClearHistory,
  isOpen,
  onToggle,
}: HistorySidebarProps) {
  return (
    <div
      id="history-sidebar-outer"
      className={`border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        isOpen ? "h-64 lg:h-auto lg:w-80" : "h-0 lg:h-auto lg:w-0 overflow-hidden border-none"
      } flex flex-col bg-slate-50 dark:bg-slate-900/40`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
          <History className="w-4 h-4 text-indigo-500" />
          <span>Historial de Operaciones</span>
          <span className="text-xs text-slate-400 font-mono">({history.length})</span>
        </div>

        {history.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={onClearHistory}
            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            title="Borrar todo el historial"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History Items List */}
      <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-2.5 max-h-52 lg:max-h-[380px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
            <Clock className="w-8 h-8 opacity-30 mb-2 stroke-1" />
            <p className="text-xs font-medium">Aún no hay cálculos registrados</p>
            <p className="text-[10px] opacity-75 mt-0.5">Las operaciones aparecerán aquí</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              onClick={() => onSelectHistoryItem(item)}
              className="group text-right p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col gap-1 shadow-xs relative overflow-hidden"
              title="Click para recuperar operación o resultado"
            >
              {/* Formula */}
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate pr-4">
                {item.expression}
              </div>

              {/* Result */}
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono flex items-center justify-end gap-1.5 pr-4">
                <span className="text-[10px] text-indigo-500/60 font-sans font-medium uppercase tracking-wider scale-95 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <CornerDownLeft className="w-3 h-3" /> Cargar
                </span>
                <span>{item.result}</span>
              </div>

              {/* Mini hover accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
