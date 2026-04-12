"use client";

import { Button } from "@/components/base/buttons/button";

export const ContentSectionSplitImage01 = () => {
    return (
        <section className="flex flex-col gap-12 bg-primary py-16 md:gap-16 md:py-24">
            <div className="mx-auto flex w-full max-w-container flex-col items-stretch justify-between gap-8 px-4 md:flex-row md:items-start md:px-8">
                <div className="flex max-w-3xl flex-col">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Why we're different</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                        We bring honesty and transparency to financial services technology
                    </h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper mattis lorem non.
                    </p>
                </div>
                <Button size="xl">Get started</Button>
            </div>

            <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-8">
                <div className="prose md:prose-lg">
                    <p>
                        Dolor enim eu tortor urna sed duis nulla. Aliquam vestibulum, nulla odio nisl vitae. In aliquet pellentesque aenean hac vestibulum
                        turpis mi bibendum diam. Tempor integer aliquam in vitae malesuada fringilla.
                    </p>
                    <h2>Why we're better</h2>
                    <p>
                        Mi tincidunt elit, id quisque ligula ac diam, amet. Vel etiam suspendisse morbi eleifend faucibus eget vestibulum felis. Dictum quis
                        montes, sit sit. Tellus aliquam enim urna, etiam. Mauris posuere vulputate arcu amet, vitae nisi, tellus tincidunt. At feugiat sapien
                        varius id.
                    </p>
                    <p>
                        Eget quis mi enim, leo lacinia pharetra, semper. Eget in volutpat mollis at volutpat lectus velit, sed auctor. Porttitor fames arcu quis
                        fusce augue enim. Quis at habitant diam at. Suscipit tristique risus, at donec. In turpis vel et quam imperdiet. Ipsum molestie aliquet
                        sodales id est ac volutpat.{" "}
                    </p>
                </div>

                <img
                    className="h-60 w-full object-cover md:h-140"
                    alt="A girl with camera"
                    src="https://www.untitledui.com/marketing/content-section-01.webp"
                />
            </div>
        </section>
    );
};
