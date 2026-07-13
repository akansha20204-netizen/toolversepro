import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", on);
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full gradient-primary text-white shadow-glow transition-all",
        show ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
