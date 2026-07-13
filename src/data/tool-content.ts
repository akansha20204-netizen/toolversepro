import type { ToolMeta } from "./tools";
import { CATEGORIES } from "./tools";

interface ToolContent {
  intro: string;
  howTo: string[];
  features: { title: string; desc: string }[];
  benefits: string;
  faqs: { q: string; a: string }[];
  description: string[];
}

export function generateToolContent(tool: ToolMeta): ToolContent {
  const cat = CATEGORIES[tool.category].name;
  const n = tool.name;
  return {
    intro:
      `The ${n} is a free, browser-based tool built to make your work faster and simpler. ` +
      `${tool.description} Whether you are a student, professional, developer or a creator, this tool gives you an accurate result in seconds — with no signup, no watermark and no upload to any server. ` +
      `Everything runs locally on your device using modern web technology, so your data stays private and the tool works even on slow connections.`,
    howTo: [
      `Open the ${n} above on this page.`,
      `Enter your input or upload the required file into the tool.`,
      `Adjust the available options to match your requirements.`,
      `Click the primary action button to run the ${n}.`,
      `Review the result on screen and use Copy or Download to save it.`,
      `Use the Reset button anytime to start over with a fresh input.`,
    ],
    features: [
      { title: "100% Browser Based", desc: `The ${n} runs entirely in your browser — no data is uploaded to any server.` },
      { title: "Fast & Accurate", desc: `Get precise results instantly, powered by modern JavaScript engines.` },
      { title: "Mobile Friendly", desc: `A fully responsive interface that works beautifully on phones, tablets and desktops.` },
      { title: "Private & Secure", desc: `Your files and data never leave your device, ensuring complete privacy.` },
      { title: "Free Forever", desc: `Unlimited usage with no signup, no watermark and no hidden fees.` },
      { title: "Copy & Download", desc: `Save output as a file or copy it to your clipboard with a single click.` },
    ],
    benefits:
      `Using our ${n} saves valuable time compared to installing desktop software or juggling multiple online tools. ` +
      `Because everything happens client-side, results are near-instant and you can use it offline once the page has loaded. ` +
      `Professionals rely on ${n} for consistent, error-free output while students find it perfect for assignments and quick calculations. ` +
      `Content creators and developers value the clean design, lightning-fast performance and privacy-first approach that keeps sensitive data on their own device. ` +
      `Combined with our other ${cat.toLowerCase()} in ToolHub Pro, you get a complete productivity suite that works anywhere, anytime.`,
    faqs: [
      { q: `Is the ${n} really free?`, a: `Yes. Every tool on ToolHub Pro is completely free with unlimited usage. There are no hidden charges, no watermarks and no signup required.` },
      { q: `Does the ${n} upload my data?`, a: `No. The ${n} works 100% inside your browser. Nothing you enter or upload is sent to our servers.` },
      { q: `Which browsers are supported?`, a: `The ${n} works on all modern browsers including Chrome, Firefox, Edge, Safari, Brave and Opera on both desktop and mobile.` },
      { q: `Can I use the ${n} on mobile?`, a: `Absolutely. The interface is designed mobile-first and adapts perfectly to any screen size.` },
      { q: `Do I need to install anything?`, a: `No installation needed. Simply open this page and start using the ${n} right away.` },
      { q: `How accurate are the results?`, a: `The ${n} uses well-tested formulas and libraries, giving you results that match industry standards.` },
    ],
    description: [
      `The ${n} is part of ToolHub Pro's growing collection of premium ${cat.toLowerCase()}. Built with a focus on speed, privacy and clean design, it removes the friction that traditional desktop applications add to simple tasks. Everything you need is one click away, and every action returns a result immediately.`,
      `We built the ${n} because online utilities often overload users with ads, force account creation or upload sensitive files to remote servers. Our approach is different: modern web APIs are powerful enough to handle heavy computation directly on your device. That means faster results, complete privacy and a smoother experience overall.`,
      `Beyond the ${n}, you can explore over 70 additional tools across categories like calculators, image editing, PDF utilities, developer helpers, unit converters and text transformations. Each tool follows the same principles — beautiful UI, fast performance and no server round-trips.`,
      `If you found the ${n} useful, bookmark this page or share it with your team. Every share helps us maintain the tools completely free. And if you have a suggestion for a new feature, reach out through our Contact page — we ship user requests every week.`,
    ],
  };
}
