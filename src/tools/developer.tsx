import { useMemo, useState } from "react";
import { Copy, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, TButton, TInput, TSelect, TTextarea, copyText } from "@/components/site/tool-ui";

const cp = async (t: string) => (await copyText(t)) ? toast.success("Copied") : toast.error("Copy failed");

function TextIO({
  action, actionLabel, placeholder = "Paste input...",
}: { action: (s: string) => string; actionLabel: string; placeholder?: string }) {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const run = () => {
    try { setErr(""); setOut(action(inp)); } catch (e: any) { setErr(e.message || "Error"); setOut(""); }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <TTextarea rows={14} value={inp} onChange={(e) => setInp(e.target.value)} placeholder={placeholder} />
        <div className="flex gap-2">
          <TButton onClick={run}>{actionLabel}</TButton>
          <TButton variant="outline" onClick={() => { setInp(""); setOut(""); setErr(""); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </div>
      </div>
      <div className="space-y-3">
        <TTextarea rows={14} value={out} readOnly placeholder="Output..." />
        {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
        <TButton variant="outline" onClick={() => cp(out)}><Copy className="h-4 w-4" />Copy output</TButton>
      </div>
    </div>
  );
}

export function JSONFormatter() {
  return <TextIO actionLabel="Format" action={(s) => JSON.stringify(JSON.parse(s), null, 2)} placeholder='{"hello":"world"}' />;
}
export function JSONMinifier() {
  return <TextIO actionLabel="Minify" action={(s) => JSON.stringify(JSON.parse(s))} />;
}
export function JSONValidator() {
  const [t, setT] = useState("");
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null);
  const run = () => { try { JSON.parse(t); setRes({ ok: true, msg: "Valid JSON ✓" }); } catch (e: any) { setRes({ ok: false, msg: e.message }); } };
  return (
    <div className="grid gap-4">
      <TTextarea rows={12} value={t} onChange={(e) => setT(e.target.value)} placeholder='Paste JSON to validate...' />
      <div className="flex gap-2"><TButton onClick={run}>Validate</TButton></div>
      {res && <div className={`rounded-xl border p-4 text-sm ${res.ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>{res.msg}</div>}
    </div>
  );
}

// Simple HTML/CSS/JS beautifier & minifier
function beautifyHTML(s: string) {
  let indent = 0;
  const lines: string[] = [];
  s.replace(/></g, ">\n<").split("\n").forEach((line) => {
    line = line.trim();
    if (!line) return;
    if (line.match(/^<\/\w/)) indent = Math.max(indent - 1, 0);
    lines.push("  ".repeat(indent) + line);
    if (line.match(/^<\w[^>]*[^/]?>$/) && !line.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) indent++;
  });
  return lines.join("\n");
}
function minifyHTML(s: string) { return s.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim(); }
function beautifyCSS(s: string) {
  return s.replace(/\s*\{\s*/g, " {\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*}\s*/g, "\n}\n").replace(/,\s*/g, ",\n").replace(/\n\s*\n/g, "\n").trim();
}
function minifyCSS(s: string) { return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim(); }
function beautifyJS(s: string) {
  let out = ""; let indent = 0; let inStr: string | false = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) { out += c; if (c === inStr && s[i - 1] !== "\\") inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; continue; }
    if (c === "{") { out += "{\n" + "  ".repeat(++indent); continue; }
    if (c === "}") { indent = Math.max(0, indent - 1); out += "\n" + "  ".repeat(indent) + "}"; continue; }
    if (c === ";") { out += ";\n" + "  ".repeat(indent); continue; }
    out += c;
  }
  return out.replace(/\n\s*\n/g, "\n").trim();
}

export function HTMLBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyHTML} placeholder="<div><p>Hello</p></div>" />; }
export function HTMLMinifier() { return <TextIO actionLabel="Minify" action={minifyHTML} />; }
export function CSSBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyCSS} placeholder="body{color:red;}" />; }
export function CSSMinifier() { return <TextIO actionLabel="Minify" action={minifyCSS} />; }
export function JSBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyJS} placeholder="function x(){return 1;}" />; }

export function PasswordGenerator() {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [num, setNum] = useState(true);
  const [sym, setSym] = useState(true);
  const [out, setOut] = useState("");
  const gen = () => {
    const parts: string[] = [];
    if (upper) parts.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (lower) parts.push("abcdefghijklmnopqrstuvwxyz");
    if (num) parts.push("0123456789");
    if (sym) parts.push("!@#$%^&*()-_=+[]{};:,.<>?");
    const src = parts.join("");
    if (!src) return toast.error("Pick at least one option");
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let s = "";
    for (let i = 0; i < len; i++) s += src[arr[i] % src.length];
    setOut(s);
  };
  const strength = useMemo(() => {
    const pool = (upper ? 26 : 0) + (lower ? 26 : 0) + (num ? 10 : 0) + (sym ? 25 : 0);
    const entropy = len * Math.log2(pool || 2);
    if (entropy < 40) return { label: "Weak", color: "bg-destructive" };
    if (entropy < 60) return { label: "Fair", color: "bg-warning" };
    if (entropy < 80) return { label: "Strong", color: "bg-success" };
    return { label: "Very strong", color: "bg-success" };
  }, [len, upper, lower, num, sym]);
  return (
    <div className="grid gap-4">
      <ResultBox>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-background p-3 font-mono text-sm break-all min-h-[3rem]">{out || <span className="text-muted-foreground">Click generate</span>}</div>
          <TButton onClick={() => cp(out)} variant="outline"><Copy className="h-4 w-4" /></TButton>
          <TButton onClick={gen}><RefreshCw className="h-4 w-4" /></TButton>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className={`h-2 flex-1 overflow-hidden rounded-full bg-muted`}><div className={`h-full ${strength.color}`} style={{ width: `${Math.min(100, (len / 32) * 100)}%` }} /></div>
          <span className="font-medium">{strength.label}</span>
        </div>
      </ResultBox>
      <Field label={`Length: ${len}`}>
        <input type="range" min={4} max={64} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full accent-primary" />
      </Field>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Uppercase", upper, setUpper], ["Lowercase", lower, setLower], ["Numbers", num, setNum], ["Symbols", sym, setSym]].map(([l, v, s]: any) => (
          <label key={l} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm cursor-pointer">
            <input type="checkbox" checked={v} onChange={(e) => s(e.target.checked)} />{l}
          </label>
        ))}
      </div>
    </div>
  );
}

function uuidv4() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}
export function UUIDGenerator() {
  const [n, setN] = useState("10");
  const [out, setOut] = useState("");
  const gen = () => setOut(Array.from({ length: Math.min(+n, 1000) }, uuidv4).join("\n"));
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Count"><TInput type="number" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <TButton onClick={gen}>Generate</TButton>
        <TButton variant="outline" onClick={() => cp(out)}><Copy className="h-4 w-4" />Copy all</TButton>
      </div>
      <TTextarea rows={12} value={out} readOnly />
    </div>
  );
}
<!-- Start: Copy this code for your Blogger Post/Page --><div class="separator" style="clear: both;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikSjTX2x7LdQ0dfyGEtd3dwOu5krDbzxmH2ebK15As-A0syQDy6CqAjgDbCvMQKXZ90XeeWVhwTHAzlYSXvqf8f7gVhL5rMNewvsHszbpXIDKCF0PfGuhTYCNCauecKsHsUHEU4UboTamZMxZYY709M1w7UeE7fbhVA5cOiCIx0pEn0Nhg4lhIS3cMpu4/s1536/ChatGPT%20Image%20Jul%201,%202025,%2011_08_15%20PM.png" style="display: block; padding: 1em 0; text-align: center; "><img alt="" border="0" height="320" data-original-height="1536" data-original-width="1024" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikSjTX2x7LdQ0dfyGEtd3dwOu5krDbzxmH2ebK15As-A0syQDy6CqAjgDbCvMQKXZ90XeeWVhwTHAzlYSXvqf8f7gVhL5rMNewvsHszbpXIDKCF0PfGuhTYCNCauecKsHsUHEU4UboTamZMxZYY709M1w7UeE7fbhVA5cOiCIx0pEn0Nhg4lhIS3cMpu4/s320/ChatGPT%20Image%20Jul%201,%202025,%2011_08_15%20PM.png"/></a></div>


<!-- Styles for the Page and Tool -->
<style>
    :root {
        --bg-dark-main: #111827; /* Darkest Blue/Gray */
        --bg-dark-secondary: #1f2937;
        --border-color: #374151;
        --text-primary: #f9fafb;
        --text-secondary: #9ca3af;
        --accent-blue: #3b82f6;
    }

    /* General Content Styles */
    .content-wrapper { max-width: 900px; margin: 20px auto; padding: 25px; background-color: #fff; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .content-wrapper h1, .content-wrapper h2, .content-wrapper h3 { color: #111827; }
    .content-wrapper p, .content-wrapper li { color: #374151; line-height: 1.7; }

    /* Converter Tool Styles */
    .converter-container {
        background-color: var(--bg-dark-main);
        padding: 30px;
        border-radius: 16px;
        border: 1px solid var(--border-color);
        margin: 40px auto;
        color: var(--text-primary);
    }
    .converter-container h2.tool-title { text-align: center; font-size: 2.2em; margin-bottom: 30px; color: var(--text-primary); }

    /* Input/Output Grid */
    .io-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
    @media (min-width: 800px) { .io-grid { grid-template-columns: 1fr 1fr; } }
    
    .io-pane h3 { border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-top: 0; }
    
    .input-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    #upload-btn {
        background-color: var(--bg-dark-secondary);
        border: 1px solid var(--border-color);
        color: var(--accent-blue);
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
    }
    #upload-btn:hover { background-color: #374151; }

    #json-input-area {
        height: 400px; width: 100%;
        background-color: var(--bg-dark-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px; padding: 15px; color: var(--text-primary);
        font-family: 'Courier New', monospace; font-size: 14px;
        resize: none; box-sizing: border-box;
    }
    
    .output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;}
    .controls-group { display: flex; align-items: center; gap: 15px; }
    .controls-group label { color: var(--text-secondary); }
    .controls-group select {
        background-color: var(--bg-dark-secondary); border: 1px solid var(--border-color);
        color: var(--text-primary); border-radius: 6px; padding: 8px 12px;
    }

    .csv-preview-container {
        height: 400px; overflow: auto;
        background-color: var(--bg-dark-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }
    #csv-preview-table { width: 100%; border-collapse: collapse; }
    #csv-preview-table th, #csv-preview-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
    #csv-preview-table thead th { background-color: var(--bg-dark-main); position: sticky; top: 0; z-index: 1; }

    #download-btn {
        display: block; width: 100%; padding: 15px; font-size: 1.2em; font-weight: bold;
        color: white; background: var(--accent-blue); border: none; border-radius: 8px;
        cursor: pointer; margin-top: 30px; transition: background-color 0.2s, transform 0.2s;
    }
    #download-btn:disabled { background: var(--border-color); color: var(--text-secondary); cursor: not-allowed; }
    #download-btn:not(:disabled):hover { background-color: #1d4ed8; transform: translateY(-2px); }
</style>

<div class="content-wrapper">
    <!-- ========= SEO & AdSense Friendly Content - Part 1 ========= -->
    <h1>Advanced JSON to CSV Converter (Online & Free)</h1>
    <p>
        Effortlessly convert your complex JSON data into a clean, structured CSV file with our powerful online tool. Unlike basic converters, our tool intelligently handles **nested objects and expands arrays into multiple rows**, giving you a clean, usable dataset. It's perfect for developers working with API responses, data scientists handling complex data structures, and anyone needing to convert JSON to a spreadsheet-friendly format like Excel or Google Sheets.
    </p>

    <!-- ========= The Converter Tool ========= -->
    <div class="converter-container">
        <h2 class="tool-title">JSON to CSV Converter</h2>
        <div class="io-grid">
            <!-- Left Pane: JSON Input -->
            <div class="io-pane">
                <div class="input-header">
                    <h3>JSON Input</h3>
                    <button id="upload-btn">Upload File</button>
                    <input type="file" id="json-file-input" accept=".json" style="display:none;">
                </div>
                <textarea id="json-input-area" placeholder="Paste or drop a .json file here..."></textarea>
            </div>
            
            <!-- Right Pane: CSV Output Preview -->
            <div class="io-pane">
                <div class="output-header">
                    <h3>CSV Output</h3>
                    <div class="controls-group">
                        <label for="separator">Separator:</label>
                        <select id="separator">
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab</option>
                        </select>
                    </div>
                </div>
                <div class="csv-preview-container">
                    <table id="csv-preview-table">
                        <thead></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
        <button id="download-btn" disabled>Download CSV</button>
    </div>
    <!-- ========= End of Tool ========= -->
    
    <!-- ========= SEO & AdSense Friendly Content - Part 2 ========= -->
    <h2>How to Use the JSON to CSV Converter</h2>
    <ol>
        <li><strong>Provide Your JSON Data:</strong> You have two easy options. You can either paste your raw JSON code directly into the editor on the left, or you can click the "Upload File" button to select a `.json` file from your computer. You can also drag and drop a file directly onto the editor.</li>
        <li><strong>See the Instant Preview:</strong> As soon as you provide the data, our tool automatically processes it and generates a live preview of the resulting CSV in the table on the right. This allows you to verify the conversion in real-time.</li>
        <li><strong>Customize and Download:</strong> Choose your preferred CSV separator (comma, semicolon, or tab) from the dropdown menu. Once you are satisfied, click the "Download CSV" button to save the file to your device.</li>
    </ol>

    <h2>Why Our Converter Stands Out</h2>
    <p>While many converters exist, our tool is built to handle the real-world complexities of JSON data. Here's what makes it superior:</p>
    <ul>
        <li><strong>Advanced Array Handling:</strong> This is our key feature. If a JSON object contains an array of items (like multiple phone numbers for one contact), our tool smartly creates a separate row for each item in the array, duplicating the other data. This is crucial for creating a clean, flat CSV file ready for analysis.</li>
        <li><strong>Deeply Nested Object Support:</strong> Our converter automatically "flattens" nested objects, using dot notation (e.g., `user.address.city`) as headers to preserve the data's structure and context.</li>
        <li><strong>Complete Privacy & Security:</strong> Your data's security is guaranteed. The entire conversion process happens locally in your web browser. Your sensitive information is never sent to or stored on our servers.</li>
    </ul>

    <h3>Frequently Asked Questions (FAQ)</h3>
    <p><strong>What is JSON?</strong><br>
    JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate. It's the most common format for data sent from a server to a web page (API responses).</p>
    
    <p><strong>Why do people convert JSON to CSV?</strong><br>
    CSV (Comma-Separated Values) is the most compatible format for spreadsheets and data analysis software. People convert JSON to CSV to easily open, analyze, and visualize the data in programs like Microsoft Excel, Google Sheets, or to import it into a database.</p>
</div>

<!-- JavaScript for the Tool -->
<script>
    const jsonInput = document.getElementById('json-input-area');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('json-file-input');
    const csvTableHead = document.querySelector('#csv-preview-table thead');
    const csvTableBody = document.querySelector('#csv-preview-table tbody');
    const downloadBtn = document.getElementById('download-btn');
    const separatorSelect = document.getElementById('separator');

    let csvContent = '';

    jsonInput.addEventListener('input', () => processJSON(jsonInput.value));
    downloadBtn.addEventListener('click', downloadCSV);
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                jsonInput.value = event.target.result;
                processJSON(event.target.result);
            };
            reader.readAsText(file);
        }
    });
    
    jsonInput.addEventListener('dragover', (e) => e.preventDefault());
    jsonInput.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (event) => {
                jsonInput.value = event.target.result;
                processJSON(event.target.result);
            };
            reader.readAsText(file);
        }
    });

    function processJSON(jsonString) {
        csvTableHead.innerHTML = '';
        csvTableBody.innerHTML = '';
        downloadBtn.disabled = true;

        if (jsonString.trim() === '') return;

        try {
            let data = JSON.parse(jsonString);
            if (!Array.isArray(data)) data = [data]; 
            
            const processedData = data.flatMap(item => unwindAndFlatten(item));
            if (processedData.length === 0) return;

            const headers = [...new Set(processedData.flatMap(Object.keys))];
            
            csvTableHead.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
            const rowsHtml = processedData.map(row => {
                const cells = headers.map(header => `<td>${row[header] !== undefined ? escapeHtml(row[header]) : ''}</td>`);
                return `<tr>${cells.join('')}</tr>`;
            }).join('');
            csvTableBody.innerHTML = rowsHtml;
            
            updateCsvContent();
            downloadBtn.disabled = false;
        } catch (error) {
            csvTableBody.innerHTML = `<tr><td style="color:red; white-space:normal;">Invalid JSON: ${error.message}</td></tr>`;
        }
    }
    
    function unwindAndFlatten(obj) {
        const results = [];
        const process = (current, path) => {
            let arrayKeys = Object.keys(current).filter(k => Array.isArray(current[k]) && current[k].every(i => typeof i === 'object' && i !== null && Object.keys(i).length > 0));

            if (arrayKeys.length > 0) {
                const keyToUnwind = arrayKeys[0];
                const arrayToProcess = current[keyToUnwind];
                const base = { ...path };
                Object.keys(current).forEach(k => {
                    if (k !== keyToUnwind) { Object.assign(base, flatten({ [k]: current[k] })); }
                });
                
                if (arrayToProcess.length > 0) {
                    arrayToProcess.forEach(item => process(item, { ...base }));
                } else {
                    results.push(base);
                }
            } else {
                results.push(flatten(current, path));
            }
        };
        const flatten = (obj, path = {}, prefix = '') => {
            Object.keys(obj).forEach(key => {
                const newKey = prefix ? prefix + '.' + key : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    Object.assign(path, flatten(obj[key], {}, newKey));
                } else {
                    path[newKey] = Array.isArray(obj[key]) ? JSON.stringify(obj[key]) : obj[key];
                }
            });
            return path;
        };
        process(obj, {});
        return results;
    }

    function updateCsvContent() {
        const separator = separatorSelect.value;
        const headers = Array.from(csvTableHead.querySelectorAll('th')).map(th => th.textContent);
        const rows = Array.from(csvTableBody.querySelectorAll('tr'));
        
        const csvRows = [
            headers.map(h => `"${h.replace(/"/g, '""')}"`).join(separator),
            ...rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return headers.map((header, index) => {
                    const cellText = cells[index] ? cells[index].textContent : '';
                    if (cellText.includes(separator) || cellText.includes('"') || cellText.includes('\n')) {
                        return `"${cellText.replace(/"/g, '""')}"`;
                    }
                    return cellText;
                }).join(separator);
            })
        ];
        csvContent = csvRows.join('\n');
    }
    
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.innerText = text;
        return div.innerHTML;
    }

    function downloadCSV() {
        if (!csvContent) return;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'converted_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    separatorSelect.addEventListener('change', () => {
        if (jsonInput.value.trim() !== '') {
            updateCsvContent();
        }
    });

</script>
<!-- End: Copy this code for your Blogger Post/Page -->
