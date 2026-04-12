"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BackgroundCircle {
  size: number;
  top: string;
  left: string;
  color: string;
}

interface InvestmentProgress {
  logo: string;
  companyName: string;
  roundType: string;
  raised: string;
  target: string;
  progressPercent: number;
  valuation: string;
  minInvestment: string;
}

interface PortfolioStats {
  totalValue: string;
  companies: Array<{
    name: string;
    color: string;
    performance: string;
  }>;
}

interface InvestorProfile {
  top: string;
  left: string;
  image: string;
  amount: string;
  company: string;
  animate: number[];
}

interface FundingTrend {
  growth: string;
  monthlyData: number[];
}

interface InvestmentInterfaceProps {
  backgroundCircles?: BackgroundCircle[];
  investmentProgress?: InvestmentProgress;
  portfolioStats?: PortfolioStats;
  investorProfiles?: InvestorProfile[];
  fundingTrend?: FundingTrend;
}

export default function InvestmentInterface({
  backgroundCircles = [
    { size: 400, top: "5%", left: "10%", color: "#B59544" },
    { size: 340, top: "60%", left: "75%", color: "#4489B5" },
    { size: 280, top: "75%", left: "15%", color: "#7F56D9" },
  ],
  investmentProgress = {
    logo: "/facebook.webp",
    companyName: "Facebook",
    roundType: "Seed Round",
    raised: "€1.2M",
    target: "€2M",
    progressPercent: 60,
    valuation: "€8M",
    minInvestment: "€10K",
  },
  portfolioStats = {
    totalValue: "€148,500",
    companies: [
      { name: "Facebook", color: "bg-[#7F56D9]", performance: "+18.2%" },
      { name: "Crunchbase", color: "bg-[#F63D68]", performance: "+7.4%" },
      { name: "Reddit", color: "bg-[#12B76A]", performance: "+32.1%" },
    ],
  },
  investorProfiles = [
    {
      top: "320px",
      left: "10px",
      image: "/nicolas-wang.png",
      amount: "€25K",
      company: "Lime",
      animate: [-5, 5],
    },
    {
      top: "232px",
      left: "30px",
      image: "/isobel-fuller.jpg",
      amount: "€75K",
      company: "Seyna",
      animate: [5, -5],
    },
    {
      top: "280px",
      left: "120px",
      image: "/jackson-reed.png",
      amount: "€40K",
      company: "Orbit",
      animate: [-3, 3],
    },
  ],
  fundingTrend = {
    growth: "+12.5%",
    monthlyData: [35, 48, 32, 55, 42, 58, 65, 42, 48, 60, 52, 70],
  },
}: InvestmentInterfaceProps) {
  return (
    <div className="relative p-4 w-max-[500px] bg-white rounded-xl overflow-hidden">
      {/* Background gradient elements */}
      {backgroundCircles.map((circle, index) => (
        <div
          key={`investment-circle-${index}`}
          className="absolute rounded-full -z-10 blur-3xl"
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            background: circle.color,
            opacity: 0.05,
          }}
        />
      ))}

      {/* Desktop/Tablet layout */}
      <div className="hidden sm:block relative h-[400px]">
        {/* Investment Progress Card */}
        <motion.div
          className="absolute top-10 z-10 left-8 w-72 bg-white rounded-xl shadow-md border border-gray-200 p-4"
          animate={{ y: [-5, 5] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Image
                src={investmentProgress.logo}
                alt="Startup Logo"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">{investmentProgress.companyName}</span>
            </div>
            <Badge className="bg-[#F9F5FF] text-[#7F56D9] border-0 text-xs">
              {investmentProgress.roundType}
            </Badge>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Raised</span>
              <span className="font-semibold">{investmentProgress.raised} / {investmentProgress.target}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7F56D9] rounded-full"
                style={{ width: `${investmentProgress.progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Valuation</div>
              <div className="font-semibold">{investmentProgress.valuation}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">
                Min. investment
              </div>
              <div className="font-semibold">{investmentProgress.minInvestment}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full text-xs h-8">
            View opportunity
          </Button>
        </motion.div>

        {/* Portfolio Performance Card */}
        <motion.div
          className="absolute right-2 top-48 sm:top-auto sm:right-2 w-48 sm:w-56 bg-white rounded-xl shadow-md border border-gray-200 p-4"
          animate={{ y: [-6, 6] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.7,
          }}
        >
          <div className="text-sm font-semibold mb-3">
            Your Portfolio
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 22H22"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.75 4V22H14.25V4C14.25 2.9 13.8 2 12.45 2H11.55C10.2 2 9.75 2.9 9.75 4Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10V22H7V10C7 8.9 6.6 8 5.4 8H4.6C3.4 8 3 8.9 3 10Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 15V22H21V15C21 13.9 20.6 13 19.4 13H18.6C17.4 13 17 13.9 17 15Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs">Total value</div>
              <div className="font-semibold">{portfolioStats.totalValue}</div>
            </div>
          </div>
          <div className="space-y-2">
            {portfolioStats.companies.map((company, index) => (
              <div key={`company-${index}`} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${company.color}`}></div>
                  <span className="text-xs">{company.name}</span>
                </div>
                <span className="text-xs font-medium">{company.performance}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Investor Profiles */}
        {investorProfiles.map((investor, i) => (
          <motion.div
            key={`investor-${i}`}
            className="absolute w-fit hidden sm:block"
            style={{
              top: investor.top,
              left: investor.left,
              "@media (maxWidth: 640px)": {
                top: `calc(${investor.top} - 50px)`,
                left: `calc(${investor.left} - 20px)`,
              },
            }}
            animate={{ y: investor.animate }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex items-center gap-3">
              <Image
                src={investor.image}
                alt="Investor"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#F2F4F7]"
              />
              <div>
                <div className="text-xs font-semibold">
                  {investor.amount}
                </div>
                <div className="text-[10px] text-gray-500">
                  Invested in {investor.company}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Funding Trends Chart */}
        <motion.div
          className="absolute z-20 bottom-2 right-6 w-64 bg-white rounded-xl shadow-md border border-gray-200 p-3"
          animate={{ y: [4, -4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold">
              Funding Trends
            </div>
            <Badge className="bg-[#ECFDF3] text-[#12B76A] border-0 text-xs">
              {fundingTrend.growth}
            </Badge>
          </div>
          <div className="h-24 flex items-end gap-1 mb-1">
            {fundingTrend.monthlyData.map((height, i) => (
              <div
                key={`bar-${i}`}
                className="flex-1 rounded-t"
                style={{
                  height: `${height}%`,
                  background: i === fundingTrend.monthlyData.length - 1 ? "#7F56D9" : "#E9D7FE",
                }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden flex flex-col items-center gap-4">
        {/* Investment Progress Card - Mobile */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-xl shadow-md border border-gray-200 p-4"
          animate={{ y: [-3, 3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Image
                src={investmentProgress.logo}
                alt="Startup Logo"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">{investmentProgress.companyName}</span>
            </div>
            <Badge className="bg-[#F9F5FF] text-[#7F56D9] border-0 text-xs">
              {investmentProgress.roundType}
            </Badge>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Raised</span>
              <span className="font-semibold">{investmentProgress.raised} / {investmentProgress.target}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7F56D9] rounded-full"
                style={{ width: `${investmentProgress.progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Valuation</div>
              <div className="font-semibold">{investmentProgress.valuation}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">
                Min. investment
              </div>
              <div className="font-semibold">{investmentProgress.minInvestment}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full text-xs h-8">
            View opportunity
          </Button>
        </motion.div>

        {/* Portfolio Performance Card - Mobile */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-xl shadow-md border border-gray-200 p-4"
          animate={{ y: [3, -3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="text-sm font-semibold mb-3">
            Your Portfolio
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 22H22"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.75 4V22H14.25V4C14.25 2.9 13.8 2 12.45 2H11.55C10.2 2 9.75 2.9 9.75 4Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10V22H7V10C7 8.9 6.6 8 5.4 8H4.6C3.4 8 3 8.9 3 10Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 15V22H21V15C21 13.9 20.6 13 19.4 13H18.6C17.4 13 17 13.9 17 15Z"
                  stroke="#7F56D9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs">Total value</div>
              <div className="font-semibold">{portfolioStats.totalValue}</div>
            </div>
          </div>
          <div className="space-y-2">
            {portfolioStats.companies.map((company, index) => (
              <div key={`company-mobile-${index}`} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${company.color}`}></div>
                  <span className="text-xs">{company.name}</span>
                </div>
                <span className="text-xs font-medium">{company.performance}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Funding Trends Chart - Mobile */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-xl shadow-md border border-gray-200 p-3"
          animate={{ y: [-2, 2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold">
              Funding Trends
            </div>
            <div className="text-xs font-medium text-[#039855]">
              {fundingTrend.growth}
            </div>
          </div>
          <div className="h-12">
            <div className="flex items-end h-full justify-between gap-[2px]">
              {fundingTrend.monthlyData.map((value, index) => (
                <div
                  key={`funding-bar-mobile-${index}`}
                  className="w-full max-w-[4px] bg-[#7F56D9] rounded-t-sm"
                  style={{
                    height: `${(value / 70) * 100}%`,
                    opacity: index === fundingTrend.monthlyData.length - 1 ? 1 : 0.6,
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-gray-500 mt-2">
            Monthly trends (Past 12 months)
          </div>
        </motion.div>

        {/* Investor Profiles - Mobile */}
        {investorProfiles.map((investor, i) => (
          <motion.div
            key={`investor-mobile-${i}`}
            className="w-full max-w-xs"
            animate={{ y: [-2, 2] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex items-center gap-3">
              <Image
                src={investor.image}
                alt="Investor"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#F2F4F7]"
              />
              <div>
                <div className="text-xs font-semibold">
                  {investor.amount}
                </div>
                <div className="text-[10px] text-gray-500">
                  Invested in {investor.company}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 