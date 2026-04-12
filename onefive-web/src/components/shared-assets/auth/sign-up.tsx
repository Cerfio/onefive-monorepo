"use client";

import { useState } from "react";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { cx } from "@/utils/cx";
import { LogoMark } from "./logomark";

const tabs = [
    {
        id: "signup",
        label: "Sign up",
    },
    {
        id: "login",
        label: "Log in",
    },
];
export const SignupSimple = () => {
    const [password, setPassword] = useState("");

    return (
        <section className="min-h-screen overflow-hidden bg-primary px-4 py-12 md:px-8 md:pt-24">
            <div className="mx-auto flex w-full flex-col gap-8 sm:max-w-90">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                        <BackgroundPattern pattern="grid" className="absolute top-1/2 left-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block" />
                        <BackgroundPattern pattern="grid" size="md" className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden" />
                        <LogoMark size="lg" className="relative z-10 max-md:hidden" />
                        <LogoMark size="md" className="relative z-10 md:hidden" />
                    </div>
                    <div className="z-10 flex flex-col gap-2 md:gap-3">
                        <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">Create an account</h1>
                        <p className="text-md text-tertiary">Start your 30-day free trial.</p>
                    </div>
                    <Tabs className="z-10 w-full">
                        <TabList size="sm" fullwidth type="button-minimal" items={tabs} />
                    </Tabs>
                </div>

                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const data = Object.fromEntries(new FormData(e.currentTarget));
                        // TODO: Implement signup
                    }}
                    className="z-10 flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-5">
                        <Input isRequired hideRequiredIndicator label="Name" type="text" name="name" placeholder="Enter your name" size="md" />
                        <Input isRequired hideRequiredIndicator label="Email" type="email" name="email" placeholder="Enter your email" size="md" />
                        <Input
                            isRequired
                            hideRequiredIndicator
                            label="Password"
                            type="password"
                            name="password"
                            size="md"
                            placeholder="Create a password"
                            onChange={setPassword}
                            minLength={8}
                            pattern='.*[!@#$%^&*(),.?\":{}|<>].*'
                        />
                        <div className="flex flex-col gap-3">
                            <span className="flex gap-2">
                                <div
                                    className={cx(
                                        "flex size-5 items-center justify-center rounded-full bg-fg-disabled_subtle text-fg-white transition duration-150 ease-in-out",
                                        password.length >= 8 ? "bg-fg-success-primary" : "",
                                    )}
                                >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1.25 4L3.75 6.5L8.75 1.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm text-tertiary">Must be at least 8 characters</p>
                            </span>
                            <span className="flex gap-2">
                                <div
                                    className={cx(
                                        "flex size-5 items-center justify-center rounded-full bg-fg-disabled_subtle text-fg-white transition duration-150 ease-in-out",
                                        password.match(/[!@#$%^&*(),.?":{}|<>]/) ? "bg-fg-success-primary" : "",
                                    )}
                                >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1.25 4L3.75 6.5L8.75 1.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm text-tertiary">Must contain one special character</p>
                            </span>
                        </div>
                    </div>

                    <div className="z-10 flex flex-col gap-4">
                        <Button type="submit" size="lg">
                            Get started
                        </Button>
                        <SocialButton social="google" theme="color">
                            Sign up with Google
                        </SocialButton>
                    </div>
                </Form>

                <div className="flex justify-center gap-1 text-center">
                    <span className="text-sm text-tertiary">Already have an account?</span>
                    <Button href="/auth/login" color="link-color" size="md">
                        Log in
                    </Button>
                </div>
            </div>
        </section>
    );
};
