import { UnitCategory, Unit } from "../types";

export const CONVERSION_DATA: Record<UnitCategory, { label: string; units: Unit[] }> = {
  length: {
    label: "Longitud",
    units: [
      { value: "m", label: "Metros (m)", factor: 1 },
      { value: "km", label: "Kilómetros (km)", factor: 1000 },
      { value: "cm", label: "Centímetros (cm)", factor: 0.01 },
      { value: "mm", label: "Milímetros (mm)", factor: 0.001 },
      { value: "inch", label: "Pulgadas (in)", factor: 0.0254 },
      { value: "ft", label: "Pies (ft)", factor: 0.3048 },
      { value: "yd", label: "Yardas (yd)", factor: 0.9144 },
      { value: "mi", label: "Millas (mi)", factor: 1609.344 },
    ],
  },
  weight: {
    label: "Peso / Masa",
    units: [
      { value: "kg", label: "Kilogramos (kg)", factor: 1 },
      { value: "g", label: "Gramos (g)", factor: 0.001 },
      { value: "mg", label: "Miligramos (mg)", factor: 0.000001 },
      { value: "lb", label: "Libras (lb)", factor: 0.45359237 },
      { value: "oz", label: "Onzas (oz)", factor: 0.028349523125 },
      { value: "ton", label: "Toneladas (t)", factor: 1000 },
    ],
  },
  temperature: {
    label: "Temperatura",
    units: [
      { value: "C", label: "Celsius (°C)", factor: 1 },
      { value: "F", label: "Fahrenheit (°F)", factor: 1 },
      { value: "K", label: "Kelvin (K)", factor: 1 },
    ],
  },
  area: {
    label: "Área",
    units: [
      { value: "m2", label: "Metros cuadrados (m²)", factor: 1 },
      { value: "km2", label: "Kilómetros cuadrados (km²)", factor: 1000000 },
      { value: "cm2", label: "Centímetros cuadrados (cm²)", factor: 0.0001 },
      { value: "hectare", label: "Hectáreas (ha)", factor: 10000 },
      { value: "acre", label: "Acres (ac)", factor: 4046.8564224 },
      { value: "sqft", label: "Pies cuadrados (sq ft)", factor: 0.09290304 },
    ],
  },
  volume: {
    label: "Volumen",
    units: [
      { value: "l", label: "Litros (L)", factor: 1 },
      { value: "ml", label: "Mililitros (mL)", factor: 0.001 },
      { value: "m3", label: "Metros cúbicos (m³)", factor: 1000 },
      { value: "gal", label: "Galones (gal US)", factor: 3.785411784 },
      { value: "qt", label: "Cuartos (qt US)", factor: 0.946352946 },
      { value: "cup", label: "Tazas (cup US)", factor: 0.2365882365 },
    ],
  },
};

export function convertUnits(
  value: number,
  fromUnitCode: string,
  toUnitCode: string,
  category: UnitCategory
): number {
  if (isNaN(value)) return 0;
  if (fromUnitCode === toUnitCode) return value;

  const catData = CONVERSION_DATA[category];
  if (!catData) return 0;

  const fromUnit = catData.units.find((u) => u.value === fromUnitCode);
  const toUnit = catData.units.find((u) => u.value === toUnitCode);

  if (!fromUnit || !toUnit) return 0;

  // Custom temperature conversions
  if (category === "temperature") {
    let celsius = value;
    if (fromUnitCode === "F") {
      celsius = ((value - 32) * 5) / 9;
    } else if (fromUnitCode === "K") {
      celsius = value - 273.15;
    }

    if (toUnitCode === "C") {
      return celsius;
    } else if (toUnitCode === "F") {
      return (celsius * 9) / 5 + 32;
    } else if (toUnitCode === "K") {
      return celsius + 273.15;
    }
    return 0;
  }

  // General conversions relative to base factor
  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}
