"use client";

import { cx } from "@/utils/cx";

const sizes = {
    xs: "size-4",
    sm: "size-5", 
    md: "size-6",
    lg: "size-8",
    xl: "size-10",
};

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    showText?: boolean;
    text?: string;
}

export const Spinner = ({ 
    size = "md", 
    className, 
    showText = false, 
    text = "Chargement..." 
}: SpinnerProps) => {
    return (
        <div className={cx("flex items-center justify-center gap-2", className)}>
            <svg
                fill="none"
                data-icon="loading"
                viewBox="0 0 20 20"
                className={cx(sizes[size])}
            >
                {/* Background circle */}
                <circle 
                    className="stroke-current opacity-30" 
                    cx="10" 
                    cy="10" 
                    r="8" 
                    fill="none" 
                    strokeWidth="2" 
                />
                {/* Spinning circle */}
                <circle
                    className="origin-center animate-spin stroke-current"
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray="12.5 50"
                    strokeLinecap="round"
                />
            </svg>
            {showText && (
                <span className="text-sm text-fg-secondary">{text}</span>
            )}
        </div>
    );
}; 