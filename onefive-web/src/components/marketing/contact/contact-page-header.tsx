"use client";

import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import countries, { phoneCodeOptions } from "@/utils/countries";

export const ContactSimpleForm = () => {
    const [selectedCountryPhone, setSelectedCountryPhone] = useState("US");

    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Contact us</span>
                    <h2 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">Get in touch</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">We'd love to hear from you. Please fill out this form.</p>
                </div>

                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        // TODO: Implement contact form API
                    }}
                    className="mx-auto mt-16 flex flex-col gap-8 md:mt-24 md:max-w-120"
                >
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-x-8 gap-y-6 md:flex-row">
                            <Input isRequired size="md" name="firstName" label="First name" placeholder="First name" wrapperClassName="flex-1" />
                            <Input isRequired size="md" name="lastName" label="Last name" placeholder="Last name" wrapperClassName="flex-1" />
                        </div>
                        <Input isRequired size="md" name="email" label="Email" type="email" placeholder="you@company.com" />
                        <InputGroup
                            size="md"
                            name="phone"
                            label="Phone number"
                            leadingAddon={
                                <NativeSelect
                                    value={selectedCountryPhone}
                                    onChange={(value) => setSelectedCountryPhone(value.currentTarget.value)}
                                    options={phoneCodeOptions.map((item) => ({
                                        label: item.label as string,
                                        value: item.id as string,
                                    }))}
                                />
                            }
                        >
                            <InputBase
                                type="tel"
                                placeholder={countries.find((country) => country.code === selectedCountryPhone)?.phoneMask?.replaceAll("#", "0")}
                            />
                        </InputGroup>
                        <TextArea isRequired label="Message" placeholder="Leave us a message..." rows={5} />
                        <Checkbox
                            name="privacy"
                            size="md"
                            hint={
                                <>
                                    You agree to our friendly{" "}
                                    <a
                                        href="/privacy-policy"
                                        className="rounded-sm underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        privacy policy.
                                    </a>
                                </>
                            }
                        />
                    </div>

                    <Button type="submit" size="xl">
                        Send message
                    </Button>
                </Form>
            </div>
        </section>
    );
};
