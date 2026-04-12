"use client";

import { ChartBreakoutSquare, MessageChatCircle, Zap } from "@untitledui/icons";
import { FeatureTextFeaturedIconTopCenteredBrand } from "./base-components/feature-text";

export const FeaturesSimpleIcons01Brand = () => {
    return (
        <section className="bg-brand-section py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <ul className="grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                    {[
                        {
                            title: "Share team inboxes",
                            subtitle: "Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.",
                            icon: MessageChatCircle,
                        },
                        {
                            title: "Deliver instant answers",
                            subtitle: "An all-in-one customer service platform that helps you balance everything your customers need to be happy.",
                            icon: Zap,
                        },
                        {
                            title: "Manage your team with reports",
                            subtitle:
                                "Measure what matters with Untitled's easy-to-use reports. You can filter, export, and drilldown on the data in a couple clicks.",
                            icon: ChartBreakoutSquare,
                        },
                    ].map((item) => (
                        <li key={item.title}>
                            <FeatureTextFeaturedIconTopCenteredBrand {...item} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
