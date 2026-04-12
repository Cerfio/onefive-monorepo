import { Badge } from "@/components/ui/badge";
import { RotatingCircles } from "./rotating-circles";

export const HeroSection = () => {
  return (
    <div className="relative w-screen h-[600px] flex items-center justify-center">
      <RotatingCircles />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-2xl text-center flex flex-col items-center p-12">
          <Badge className="px-4 py-1.5 rounded-full bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 text-sm font-medium shadow-sm">
            Onefive social network
          </Badge>
          {/* ... Rest of hero content ... */}
        </div>
      </div>
    </div>
  );
}; 