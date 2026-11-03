"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a reveal toggle.
 *
 * The toggle is `type="button"` so it never submits the form, and
 * `aria-pressed` tells assistive technology which state it is in.
 */
export function PasswordInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
}
