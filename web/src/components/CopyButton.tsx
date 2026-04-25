"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = "Copy", className, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Failed to copy");
        }
      }}
      {...rest}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
