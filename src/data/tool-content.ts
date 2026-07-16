import type { ToolMeta } from "./tools";
import { CATEGORIES } from "./tools";

export interface ToolContent {
  intro: string;
  howTo: string[];
  features: { title: string; desc: string }[];
  benefits: string;
  faqs: { q: string; a: string }[];
  description: string[];
}

// -----------------------------------------------------------------------------
// Per-tool hand-written content overrides — tailored to what each tool
// actually does. Only mention buttons/uploads/downloads that exist in the UI.
// -----------------------------------------------------------------------------
const OVERRIDES: Record<string, Partial<ToolContent>> = {
  "age-calculator": {
    intro:
      "The Age Calculator finds your exact age in years, months and days between any two dates. Enter your date of birth and a target date (today by default) and the result updates instantly — no button press, no page reload, no data sent anywhere.",
    howTo: [
      "Pick your date of birth in the first date field.",
      "Leave the second field on today's date, or pick any past or future date to see your age on that day.",
      "Read your exact age in years, months and days directly above the totals.",
      "Use the totals row to see the same age expressed in days, hours and minutes.",
      "Click Reset to clear the inputs and start again.",
    ],
    features: [
      { title: "Exact years, months, days", desc: "Correctly rolls over months of 28, 29, 30 and 31 days — no off-by-one errors." },
      { title: "Any target date", desc: "Not just today. Check your age on a wedding, a retirement, or a historical date." },
      { title: "Days, hours & minutes", desc: "See the same age in three different units for forms, essays and fun facts." },
      { title: "Live updates", desc: "No calculate button. Change either date and the result recomputes on the spot." },
      { title: "Handles leap years", desc: "Uses real calendar arithmetic, so 29 February birthdays and leap-year gaps stay accurate." },
      { title: "100% private", desc: "Dates never leave your browser — the whole calculation is a few lines of JavaScript on your device." },
    ],
    benefits:
      "Passports, insurance forms, school admissions and legal documents often ask for exact age in years, months and days — a surprisingly awkward calculation to do by hand. This tool answers it in a second and gives you the day, hour and minute totals for free. Because everything runs client-side, you can use it on the train, in flight mode, or on a locked-down office machine that blocks other websites.",
    faqs: [
      { q: "How is the age calculated?", a: "The tool subtracts the birth date from the target date using JavaScript's built-in Date arithmetic, then rolls over months and days using each month's real length." },
      { q: "Can I calculate age on a future date?", a: "Yes. Set the second date field to any future date to see how old you (or someone else) will be on that day." },
      { q: "Does it handle leap years?", a: "Yes. The calculation uses real calendar months, so 29 February birthdays and leap-year day counts are always correct." },
      { q: "Is my date of birth stored anywhere?", a: "No. The tool runs entirely in your browser — nothing is uploaded and nothing is logged." },
      { q: "Why do the days, hours and minutes look different from years-months-days?", a: "Years-months-days is calendar arithmetic. Days, hours and minutes are the raw time difference — both are correct, just different units." },
    ],
    description: [
      "The Age Calculator is a small, focused tool that answers one question exactly: how old is someone, right now or on a chosen date. It is designed for the moments a rough estimate is not enough — visa applications, school forms, medical records, retirement planning.",
      "Under the hood, the calculation is native JavaScript Date arithmetic with month-length correction, so 31-day, 30-day and February months all roll over correctly. There is no server call, so it works offline and on restricted networks.",
      "Pair it with our Date Difference Calculator when you need the raw gap between two dates in days, weeks or months, or the Time Duration Calculator for hour-and-minute precision.",
    ],
  },

  "bmi-calculator": {
    intro:
      "The BMI Calculator returns your Body Mass Index using the standard formula weight (kg) divided by height (m) squared. Switch between metric and imperial units, enter height and weight, and read your BMI plus the WHO health category on the spot.",
    howTo: [
      "Choose Metric (cm / kg) or Imperial (ft, in / lbs) using the unit toggle.",
      "Enter your height in the height field.",
      "Enter your current weight in the weight field.",
      "Read your BMI value and the corresponding health category (Underweight, Normal, Overweight, Obese) as they update live.",
      "Adjust either input to model weight-loss or weight-gain targets.",
    ],
    features: [
      { title: "Metric and imperial", desc: "One toggle switches every field between cm/kg and ft-in/lbs — no manual conversion." },
      { title: "Live category", desc: "BMI and WHO category (Underweight, Normal, Overweight, Obese) update as you type." },
      { title: "Standard formula", desc: "Uses the WHO reference BMI = weight (kg) ÷ height (m)² — the same formula clinicians use." },
      { title: "No account", desc: "No sign-up, no saved history — private by design." },
    ],
    benefits:
      "BMI is not a perfect measure of health — very muscular athletes and older adults can be misclassified — but it remains the fastest, most widely used screening indicator worldwide. This calculator gives you the exact WHO value in seconds so you can compare against published ranges, track progress against a fitness plan, or check the number your doctor mentioned in your last visit.",
    faqs: [
      { q: "What formula does this use?", a: "The WHO reference formula: BMI = weight in kilograms divided by height in metres squared. Imperial inputs are converted first, then the same formula applies." },
      { q: "What are the BMI categories?", a: "Underweight below 18.5, Normal 18.5–24.9, Overweight 25–29.9, Obese 30 and above (WHO adult ranges)." },
      { q: "Is BMI accurate for athletes?", a: "Not always — high muscle mass raises weight without adding fat, so athletes often score in the Overweight range while being extremely healthy." },
      { q: "Should I use this for children?", a: "No. Children and teenagers use age- and sex-specific percentile charts, not the adult BMI ranges shown here." },
    ],
    description: [
      "This BMI Calculator implements the exact World Health Organization adult formula and category table so the number you see matches what a clinician or fitness tracker would report.",
      "Use it as one input into a bigger picture. Combine BMI with waist circumference, body-fat percentage or a proper fitness assessment for a fuller view of your health.",
      "For related calculations, see our Age Calculator (many BMI conversations are age-adjusted) and the Compound Interest Calculator (useful for planning long-term gym or trainer costs).",
    ],
  },

  "emi-calculator": {
    intro:
      "The EMI Calculator computes the equated monthly instalment on any loan using the standard bank formula: EMI = [P × r × (1+r)ⁿ] ÷ [(1+r)ⁿ − 1], where P is principal, r is the monthly interest rate and n is the number of monthly payments. Enter your loan details and get EMI, total interest and total repayment instantly.",
    howTo: [
      "Enter the loan principal (the amount you actually borrow).",
      "Enter the annual interest rate as a percentage — the tool converts it to a monthly rate internally.",
      "Enter the loan tenure in years (or months, depending on the field label).",
      "Read the monthly EMI plus the totals: total interest payable and total amount paid over the full tenure.",
      "Change any input to compare offers side by side without reloading.",
    ],
    features: [
      { title: "Bank-standard formula", desc: "Uses the same reducing-balance EMI formula banks and NBFCs use, so the number matches your loan agreement." },
      { title: "Interest breakdown", desc: "See total interest separately from principal — the true cost of borrowing." },
      { title: "Instant recalculation", desc: "Try different tenures and rates side by side in seconds." },
      { title: "Any currency", desc: "The math is currency-agnostic — the number you enter is the number you get back." },
    ],
    benefits:
      "Choosing between two loan offers usually comes down to a few hundred rupees, dollars or euros per month — but multiplied over 20 or 30 years, those small differences add up to lakhs or tens of thousands. This calculator lets you see the exact EMI, total interest and total repayment for every offer, so you can pick the one that actually costs less rather than the one that looks best in the ad.",
    faqs: [
      { q: "How is EMI calculated?", a: "EMI = [P × r × (1+r)ⁿ] ÷ [(1+r)ⁿ − 1], where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the number of monthly instalments." },
      { q: "Does this match my bank's EMI?", a: "Yes — this is the standard reducing-balance formula. If your bank quotes a different number, ask them to disclose processing fees or flat-rate versus reducing-balance interest." },
      { q: "Can I use this for home, car and personal loans?", a: "Yes. The formula is the same for all reducing-balance loans; only the principal, rate and tenure change." },
      { q: "Where do I see total interest paid?", a: "The result panel shows the EMI, total interest and total amount payable over the full tenure." },
    ],
    description: [
      "Every home, car or personal loan is priced by three numbers: principal, interest rate and tenure. This EMI Calculator turns those three inputs into the four numbers that actually matter for your budget — monthly EMI, total principal, total interest and total payment.",
      "Try running the same loan at 15 years vs 20 years and you'll see the classic trade-off: a longer tenure lowers your EMI but dramatically increases the total interest. Most borrowers overpay by lakhs simply because nobody showed them this table.",
      "See also our Loan Calculator for a broader amortisation view, SIP Calculator to compare paying down debt versus investing, and Compound Interest Calculator for long-term growth modelling.",
    ],
  },

  "sip-calculator": {
    intro:
      "The SIP Calculator projects how a Systematic Investment Plan grows over time using the future-value-of-an-annuity formula. Enter your monthly investment, expected annual return and duration in years to see the total amount invested, the estimated returns, and the projected corpus at the end.",
    howTo: [
      "Enter your monthly SIP amount (the fixed sum you plan to invest every month).",
      "Enter your expected annual return as a percentage — historical equity funds average 10–14%; adjust to your own assumption.",
      "Enter the investment duration in years.",
      "Read the three headline numbers: total invested, estimated returns and final corpus.",
      "Change any input to see how a small increase in SIP amount or duration transforms your final wealth.",
    ],
    features: [
      { title: "Correct SIP formula", desc: "Uses FV = P × [((1+r)ⁿ − 1) ÷ r] × (1+r) — the same formula used by fund houses." },
      { title: "Invested vs returns split", desc: "See how much came from your pocket and how much was compounding at work." },
      { title: "Any return rate", desc: "Model conservative debt SIPs (7%), balanced (10%), aggressive equity (14%) — anything." },
      { title: "Long horizons", desc: "Comfortable with 30- and 40-year projections where compounding truly shines." },
    ],
    benefits:
      "A SIP feels small month to month, but compounded over decades it becomes a wealth-building machine. This calculator makes the compounding visible: a ₹5,000 SIP at 12% for 30 years grows to over ₹1.7 crore, and the invested-vs-returns split shows you that most of that money is returns, not contributions. Seeing that number early in your career is the single most motivating financial exercise you can do.",
    faqs: [
      { q: "What is the SIP formula?", a: "Future Value = P × [((1 + r)ⁿ − 1) ÷ r] × (1 + r), where P is the monthly investment, r is the monthly rate of return (annual ÷ 12 ÷ 100), and n is the number of months." },
      { q: "What annual return should I assume?", a: "Historical Indian equity mutual funds have delivered 10–14% over long periods; large-cap index funds sit around 11–12%. Use a rate you're comfortable defending — many investors run three scenarios (conservative, base, optimistic)." },
      { q: "Does this account for inflation?", a: "No — the projection is in nominal terms. To see inflation-adjusted returns, subtract expected inflation (e.g. 6%) from your return rate before entering it." },
      { q: "Can I model step-up SIPs?", a: "This calculator uses a fixed monthly amount. For step-up SIPs, run it in segments (e.g. ₹10k for 3 years, then ₹15k for 3 years) and add the final corpuses." },
    ],
    description: [
      "SIP investing is the default recommendation of almost every serious financial planner, and for good reason: it removes market timing, builds discipline, and lets compounding do the heavy lifting.",
      "This calculator quantifies exactly what that means for you. Try ₹5,000 for 20 years at 12% and compare it to ₹5,000 for 30 years at 12% — the extra decade more than triples the corpus. That is the single most important insight in personal finance.",
      "See also our EMI Calculator to compare paying down debt vs investing, FD Calculator for guaranteed returns, and Compound Interest Calculator for lump-sum growth.",
    ],
  },

  "gst-calculator": {
    intro:
      "The GST Calculator computes both inclusive and exclusive Goods and Services Tax amounts at any rate you choose. Enter an amount, pick a GST rate, and see the base value, GST value and total value side by side.",
    howTo: [
      "Enter the amount you want to calculate GST on.",
      "Choose GST-Exclusive (add GST to the amount) or GST-Inclusive (extract GST from a total).",
      "Enter or pick the GST rate — common Indian rates are 5%, 12%, 18% and 28%.",
      "Read the breakdown: base amount, GST amount and final total.",
      "Adjust any field to compare rates or reverse-calculate any invoice.",
    ],
    features: [
      { title: "Inclusive & exclusive", desc: "Both directions supported — add GST to a price, or extract the GST already inside a total." },
      { title: "Any rate", desc: "Not limited to 5/12/18/28 — enter any custom rate for state-specific or international VAT calculations." },
      { title: "CGST / SGST split visible", desc: "See total GST split cleanly so you can enter both halves in your invoice or accounting software." },
      { title: "Instant reverse calculation", desc: "Given a ₹1,180 total at 18% GST, the tool shows the ₹1,000 base and ₹180 GST — essential for invoice reconciliation." },
    ],
    benefits:
      "Freelancers, small business owners and shoppers all deal with GST every day, and the mental math is genuinely tricky when you need to strip GST out of a total or verify an invoice. This calculator handles both directions in a second, with no ambiguity. Use it to check supplier invoices, generate customer quotes, and reconcile your books.",
    faqs: [
      { q: "What is the difference between GST-inclusive and GST-exclusive?", a: "GST-exclusive means the amount you enter is the base price and GST is added on top. GST-inclusive means the amount you enter already contains GST and the tool extracts the base price from it." },
      { q: "How is GST-inclusive calculated?", a: "Base = Total ÷ (1 + rate/100). At 18%, ₹1,180 total contains ₹1,000 base and ₹180 GST." },
      { q: "Which GST rates does this support?", a: "Any rate — the tool offers 5%, 12%, 18% and 28% shortcuts but you can type any percentage for VAT, sales tax or bespoke rates." },
      { q: "Does this handle CGST and SGST separately?", a: "The total GST value is what matters mathematically; CGST and SGST are simply that value split in half for intra-state Indian transactions." },
    ],
    description: [
      "Whether you are a freelancer raising invoices, a shopkeeper double-checking a bill, or a customer wondering how much tax you paid, this GST Calculator answers in one step.",
      "Both add-GST and extract-GST modes are supported, and any rate works — so the same tool covers Indian GST, EU VAT, UAE VAT and US sales tax.",
      "See also our Percentage Calculator for general percentage math, Discount Calculator for sale prices, and Profit & Loss Calculator for margin analysis on top of GST.",
    ],
  },

  "percentage-calculator": {
    intro:
      "The Percentage Calculator handles every common percentage question in one place: X% of Y, X is what percentage of Y, and percent increase or decrease from X to Y. Enter the two numbers involved and the answer appears immediately.",
    howTo: [
      "Pick the calculation mode that matches your question.",
      "Enter the two numbers into the labelled fields.",
      "Read the result — no calculate button is needed; it updates as you type.",
      "Reset any field to run a new calculation.",
    ],
    features: [
      { title: "Every common variation", desc: "\"X% of Y\", \"X is what % of Y\" and \"% change from X to Y\" — all in one interface." },
      { title: "Instant result", desc: "No submit button. Change any number and the answer updates on the spot." },
      { title: "Signed % change", desc: "Percent-change mode returns a positive number for increases and a negative for decreases, matching how spreadsheets calculate it." },
    ],
    benefits:
      "Discounts, tips, tax, exam scores, salary hikes, cricket run-rates — percentages hide inside almost every everyday number. This tool removes the mental math and the risk of mixing up which number goes where.",
    faqs: [
      { q: "How is percentage change calculated?", a: "((New − Old) ÷ Old) × 100. A positive result is an increase, a negative result is a decrease." },
      { q: "Does this handle decreases correctly?", a: "Yes. A change from 200 to 150 returns −25%, matching the spreadsheet convention." },
    ],
    description: [
      "Percentages are one of those primary-school topics that keep coming back for the rest of your life. This calculator collects the three variations you'll actually use.",
      "See also our Discount Calculator for shopping math, GST Calculator for tax, and Profit & Loss Calculator for business margins.",
    ],
  },

  "word-counter": {
    intro:
      "The Word Counter shows live counts of words, characters (with and without spaces), sentences, paragraphs and estimated reading time as you type or paste text. Perfect for essays with word limits, blog posts, social captions and meta descriptions.",
    howTo: [
      "Paste or type your text into the editor.",
      "Read the live stats above or beside the editor: words, characters, sentences, paragraphs and reading time.",
      "Edit freely — every count updates on the fly.",
      "Clear the editor to start again.",
    ],
    features: [
      { title: "Live word count", desc: "No submit button — every keystroke updates the count." },
      { title: "Chars with & without spaces", desc: "The two counts most character-limited platforms actually enforce." },
      { title: "Reading time estimate", desc: "Based on ~225 words per minute, the standard adult English reading rate." },
      { title: "Nothing sent anywhere", desc: "Text stays in your browser tab — safe for drafts, private notes and NDAs." },
    ],
    benefits:
      "Word processors work fine for long documents but are massive overkill for a tweet, a meta description or a class essay's abstract. This tool loads in a second, gives you all six standard counts at once, and never leaves your text in anyone's cloud.",
    faqs: [
      { q: "What counts as a word?", a: "A whitespace-separated run of non-whitespace characters — the same definition Microsoft Word uses." },
      { q: "Is my text stored?", a: "No. Everything runs in your browser tab; nothing is uploaded." },
      { q: "How is reading time calculated?", a: "Word count divided by 225 (average adult English reading rate), rounded up to the nearest minute." },
    ],
    description: [
      "Every writer, student and marketer benefits from a fast, distraction-free counter. This one shows all the numbers you'll ever need on one screen.",
      "See also our Character Counter for hard character limits, Case Converter for capitalisation, and Slug Generator for URL-safe versions of your titles.",
    ],
  },

  "case-converter": {
    intro:
      "The Case Converter converts pasted text between the six cases writers actually use: UPPERCASE, lowercase, Title Case, Sentence case, aLtErNaTiNg CaSe and iNVERSE case. Pick a case and copy the result — no formatting is added.",
    howTo: [
      "Paste your text into the input area.",
      "Click the button for the case you want.",
      "Read the converted text in the output area.",
      "Use the Copy button to copy the result to your clipboard, or click another case button to convert again.",
    ],
    features: [
      { title: "Six cases", desc: "UPPER, lower, Title, Sentence, alternating and inverse — the complete practical set." },
      { title: "One-click copy", desc: "Convert and copy without leaving the tool." },
      { title: "Preserves your original", desc: "Your source text stays intact so you can try different cases quickly." },
    ],
    benefits:
      "Fixing an ALL-CAPS email, retitling a chapter, cleaning up a spreadsheet column — these small case-conversion jobs pile up. Doing them in a text editor's Find & Replace is slow and error-prone; a dedicated tool takes one click.",
    faqs: [
      { q: "What is Sentence case?", a: "Only the first letter of each sentence is capitalised — the same convention used in most prose." },
      { q: "What is Title Case?", a: "The first letter of each major word is capitalised; short function words (a, an, the, of, in) stay lowercase." },
    ],
    description: [
      "Case conversion looks trivial but is one of the most-used tools on any writer's toolbelt.",
      "See also our Word Counter for length checks, Remove Extra Spaces to clean whitespace, and Slug Generator for URL-friendly output.",
    ],
  },

  "json-formatter": {
    intro:
      "The JSON Formatter pretty-prints any JSON payload with proper indentation, line breaks and key ordering — so you can actually read what an API returned or what a config file contains.",
    howTo: [
      "Paste the raw JSON into the input area.",
      "Click Format.",
      "Read the indented output on the right, or copy it to your clipboard with one click.",
      "If the JSON is invalid, the tool shows the parse error message and the character position so you can fix it.",
    ],
    features: [
      { title: "2-space indentation", desc: "Standard formatting that matches Prettier, ESLint and most style guides." },
      { title: "Precise error messages", desc: "Invalid JSON shows the exact character position and reason it failed to parse." },
      { title: "Copy output", desc: "One click copies the formatted JSON to your clipboard." },
      { title: "100% client-side", desc: "Payload never leaves your browser — safe for API responses containing tokens or user data." },
    ],
    benefits:
      "Pasting production API responses into random online formatters is a real security risk — some have been caught logging payloads. This one runs entirely in your browser, so tokens, PII and secrets stay on your machine.",
    faqs: [
      { q: "What formatting style is used?", a: "Standard 2-space indentation with sorted-by-insertion-order keys — the output of JSON.stringify(value, null, 2)." },
      { q: "Why did formatting fail?", a: "The input isn't valid JSON. Common causes: single quotes instead of double, trailing commas, unquoted keys, or a stray comment. The error message points to the exact character." },
      { q: "Does this send my JSON anywhere?", a: "No. Formatting uses the browser's built-in JSON.parse and JSON.stringify — nothing is uploaded." },
    ],
    description: [
      "The JSON Formatter is the fastest way to make an API response human-readable without opening an IDE.",
      "See also our JSON Validator for precise error checking, JSON Minifier to strip whitespace, and JSON to CSV Converter to export JSON into spreadsheets.",
    ],
  },

  "json-to-csv-converter": {
    intro:
      "The JSON to CSV Converter turns a JSON file or pasted JSON into a downloadable CSV, flattening nested objects into dot-notation columns (user.name, user.address.city) so nothing is lost. Files up to 15 MB are supported.",
    howTo: [
      "Drag a JSON file onto the drop zone, or click Choose file to browse (up to 15 MB).",
      "Or paste JSON directly into the text area below.",
      "Click Convert to CSV.",
      "Review the preview table (first 50 rows) and column count.",
      "Click Download CSV to save the file, or Copy CSV to grab it as text.",
      "Click Reset to start again with a new payload.",
    ],
    features: [
      { title: "File upload up to 15 MB", desc: "Drag-drop or file picker — reads entirely in the browser." },
      { title: "Paste-in mode", desc: "For quick one-liners you don't want to save as a file first." },
      { title: "Nested flattening", desc: "user.address.city becomes its own column — no data is lost when JSON has nested objects." },
      { title: "Array handling", desc: "Arrays of primitives become semicolon-joined values; arrays of objects expand into indexed columns." },
      { title: "Preview before download", desc: "See the first 50 rows and all columns before saving." },
      { title: "100% in browser", desc: "Files are parsed and converted locally — nothing is uploaded." },
    ],
    benefits:
      "Exporting API data for analysts, dumping a Mongo collection for a stakeholder, feeding an Excel pivot table — this converter turns any JSON shape into a clean, spreadsheet-ready CSV in one step.",
    faqs: [
      { q: "How large a file can I convert?", a: "Up to 15 MB. Larger files can crash the browser tab; split them first or use a command-line tool." },
      { q: "How are nested objects handled?", a: "They are flattened using dot notation: user.address.city becomes a single column named exactly that. Nothing is dropped." },
      { q: "How are arrays handled?", a: "Arrays of primitives (strings, numbers) become semicolon-joined cells. Arrays of objects expand into indexed columns (items.0.name, items.1.name)." },
      { q: "Is my JSON uploaded?", a: "No. The whole conversion runs in your browser — the file never leaves your device." },
    ],
    description: [
      "APIs speak JSON, but business users speak spreadsheets. This converter bridges the two without a script or a paid SaaS.",
      "See also our JSON Formatter, JSON Validator and JSON Minifier for round-trip developer workflows.",
    ],
  },

  "password-generator": {
    intro:
      "The Password Generator creates strong, random passwords using the browser's built-in cryptographic random number generator. Choose length and which character classes to include; the tool shows entropy strength as you tweak.",
    howTo: [
      "Set the desired length using the slider (4 to 64 characters).",
      "Tick the character classes to include: uppercase, lowercase, numbers, symbols.",
      "Click the Refresh button to generate a new password.",
      "Read the entropy meter to see how strong the password is.",
      "Click the Copy button to copy the password to your clipboard.",
    ],
    features: [
      { title: "Cryptographic randomness", desc: "Uses window.crypto.getRandomValues — the browser's secure RNG, not Math.random." },
      { title: "Length 4–64", desc: "Cover everything from PINs to master passwords." },
      { title: "Live entropy score", desc: "Weak / Fair / Strong / Very strong updates as you change length and character classes." },
      { title: "One-click copy", desc: "Copy to clipboard without ever revealing the password in a URL or log." },
    ],
    benefits:
      "Every reused password is a breach waiting to happen. This tool generates a fresh, high-entropy password in one click — the only thing left is pasting it into your password manager.",
    faqs: [
      { q: "Is this password truly random?", a: "Yes. It uses window.crypto.getRandomValues, the cryptographically secure RNG built into every modern browser." },
      { q: "How long should my password be?", a: "16 characters with all four character classes gives ~104 bits of entropy — comfortable against any offline attack. 20+ is even better." },
      { q: "Is the password stored anywhere?", a: "No. It is generated locally and displayed to you; nothing is saved or transmitted." },
    ],
    description: [
      "Password managers include generators, but sometimes you need one before you're logged into the manager — first-time setup, kiosk machines, temporary tokens.",
      "See also our UUID Generator for unique IDs and JSON Formatter for API debugging.",
    ],
  },

  "image-compressor": {
    intro:
      "The Image Compressor reduces JPG, PNG and WebP file sizes by re-encoding them through the Canvas API at a quality level of your choice. Nothing is uploaded — the image is compressed entirely in your browser.",
    howTo: [
      "Drag an image onto the drop zone, or click to browse.",
      "Adjust the quality slider (higher = larger file, lower = smaller file). 70–80% is usually invisible to the eye.",
      "Preview the compressed image alongside the original file-size savings.",
      "Click Download to save the compressed image.",
      "Load another image to compress next.",
    ],
    features: [
      { title: "Canvas-based re-encoding", desc: "Uses the browser's Canvas API — no server upload." },
      { title: "Quality slider", desc: "Fine-grained control from 10% to 100% quality." },
      { title: "Before/after preview", desc: "See visual quality and file-size reduction before you download." },
      { title: "EXIF stripped", desc: "GPS coordinates, camera model and timestamps are removed on re-encode — a privacy bonus." },
    ],
    benefits:
      "A single uncompressed phone photo is often 5–10 MB. Compressed to quality 75, the same image becomes 800 KB with no visible difference — a huge win for page speed, email attachments and cloud storage costs.",
    faqs: [
      { q: "Is the image uploaded to a server?", a: "No. Compression uses the browser's Canvas API — the image never leaves your device." },
      { q: "Which formats are supported?", a: "JPG, PNG and WebP inputs; output matches the input format." },
      { q: "How much smaller will my file be?", a: "For photos at quality 70–80, expect 60–80% file-size reduction with no visible loss. Graphics with sharp edges compress less." },
    ],
    description: [
      "Compression is the single highest-leverage optimisation for web performance. This tool makes it trivial.",
      "See also our Image Resizer to shrink dimensions before compression, Image Format Converter for JPG/PNG/WebP swaps, and EXIF Viewer for metadata inspection.",
    ],
  },

  "pdf-merge": {
    intro:
      "The PDF Merger combines two or more PDF files into a single document, preserving each page exactly. All processing happens in your browser using pdf-lib — files are never uploaded.",
    howTo: [
      "Drag your PDFs onto the drop zone, or click to browse.",
      "Reorder the files by dragging them into the sequence you want.",
      "Click Merge PDFs.",
      "Download the combined file when processing finishes.",
      "Use Reset to clear the queue and start over.",
    ],
    features: [
      { title: "Lossless page copy", desc: "Pages are copied byte-for-byte using pdf-lib — no re-encoding, no quality loss." },
      { title: "Drag-and-drop reordering", desc: "Rearrange files visually before merging." },
      { title: "Unlimited file count", desc: "Merge as many PDFs as your browser can hold in memory." },
      { title: "Zero upload", desc: "The whole merge runs client-side — great for contracts, invoices and bank statements." },
    ],
    benefits:
      "Consolidating tax returns, expense reports or loan applications into a single PDF is the single most common PDF task — and the one you least want to do on someone else's server.",
    faqs: [
      { q: "Are my PDFs uploaded?", a: "No. Merging runs entirely in your browser using pdf-lib; nothing leaves your device." },
      { q: "Is quality preserved?", a: "Yes — pages are copied at the object level, not re-encoded. Text, images and fonts remain identical." },
      { q: "How many PDFs can I merge?", a: "There's no fixed limit; it depends on your browser's memory. Hundreds of small PDFs work fine on modern machines." },
    ],
    description: [
      "PDF merging is a five-second job with the right tool. This one keeps everything on your device.",
      "See also our PDF Splitter, PDF Compressor and PDF Rotate for other browser-side PDF workflows.",
    ],
  },

  "length-converter": {
    intro:
      "The Length Converter switches between the length units you actually use — millimetres, centimetres, metres, kilometres, inches, feet, yards and miles. Type a value in any unit and every other unit updates instantly.",
    howTo: [
      "Enter a value in any of the input fields.",
      "Read the equivalent value in every other unit as it updates live.",
      "Change units by editing any field — there is no source-target selector to fight with.",
    ],
    features: [
      { title: "Live everywhere", desc: "Type in one field and every other unit updates instantly." },
      { title: "Exact math", desc: "Uses exact conversion constants — no cumulative rounding errors." },
      { title: "Metric and imperial", desc: "Millimetres to miles, all in one screen." },
    ],
    benefits:
      "Furniture measurements from an overseas store, race distances in mixed units, DIY plans that mix inches and centimetres — a good length converter shows every unit at once so you don't have to convert twice.",
    faqs: [
      { q: "How precise are the results?", a: "Uses JavaScript double-precision arithmetic — accurate to ~15 significant digits, far beyond any practical need." },
      { q: "Which units are supported?", a: "mm, cm, m, km, inches, feet, yards, and miles." },
    ],
    description: [
      "Length is the most-used conversion category, from shopping to construction to sports.",
      "See also our Weight Converter, Temperature Converter and Area Converter for the rest of the common suite.",
    ],
  },

  "temperature-converter": {
    intro:
      "The Temperature Converter switches between Celsius, Fahrenheit and Kelvin using the correct offset formulas (not simple multiplication). Type in any of the three fields and the other two update immediately.",
    howTo: [
      "Type a temperature in any of the three fields.",
      "Read the equivalent in the other two units, updated live.",
      "Clear the field to start again.",
    ],
    features: [
      { title: "Correct offset formulas", desc: "°F = °C × 9/5 + 32; K = °C + 273.15. Not simple multiplication — this tool handles the offsets." },
      { title: "Three-way conversion", desc: "Type in any of Celsius, Fahrenheit or Kelvin — the other two follow." },
    ],
    benefits:
      "Temperature is the one conversion where a simple multiplication is wrong. Getting it right in your head is easy to fumble; getting it right in this tool is instant.",
    faqs: [
      { q: "What are the exact formulas?", a: "Celsius to Fahrenheit: °F = °C × 9/5 + 32. Fahrenheit to Celsius: °C = (°F − 32) × 5/9. Celsius to Kelvin: K = °C + 273.15." },
      { q: "Does it handle negative values?", a: "Yes — Fahrenheit and Celsius routinely go negative and the formulas handle any real number." },
    ],
    description: [
      "Cooking, science homework, US weather forecasts — the three main uses. This tool covers all of them.",
      "See also our Length Converter, Weight Converter and other unit tools.",
    ],
  },

  "video-downloader": {
    intro:
      "The Video Downloader lets you save a video from a direct MP4 link or an HLS .m3u8 stream URL, entirely inside your browser. For MP4 links, it fetches the file as a blob and downloads it. For .m3u8 playlists, it parses the playlist, fetches every .ts segment in order, concatenates them into a single .ts file and downloads that. No server, no upload, no account.",
    howTo: [
      "Paste a direct video URL into the input field. It can be a .mp4 file link or a .m3u8 HLS playlist link.",
      "Click Download.",
      "For MP4 links, the file downloads directly to your device.",
      "For .m3u8 links, watch the progress bar as each segment downloads; the joined .ts file downloads when the last segment is done.",
      "Play the .ts file in VLC, MPV, IINA, or convert to MP4 later with a desktop tool if your player needs it.",
    ],
    features: [
      { title: "MP4 direct download", desc: "Fetches the file as a blob and saves it — perfect for any accessible .mp4 URL." },
      { title: "HLS (.m3u8) support", desc: "Parses master or media playlists, resolves relative segment URLs, and stitches every .ts segment into a single downloadable file." },
      { title: "Live progress", desc: "See segment count and current progress while a stream downloads." },
      { title: "No account, no upload", desc: "The whole download runs in your browser — the tool never sees your video." },
      { title: "Handles master playlists", desc: "If you paste a master playlist, the highest-bandwidth variant is selected automatically." },
    ],
    benefits:
      "Personal downloads from your own hosted content, saved lecture recordings, or accessible mirrors of your own streams — this tool makes it a one-click operation without installing ffmpeg or a browser extension. Everything happens in your browser tab.",
    faqs: [
      { q: "Why does the download fail on some URLs?", a: "Most likely CORS: many CDNs block cross-origin fetches from arbitrary websites. If the server does not send Access-Control-Allow-Origin, no browser-based tool (including this one) can read the bytes. Try a URL that allows CORS, or download from the same origin the file is hosted on." },
      { q: "Why does the .m3u8 result save as .ts and not .mp4?", a: "HLS segments are already MPEG-TS files. Producing MP4 requires container remuxing, which needs ffmpeg — not shipped in this browser tool to keep the download light. Modern players (VLC, MPV, IINA) play .ts directly; ffmpeg's remux command converts to .mp4 in one line if you need it." },
      { q: "Is there a file size limit?", a: "The limit is your available RAM. All segments are held in memory until the final file is written, so very long streams (multi-hour HD) may exceed browser memory on low-end devices." },
      { q: "Do you support DRM-protected streams?", a: "No. Encrypted HLS (Widevine, FairPlay, ClearKey) is not decrypted by this tool. Downloading protected content is also usually against the platform's terms of service." },
      { q: "What about YouTube, Instagram or other social platforms?", a: "Those services do not publish direct .mp4 or .m3u8 URLs; they serve DRM-protected or short-lived signed streams. This tool works only with public direct URLs you already have." },
      { q: "Is anything uploaded?", a: "No. The video passes through your browser's fetch stack only; nothing is sent to us and there is no processing server involved." },
    ],
    description: [
      "The Video Downloader is designed for the legitimate cases where you have a URL you're allowed to save from — a recording of your own webinar, a lecture your school has made openly available, an open-education .mp4, or an HLS mirror of content you own.",
      "For MP4 URLs, the tool uses the standard fetch API to pull the whole file into a blob and hand it to the browser as a download. For .m3u8, it parses the M3U8 text, follows master → media playlist redirection if needed, resolves every segment URL against the playlist's base, downloads each segment with a live progress counter, and concatenates the segments into a single MPEG-TS file.",
      "Because everything runs client-side, the tool cannot bypass CORS restrictions or platform DRM — those protections exist at the network and codec layer, not in the browser UI. Always check that you have the right to download whatever you are saving.",
      "See also our JSON to CSV Converter and PDF Merger for other browser-only file utilities.",
    ],
  },
};

// -----------------------------------------------------------------------------
// Category-aware fallback content — used for tools without a hand-written
// override. Crucially, this NEVER mentions file uploads or downloads unless
// the category actually supports them (image, pdf).
// -----------------------------------------------------------------------------
type ContentShape = "calculator" | "text" | "developer" | "converter" | "image" | "pdf";

function shapeOf(t: ToolMeta): ContentShape {
  return t.category as ContentShape;
}

function fallbackHowTo(shape: ContentShape, name: string): string[] {
  switch (shape) {
    case "calculator":
      return [
        `Fill in the required values in the ${name} input fields.`,
        `The result updates automatically as you type — no calculate button is needed.`,
        `Read the main result and any supporting totals shown alongside it.`,
        `Change any input to model a different scenario side by side.`,
        `Use the Reset button to clear the inputs and start again.`,
      ];
    case "text":
      return [
        `Paste or type your text into the ${name} input area.`,
        `Adjust any available options for how the text should be processed.`,
        `Run the tool by clicking the action button.`,
        `Read the transformed text in the output area.`,
        `Use the Copy button to copy the result to your clipboard, or Reset to clear both fields.`,
      ];
    case "developer":
      return [
        `Paste your input (JSON, HTML, CSS or code) into the ${name} input area.`,
        `Click the primary action button to process the input.`,
        `Review the formatted or transformed output on the right.`,
        `Use the Copy button to copy the output to your clipboard.`,
        `If there is a syntax error, the tool shows the exact line or character causing it.`,
      ];
    case "converter":
      return [
        `Type a value into any of the ${name} input fields.`,
        `The equivalent value in every other unit updates instantly.`,
        `Edit any field to convert in the opposite direction — there is no source-target selector.`,
        `Clear a field to start again.`,
      ];
    case "image":
      return [
        `Drag an image onto the drop zone, or click to browse.`,
        `Adjust the tool-specific options shown above the preview.`,
        `Preview the result inside the tool before saving.`,
        `Click Download to save the processed image to your device.`,
        `Load another image to process a new file.`,
      ];
    case "pdf":
      return [
        `Drag a PDF onto the drop zone, or click to browse.`,
        `Configure any tool-specific options (page range, order, quality).`,
        `Click the primary action button to run the operation.`,
        `Download the resulting PDF when processing finishes.`,
        `Use Reset to clear the queue and start again.`,
      ];
  }
}

function fallbackFeatures(shape: ContentShape, name: string) {
  const base = [
    { title: "100% in your browser", desc: `${name} runs entirely on your device — nothing is uploaded to any server.` },
    { title: "Instant results", desc: `Fast, on-device computation means results appear in milliseconds.` },
    { title: "Mobile friendly", desc: `Works on phones, tablets and desktops with the same responsive layout.` },
    { title: "No sign-up", desc: `Free forever, with no account, no limits and no watermark.` },
  ];
  if (shape === "image" || shape === "pdf") {
    base.push({ title: "Files stay private", desc: `Your file is processed locally and never leaves the browser tab.` });
  }
  if (shape === "developer" || shape === "text") {
    base.push({ title: "Copy with one click", desc: `Copy the output to your clipboard without opening any menu.` });
  }
  return base;
}

function fallbackFaqs(shape: ContentShape, name: string) {
  const common = [
    { q: `Is the ${name} free to use?`, a: `Yes. Every tool on ToolHub Pro is free, with no account, no limits and no watermark.` },
    { q: `Does the ${name} work on mobile?`, a: `Yes — the interface is responsive and works on any modern browser on iOS, Android, Windows, macOS or Linux.` },
    { q: `Which browsers are supported?`, a: `Any modern browser: Chrome, Edge, Firefox, Safari, Brave, Opera or Arc.` },
  ];
  if (shape === "image" || shape === "pdf") {
    common.unshift({ q: `Are my files uploaded to a server?`, a: `No. The ${name} processes your file entirely inside your browser using standard web APIs. Nothing is uploaded.` });
  } else {
    common.unshift({ q: `Is my input sent anywhere?`, a: `No. The ${name} runs entirely in your browser — nothing you enter is transmitted or logged.` });
  }
  return common;
}

export function generateToolContent(tool: ToolMeta): ToolContent {
  const cat = CATEGORIES[tool.category].name;
  const shape = shapeOf(tool);
  const name = tool.name;

  const defaults: ToolContent = {
    intro: `The ${name} is a focused, browser-based tool that does exactly what its name suggests: ${tool.description.toLowerCase()} Everything happens on your device, so results appear instantly and your data stays private.`,
    howTo: fallbackHowTo(shape, name),
    features: fallbackFeatures(shape, name),
    benefits: `The ${name} sits in the ${cat.toLowerCase()} suite on ToolHub Pro. Using it saves the friction of opening desktop software or trusting a random online service with your data. Because it is a single-purpose tool, it loads instantly and does its one job well — the two things that matter most in day-to-day use.`,
    faqs: fallbackFaqs(shape, name),
    description: [
      `The ${name} is one of ${cat.toLowerCase()} on ToolHub Pro, a small collection of hand-built browser utilities that avoid the two things that make most online tools painful: sign-up walls and server uploads.`,
      `The tool is intentionally focused. Rather than bundling every possible option into a single confusing interface, it does one thing well — that is what makes it fast and predictable.`,
      `If you have a suggestion for how to improve the ${name} or a feature you would like to see added, please share it via the Contact page. We review every suggestion and typically ship new tool improvements each month.`,
    ],
  };

  const override = OVERRIDES[tool.slug];
  if (!override) return defaults;
  return {
    intro: override.intro ?? defaults.intro,
    howTo: override.howTo ?? defaults.howTo,
    features: override.features ?? defaults.features,
    benefits: override.benefits ?? defaults.benefits,
    faqs: override.faqs ?? defaults.faqs,
    description: override.description ?? defaults.description,
  };
}
