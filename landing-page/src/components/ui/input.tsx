"use client";
import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils/core/cn";
import type { LucideIcon } from "@/components/icons/_iconUtils";
import Eye from "@/components/icons/eye";
import EyeOff from "@/components/icons/eye-off";
import Search from "@/components/icons/search";

// Common Input classNames
const inputClasses = cn(
  "flex h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, ...props }, ref) => {
    const [show, setShow] = useState(false);

    if (type === "password") {
      return (
        <div className="relative w-full">
          <button
            onClick={() => setShow((prev) => !prev)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 transform px-1"
            type="button"
          >
            {show ? (
              <Eye className="size-4 text-muted-foreground" />
            ) : (
              <EyeOff className="size-4 text-muted-foreground" />
            )}
          </button>
          <input
            type={!show ? "password" : "text"}
            className={cn(inputClasses, "pl-8 pr-3", className)}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    if (type === "search") {
      return (
        <div className="relative flex w-full items-center">
          <div className="absolute left-1.5 px-1">
            <Search className="size-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            className={cn(
              inputClasses,
              "pl-8 pr-4",
              "flex items-center",
              "[&::-webkit-search-cancel-button]:order-last [&::-webkit-search-cancel-button]:mr-0.5 [&::-webkit-search-cancel-button]:ml-auto",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    const StartIcon = startIcon;
    return (
      <div className="relative w-full">
        {StartIcon && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 transform px-1">
            <StartIcon className="size-4 text-muted-foreground" />
          </div>
        )}

        <input
          type={type}
          className={cn(inputClasses, startIcon ? "pl-8" : "px-3", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
