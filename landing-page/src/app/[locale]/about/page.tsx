import React from "react";
import Builder from "@/components/builder";
import { Users, Rocket, Heart, Target } from "lucide-react";
import TeamSection from "./TeamSection";
import { getPayloadClient } from "@/lib/payload";

const mission = {
  title: "Empowering the Next Generation of Startups",
  description:
    "We're building the most comprehensive platform for startups to connect, grow, and succeed together. Our mission is to democratize access to resources, knowledge, and opportunities in the startup ecosystem.",
  stats: [
    { value: "2025", label: "Founded" },
    { value: "Paris", label: "Headquarters" },
    { value: "Coming Soon", label: "Countries" },
  ],
};

const values = [
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Innovation First",
    description:
      "We constantly push boundaries and embrace new technologies to provide cutting-edge solutions for startups.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Driven",
    description:
      "Our community is at the heart of everything we do. We grow and evolve based on their needs and feedback.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Authentic Connections",
    description:
      "We believe in fostering genuine relationships and meaningful collaborations within our ecosystem.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Impact Focused",
    description:
      "Every feature and decision is guided by the potential impact it can have on our users' success.",
  },
];

// Fonction pour récupérer les données de l'équipe côté serveur
async function getTeamData() {
  try {
    const payload = await getPayloadClient();

    const data = await payload.find({
      collection: "team",
      limit: 100,
      depth: 1,
    });

    return data.docs || [];
  } catch (error) {
    console.error("Error fetching team data:", error);
    return [];
  }
}

async function Body() {
  // Récupération des données côté serveur
  const teamMembers = await getTeamData();

  // Create a copy of mission with dynamic team members count
  const missionWithDynamicStats = {
    ...mission,
    stats: [
      mission.stats[0],
      mission.stats[1],
      { value: teamMembers.length.toString(), label: "Team Members" },
      mission.stats[2],
    ],
  };

  // Extraction des catégories
  const uniqueCategories = [
    ...new Set(teamMembers.map((member: any) => member.category)),
  ];
  const categories = ["All", ...uniqueCategories];

  return (
    <div className="max-w-7xl mx-auto px-8 mt-20">
      {/* Mission Section */}
      <div className="text-center mb-20">
        <h2 className="text-4xl font-bold mb-6">{missionWithDynamicStats.title}</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          {missionWithDynamicStats.description}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {missionWithDynamicStats.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-[#5E6AD2] mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="text-[#5E6AD2] mb-4">{value.icon}</div>
              <h3 className="text-xl font-medium mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section - Composant Client pour la partie interactive */}
      <TeamSection teamMembers={teamMembers} categories={categories as string[]} />
    </div>
  );
}

const About = async () => {
  return (
    <Builder
      title="About Onefive"
      description="Learn more about our mission and the team behind Onefive"
      image={null}
      displayJoinWaitlist={false}
      body={await Body()}
      badge="About"
    />
  );
};

export default About;
