import { useMemo, useState } from "react";
import { Field, ResultBox, TInput, TSelect } from "@/components/site/tool-ui";

type UnitMap = Record<string, { label: string; factor: number }>;

function ConverterUI({ units, defaultFrom, defaultTo, custom }: {
  units: UnitMap; defaultFrom: string; defaultTo: string;
  custom?: (v: number, from: string, to: string) => number;
}) {
  const [v, setV] = useState("1");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const out = useMemo(() => {
    const n = +v;
    if (!isFinite(n)) return "";
    if (custom) return custom(n, from, to).toString();
    const base = n * units[from].factor;
    return (base / units[to].factor).toString();
  }, [v, from, to, units, custom]);
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="space-y-2">
        <TInput type="number" value={v} onChange={(e) => setV(e.target.value)} />
        <TSelect value={from} onChange={(e) => setFrom(e.target.value)}>
          {Object.entries(units).map(([k, u]) => <option key={k} value={k}>{u.label}</option>)}
        </TSelect>
      </div>
      <div className="hidden self-center text-2xl text-muted-foreground md:block">=</div>
      <div className="space-y-2">
        <ResultBox className="!p-3"><div className="font-mono text-lg">{out}</div></ResultBox>
        <TSelect value={to} onChange={(e) => setTo(e.target.value)}>
          {Object.entries(units).map(([k, u]) => <option key={k} value={k}>{u.label}</option>)}
        </TSelect>
      </div>
    </div>
  );
}

export function LengthConverter() { return <ConverterUI defaultFrom="m" defaultTo="ft" units={{
  mm: { label: "Millimeter (mm)", factor: 0.001 }, cm: { label: "Centimeter (cm)", factor: 0.01 },
  m: { label: "Meter (m)", factor: 1 }, km: { label: "Kilometer (km)", factor: 1000 },
  in: { label: "Inch (in)", factor: 0.0254 }, ft: { label: "Foot (ft)", factor: 0.3048 },
  yd: { label: "Yard (yd)", factor: 0.9144 }, mi: { label: "Mile (mi)", factor: 1609.344 },
}} />; }

export function WeightConverter() { return <ConverterUI defaultFrom="kg" defaultTo="lb" units={{
  mg: { label: "Milligram (mg)", factor: 0.000001 }, g: { label: "Gram (g)", factor: 0.001 },
  kg: { label: "Kilogram (kg)", factor: 1 }, t: { label: "Metric ton (t)", factor: 1000 },
  oz: { label: "Ounce (oz)", factor: 0.02834952 }, lb: { label: "Pound (lb)", factor: 0.4535924 },
}} />; }

export function TemperatureConverter() {
  const units: UnitMap = { c: { label: "Celsius (°C)", factor: 1 }, f: { label: "Fahrenheit (°F)", factor: 1 }, k: { label: "Kelvin (K)", factor: 1 } };
  return <ConverterUI defaultFrom="c" defaultTo="f" units={units} custom={(v, from, to) => {
    let c = v;
    if (from === "f") c = (v - 32) * (5 / 9);
    if (from === "k") c = v - 273.15;
    if (to === "c") return c;
    if (to === "f") return c * 9 / 5 + 32;
    return c + 273.15;
  }} />;
}

export function AreaConverter() { return <ConverterUI defaultFrom="m2" defaultTo="ft2" units={{
  m2: { label: "Sq meter (m²)", factor: 1 }, km2: { label: "Sq kilometer (km²)", factor: 1e6 },
  cm2: { label: "Sq centimeter (cm²)", factor: 0.0001 }, ft2: { label: "Sq foot (ft²)", factor: 0.092903 },
  yd2: { label: "Sq yard (yd²)", factor: 0.836127 }, acre: { label: "Acre", factor: 4046.86 },
  hectare: { label: "Hectare", factor: 10000 },
}} />; }

export function VolumeConverter() { return <ConverterUI defaultFrom="l" defaultTo="gal" units={{
  ml: { label: "Milliliter (mL)", factor: 0.001 }, l: { label: "Liter (L)", factor: 1 },
  m3: { label: "Cubic meter (m³)", factor: 1000 }, gal: { label: "US Gallon", factor: 3.78541 },
  qt: { label: "US Quart", factor: 0.946353 }, cup: { label: "US Cup", factor: 0.24 },
  floz: { label: "US Fluid ounce", factor: 0.0295735 },
}} />; }

export function SpeedConverter() { return <ConverterUI defaultFrom="kmh" defaultTo="mph" units={{
  ms: { label: "Meter/sec (m/s)", factor: 1 }, kmh: { label: "Kilometer/hour (km/h)", factor: 0.277778 },
  mph: { label: "Mile/hour (mph)", factor: 0.44704 }, knot: { label: "Knot", factor: 0.514444 },
  fts: { label: "Foot/sec (ft/s)", factor: 0.3048 },
}} />; }

export function TimeConverter() { return <ConverterUI defaultFrom="min" defaultTo="hr" units={{
  ms: { label: "Millisecond", factor: 0.001 }, s: { label: "Second", factor: 1 },
  min: { label: "Minute", factor: 60 }, hr: { label: "Hour", factor: 3600 },
  d: { label: "Day", factor: 86400 }, wk: { label: "Week", factor: 604800 },
  yr: { label: "Year", factor: 31536000 },
}} />; }

export function DataConverter() { return <ConverterUI defaultFrom="mb" defaultTo="gb" units={{
  b: { label: "Byte", factor: 1 }, kb: { label: "Kilobyte (KB)", factor: 1024 },
  mb: { label: "Megabyte (MB)", factor: 1024 ** 2 }, gb: { label: "Gigabyte (GB)", factor: 1024 ** 3 },
  tb: { label: "Terabyte (TB)", factor: 1024 ** 4 }, pb: { label: "Petabyte (PB)", factor: 1024 ** 5 },
}} />; }

export function PressureConverter() { return <ConverterUI defaultFrom="pa" defaultTo="psi" units={{
  pa: { label: "Pascal (Pa)", factor: 1 }, kpa: { label: "Kilopascal (kPa)", factor: 1000 },
  bar: { label: "Bar", factor: 100000 }, atm: { label: "Atmosphere (atm)", factor: 101325 },
  psi: { label: "PSI", factor: 6894.76 }, torr: { label: "Torr", factor: 133.322 },
}} />; }

export function EnergyConverter() { return <ConverterUI defaultFrom="j" defaultTo="cal" units={{
  j: { label: "Joule (J)", factor: 1 }, kj: { label: "Kilojoule (kJ)", factor: 1000 },
  cal: { label: "Calorie", factor: 4.184 }, kcal: { label: "Kilocalorie", factor: 4184 },
  wh: { label: "Watt-hour (Wh)", factor: 3600 }, kwh: { label: "Kilowatt-hour (kWh)", factor: 3.6e6 },
  ev: { label: "Electronvolt (eV)", factor: 1.602e-19 },
}} />; }
