"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface SecurityActivity {
  status: string;
  statusColor: string;
  message: string;
  timestamp: string;
}

interface DocumentPreview {
  imageSrc: string;
  fileName: string;
  lastUpdated: string;
  status: string;
  statusBgColor: string;
  statusTextColor: string;
}

interface AccessProfile {
  src: string;
  alt: string;
}

interface DocumentAccess {
  profiles: AccessProfile[];
  additionalCount: number;
  totalCount: string;
  viewCount: string;
}

interface DataroomInterfaceProps {
  securityActivities?: SecurityActivity[];
  documentPreview?: DocumentPreview;
  documentAccess?: DocumentAccess;
}

export default function DataroomInterface({
  securityActivities = [
    {
      status: "green",
      statusColor: "bg-green-100 border-green-400",
      message: "Access verification complete",
      timestamp: "Today, 10:42 AM",
    },
    {
      status: "indigo",
      statusColor: "bg-indigo-100 border-indigo-400",
      message: "Data encryption refreshed",
      timestamp: "Today, 09:15 AM",
    },
    {
      status: "gray",
      statusColor: "bg-gray-100 border-gray-400",
      message: "New document shared",
      timestamp: "Yesterday, 4:23 PM",
    },
  ],
  documentPreview = {
    imageSrc: "/pitch-preview.png",
    fileName: "LinkedIn_Pitch_v3.pdf",
    lastUpdated: "2 days ago",
    status: "Shared",
    statusBgColor: "bg-green-100",
    statusTextColor: "text-green-800",
  },
  documentAccess = {
    profiles: [
      {
        src: "/isobel-fuller.jpg",
        alt: "Investor 1",
      },
      {
        src: "/jackson-reed.png",
        alt: "Investor 2",
      },
      {
        src: "/katy-fuller.png",
        alt: "Investor 3",
      },
    ],
    additionalCount: 3,
    totalCount: "6 investors have access",
    viewCount: "52 views",
  },
}: DataroomInterfaceProps) {
  return (
    <div className="relative p-4 h-auto lg:h-[400px] bg-white rounded-xl overflow-hidden">
      <div className="flex flex-col lg:block">
        {/* Security Dashboard */}
        <motion.div
          className="relative lg:absolute lg:top-20 lg:left-0 w-full lg:w-64 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-md border border-gray-100 p-4 mb-4 lg:mb-0"
          animate={{ y: [2, -2, 2] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 bg-opacity-10 rounded-full p-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L20 7.5V12.5C20 17 16.5 21 12 21C7.5 21 4 17 4 12.5V7.5L12 3Z"
                    fill="#4338CA"
                    fillOpacity="0.2"
                    stroke="#4338CA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="#4338CA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semibold text-sm text-gray-900">
                Security Shield
              </span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
          </div>

          {/* Recent Activity */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Recent Security Activity
            </div>
            <div className="space-y-2.5">
              {securityActivities.map((activity, index) => (
                <div
                  key={`activity-${index}`}
                  className="flex items-start gap-2"
                >
                  <div
                    className={`mt-0.5 h-3 w-3 rounded-full ${activity.statusColor} flex-shrink-0`}
                  ></div>
                  <div>
                    <p className="text-xs text-gray-700">{activity.message}</p>
                    <p className="text-[10px] text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.7 12 17 9.7 17 7C17 4.3 14.7 2 12 2C9.3 2 7 4.3 7 7C7 9.7 9.3 12 12 12Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 22C3 17.5 7 14 12 14C17 14 21 17.5 21 22"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 9L10 5"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-gray-800">Role Access</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.5 10.6499H9.5"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8.1499V13.1499"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.8199 2H7.17995C5.04995 2 3.31995 3.74 3.31995 5.86V19.95C3.31995 21.75 4.60995 22.51 6.18995 21.64L11.0699 18.93C11.5899 18.64 12.4299 18.64 12.9399 18.93L17.8199 21.64C19.3999 22.52 20.6899 21.76 20.6899 19.95V5.86C20.6799 3.74 18.9499 2 16.8199 2Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-gray-800">Traceable Files</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.5 16.5C14.5 18.43 12.93 20 11 20C9.07 20 7.5 18.43 7.5 16.5C7.5 14.57 9.07 13 11 13C12.93 13 14.5 14.57 14.5 16.5Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 16C20 13.79 18.21 12 16 12C13.79 12 12 13.79 12 16C12 18.21 13.79 20 16 20C18.21 20 20 18.21 20 16Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 6C6.2 3.8 8.8 2.5 11.7 2.1C14.6 1.7 17.6 2.3 20.1 3.7"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-gray-800">Audit Logs</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10V8C8 5.8 9.3 4 12 4C14.7 4 16 5.8 16 8V10"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18.5C13.3 18.5 14.4 17.4 14.4 16C14.4 14.6 13.3 13.5 12 13.5C10.7 13.5 9.59998 14.6 9.59998 16C9.59998 17.4 10.7 18.5 12 18.5Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22C7.4 22 3.5 18.8 3.5 12V10C3.5 5.9 4.3 3.3 12 3.3C19.7 3.3 20.5 5.9 20.5 10V12C20.5 18.8 16.6 22 12 22Z"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-gray-800">Encryption</span>
            </div>
          </div>
        </motion.div>

        {/* Document preview */}
        <motion.div
          className="relative lg:absolute lg:top-12 lg:right-2 w-full lg:w-64 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4 lg:mb-0"
          animate={{ y: [-4, 4] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="p-3">
            <div className="h-28 bg-gray-100 rounded mb-2 flex items-center justify-center relative">
              <Image
                src={documentPreview.imageSrc}
                alt="Pitch deck preview"
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="pt-2 text-sm font-semibold text-gray-900">
              {documentPreview.fileName}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Last updated: {documentPreview.lastUpdated}
              </div>
              <Badge
                className={`${documentPreview.statusBgColor} ${documentPreview.statusTextColor} text-xs border-0`}
              >
                {documentPreview.status}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Document access card */}
        <motion.div
          className="relative lg:absolute lg:bottom-2 lg:right-0 w-full lg:w-72 bg-white rounded-lg shadow-md border border-gray-200 p-3"
          animate={{ y: [4, -4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="text-sm font-semibold mb-2 text-gray-900">
            Document access
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {documentAccess.profiles.map((profile, index) => (
                <Image
                  key={`profile-${index}`}
                  src={profile.src}
                  alt={profile.alt}
                  width={24}
                  height={24}
                  className="rounded-full border border-white"
                />
              ))}
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border border-white text-xs text-gray-600">
                +{documentAccess.additionalCount}
              </div>
            </div>
            <span className="text-xs text-gray-600">
              {documentAccess.totalCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z"
                  stroke="#4489B5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                  stroke="#4489B5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs text-gray-600">
                {documentAccess.viewCount}
              </span>
            </div>
            <Badge className="bg-[#F8F0FF] text-[#7F56D9] border-0 text-xs">
              View analytics
            </Badge>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
