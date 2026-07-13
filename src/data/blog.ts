export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readingTime: number;
  tags: string[];
  content: string; // markdown-ish plain HTML
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-compress-images-without-losing-quality",
    title: "How to Compress Images Without Losing Quality in 2026",
    excerpt: "Learn practical techniques and browser tools to shrink image size while preserving visual fidelity for web, blogs and social media.",
    category: "Image",
    author: "ToolHub Team",
    date: "2026-06-14",
    readingTime: 7,
    tags: ["images", "optimization", "performance"],
    content: `
<h2>Why image compression matters</h2>
<p>Images account for over 50% of the payload on most modern websites. Compressing them well is one of the highest-ROI performance wins you can make — it speeds up load times, improves Core Web Vitals, and helps SEO.</p>
<h2>Lossless vs lossy</h2>
<p>Lossless compression rearranges data without discarding any of it, while lossy compression removes visual information the human eye is least likely to notice. Modern encoders like MozJPEG, WebP and AVIF strike an excellent balance.</p>
<h2>Step-by-step in the browser</h2>
<ol><li>Open our <a href="/tools/image-compressor">Image Compressor</a>.</li><li>Drop a JPG, PNG or WebP file.</li><li>Choose a quality between 60-80 for photos.</li><li>Download the optimized image.</li></ol>
<h2>Pro tips</h2>
<p>Resize before compressing. Use WebP or AVIF for the web. Strip metadata if you don't need EXIF data.</p>
`,
  },
  {
    slug: "top-10-free-pdf-tools-online",
    title: "Top 10 Free PDF Tools You Can Use Online",
    excerpt: "A curated list of browser-based PDF tools — merge, split, compress, rotate and more — that run without uploads.",
    category: "PDF",
    author: "ToolHub Team",
    date: "2026-05-30",
    readingTime: 6,
    tags: ["pdf", "productivity"],
    content: `<h2>Why browser-based PDF tools?</h2><p>They keep your documents private (files never leave your device), work offline once loaded, and are usually faster than cloud tools.</p><h2>The list</h2><ul><li>PDF Merge</li><li>PDF Split</li><li>PDF Compressor</li><li>PDF Rotate</li><li>Reorder Pages</li></ul><p>Try them all in our <a href="/category/pdf">PDF Tools</a> section.</p>`,
  },
  {
    slug: "understanding-emi-a-complete-guide",
    title: "Understanding EMI: A Complete Guide for Borrowers",
    excerpt: "Everything you need to know about Equated Monthly Installments — the formula, factors and how to reduce your EMI.",
    category: "Finance",
    author: "ToolHub Team",
    date: "2026-05-10",
    readingTime: 8,
    tags: ["finance", "loans"],
    content: `<h2>What is EMI?</h2><p>EMI stands for Equated Monthly Installment. It is a fixed payment amount made by a borrower to a lender each month.</p><h2>The EMI formula</h2><p><code>EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]</code></p><p>Use our <a href="/tools/emi-calculator">EMI Calculator</a> to run the numbers instantly.</p>`,
  },
  {
    slug: "json-formatting-best-practices",
    title: "JSON Formatting Best Practices for Developers",
    excerpt: "Readable JSON is maintainable JSON. Here's how to format, validate and structure it well.",
    category: "Developer",
    author: "ToolHub Team",
    date: "2026-04-22",
    readingTime: 5,
    tags: ["json", "developer"],
    content: `<h2>Consistent indentation</h2><p>Pick 2 or 4 spaces and stick to it. Our <a href="/tools/json-formatter">JSON Formatter</a> handles either.</p><h2>Validate early</h2><p>Broken JSON is silent — always validate before shipping.</p>`,
  },
  {
    slug: "unit-conversion-cheatsheet",
    title: "The Ultimate Unit Conversion Cheatsheet",
    excerpt: "A quick reference for the most common length, weight, temperature and speed conversions.",
    category: "Reference",
    author: "ToolHub Team",
    date: "2026-04-05",
    readingTime: 4,
    tags: ["units", "reference"],
    content: `<h2>Length</h2><p>1 meter = 3.281 feet, 1 km = 0.621 miles.</p><h2>Weight</h2><p>1 kg = 2.205 lbs, 1 oz = 28.35 g.</p><p>Convert live with our <a href="/category/converter">Unit Converters</a>.</p>`,
  },
  {
    slug: "strong-passwords-and-modern-security",
    title: "Strong Passwords and Modern Account Security",
    excerpt: "How to build passwords that resist brute force and phishing, and why a password manager is non-negotiable.",
    category: "Security",
    author: "ToolHub Team",
    date: "2026-03-18",
    readingTime: 6,
    tags: ["security", "passwords"],
    content: `<h2>Length beats complexity</h2><p>A 16-character random passphrase beats an 8-character symbol soup.</p><p>Generate one with our <a href="/tools/password-generator">Password Generator</a>.</p>`,
  },
];

export const getPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
