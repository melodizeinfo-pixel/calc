export enum CalculatorMode {
  Standard = "STANDARD",
  Scientific = "SCIENTIFIC",
  Converter = "CONVERTER",
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface MemoryValue {
  value: number;
  timestamp: Date;
}

export type UnitCategory = "length" | "weight" | "temperature" | "area" | "volume";

export interface Unit {
  value: string;
  label: string;
  factor: number; // relative to base unit, or custom converter fn
}
