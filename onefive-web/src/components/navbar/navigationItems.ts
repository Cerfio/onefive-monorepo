import {
  BarChart2,
  Users,
  Mic2,
  LandPlot,
  MessagesSquare,
  FolderOpen,
  LineChart,
} from 'lucide-react';
import React from 'react';

export const navigationItems = [
  {
    name: 'Feed',
    icon: React.createElement(BarChart2, { className: "w-4 h-4" }),
    link: '/feed',
    description: 'Votre flux principal',
  },
  {
    name: 'Network',
    icon: React.createElement(Users, { className: "w-4 h-4" }),
    link: '/network',
    description: 'Votre réseau professionnel',
  },
  {
    name: 'Discussion',
    icon: React.createElement(Mic2, { className: "w-4 h-4" }),
    link: '/discussions',
    description: 'Discussions communautaires',
  },
  {
    name: 'Spotlight',
    icon: React.createElement(LandPlot, { className: "w-4 h-4" }),
    link: '/spotlight',
    description: 'Opportunités en vedette',
  },
  {
    name: 'Messages',
    icon: React.createElement(MessagesSquare, { className: "w-4 h-4" }),
    link: '/messages',
    description: 'Messagerie privée',
  },
  {
    name: 'Data rooms',
    icon: React.createElement(FolderOpen, { className: "w-4 h-4" }),
    link: '/dataroom',
    description: 'Vos data rooms',
  },
  {
    name: 'Analytics',
    icon: React.createElement(LineChart, { className: "w-4 h-4" }),
    link: '/analytics',
    description: 'Vos statistiques',
  },
]; 