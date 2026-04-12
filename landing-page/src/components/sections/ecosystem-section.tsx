"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = [
  {
    feature: "professionalNetworking",
    onefive: "✅",
    linkedin: "✅",
    angelList: "✅",
  },
  {
    feature: "capitalManagementDataroom",
    onefive: "✅",
    linkedin: "❌",
    angelList: "✅",
  },
  {
    feature: "discover",
    onefive: "✅",
    linkedin: "❌",
    angelList: "❌",
  },
  {
    feature: "educationalResources",
    onefive: "✅",
    linkedin: "❌",
    angelList: "❌",
  },
  {
    feature: "startupInsightsAnalytics",
    onefive: "✅",
    linkedin: "❌",
    angelList: "❌",
  },
];

function TableDemo() {
  const t = useTranslations("home");

  return (
    <div className="w-full overflow-auto flex justify-center px-4 sm:px-8 lg:px-16">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">
              {t("featuresTable.features")}
            </TableHead>
            <TableHead className="w-[20%] text-center">Onefive</TableHead>
            <TableHead className="w-[20%] text-center">LinkedIn</TableHead>
            <TableHead className="w-[20%] text-center">AngelList</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.feature}>
              <TableCell className="font-medium">
                {t(`featuresTable.${feature.feature}`)}
              </TableCell>
              <TableCell className="text-center">{feature.onefive}</TableCell>
              <TableCell className="text-center">{feature.linkedin}</TableCell>
              <TableCell className="text-center">{feature.angelList}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EcosystemSection() {
  const t = useTranslations("home");

  return (
    <div className="mt-[700px] sm:mt-12 flex flex-col items-center justify-center px-4 sm:px-6">
      <h1 className="text-2xl sm:text-4xl font-bold text-center">
        {t("ecosystem")}
      </h1>
      <p className="text-base sm:text-lg text-[#344054] text-muted-foreground mb-8 text-center pt-4 max-w-2xl mx-auto">
        {t("ecosystemDescription")}
      </p>
      <TableDemo />
    </div>
  );
}

