import { Tags } from "../enums/tags";

export const tags = [
  {
    enum: Tags.FUNDAMENTALS,
    title: "Fundamentals",
    bgColor: "bg-error-50",
    hoverBgColor: "hover:bg-error-100",
    textColor: "text-error-700",
    iconColor: "text-error-500",
    topicColor: "bg-error-500",
    icon: "📚",
  },
  {
    enum: Tags.MARKET,
    title: "Market",
    bgColor: "bg-primary-50",
    hoverBgColor: "hover:bg-primary-100",
    textColor: "text-primary-700",
    iconColor: "text-primary-500",
    topicColor: "bg-primary-500",
    icon: "📈",
  },
  {
    enum: Tags.MARKETING,
    title: "Marketing",
    bgColor: "bg-warning-50",
    hoverBgColor: "hover:bg-warning-100",
    textColor: "text-warning-700",
    iconColor: "text-warning-500",
    topicColor: "bg-warning-500",
    icon: "📣",
  },
  {
    enum: Tags.SALES,
    title: "Sales",
    bgColor: "bg-success-50",
    hoverBgColor: "hover:bg-success-100",
    textColor: "text-success-700",
    iconColor: "text-success-500",
    topicColor: "bg-success-500",
    icon: "💰",
  },
  {
    enum: Tags.SCALING_AND_GROWTH,
    title: "Scaling & Growth",
    bgColor: "bg-success-50",
    hoverBgColor: "hover:bg-success-100",
    textColor: "text-success-700",
    iconColor: "text-success-500",
    topicColor: "bg-success-500",
    icon: "🚀",
  },
  {
    enum: Tags.FUNDING_AND_INVESTMENT,
    title: "Funding & investment",
    bgColor: "bg-blue-light-50",
    hoverBgColor: "hover:bg-blue-light-100",
    textColor: "text-blue-light-700",
    iconColor: "text-blue-light-500",
    topicColor: "bg-blue-light-500",
    icon: "💸",
  },
  {
    enum: Tags.LEGAL,
    title: "Legal Advice",
    bgColor: "bg-indigo-50",
    hoverBgColor: "hover:bg-indigo-100",
    textColor: "text-indigo-700",
    iconColor: "text-indigo-500",
    topicColor: "bg-indigo-500",
    icon: "⚖️",
  },
  {
    enum: Tags.HUMAN_RESOURCES_AND_TEAM,
    title: "HR & Team",
    bgColor: "bg-pink-50",
    hoverBgColor: "hover:bg-pink-100",
    textColor: "text-pink-700",
    iconColor: "text-pink-500",
    topicColor: "bg-pink-500",
    icon: "🤝",
  },
  {
    enum: Tags.PRODUCT,
    title: "Product",
    bgColor: "bg-gray-blue-50",
    hoverBgColor: "hover:bg-gray-blue-100",
    textColor: "text-gray-blue-700",
    iconColor: "text-gray-blue-500",
    topicColor: "bg-gray-blue-500",
    icon: "🛠️",
  },
  {
    enum: Tags.TECHNOLOGY,
    title: "Tech",
    bgColor: "bg-gray-blue-50",
    hoverBgColor: "hover:bg-gray-blue-100",
    textColor: "text-gray-blue-700",
    iconColor: "text-gray-blue-500",
    topicColor: "bg-gray-blue-500",
    icon: "💻",
  },
  {
    enum: Tags.CUSTOMER,
    title: "Customer",
    bgColor: "bg-gray-blue-50",
    hoverBgColor: "hover:bg-gray-blue-100",
    textColor: "text-gray-blue-700",
    iconColor: "text-gray-blue-500",
    topicColor: "bg-gray-blue-500",
    icon: "🎯",
  },
];

export const getTagByInterest = (interest: string) =>
  tags.find((t) => t.title === interest || t.enum === interest);

export const getInterestDisplayLabel = (interest: string): string => {
  const tag = getTagByInterest(interest);
  if (tag) return tag.title;
  return interest
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};
