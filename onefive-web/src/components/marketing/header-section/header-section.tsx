"use client";
export const HeaderCentered = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">About us</span>
                    <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">About the company</h1>
                    <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">Learn more about the company and the world-class team behind Untitled.</p>
                </div>
            </div>
        </section>
    );
};
