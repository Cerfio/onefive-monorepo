"use client";
import React, { useState } from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  ChevronRight,
  Ticket,
  Video,
  CalendarCheck,
  Share2,
} from "lucide-react";

type EventType = "All" | "Conference" | "Webinar" | "Workshop" | "Meetup";
type EventStatus = "upcoming" | "past";

const EventsPage = () => {
  const [selectedType, setSelectedType] = useState<EventType>("All");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>("upcoming");

  const eventTypes: EventType[] = [
    "All",
    "Conference",
    "Webinar",
    "Workshop",
    "Meetup",
  ];

  const featuredEvent = {
    title: "European Startup Summit 2024",
    date: "June 15-16, 2024",
    location: "Paris, France",
    type: "Conference",
    image: "/events/summit.jpg",
    attendees: "500+",
    description:
      "Join Europe's largest gathering of startup founders, investors, and innovators.",
    speakers: [
      {
        name: "Sarah Chen",
        role: "CEO, TechVentures",
        image: "/speakers/sarah.jpg",
      },
      // ... autres speakers
    ],
  };

  const events = [
    {
      title: "AI in Startups Workshop",
      date: "April 20, 2024",
      time: "14:00 - 17:00 CEST",
      type: "Workshop",
      format: "Hybrid",
      location: "Paris & Online",
      image: "/events/workshop.jpg",
      price: "Free",
      spots: "50 spots left",
      description: "Learn how to implement AI in your startup effectively.",
    },
    // ... autres événements
  ];

  return (
    <>
      <NavigationMenuDemo />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Onefive Events</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect, learn, and grow with the startup community through our
            curated events.
          </p>
        </div>

        {/* Featured Event */}
        <div className="mb-16">
          <div className="rounded-2xl overflow-hidden border hover:border-[#5E6AD2] transition-all">
            <div className="relative h-[400px]">
              <Image
                src={featuredEvent.image}
                alt={featuredEvent.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <Badge className="bg-[#5E6AD2] mb-4">Featured Event</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  {featuredEvent.title}
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {featuredEvent.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {featuredEvent.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {featuredEvent.attendees} Attendees
                  </div>
                </div>
                <p className="mb-6 max-w-2xl">{featuredEvent.description}</p>
                <Button className="bg-white text-black hover:bg-white/90">
                  Register Now
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            {/* Speakers */}
            <div className="p-8 bg-white">
              <h3 className="font-medium mb-4">Featured Speakers</h3>
              <div className="flex gap-4">
                {featuredEvent.speakers.map((speaker) => (
                  <div key={speaker.name} className="flex items-center gap-3">
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {speaker.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex gap-2">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? "bg-[#5E6AD2]" : ""}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "upcoming" ? "default" : "outline"}
              onClick={() => setSelectedStatus("upcoming")}
              className={selectedStatus === "upcoming" ? "bg-[#5E6AD2]" : ""}
            >
              Upcoming
            </Button>
            <Button
              variant={selectedStatus === "past" ? "default" : "outline"}
              onClick={() => setSelectedStatus("past")}
              className={selectedStatus === "past" ? "bg-[#5E6AD2]" : ""}
            >
              Past Events
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          {events.map((event) => (
            <div
              key={event.title}
              className="rounded-xl border hover:border-[#5E6AD2] transition-all overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <Badge
                  className="absolute top-4 left-4"
                  variant={event.format === "Online" ? "outline" : "default"}
                >
                  {event.format}
                </Badge>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{event.type}</Badge>
                  <Badge variant="secondary" className="bg-[#5E6AD2]/10">
                    {event.price}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {event.spots}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button className="bg-[#5E6AD2]">
                      <Ticket className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Integration */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center mb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Never Miss an Event</h2>
            <p className="text-muted-foreground mb-6">
              Add our events calendar to your preferred calendar app and stay
              updated.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Google Calendar
              </Button>
              <Button variant="outline">
                <CalendarCheck className="w-4 h-4 mr-2" />
                iCal
              </Button>
              <Button variant="outline">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Outlook
              </Button>
            </div>
          </div>
        </div>

        {/* Host Event CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Host an Event?</h2>
          <p className="text-muted-foreground mb-6">
            Partner with us to organize workshops, meetups, or speaking
            engagements.
          </p>
          <Button variant="outline">Contact Events Team</Button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default EventsPage;
