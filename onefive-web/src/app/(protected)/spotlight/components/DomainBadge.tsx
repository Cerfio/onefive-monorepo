import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Code, Megaphone, Brain, Landmark, HeartPulse,
  GraduationCap, Leaf, ShoppingCart, HandHeart, Scale, Building2,
  UtensilsCrossed, Car, Gamepad2, Film, ShieldCheck, FlaskConical,
  Link, Users, Palette, Crown, Sparkles, Trophy, Atom, Radio, MapPin, Tag,
} from 'lucide-react';

interface DomainBadgeProps {
  domain: string;
  size?: 'sm' | 'md';
}

const domainConfigMap: Record<string, { icon: typeof Code; color: string; label: string }> = {
  TECH: { icon: Code, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Tech' },
  AI: { icon: Brain, color: 'bg-violet-100 text-violet-800 border-violet-200', label: 'IA' },
  FINTECH: { icon: Landmark, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Fintech' },
  HEALTHTECH: { icon: HeartPulse, color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Healthtech' },
  EDTECH: { icon: GraduationCap, color: 'bg-sky-100 text-sky-800 border-sky-200', label: 'Edtech' },
  GREENTECH: { icon: Leaf, color: 'bg-green-100 text-green-800 border-green-200', label: 'Greentech' },
  ECOMMERCE: { icon: ShoppingCart, color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'E-commerce' },
  SOCIALIMPACT: { icon: HandHeart, color: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Impact Social' },
  LEGALTECH: { icon: Scale, color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Legaltech' },
  PROPTECH: { icon: Building2, color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Proptech' },
  FOODTECH: { icon: UtensilsCrossed, color: 'bg-lime-100 text-lime-800 border-lime-200', label: 'Foodtech' },
  MOBILITY: { icon: Car, color: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Mobilité' },
  GAMING: { icon: Gamepad2, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Gaming' },
  MEDIA: { icon: Film, color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', label: 'Média' },
  CYBERSECURITY: { icon: ShieldCheck, color: 'bg-red-100 text-red-800 border-red-200', label: 'Cybersécurité' },
  BIOTECH: { icon: FlaskConical, color: 'bg-teal-100 text-teal-800 border-teal-200', label: 'Biotech' },
  WEB3: { icon: Link, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Web3' },
  HR: { icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'RH' },
  DESIGN: { icon: Palette, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Design' },
  MARKETING: { icon: Megaphone, color: 'bg-green-100 text-green-800 border-green-200', label: 'Marketing' },
  BUSINESS: { icon: Briefcase, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Business' },
  LUXURY: { icon: Crown, color: 'bg-stone-100 text-stone-800 border-stone-200', label: 'Luxe' },
  BEAUTY: { icon: Sparkles, color: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Beauté' },
  SPORTS: { icon: Trophy, color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Sport' },
  QUANTUM: { icon: Atom, color: 'bg-violet-100 text-violet-800 border-violet-200', label: 'Quantique' },
  ADTECH: { icon: Radio, color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Adtech' },
  URBAN: { icon: MapPin, color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Ville & Urbanisme' },
  INSURTECH: { icon: Scale, color: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Insurtech' },
  OTHER: { icon: Tag, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Autre' },
};

const defaultConfig = {
  icon: Briefcase,
  color: 'bg-gray-100 text-gray-800 border-gray-200',
  label: '',
};

export const DomainBadge = ({ domain, size = 'sm' }: DomainBadgeProps) => {
  const config = domainConfigMap[domain.toUpperCase()] ?? { ...defaultConfig, label: domain };
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${size === 'sm' ? 'text-xs' : 'text-sm'} border font-medium`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {config.label}
    </Badge>
  );
};
