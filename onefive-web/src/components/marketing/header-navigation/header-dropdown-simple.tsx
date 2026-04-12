"use client";

import { Header } from "./components/header";
import { DropdownMenuSimpleWithFooter as DropdownMenuSimple } from "./dropdown-header-navigation";

export const HeaderDropdownSimple = () => (
    <Header
        autoOpenMenu
        items={[
            { label: "Products", href: "/products", menu: <DropdownMenuSimple /> },
            { label: "Services", href: "/Services", menu: <DropdownMenuSimple /> },
            { label: "Pricing", href: "/pricing" },
            { label: "Resources", href: "/resources", menu: <DropdownMenuSimple /> },
            { label: "About", href: "/about" },
        ]}
    />
);
