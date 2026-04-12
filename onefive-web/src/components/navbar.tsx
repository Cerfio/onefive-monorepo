'use client';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import OnefiveLogo from '@/images/onefiveLogo.png';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import {
  SearchBar,
  NavigationItem,
  UserDropdown,
  NotificationDropdown,
  navigationItems,
} from './navbar/';

// Composant principal de la navbar
const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar principale */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <Image 
                    quality={100} 
                    width={32} 
                    height={32}
                    src={OnefiveLogo} 
                    alt="Onefive logo"
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
              </Link>

              {/* Barre de recherche - Desktop */}
              <div className="hidden md:block flex-1 max-w-md">
                <SearchBar />
              </div>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isActive={pathname === item.link}
                />
              ))}
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotificationDropdown />

              {/* Profil utilisateur */}
              <UserDropdown />

              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Barre de recherche mobile */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </nav>

      {/* Menu mobile avec animation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6 space-y-4 animate-in fade-in-50 duration-300 delay-100">
            {navigationItems.map((item, index) => (
              <div
                key={item.name}
                className="animate-in slide-in-from-left-4 duration-200"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <NavigationItem
                  item={item}
                  isActive={pathname === item.link}
                  isMobile={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
