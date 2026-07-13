import { useMemo, useState } from "react";
import { Copy, Download, RotateCcw, Play } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, Stat, TButton, TInput, TSelect, copyText, download } from "@/components/site/tool-ui";

// -------- AGE CALCULATOR --------
export function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const result = useMemo(() => {
    if (!dob) return null;
    const b = new Date(dob);
    const t = new Date(to);
    if (isNaN(+b) || isNaN(+t) || b > t) return null;
    let y = t.getFullYear() - b.getFullYear();
    let m = t.getMonth() - b.getMonth();
    let d = t.getDate() - b.getDate();
    if (d < 0) {
      m -= 1;
      d += new Date(t.getFullYear(), t.getMonth(), 0).getDate();
    }
    if (m < 0) { y -= 1; m += 12; }
    const totalDays = Math.floor((+t - +b) / 86400000);
    return { y, m, d, totalDays, hours: totalDays * 24, minutes: totalDays * 24 * 60 };
  }, [dob, to]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Date of birth"><TInput type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
        <Field label="Age at date"><TInput type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <div className="flex gap-2">
          <TButton variant="outline" onClick={() => { setDob(""); setTo(new Date().toISOString().slice(0, 10)); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </div>
      </div>
      <ResultBox>
        {result ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text">{result.y}<span className="text-lg text-muted-foreground"> yrs</span> {result.m}<span className="text-lg text-muted-foreground"> mo</span> {result.d}<span className="text-lg text-muted-foreground"> days</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Days" value={result.totalDays.toLocaleString()} />
              <Stat label="Hours" value={result.hours.toLocaleString()} />
              <Stat label="Minutes" value={result.minutes.toLocaleString()} />
            </div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Enter your date of birth to calculate age.</p>}
      </ResultBox>
    </div>
  );
}

// -------- BMI --------
export function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const bmi = useMemo(() => {
    const hn = +h, wn = +w;
    if (!hn || !wn) return null;
    let v = 0;
    if (unit === "metric") v = wn / ((hn / 100) ** 2);
    else v = (wn / (hn * hn)) * 703;
    if (!isFinite(v)) return null;
    let cat = "Normal weight";
    if (v < 18.5) cat = "Underweight";
    else if (v < 25) cat = "Normal weight";
    else if (v < 30) cat = "Overweight";
    else cat = "Obese";
    return { v: v.toFixed(1), cat };
  }, [h, w, unit]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Unit system"><TSelect value={unit} onChange={(e) => setUnit(e.target.value as any)}><option value="metric">Metric (cm, kg)</option><option value="imperial">Imperial (in, lb)</option></TSelect></Field>
        <Field label={unit === "metric" ? "Height (cm)" : "Height (in)"}><TInput type="number" value={h} onChange={(e) => setH(e.target.value)} placeholder="e.g. 170" /></Field>
        <Field label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"}><TInput type="number" value={w} onChange={(e) => setW(e.target.value)} placeholder="e.g. 65" /></Field>
        <TButton variant="outline" onClick={() => { setH(""); setW(""); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
      </div>
      <ResultBox>
        {bmi ? (
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold gradient-text">{bmi.v}</div>
            <div className="text-sm text-muted-foreground">Your BMI</div>
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">{bmi.cat}</div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Enter your height and weight to compute BMI.</p>}
      </ResultBox>
    </div>
  );
}

// -------- EMI / Loan (shared) --------
function computeEMI(P: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return { emi, total, interest: total - P };
}
function LoanForm({ title }: { title: string }) {
  const [P, setP] = useState("500000");
  const [rate, setRate] = useState("8.5");
  const [yr, setYr] = useState("5");
  const res = useMemo(() => computeEMI(+P, +rate, +yr * 12), [P, rate, yr]);
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label={`${title} amount`}><TInput type="number" value={P} onChange={(e) => setP(e.target.value)} /></Field>
        <Field label="Interest rate (% p.a.)"><TInput type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
        <Field label="Tenure (years)"><TInput type="number" value={yr} onChange={(e) => setYr(e.target.value)} /></Field>
        <TButton variant="outline" onClick={() => { setP("500000"); setRate("8.5"); setYr("5"); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
      </div>
      <ResultBox>
        {isFinite(res.emi) ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Monthly EMI</div>
              <div className="text-4xl font-bold gradient-text">{fmt(res.emi)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Total interest" value={fmt(res.interest)} />
              <Stat label="Total payable" value={fmt(res.total)} />
            </div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Enter valid numbers.</p>}
      </ResultBox>
    </div>
  );
}
export function EMICalculator() { return <LoanForm title="Loan" />; }
export function LoanCalculator() { return <LoanForm title="Loan" />; }

// -------- GST --------
export function GSTCalculator() {
  const [amt, setAmt] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const r = +rate / 100;
  const a = +amt;
  const base = mode === "add" ? a : a / (1 + r);
  const gst = mode === "add" ? a * r : a - base;
  const total = mode === "add" ? a + gst : a;
  const fmt = (n: number) => (isFinite(n) ? n.toFixed(2) : "—");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Amount"><TInput type="number" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
        <Field label="GST rate (%)"><TInput type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
        <Field label="Mode">
          <TSelect value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="add">Add GST (exclusive)</option>
            <option value="remove">Remove GST (inclusive)</option>
          </TSelect>
        </Field>
      </div>
      <ResultBox>
        <div className="grid gap-2">
          <Stat label="Base amount" value={fmt(base)} />
          <Stat label="GST" value={fmt(gst)} />
          <Stat label="Total" value={fmt(total)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- SIP --------
export function SIPCalculator() {
  const [m, setM] = useState("5000");
  const [rate, setRate] = useState("12");
  const [yr, setYr] = useState("10");
  const monthly = +m; const r = +rate / 12 / 100; const n = +yr * 12;
  const future = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const fmt = (n: number) => (isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Monthly investment"><TInput type="number" value={m} onChange={(e) => setM(e.target.value)} /></Field>
        <Field label="Expected return (% p.a.)"><TInput type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
        <Field label="Duration (years)"><TInput type="number" value={yr} onChange={(e) => setYr(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Invested amount" value={fmt(invested)} />
          <Stat label="Estimated returns" value={fmt(future - invested)} />
          <Stat label="Future value" value={fmt(future)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- FD --------
export function FDCalculator() {
  const [P, setP] = useState("100000");
  const [rate, setRate] = useState("7");
  const [yr, setYr] = useState("5");
  const [freq, setFreq] = useState("4");
  const n = +freq;
  const t = +yr;
  const A = +P * Math.pow(1 + +rate / (100 * n), n * t);
  const fmt = (n: number) => (isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Principal"><TInput type="number" value={P} onChange={(e) => setP(e.target.value)} /></Field>
        <Field label="Interest rate (% p.a.)"><TInput type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
        <Field label="Duration (years)"><TInput type="number" value={yr} onChange={(e) => setYr(e.target.value)} /></Field>
        <Field label="Compounding frequency (per year)"><TSelect value={freq} onChange={(e) => setFreq(e.target.value)}><option value="1">Annually</option><option value="2">Half-yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option></TSelect></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Maturity amount" value={fmt(A)} />
          <Stat label="Interest earned" value={fmt(A - +P)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- PERCENTAGE --------
export function PercentageCalculator() {
  const [x, setX] = useState("15");
  const [y, setY] = useState("200");
  const r = (+x / 100) * +y;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Percentage (%)"><TInput type="number" value={x} onChange={(e) => setX(e.target.value)} /></Field>
        <Field label="Of value"><TInput type="number" value={y} onChange={(e) => setY(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="text-center">
          <div className="text-xs uppercase text-muted-foreground">{x}% of {y}</div>
          <div className="text-4xl font-bold gradient-text">{isFinite(r) ? r : "—"}</div>
        </div>
      </ResultBox>
    </div>
  );
}

// -------- DISCOUNT --------
export function DiscountCalculator() {
  const [p, setP] = useState("2000");
  const [d, setD] = useState("15");
  const off = (+p * +d) / 100;
  const final = +p - off;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Original price"><TInput type="number" value={p} onChange={(e) => setP(e.target.value)} /></Field>
        <Field label="Discount (%)"><TInput type="number" value={d} onChange={(e) => setD(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="You save" value={off.toFixed(2)} />
          <Stat label="Final price" value={final.toFixed(2)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- PROFIT & LOSS --------
export function ProfitLossCalculator() {
  const [cp, setCp] = useState("100");
  const [sp, setSp] = useState("120");
  const diff = +sp - +cp;
  const pct = (diff / +cp) * 100;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Cost price"><TInput type="number" value={cp} onChange={(e) => setCp(e.target.value)} /></Field>
        <Field label="Selling price"><TInput type="number" value={sp} onChange={(e) => setSp(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${diff >= 0 ? "text-success" : "text-destructive"}`}>{diff >= 0 ? "Profit" : "Loss"}: {Math.abs(diff).toFixed(2)}</div>
          <Stat label="Margin %" value={isFinite(pct) ? pct.toFixed(2) + "%" : "—"} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- SIMPLE INTEREST --------
export function SimpleInterestCalculator() {
  const [P, setP] = useState("10000");
  const [r, setR] = useState("8");
  const [t, setT] = useState("3");
  const SI = (+P * +r * +t) / 100;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Principal"><TInput type="number" value={P} onChange={(e) => setP(e.target.value)} /></Field>
        <Field label="Rate (% p.a.)"><TInput type="number" value={r} onChange={(e) => setR(e.target.value)} /></Field>
        <Field label="Time (years)"><TInput type="number" value={t} onChange={(e) => setT(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Simple interest" value={SI.toFixed(2)} />
          <Stat label="Total amount" value={(+P + SI).toFixed(2)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- COMPOUND INTEREST --------
export function CompoundInterestCalculator() {
  const [P, setP] = useState("10000");
  const [r, setR] = useState("8");
  const [t, setT] = useState("3");
  const [n, setN] = useState("4");
  const A = +P * Math.pow(1 + +r / (100 * +n), +n * +t);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Principal"><TInput type="number" value={P} onChange={(e) => setP(e.target.value)} /></Field>
        <Field label="Rate (% p.a.)"><TInput type="number" value={r} onChange={(e) => setR(e.target.value)} /></Field>
        <Field label="Time (years)"><TInput type="number" value={t} onChange={(e) => setT(e.target.value)} /></Field>
        <Field label="Compounding freq (per year)"><TInput type="number" value={n} onChange={(e) => setN(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Interest earned" value={(A - +P).toFixed(2)} />
          <Stat label="Maturity amount" value={A.toFixed(2)} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- AVERAGE --------
export function AverageCalculator() {
  const [txt, setTxt] = useState("10, 20, 30, 40, 50");
  const nums = txt.split(/[\s,]+/).map(Number).filter((x) => !isNaN(x));
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = nums.length ? sum / nums.length : 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const median = sorted.length ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : 0;
  const freq: Record<number, number> = {};
  nums.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
  const maxF = Math.max(...Object.values(freq), 0);
  const mode = Object.entries(freq).filter(([, v]) => v === maxF && maxF > 1).map(([k]) => k).join(", ") || "None";
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Numbers (comma or space separated)"><TInput value={txt} onChange={(e) => setTxt(e.target.value)} /></Field>
        <div className="text-xs text-muted-foreground">Detected: {nums.length} numbers</div>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Sum" value={sum} />
          <Stat label="Mean" value={mean.toFixed(2)} />
          <Stat label="Median" value={median} />
          <Stat label="Mode" value={mode} />
        </div>
      </ResultBox>
    </div>
  );
}

// -------- DATE DIFF --------
export function DateDifferenceCalculator() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const ad = new Date(a); const bd = new Date(b);
  const ok = !isNaN(+ad) && !isNaN(+bd);
  const ms = ok ? Math.abs(+bd - +ad) : 0;
  const days = Math.floor(ms / 86400000);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="From date"><TInput type="date" value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="To date"><TInput type="date" value={b} onChange={(e) => setB(e.target.value)} /></Field>
      </div>
      <ResultBox>
        {ok ? (
          <div className="space-y-2">
            <Stat label="Days" value={days.toLocaleString()} />
            <Stat label="Weeks" value={(days / 7).toFixed(2)} />
            <Stat label="Months (approx)" value={(days / 30.44).toFixed(2)} />
            <Stat label="Years (approx)" value={(days / 365.25).toFixed(2)} />
          </div>
        ) : <p className="text-sm text-muted-foreground">Pick both dates.</p>}
      </ResultBox>
    </div>
  );
}

// -------- TIME DURATION --------
export function TimeDurationCalculator() {
  const [a, setA] = useState("09:00");
  const [b, setB] = useState("17:30");
  const parse = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const diff = Math.max(0, parse(b) - parse(a));
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Start time"><TInput type="time" value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="End time"><TInput type="time" value={b} onChange={(e) => setB(e.target.value)} /></Field>
      </div>
      <ResultBox>
        <div className="space-y-2">
          <Stat label="Hours" value={(diff / 60).toFixed(2)} />
          <Stat label="Minutes" value={diff} />
          <Stat label="H:M" value={`${Math.floor(diff / 60)}h ${diff % 60}m`} />
        </div>
      </ResultBox>
    </div>
  );
}
