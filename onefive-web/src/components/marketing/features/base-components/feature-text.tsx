"use client";

import type { FC } from "react";
import { type ReactNode } from "react";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icons";

interface TextCentered {
    title: string;
    subtitle: string;

    footer?: ReactNode;
}

interface FeatureTextIcon extends TextCentered {
    icon: FC<{ className?: string }>;
}

export const FeatureTextFeaturedIconTopCenteredBrand = ({ icon, title, subtitle, footer }: FeatureTextIcon) => (
    <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <FeaturedIcon icon={icon} size="lg" color="brand" theme="dark" className="hidden md:inline-flex" />
        <FeaturedIcon icon={icon} size="md" color="brand" theme="dark" className="inline-flex md:hidden" />

        <div>
            <h3 className="text-lg font-semibold text-primary_on-brand">{title}</h3>
            <p className="mt-1 text-md text-tertiary_on-brand">{subtitle}</p>
        </div>

        {footer}
    </div>
);
