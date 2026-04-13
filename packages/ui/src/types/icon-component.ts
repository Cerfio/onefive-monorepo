/**
 * Replaces `FC<…>` for icon props. Parameter and return are `any` to avoid React 19
 * `ReactNode` incompatibilities between `react` and libraries (e.g. react-aria) in this monorepo.
 */
export type IconComponent = (props: any) => any;

export type IconComponentStroke = (props: any) => any;

export type HtmlOrSvgIcon = (props: any) => any;
