import { Link } from "@tanstack/react-router";
import { Sparkles, Twitter, Facebook, Instagram, Github } from "lucide-react";
import { CATEGORIES } from "@/data/tools";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-bold font-display">
                ToolHub<span className="gradient-text"> Pro</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              70+ free browser-based tools for creators, students and developers. Fast, private and beautifully designed. Everything runs on your device.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <li key={key}>
                  <Link to="/category/$slug" params={{ slug: key }} className="hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/write-for-us" className="hover:text-foreground">Write For Us</Link></li>
              <li><Link to="/sitemap" className="hover:text-foreground">Sitemap</Link></li>
              <li><Link to="/export-blogger" className="hover:text-foreground">Export to Blogger</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
              <li><Link to="/dmca" className="hover:text-foreground">DMCA</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
              <li><Link to="/affiliate-disclosure" className="hover:text-foreground">Affiliate Disclosure</Link></li>
              <li><Link to="/refund" className="hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} ToolHub Pro. All rights reserved.</p>
          <p>Built with ❤️ — 100% browser, no uploads.</p>
        </div>
      </div>
    </footer>
  );
}
