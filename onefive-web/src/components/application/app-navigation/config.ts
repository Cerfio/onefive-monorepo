export type NavItemType = {
    label: string;
    href?: string;
    icon?: any;
    badge?: any;
    items?: { label: string; href: string; icon?: any; badge?: any }[];
    divider?: boolean;
};

export type NavItemDividerType = Omit<NavItemType, "label" | "divider"> & {
    label?: string;
    divider: true;
};
