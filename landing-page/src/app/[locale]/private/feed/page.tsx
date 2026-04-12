"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Send, MoreHorizontal, Plus, Check } from "lucide-react";

const FeedPage = () => {
  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-4">
            <Image src="/onefive.svg" alt="Onefive" width={42} height={42} />
          </Link>
          
          {/* Search */}
          <div className="relative flex-1 max-w-md mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 rounded-full bg-gray-50 border-gray-200"
            />
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 flex items-center justify-center space-x-6">
            <Link href="/feed" className="flex flex-col items-center text-[#5E6AD2] font-medium">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mb-0.5">
                <path 
                  d="M4 12.5L10 18.5L16 12.5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                />
                <path 
                  d="M4 6.5L10 12.5L16 6.5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                />
              </svg>
              <span className="text-sm">Feed</span>
            </Link>
            
            <Link href="/networks" className="flex flex-col items-center text-gray-500 hover:text-[#5E6AD2]">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mb-0.5">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="3" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="17" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-sm">Networks</span>
            </Link>
            
            <Link href="/messages" className="flex flex-col items-center text-gray-500 hover:text-[#5E6AD2] relative">
              <MessageCircle className="h-5 w-5 mb-0.5" />
              <span className="text-sm">Messages</span>
              <span className="absolute -top-1 -right-2 bg-[#5E6AD2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">9</span>
            </Link>
            
            <Link href="/notifications" className="flex flex-col items-center text-gray-500 hover:text-[#5E6AD2] relative">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mb-0.5">
                <path d="M16 7C16 5.4087 15.3679 3.88258 14.2426 2.75736C13.1174 1.63214 11.5913 1 10 1C8.4087 1 6.88258 1.63214 5.75736 2.75736C4.63214 3.88258 4 5.4087 4 7C4 14 1 16 1 16H19C19 16 16 14 16 7Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M11.7295 19C11.5537 19.3031 11.3014 19.5547 10.9978 19.7295C10.6941 19.9044 10.3499 19.9965 9.9995 19.9965C9.6491 19.9965 9.3049 19.9044 9.0012 19.7295C8.6976 19.5547 8.4453 19.3031 8.2695 19" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-sm">Notifications</span>
              <span className="absolute -top-1 -right-2 bg-[#5E6AD2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </Link>
            
            <Link href="/directory" className="flex flex-col items-center text-gray-500 hover:text-[#5E6AD2]">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mb-0.5">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M3 7H17" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7V17" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-sm">Annuaire</span>
            </Link>
          </nav>
          
          {/* User Profile */}
          <div className="flex-shrink-0 ml-4">
            <Image 
              src="/franklin-mays.jpg" 
              alt="Profile" 
              width={40} 
              height={40} 
              className="rounded-full border-2 border-gray-200"
            />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col items-center p-6">
              <Image 
                src="/isobel-fuller.jpg" 
                alt="Yannis Coulibaly" 
                width={120} 
                height={120} 
                className="rounded-full mb-4"
              />
              <h2 className="font-semibold text-lg">Yannis Coulibaly</h2>
              <p className="text-gray-500 text-sm mb-4">Co-Founder at Onefive</p>
              
              <div className="w-full">
                <div className="flex justify-between py-2 text-sm border-t border-gray-100">
                  <span className="text-gray-500">Views of your profile</span>
                  <span className="font-medium text-[#5E6AD2]">142</span>
                </div>
                <div className="flex justify-between py-2 text-sm border-t border-gray-100">
                  <span className="text-gray-500">Number of post views</span>
                  <span className="font-medium text-[#5E6AD2]">1032</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center mr-3">
                  <span className="text-2xl font-bold">N</span>
                </div>
                <h2 className="font-semibold text-lg">Onefive</h2>
              </div>
              
              <div className="w-full">
                <div className="flex justify-between py-2 text-sm border-t border-gray-100">
                  <span className="text-gray-500">Views of your project</span>
                  <span className="font-medium text-[#5E6AD2]">142</span>
                </div>
                <div className="flex justify-between py-2 text-sm border-t border-gray-100">
                  <span className="text-gray-500">Number of post views</span>
                  <span className="font-medium text-[#5E6AD2]">1032</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-sm">
                Accéder à mon projet
              </Button>
            </div>
          </div>
          
          {/* Project Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center mr-3">
                  <span className="text-xl font-bold">N</span>
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-800 border-0 mb-1">#Marketing</Badge>
                  <h2 className="font-semibold">UI/UX Design for beginner</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Feed */}
        <div className="col-span-6 space-y-4">
          {/* Post Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Image 
                src="/franklin-mays.jpg" 
                alt="Profile" 
                width={40} 
                height={40} 
                className="rounded-full mr-3"
              />
              <Input
                type="text"
                placeholder="Do you have any news to share?"
                className="bg-gray-50 rounded-full"
              />
            </div>
          </div>
          
          {/* Posts */}
          {[1, 2].map((post, index) => (
            <div key={post} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex justify-between items-start">
                <div className="flex items-start">
                  {index === 0 && (
                    <div className="flex items-center text-sm text-gray-500 mr-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                        A
                      </div>
                      <span>Arthur Laurier</span>
                      <span className="mx-1">•</span>
                      <span>likes this</span>
                    </div>
                  )}
                </div>
                <button className="text-gray-400">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              {/* Post Author */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Image 
                    src="/avatars/alex.jpg" 
                    alt="Alice Duranteau" 
                    width={40} 
                    height={40} 
                    className="rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium">Alice Duranteau</h3>
                    <p className="text-xs text-gray-500">Co-Founder & CEO @beaucouvreclub</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>3h</span>
                  <span className="mx-2">•</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <button className="ml-2">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-sm mb-3">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam!
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-[#EEF4FF] text-[#3E7BFA] border-0">Finance</Badge>
                  <Badge className="bg-[#FFF1F3] text-[#F04438] border-0">Juridique</Badge>
                  <Badge className="bg-[#ECFDF3] text-[#12B76A] border-0">Marketing</Badge>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/events/workshop.jpg"
                    alt="Post image"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              
              {/* Post Interactions */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">4,874</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {index === 0 ? "11 comments" : (
                      <div className="flex items-center gap-2">
                        <span>11 Comments</span>
                        <span>•</span>
                        <span>9 Shares</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex border-t border-gray-100 pt-2">
                  <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-50 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span className="text-sm">Like</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-50 rounded">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Comment</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-50 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span className="text-sm">Share</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center py-1 text-gray-500 hover:bg-gray-50 rounded">
                    <Send className="h-4 w-4 mr-2" />
                    <span className="text-sm">Send</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Suggested Profiles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Suggestions profiles for you</h2>
              
              {/* Profile Suggestions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image 
                      src="/avatars/emma.jpg" 
                      alt="Karie Alter" 
                      width={40} 
                      height={40} 
                      className="rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-sm">Karie Alter</h3>
                      <p className="text-xs text-gray-500">Co-founder @Leverly - Hiring ❤️</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Se connecter
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3">
                      EM
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Olympe Delaunay</h3>
                      <p className="text-xs text-gray-500">Co-founder at Siepal</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Se connecter
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image 
                      src="/avatars/alex.jpg" 
                      alt="Alice Duranteau" 
                      width={40} 
                      height={40} 
                      className="rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-sm">Alice Duranteau</h3>
                      <p className="text-xs text-gray-500">Co-Founder & CEO @beaucouvreclub</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8 bg-gray-100">
                    En attente
                  </Button>
                </div>
              </div>
              
              <button className="w-full text-center text-sm text-gray-500 mt-4 hover:underline">
                Show more
              </button>
            </div>
          </div>
          
          {/* Suggested Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Suggestions projects for you</h2>
              
              {/* Project Suggestions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center mr-3">
                      <span className="text-white font-bold">N</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Notion</h3>
                      <p className="text-xs text-gray-500">Technologie, Information et Internet</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Suivre
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="#F24E1E" d="M8 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                        <path fill="#FF7262" d="M24 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                        <path fill="#1ABCFE" d="M8 24c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                        <path fill="#0ACF83" d="M24 24c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                        <path fill="#A259FF" d="M16 16c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Figma</h3>
                      <p className="text-xs text-gray-500">Technologie, Information et Internet</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Suivre
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded flex items-center justify-center mr-3">
                      CU
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Click Up</h3>
                      <p className="text-xs text-gray-500">Technologie, Information et Internet</p>
                    </div>
                  </div>
                  <Button size="sm" className="text-xs h-8 bg-gray-100" variant="outline">
                    <Check className="h-3 w-3 mr-1" />
                    Suivi
                  </Button>
                </div>
              </div>
              
              <button className="w-full text-center text-sm text-gray-500 mt-4 hover:underline">
                Show more
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
