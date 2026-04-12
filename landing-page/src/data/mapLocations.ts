export const mapLocations = [
  {
    latitude: 48.834507991017,
    longitude: 2.370633977638,
    name: "Station F",
    type: "INCUBATOR",
    address: "5 Parvis Alan Turing, 75013 Paris, France",
  },
  // ... autres locations
] as const;

export const typeStyles = {
  INCUBATOR: {
    pinColor: "#9E77ED",
    icon: "🏢",
    scale: 1,
  },
  ACCELERATOR: {
    pinColor: "#F04438",
    icon: "🚀",
    scale: 1.1,
  },
  COWORKING: {
    pinColor: "#12B76A",
    icon: "💼",
    scale: 0.9,
  },
  EVENT: {
    pinColor: "#F79009",
    icon: "🎯",
    scale: 1.2,
  },
} as const; 