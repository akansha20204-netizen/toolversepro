import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Field = ({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium">{label}</span>
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
  </label>
);

export const TInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TInput(
  { className, ...p },
  ref,
) {
  return (
    <input
      ref={ref}
      {...p}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30",
        className,
      )}
    />
  );
});

export const TTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TTextarea({ className, ...p }, ref) {
    return (
      <textarea
        ref={ref}
        {...p}
        className={cn(
          "w-full min-h-32 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30 font-mono",
          className,
        )}
      />
    );
  },
);

export const TSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function TSelect({ className, ...p }, ref) {
    return (
      <select
        ref={ref}
        {...p}
        className={cn(
          "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30",
          className,
        )}
      />
    );
  },
);

type BProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
};
export const TButton = ({ className, variant = "primary", ...p }: BProps) => (
  <button
    {...p}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" && "gradient-primary text-white shadow-md hover:shadow-glow active:scale-[0.98]",
      variant === "outline" && "border border-border bg-background hover:bg-muted",
      variant === "ghost" && "hover:bg-muted",
      variant === "danger" && "bg-destructive text-destructive-foreground hover:opacity-90",
      className,
    )}
  />
);

export const ResultBox = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl border border-border bg-muted/40 p-5", className)}>{children}</div>
);

export const Stat = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl border border-border bg-background p-4">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="mt-1 text-lg font-bold">{value}</div>
  </div>
);

export const download = (data: BlobPart | Blob | Uint8Array | ArrayBuffer, filename: string, type = "application/octet-stream") => {
  const blob =
    data instanceof Blob
      ? data
      : data instanceof Uint8Array
        ? new Blob([new Uint8Array(data).buffer], { type })
        : new Blob([data as BlobPart], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
