"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Share2,
  Users,
  MessageSquare,
  Rocket,
  Award,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Plus,
  ChevronDown,
  Grid3X3,
  Clock,
  ArrowUpRight,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user data
  const user = {
    id: "user1",
    firstName: "Thomas",
    lastName: "Martin",
    role: "Founder & CEO",
    company: "NextLevel Technologies",
    location: "Paris, France",
    joined: "June 2023",
    avatar: "/franklin-mays.jpg", // Reusing an existing image from the codebase
    coverImage: "/illustrations/team.webp", // Reusing an existing image
    bio: {
      fr: "Entrepreneur passionné par les technologies innovantes. Je construis NextLevel Technologies pour révolutionner la façon dont les startups utilisent l'IA.",
      en: "Passionate entrepreneur focused on innovative technologies. Building NextLevel Technologies to revolutionize how startups use AI."
    },
    stats: {
      followers: 1248,
      following: 357,
      connections: 485,
      posts: 96
    },
    skills: ["Artificial Intelligence", "Product Strategy", "Fundraising", "Team Leadership", "Business Development", "Tech Innovation"],
    interests: ["SaaS", "AI/ML", "Startup Ecosystems", "Venture Capital", "Sustainable Tech"],
    experience: [
      {
        role: "Founder & CEO",
        company: "NextLevel Technologies",
        period: "2023 - Present",
        description: "Building an AI-powered platform for startups to optimize their growth strategies."
      },
      {
        role: "Product Manager",
        company: "TechVentures",
        period: "2020 - 2023",
        description: "Led product development for SaaS solutions serving over 200 enterprise clients."
      }
    ],
    education: [
      {
        degree: "MBA, Technology Management",
        institution: "INSEAD",
        year: "2020"
      },
      {
        degree: "MSc, Computer Science",
        institution: "École Polytechnique",
        year: "2018"
      }
    ],
    achievements: [
      {
        title: "Raised €1.5M Seed Round",
        date: "December 2023"
      },
      {
        title: "Selected for Station F Founders Program",
        date: "July 2023"
      }
    ],
    socialMedia: [
      {
        platform: "LinkedIn",
        handle: "@thomas-martin",
        url: "https://linkedin.com/in/thomas-martin"
      },
      {
        platform: "Twitter",
        handle: "@thomasmartin",
        url: "https://twitter.com/thomasmartin"
      },
      {
        platform: "GitHub",
        handle: "@tmartin",
        url: "https://github.com/tmartin"
      }
    ]
  };

  // Mock activity/posts data
  const posts = [
    {
      id: "post1",
      content: "Just closed our seed round of €1.5M! Excited to accelerate our growth with amazing investors onboard. #funding #startuplife",
      timestamp: "3 days ago",
      likes: 142,
      comments: 38,
      shares: 12,
      hasImage: true,
      image: "/events/summit.jpg"
    },
    {
      id: "post2",
      content: "Looking for a senior full-stack developer to join our growing team. If you're passionate about AI and startup technologies, DM me! #hiring #techjobs",
      timestamp: "1 week ago",
      likes: 87,
      comments: 25,
      shares: 15,
      hasImage: false
    },
    {
      id: "post3",
      content: "Just published our latest case study on how we helped 3 startups optimize their growth using our AI platform. Check it out on our website!",
      timestamp: "2 weeks ago",
      likes: 94,
      comments: 16,
      shares: 21,
      hasImage: true,
      image: "/woman-video.jpeg"
    }
  ];

  // Mock connections data
  const connections = [
    {
      id: "conn1",
      name: "Emma Dubois",
      role: "CEO at Innovatech",
      avatar: "/isobel-fuller.jpg",
      mutualConnections: 12
    },
    {
      id: "conn2",
      name: "Lucas Renard",
      role: "Independent Consultant",
      avatar: "/franklin-mays.jpg",
      mutualConnections: 8
    },
    {
      id: "conn3",
      name: "Sophie Garnier",
      role: "COO at FoodLab",
      avatar: "/speakers/sarah.jpg",
      mutualConnections: 15
    }
  ];

  // Mock opportunities data
  const opportunities = [
    {
      id: "opp1",
      title: "Station F Founders Program 2024",
      type: "Incubator",
      deadline: "April 30, 2024",
      match: "95% match"
    },
    {
      id: "opp2",
      title: "AI in Startups Workshop",
      type: "Workshop",
      date: "April 20, 2024",
      match: "87% match"
    }
  ];

  // Handle follow/unfollow action
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  // Get social media icon based on platform
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "LinkedIn":
        return <Linkedin className="h-4 w-4" />;
      case "Twitter":
        return <Twitter className="h-4 w-4" />;
      case "GitHub":
        return <Github className="h-4 w-4" />;
      case "Instagram":
        return <Instagram className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-[#FCFCFD] min-h-screen">
      <Navbar hasScrolled={false} />

      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-[#5E6AD2]/20 to-[#F35C47]/20">
        <Image
          src={user.coverImage}
          alt="Cover"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E6AD2]/20 to-[#F35C47]/20" />
      </div>

      {/* Profile Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 relative">
              {/* Avatar */}
              <div className="rounded-full border-4 border-white shadow-lg overflow-hidden h-32 w-32">
                <Image 
                  src={user.avatar} 
                  alt={`${user.firstName} ${user.lastName}`}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[#101828]">{user.firstName} {user.lastName}</h1>
                  <Badge className="bg-[#5E6AD2]/10 text-[#5E6AD2] border-0">Founder</Badge>
                </div>
                <div className="flex flex-wrap items-center text-muted-foreground text-sm gap-4 mb-2">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4"/>
                    {user.role} at {user.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4"/>
                    {user.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4"/>
                    Joined {user.joined}
                  </span>
                </div>
                <p className="max-w-2xl text-[#475467] mt-3">
                  {user.bio.en}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "" : "bg-[#5E6AD2] hover:bg-[#4F58B8]"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Posts</p>
                <p className="text-xl font-semibold">{user.stats.posts}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-xl font-semibold">{user.stats.followers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Following</p>
                <p className="text-xl font-semibold">{user.stats.following}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-xl font-semibold">{user.stats.connections}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4" /> EXPERIENCE
                  </h3>
                  <div className="space-y-4">
                    {user.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                        <h4 className="font-medium">{exp.role}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Education */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" /> EDUCATION
                  </h3>
                  <div className="space-y-4">
                    {user.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4" /> SKILLS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Interests */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                    <Rocket className="h-4 w-4" /> INTERESTS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Achievements</h2>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
              <div className="space-y-4">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-[#5E6AD2]/10 rounded-full p-2 mt-0.5">
                      <Award className="h-5 w-5 text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Social Media</h2>
              <div className="space-y-3">
                {user.socialMedia.map((social, index) => (
                  <a 
                    key={index} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getSocialIcon(social.platform)}
                      </div>
                      <div>
                        <h4 className="font-medium">{social.platform}</h4>
                        <p className="text-sm text-muted-foreground">{social.handle}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Profile
                </Button>
              </div>
            </div>
          </div>
          
          {/* Center Content - Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <Tabs defaultValue="posts" className="w-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <TabsList className="w-full justify-start px-4 pt-2 bg-transparent border-b rounded-none h-auto">
                  <TabsTrigger value="posts" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="opportunities" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none">
                    Opportunities
                  </TabsTrigger>
                </TabsList>
                
                {/* Posts Tab Content */}
                <TabsContent value="posts" className="p-0 mt-0">
                  {/* New Post Box */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                      <Image 
                        src={user.avatar}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1 text-muted-foreground">
                        What's on your mind, {user.firstName}?
                      </div>
                    </div>
                  </div>
                  
                  {/* Posts */}
                  <div className="divide-y">
                    {posts.map((post) => (
                      <div key={post.id} className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <Image 
                            src={user.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {post.timestamp}
                            </p>
                          </div>
                        </div>
                        
                        <p className="mb-4">{post.content}</p>
                        
                        {post.hasImage && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <Image 
                              src={post.image || ""}
                              alt="Post image"
                              width={600}
                              height={400}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 hover:text-[#5E6AD2]">
                              <ThumbsUp className="h-4 w-4" /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#5E6AD2]">
                              <MessageSquare className="h-4 w-4" /> {post.comments}
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#5E6AD2]">
                              <Share2 className="h-4 w-4" /> {post.shares}
                            </button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Activity Tab Content */}
                <TabsContent value="activity" className="p-6 mt-0">
                  <div className="space-y-6">
                    <div className="border-l-2 border-[#5E6AD2] pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>3 days ago</span>
                      </div>
                      <p><span className="font-medium">Thomas</span> published a new post about fundraising</p>
                    </div>
                    
                    <div className="border-l-2 border-[#5E6AD2] pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>1 week ago</span>
                      </div>
                      <p><span className="font-medium">Thomas</span> was featured in the Onefive Spotlight</p>
                    </div>
                    
                    <div className="border-l-2 border-[#5E6AD2] pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>2 weeks ago</span>
                      </div>
                      <p><span className="font-medium">Thomas</span> connected with <span className="font-medium">Emma Dubois</span></p>
                    </div>
                    
                    <div className="border-l-2 border-[#5E6AD2] pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>3 weeks ago</span>
                      </div>
                      <p><span className="font-medium">Thomas</span> joined the Station F Founders Program</p>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Full Activity
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Opportunities Tab Content */}
                <TabsContent value="opportunities" className="p-6 mt-0">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-2">Personalized opportunities for your startup:</p>
                    
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-4 hover:border-[#5E6AD2] transition-colors">
                        <div className="flex justify-between mb-2">
                          <Badge>{opportunity.type}</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            {opportunity.match}
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {opportunity.deadline ? `Deadline: ${opportunity.deadline}` : `Date: ${opportunity.date}`}
                        </p>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full">
                      Explore More Opportunities
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            {/* Connections Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Connections</h2>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-4 hover:border-[#5E6AD2] transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Image 
                        src={connection.avatar}
                        alt={connection.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-sm">{connection.name}</h4>
                        <p className="text-xs text-muted-foreground">{connection.role}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        <Users className="h-3 w-3 inline mr-1" />
                        {connection.mutualConnections} mutual
                      </span>
                      <Button variant="ghost" size="sm" className="h-8">
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
