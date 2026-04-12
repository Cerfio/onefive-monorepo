"use client";

import { Header } from "./components/header";
import { Menu2ColWithSidebar } from "./full-width-header-navigation";

export const Header2ColWithSidebar = () => (
    <Header
        autoOpenMenu
        isFullWidth
        items={[
            { label: "Products", href: "/products", menu: <Menu2ColWithSidebar /> },
            { label: "Services", href: "/Services", menu: <Menu2ColWithSidebar /> },
            { label: "Pricing", href: "/pricing" },
            { label: "Resources", href: "/resources", menu: <Menu2ColWithSidebar /> },
            { label: "About", href: "/about" },
        ]}
    />
);
