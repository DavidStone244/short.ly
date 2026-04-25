import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card/40 px-4 py-2 text-sm backdrop-blur transition-all",
        "placeholder:text-muted-foreground/70",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-card/70 focus-visible:shadow-[0_0_0_3px_rgba(110,168,255,0.18),0_0_24px_-4px_rgba(110,168,255,0.45)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
