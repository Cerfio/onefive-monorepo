import { Marker } from "react-map-gl";
import { typeStyles } from "@/data/mapLocations";
import { motion } from "framer-motion";
// import { CustomPin } from "./CustomPin";

const CustomPin = ({ type }: { type: keyof typeof typeStyles }) => {
  const style = typeStyles[type];

  return (
    <motion.div
      className="relative"
      style={{
        width: `${40 * style.scale}px`,
        height: `${40 * style.scale}px`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-[10%]"
        style={{ backgroundColor: style.pinColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full opacity-[20%]"
        style={{ backgroundColor: style.pinColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ backgroundColor: style.pinColor }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {style.icon}
      </div>
    </motion.div>
  );
};

    interface MapMarkerProps {
  latitude: number;
  longitude: number;
  name: string;
  type: keyof typeof typeStyles;
}

export const MapMarker = ({
  latitude,
  longitude,
  name,
  type,
}: MapMarkerProps) => {
  return (
    <Marker latitude={latitude} longitude={longitude}>
      <div className="flex flex-col items-center">
        <CustomPin type={type} />
        <div
          className="px-2 py-1 rounded shadow-md text-sm -mt-2 flex items-center gap-1"
          style={{
            backgroundColor: typeStyles[type].pinColor,
            color: "white",
          }}
        >
          <span>{typeStyles[type].icon}</span>
          <span>{name}</span>
        </div>
      </div>
    </Marker>
  );
};
