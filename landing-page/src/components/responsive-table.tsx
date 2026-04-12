"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DataItem {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  role: string;
  email: string;
  lastActive: string;
}

interface ResponsiveTableProps {
  data: DataItem[];
  variant?: "scroll" | "cards";
}

export default function ResponsiveTable({ 
  data,
  variant = "cards"
}: ResponsiveTableProps) {
  // Fonction helper pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
      case "inactive":
        return "bg-gray-50 text-gray-700 hover:bg-gray-100";
      case "pending":
        return "bg-amber-50 text-amber-700 hover:bg-amber-100";
      default:
        return "bg-gray-50 text-gray-700 hover:bg-gray-100";
    }
  };

  // Variante 1: Tableau avec défilement horizontal sur mobile
  if (variant === "scroll") {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)} variant="outline">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Variante 2: Cartes sur mobile, tableau sur desktop
  return (
    <div className="w-full">
      {/* Version desktop - Tableau standard */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)} variant="outline">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Version mobile - Cartes */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium">{item.name}</h3>
              <Badge className={getStatusColor(item.status)} variant="outline">
                {item.status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-500">Role:</span>
                <span>{item.role}</span>
              </div>
              
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-500">Email:</span>
                <span className="break-all">{item.email}</span>
              </div>
              
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-500">Last Active:</span>
                <span>{item.lastActive}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 