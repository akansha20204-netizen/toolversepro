export type ToolCategory =
  | "calculator"
  | "image"
  | "pdf"
  | "text"
  | "developer"
  | "converter";

export interface ToolMeta {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // lucide-react icon name
  keywords: string[];
  featured?: boolean;
  popular?: boolean;
  trending?: boolean;
  latest?: boolean;
}

export const CATEGORIES: Record<
  ToolCategory,
  { name: string; description: string; icon: string; color: string }
> = {
  calculator: {
    name: "Calculators",
    description: "Financial, health & math calculators",
    icon: "Calculator",
    color: "from-blue-500 to-indigo-600",
  },
  image: {
    name: "Image Tools",
    description: "Compress, resize, convert & edit images",
    icon: "Image",
    color: "from-pink-500 to-rose-600",
  },
  pdf: {
    name: "PDF Tools",
    description: "Merge, split, compress & convert PDFs",
    icon: "FileText",
    color: "from-red-500 to-orange-600",
  },
  text: {
    name: "Text Tools",
    description: "Format, count & transform text",
    icon: "Type",
    color: "from-emerald-500 to-teal-600",
  },
  developer: {
    name: "Developer Tools",
    description: "JSON, HTML, CSS & code utilities",
    icon: "Code2",
    color: "from-violet-500 to-purple-600",
  },
  converter: {
    name: "Unit Converters",
    description: "Length, weight, temperature & more",
    icon: "ArrowLeftRight",
    color: "from-amber-500 to-yellow-600",
  },
};

export const TOOLS: ToolMeta[] = [
  // Calculators (15)
  { slug: "age-calculator", name: "Age Calculator", category: "calculator", description: "Calculate your exact age in years, months, days, hours and minutes.", icon: "Cake", keywords: ["age", "birthday", "years"], featured: true, popular: true },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "calculator", description: "Body Mass Index calculator for adults with health category.", icon: "Activity", keywords: ["bmi", "health", "weight"], popular: true },
  { slug: "emi-calculator", name: "EMI Calculator", category: "calculator", description: "Calculate monthly EMI for home, car and personal loans.", icon: "Landmark", keywords: ["emi", "loan"], featured: true, trending: true },
  { slug: "loan-calculator", name: "Loan Calculator", category: "calculator", description: "Estimate total interest and repayment on any loan.", icon: "Banknote", keywords: ["loan", "interest"] },
  { slug: "gst-calculator", name: "GST Calculator", category: "calculator", description: "Calculate GST inclusive and exclusive amounts instantly.", icon: "Receipt", keywords: ["gst", "tax"], popular: true },
  { slug: "sip-calculator", name: "SIP Calculator", category: "calculator", description: "Systematic Investment Plan return calculator.", icon: "TrendingUp", keywords: ["sip", "mutual fund"], trending: true },
  { slug: "fd-calculator", name: "FD Calculator", category: "calculator", description: "Fixed Deposit maturity and interest calculator.", icon: "PiggyBank", keywords: ["fd", "deposit"] },
  { slug: "percentage-calculator", name: "Percentage Calculator", category: "calculator", description: "Solve any percentage problem in seconds.", icon: "Percent", keywords: ["percentage"] },
  { slug: "discount-calculator", name: "Discount Calculator", category: "calculator", description: "Compute final price and savings after discount.", icon: "Tag", keywords: ["discount", "sale"] },
  { slug: "profit-loss-calculator", name: "Profit & Loss Calculator", category: "calculator", description: "Calculate profit or loss and margin percentage.", icon: "LineChart", keywords: ["profit", "loss"] },
  { slug: "simple-interest-calculator", name: "Simple Interest Calculator", category: "calculator", description: "Compute simple interest on principal.", icon: "Coins", keywords: ["interest"] },
  { slug: "compound-interest-calculator", name: "Compound Interest Calculator", category: "calculator", description: "Compound interest with flexible compounding.", icon: "Sigma", keywords: ["compound"], featured: true },
  { slug: "average-calculator", name: "Average Calculator", category: "calculator", description: "Mean, median and mode of any number set.", icon: "Divide", keywords: ["average", "mean"] },
  { slug: "date-difference-calculator", name: "Date Difference Calculator", category: "calculator", description: "Days, weeks, months between two dates.", icon: "CalendarDays", keywords: ["date"], latest: true },
  { slug: "time-duration-calculator", name: "Time Duration Calculator", category: "calculator", description: "Hours, minutes and seconds between two times.", icon: "Timer", keywords: ["time"], latest: true },

  // Image Tools (15)
  { slug: "image-compressor", name: "Image Compressor", category: "image", description: "Reduce image file size without quality loss.", icon: "Minimize2", keywords: ["compress"], featured: true, popular: true },
  { slug: "image-resizer", name: "Image Resizer", category: "image", description: "Resize images to any width and height.", icon: "Maximize", keywords: ["resize"], popular: true },
  { slug: "image-cropper", name: "Image Cropper", category: "image", description: "Crop images to exact dimensions in browser.", icon: "Crop", keywords: ["crop"] },
  { slug: "image-rotator", name: "Image Rotator", category: "image", description: "Rotate images 90°, 180° or any angle.", icon: "RotateCw", keywords: ["rotate"] },
  { slug: "image-flipper", name: "Image Flipper", category: "image", description: "Flip images horizontally or vertically.", icon: "FlipHorizontal", keywords: ["flip", "mirror"] },
  { slug: "image-to-pdf", name: "Image to PDF", category: "image", description: "Convert a single image to a PDF document.", icon: "FileImage", keywords: ["image", "pdf"], featured: true },
  { slug: "images-to-pdf", name: "Images to PDF", category: "image", description: "Combine multiple images into one PDF.", icon: "Files", keywords: ["images", "pdf"], trending: true },
  { slug: "image-to-base64", name: "Image to Base64", category: "image", description: "Encode images to Base64 data URI.", icon: "Binary", keywords: ["base64"] },
  { slug: "base64-to-image", name: "Base64 to Image", category: "image", description: "Decode Base64 string back to an image.", icon: "Image", keywords: ["base64"] },
  { slug: "image-format-converter", name: "Image Format Converter", category: "image", description: "Convert between JPG, PNG and WebP.", icon: "Repeat", keywords: ["jpg", "png", "webp"], popular: true },
  { slug: "image-color-picker", name: "Image Color Picker", category: "image", description: "Pick colors from any pixel of an image.", icon: "Pipette", keywords: ["color"] },
  { slug: "favicon-generator", name: "Favicon Generator", category: "image", description: "Generate favicons in all standard sizes.", icon: "Star", keywords: ["favicon"] },
  { slug: "image-grayscale", name: "Image Grayscale Converter", category: "image", description: "Convert any image to black & white.", icon: "Contrast", keywords: ["grayscale"] },
  { slug: "image-brightness-contrast", name: "Brightness & Contrast Adjuster", category: "image", description: "Adjust image brightness and contrast live.", icon: "Sun", keywords: ["brightness"], latest: true },
  { slug: "exif-viewer", name: "Image EXIF Viewer", category: "image", description: "View EXIF metadata from your photos.", icon: "Info", keywords: ["exif", "metadata"], latest: true },

  // PDF Tools (10)
  { slug: "pdf-merge", name: "PDF Merger", category: "pdf", description: "Combine multiple PDFs into a single document.", icon: "Combine", keywords: ["merge"], featured: true, popular: true },
  { slug: "pdf-split", name: "PDF Splitter", category: "pdf", description: "Split a PDF into individual pages.", icon: "Split", keywords: ["split"], popular: true },
  { slug: "pdf-rotate", name: "PDF Rotate", category: "pdf", description: "Rotate one or all pages in a PDF.", icon: "RotateCw", keywords: ["rotate"] },
  { slug: "pdf-compress", name: "PDF Compressor", category: "pdf", description: "Reduce PDF file size for easy sharing.", icon: "FileArchive", keywords: ["compress"], trending: true },
  { slug: "pdf-to-images", name: "PDF to Images", category: "pdf", description: "Export each PDF page as an image.", icon: "Images", keywords: ["pdf", "image"] },
  { slug: "pdf-extract-pages", name: "Extract PDF Pages", category: "pdf", description: "Extract selected pages as a new PDF.", icon: "FileOutput", keywords: ["extract"] },
  { slug: "pdf-delete-pages", name: "Delete PDF Pages", category: "pdf", description: "Remove unwanted pages from a PDF.", icon: "Trash2", keywords: ["delete"] },
  { slug: "pdf-reorder-pages", name: "Reorder PDF Pages", category: "pdf", description: "Rearrange PDF pages via drag & drop.", icon: "ArrowUpDown", keywords: ["reorder"] },
  { slug: "pdf-preview", name: "PDF Preview", category: "pdf", description: "Preview any PDF page instantly in browser.", icon: "Eye", keywords: ["preview"] },
  { slug: "pdf-page-counter", name: "PDF Page Counter", category: "pdf", description: "Count the total pages in a PDF.", icon: "Hash", keywords: ["count"] },

  // Text Tools (10)
  { slug: "word-counter", name: "Word Counter", category: "text", description: "Count words, characters, sentences and paragraphs.", icon: "AlignLeft", keywords: ["word"], featured: true, popular: true },
  { slug: "character-counter", name: "Character Counter", category: "text", description: "Live character count with and without spaces.", icon: "Type", keywords: ["character"] },
  { slug: "case-converter", name: "Case Converter", category: "text", description: "UPPER, lower, Title, Sentence and more.", icon: "CaseSensitive", keywords: ["case"], popular: true },
  { slug: "remove-extra-spaces", name: "Remove Extra Spaces", category: "text", description: "Clean up double spaces and trim whitespace.", icon: "Space", keywords: ["whitespace"] },
  { slug: "remove-duplicate-lines", name: "Remove Duplicate Lines", category: "text", description: "Deduplicate lines with one click.", icon: "ListFilter", keywords: ["duplicate"] },
  { slug: "text-sorter", name: "Text Sorter", category: "text", description: "Sort lines alphabetically or by length.", icon: "ArrowDownAZ", keywords: ["sort"] },
  { slug: "text-reverser", name: "Text Reverser", category: "text", description: "Reverse text, words or lines instantly.", icon: "FlipHorizontal2", keywords: ["reverse"] },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", category: "text", description: "Generate placeholder text for designs.", icon: "FileText", keywords: ["lorem"], trending: true },
  { slug: "slug-generator", name: "Slug Generator", category: "text", description: "Convert text into SEO-friendly URL slugs.", icon: "Link", keywords: ["slug", "url"] },
  { slug: "random-text", name: "Random Text Generator", category: "text", description: "Generate random strings and paragraphs.", icon: "Shuffle", keywords: ["random"], latest: true },

  // Developer Tools (10)
  { slug: "json-formatter", name: "JSON Formatter", category: "developer", description: "Pretty-print and highlight JSON.", icon: "Braces", keywords: ["json"], featured: true, popular: true },
  { slug: "json-validator", name: "JSON Validator", category: "developer", description: "Validate JSON with precise error messages.", icon: "CheckCircle2", keywords: ["json"] },
  { slug: "json-minifier", name: "JSON Minifier", category: "developer", description: "Minify JSON to reduce payload size.", icon: "Minimize2", keywords: ["json"] },
  { slug: "html-beautifier", name: "HTML Beautifier", category: "developer", description: "Format messy HTML into clean markup.", icon: "Code", keywords: ["html"] },
  { slug: "html-minifier", name: "HTML Minifier", category: "developer", description: "Minify HTML for production.", icon: "FileCode", keywords: ["html"] },
  { slug: "css-beautifier", name: "CSS Beautifier", category: "developer", description: "Format CSS into readable style.", icon: "Palette", keywords: ["css"] },
  { slug: "css-minifier", name: "CSS Minifier", category: "developer", description: "Compress CSS for faster page loads.", icon: "PaintBucket", keywords: ["css"], trending: true },
  { slug: "js-beautifier", name: "JavaScript Beautifier", category: "developer", description: "Beautify minified JavaScript code.", icon: "FileJson", keywords: ["js"] },
  { slug: "password-generator", name: "Password Generator", category: "developer", description: "Generate strong, random passwords.", icon: "KeyRound", keywords: ["password"], popular: true },
  { slug: "uuid-generator", name: "UUID Generator", category: "developer", description: "Generate v4 UUIDs in bulk.", icon: "Fingerprint", keywords: ["uuid"] },
  { slug: "json-to-csv-converter", name: "JSON to CSV Converter", category: "developer", description: "Convert JSON files or pasted JSON to downloadable CSV with nested key flattening.", icon: "FileSpreadsheet", keywords: ["json", "csv", "convert", "export"], latest: true },

  // Unit Converters (10)
  { slug: "length-converter", name: "Length Converter", category: "converter", description: "Meters, feet, inches, miles and more.", icon: "Ruler", keywords: ["length"], popular: true },
  { slug: "weight-converter", name: "Weight Converter", category: "converter", description: "Kg, lbs, oz, grams — instant conversion.", icon: "Weight", keywords: ["weight"] },
  { slug: "temperature-converter", name: "Temperature Converter", category: "converter", description: "Celsius, Fahrenheit and Kelvin.", icon: "Thermometer", keywords: ["temperature"], featured: true },
  { slug: "area-converter", name: "Area Converter", category: "converter", description: "Sq meters, acres, hectares and more.", icon: "Square", keywords: ["area"] },
  { slug: "volume-converter", name: "Volume Converter", category: "converter", description: "Liters, gallons, cups and cubic units.", icon: "Beaker", keywords: ["volume"] },
  { slug: "speed-converter", name: "Speed Converter", category: "converter", description: "km/h, mph, knots and m/s.", icon: "Gauge", keywords: ["speed"] },
  { slug: "time-converter", name: "Time Converter", category: "converter", description: "Convert between time units.", icon: "Clock", keywords: ["time"] },
  { slug: "data-converter", name: "Data Storage Converter", category: "converter", description: "Bytes, KB, MB, GB, TB.", icon: "HardDrive", keywords: ["data"], trending: true },
  { slug: "pressure-converter", name: "Pressure Converter", category: "converter", description: "Pascal, bar, PSI and atmospheres.", icon: "Wind", keywords: ["pressure"], latest: true },
  { slug: "energy-converter", name: "Energy Converter", category: "converter", description: "Joules, calories, kWh and more.", icon: "Zap", keywords: ["energy"], latest: true },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const getToolsByCategory = (c: ToolCategory) => TOOLS.filter((t) => t.category === c);
export const searchTools = (q: string) => {
  const s = q.toLowerCase().trim();
  if (!s) return [];
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.category.includes(s) ||
      t.keywords.some((k) => k.includes(s)),
  );
};
