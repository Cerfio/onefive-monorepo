"use client";

import { type FC, type ReactNode, useState } from "react";
import { User01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { AvatarOnlineIndicator, VerifiedTick } from "./base-components";
import { generateInitials, generateAvatarBackgroundColor } from "@/lib/avatar-utils";

type AvatarSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarVariant = "default" | "profile";

export interface AvatarProps {
    size?: AvatarSize;
    className?: string;
    src?: string | null;
    alt?: string;
    /**
     * Display a contrast border around the avatar.
     */
    contrastBorder?: boolean;
    /**
     * Display a badge (i.e. company logo).
     */
    badge?: ReactNode;
    /**
     * Display a status indicator.
     */
    status?: "online" | "offline";
    /**
     * Display a verified tick icon.
     *
     * @default false
     */
    verified?: boolean;

    /**
     * The initials of the user to display if no image is available.
     */
    initials?: string;
    /**
     * The first name for automatic initials generation.
     */
    firstName?: string | null;
    /**
     * The last name for automatic initials generation.
     */
    lastName?: string | null;
    /**
     * An icon to display if no image is available.
     */
    placeholderIcon?: FC<{ className?: string }>;
    /**
     * A placeholder to display if no image is available.
     */
    placeholder?: ReactNode;

    /**
     * Whether the avatar should show a focus ring when the parent group is in focus.
     * For example, when the avatar is wrapped inside a link.
     *
     * @default false
     */
    focusable?: boolean;

    /**
     * Avatar style variant.
     * - "default": Standard avatar with colored background for initials
     * - "profile": Premium profile avatar style with neutral background and enhanced shadows
     *
     * @default "default"
     */
    variant?: AvatarVariant;
    /**
     * Avatar shape.
     * - "circle": Circular avatar (default)
     * - "square": Square avatar with rounded corners
     *
     * @default "circle"
     */
    shape?: "circle" | "square";
}

const styles = {
    xxs: { root: "size-4 outline-[0.5px] -outline-offset-[0.5px]", initials: "text-xs font-semibold", icon: "size-3" },
    xs: { root: "size-6 outline-[0.5px] -outline-offset-[0.5px]", initials: "text-xs font-semibold", icon: "size-4" },
    sm: { root: "size-8 outline-[0.75px] -outline-offset-[0.75px]", initials: "text-sm font-semibold", icon: "size-5" },
    md: { root: "size-10 outline-1 -outline-offset-1", initials: "text-md font-semibold", icon: "size-6" },
    lg: { root: "size-12 outline-1 -outline-offset-1", initials: "text-lg font-semibold", icon: "size-7" },
    xl: { root: "size-14 outline-1 -outline-offset-1", initials: "text-xl font-semibold", icon: "size-8" },
    "2xl": { root: "size-16 outline-1 -outline-offset-1", initials: "text-display-xs font-semibold", icon: "size-8" },
};

// Profile variant styles (premium look for profile pages)
const profileStyles = {
    sm: {
        root: "size-18 p-0.75",
        rootWithPlaceholder: "p-1",
        content: "",
        icon: "size-9",
        initials: "text-display-sm font-semibold",
        badge: "bottom-0.5 right-0.5",
    },
    md: {
        root: "size-24 p-1",
        rootWithPlaceholder: "p-1.25",
        content: "shadow-xl",
        icon: "size-12",
        initials: "text-display-md font-semibold",
        badge: "bottom-1 right-1",
    },
    lg: {
        root: "size-40 p-1.5",
        rootWithPlaceholder: "p-1.75",
        content: "shadow-2xl",
        icon: "size-20",
        initials: "text-display-xl font-semibold",
        badge: "bottom-2 right-2",
    },
};

const profileTickSizeMap = {
    sm: "2xl",
    md: "3xl",
    lg: "4xl",
} as const;

export const Avatar = ({
    contrastBorder = true,
    size = "md",
    src,
    alt,
    initials,
    firstName,
    lastName,
    placeholder,
    placeholderIcon: PlaceholderIcon,
    badge,
    status,
    verified,
    focusable = false,
    variant = "default",
    shape = "circle",
    className,
}: AvatarProps) => {
    const [isFailed, setIsFailed] = useState(false);

    // Génération automatique des initiales si pas fournies explicitement
    const finalInitials = initials || generateInitials(firstName, lastName);
    const backgroundColorStyle = finalInitials ? generateAvatarBackgroundColor(finalInitials) : null;
    
    // Classes de forme
    const shapeClass = shape === "square" ? "rounded-lg" : "rounded-full";

    // Variant profile: utilise un style premium
    if (variant === "profile") {
        const profileSize = size === "xxs" || size === "xs" || size === "xl" || size === "2xl" ? "md" : size;
        const pStyles = profileStyles[profileSize as "sm" | "md" | "lg"];

        const renderProfileMainContent = () => {
            if (src && !isFailed) {
                return (
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setIsFailed(true)}
                        className={cx(
                            "size-full object-cover",
                            shapeClass,
                            contrastBorder && "outline-1 -outline-offset-1 outline-avatar-contrast-border",
                            pStyles.content,
                        )}
                    />
                );
            }

            if (finalInitials) {
                return (
                    <div
                        className={cx("flex size-full items-center justify-center ring-1 ring-secondary_alt text-white", shapeClass, pStyles.content)}
                        style={backgroundColorStyle || undefined}
                    >
                        <span className={pStyles.initials}>{finalInitials}</span>
                    </div>
                );
            }

            if (PlaceholderIcon) {
                return (
                    <div className={cx("flex size-full items-center justify-center bg-tertiary ring-1 ring-secondary_alt", shapeClass, pStyles.content)}>
                        <PlaceholderIcon className={cx("text-fg-quaternary", pStyles.icon)} />
                    </div>
                );
            }

            return (
                <div className={cx("flex size-full items-center justify-center bg-tertiary ring-1 ring-secondary_alt", shapeClass, pStyles.content)}>
                    {placeholder || <User01 className={cx("text-fg-quaternary", pStyles.icon)} />}
                </div>
            );
        };

        const renderProfileBadgeContent = () => {
            if (status) {
                return <AvatarOnlineIndicator status={status} size={profileTickSizeMap[profileSize as "sm" | "md" | "lg"]} className={pStyles.badge} />;
            }

            if (verified) {
                return <VerifiedTick size={profileTickSizeMap[profileSize as "sm" | "md" | "lg"]} className={cx("absolute", pStyles.badge)} />;
            }

            return badge;
        };

        return (
            <div
                className={cx(
                    "relative flex shrink-0 items-center justify-center bg-primary ring-1 ring-secondary_alt",
                    shapeClass,
                    pStyles.root,
                    (!src || isFailed) && pStyles.rootWithPlaceholder,
                    className,
                )}
            >
                {renderProfileMainContent()}
                {renderProfileBadgeContent()}
            </div>
        );
    }

    // Variant default: style standard
    const renderMainContent = () => {
        if (src && !isFailed) {
            return <img data-avatar-img className={cx("size-full object-cover", shapeClass)} src={src} alt={alt} onError={() => setIsFailed(true)} />;
        }

        if (finalInitials) {
            return <span className={cx("text-white", styles[size].initials)}>{finalInitials}</span>;
        }

        if (PlaceholderIcon) {
            return <PlaceholderIcon className={cx("text-fg-quaternary", styles[size].icon)} />;
        }

        return placeholder || <User01 className={cx("text-fg-quaternary", styles[size].icon)} />;
    };

    const renderBadgeContent = () => {
        if (status) {
            return <AvatarOnlineIndicator status={status} size={size === "xxs" ? "xs" : size} />;
        }

        if (verified) {
            return (
                <VerifiedTick
                    size={size === "xxs" ? "xs" : size}
                    className={cx("absolute right-0 bottom-0", (size === "xxs" || size === "xs") && "-right-px -bottom-px")}
                />
            );
        }

        return badge;
    };

    return (
        <div
            data-avatar
            className={cx(
                "relative inline-flex shrink-0 items-center justify-center outline-transparent",
                shapeClass,
                // Utilise la couleur par défaut si pas d'initiales
                !finalInitials && "bg-avatar-bg",
                // Focus styles
                focusable && "group-outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2",
                contrastBorder && "outline outline-avatar-contrast-border",
                styles[size].root,
                className,
            )}
            style={backgroundColorStyle || undefined}
        >
            {renderMainContent()}
            {renderBadgeContent()}
        </div>
    );
};
