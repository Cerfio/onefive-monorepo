export interface MapLocation {
  latitude: number;
  longitude: number;
  name: string;
  type: "INCUBATOR" | "ACCELERATOR" | "COWORKING" | "EVENT";
  address: string;
}

export const mapLocations: MapLocation[] = [
  {
    latitude: 48.834507991017,
    longitude: 2.370633977638,
    name: "Station F",
    type: "INCUBATOR",
    address: "5 Parvis Alan Turing, 75013 Paris, France",
  },
  {
    latitude: 48.86174200981,
    longitude: 2.221943038619,
    name: "BPI France",
    type: "INCUBATOR",
    address: "27-31 Rue de la République, 75011 Paris, France",
  },
  {
    latitude: 48.873306018707,
    longitude: 2.312923987542,
    name: "Le Village by CA",
    type: "INCUBATOR",
    address: "55 Rue la Boétie, 75008 Paris, France",
  },
  {
    latitude: 48.878742018192,
    longitude: 2.327851989459,
    name: "Schoolab Saint Lazare",
    type: "COWORKING",
    address: "15 Rue de Milan, 75009 Paris",
  },
  {
    latitude: 48.898595016868,
    longitude: 2.378184982752,
    name: "Paris&Co",
    type: "ACCELERATOR",
    address: "127 Boulevard de la Villette, 75010 Paris, France",
  },
  {
    latitude: 48.880546013303,
    longitude: 2.32765803222,
    name: "WeWork Saint-Lazare",
    type: "COWORKING",
    address: "4 Rue Jules Lefebvre, 75009 Paris, France",
  },
  {
    latitude: 48.867749990368,
    longitude: 2.349646027363,
    name: "Numa",
    type: "COWORKING",
    address: "39 Rue du Caire, 75002 Paris, France",
  },
  {
    latitude: 48.850504015037,
    longitude: 2.369661006317,
    name: "MakeSense",
    type: "COWORKING",
    address: "11 Rue biscornet, 75012 Paris, France",
  },
  {
    latitude: 48.874343991687,
    longitude: 2.337692008511,
    name: "WeWork Lafayette",
    type: "COWORKING",
    address: "33 Rue La Fayette, 75009 Paris, France",
  },
  {
    latitude: 48.832032982647,
    longitude: 2.288707998716,
    name: "VivaTech",
    type: "EVENT",
    address: "1 Place de la Porte de Versailles, 75015 Paris, France",
  },
  {
    latitude: 48.811951996205,
    longitude: 2.445159993342,
    name: "TechCrunch Disrupt",
    type: "EVENT",
    address: "18 Rue de la Concorde, 75001 Paris, France",
  },
  {
    latitude: 48.834507991017,
    longitude: 2.370633977638,
    address: "5 Parvis Alan Turing, 75013 Paris, France",
    name: "StartUp42",
    type: "INCUBATOR",
  },
  {
    latitude: 48.898595016868,
    longitude: 2.378184982752,
    name: "Le Cargo",
    type: "COWORKING",
    address: "157 Boulevard Macdonald, 75019 Paris, France",
  },
  {
    latitude: 48.86825101863,
    longitude: 2.345607961689,
    name: "WILLA",
    type: "INCUBATOR",
    address: "6 Rue du Sentier, 75002 Paris, France",
  },
  {
    latitude: 48.87112601142,
    longitude: 2.393389000741,
    name: "La Ruche Paris",
    type: "COWORKING",
    address: "24 Rue de l'Est, 75020 Paris, France",
  },
  {
    latitude: 45.736912011978,
    longitude: 4.820207965011,
    name: "H7",
    type: "ACCELERATOR",
    address: "70 Quai Perrache, 69002 Lyon, France",
  },
  {
    latitude: 43.3029559,
    longitude: 5.3764324,
    name: "P.Factory",
    type: "ACCELERATOR",
    address: "99 Rue Joseph Biaggi, 13003 Marseille, France",
  },
  {
    latitude: 44.84952801133,
    longitude: -0.561474021786,
    name: "Darwin Ecosystème",
    type: "COWORKING",
    address: "87 Quai des Queyries, 33100 Bordeaux, France",
  },
  {
    latitude: 50.6341259,
    longitude: 3.0214078,
    name: "EuraTechnologies",
    type: "ACCELERATOR",
    address: "165 Avenue de Bretagne, 59000 Lille, France",
  },
  {
    latitude: 48.581013,
    longitude: 7.757374,
    name: "Semia",
    type: "INCUBATOR",
    address: "9 Rue de la Krutenau, 67000 Strasbourg, France",
  },
  {
    latitude: 43.705702993882,
    longitude: 7.270590973678,
    name: "La Verrière",
    type: "COWORKING",
    address: "4 Boulevard de Cimiez, 06000 Nice, France",
  },
];
