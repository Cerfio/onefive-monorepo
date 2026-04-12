import React from 'react';
import { Badge } from '@/components/base/badges/badges';
import type { Person } from '../types';
import { allIntentionOptions, roleOptions, locationOptions } from './constants';

export const getCountryCode = (location: string): string => {
    const countryMap: { [key: string]: string } = {
        'Germany': 'DE', 'UK': 'GB', 'United Kingdom': 'GB', 'France': 'FR',
        'USA': 'US', 'United States': 'US', 'Spain': 'ES', 'Italy': 'IT',
        'Netherlands': 'NL', 'Belgium': 'BE', 'Switzerland': 'CH', 'Austria': 'AT',
        'Portugal': 'PT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
    };
    for (const [country, code] of Object.entries(countryMap)) {
        if (location.includes(country)) return code;
    }
    return 'FR'; // Default
};

export const getIntentionLabel = (value: string): string => {
    const option = allIntentionOptions.find(opt => opt.id === value);
    return option ? option.label : 'Toutes les intentions';
};

export const getRoleBadge = (role: string, key?: string) => {
    const roleConfig: { [key: string]: { label: string; color: any } } = {
        founder: { label: 'Founder', color: 'brand' },
        vc: { label: 'VC', color: 'purple' },
        angel: { label: 'Angel', color: 'orange' },
        mentor: { label: 'Mentor', color: 'blue' },
        executive: { label: 'Executive', color: 'indigo' },
        investor: { label: 'Investor', color: 'success' },
        entrepreneur: { label: 'Entrepreneur', color: 'gray-blue' }
    };
    const config = roleConfig[role] || roleConfig.entrepreneur;
    return <Badge key={key} type="pill-color" size="sm" color={config.color}>{config.label}</Badge>;
};

export const getDefaultRoleFromTags = (tags: string[]): string => {
    const tagLower = tags.map(tag => tag.toLowerCase());
    if (tagLower.includes('founder')) return 'founder';
    if (tagLower.includes('vc')) return 'vc';
    if (tagLower.includes('ba') || tagLower.includes('business angel')) return 'angel';
    if (tagLower.includes('mentor')) return 'mentor';
    if (tagLower.includes('developer') || tagLower.includes('tech')) return 'entrepreneur';
    if (tagLower.includes('marketing')) return 'entrepreneur';
    if (tagLower.includes('product')) return 'entrepreneur';
    if (tagLower.includes('design')) return 'entrepreneur';
    return 'entrepreneur';
};

export const getPersonBadges = (person: Person) => {
    const badges = [];
    if (person.role) {
        badges.push(getRoleBadge(person.role, "role"));
    } else {
        const roleFromTags = getDefaultRoleFromTags(person.tags);
        badges.push(getRoleBadge(roleFromTags, "role"));
    }

    if (person.intentionCategory === 'mentor' && person.mentorshipDomain) {
        const mentorBadges: { [key: string]: { label: string; color: any } } = {
            'finance': { label: 'Finance', color: 'success' },
            'marketing': { label: 'Marketing', color: 'orange' },
            'product': { label: 'Product', color: 'blue' },
            'tech': { label: 'Tech', color: 'indigo' },
            'design': { label: 'Design', color: 'pink' },
            'sales': { label: 'Sales', color: 'purple' },
            'business': { label: 'Business', color: 'gray-blue' }
        };
        const mentorConfig = mentorBadges[person.mentorshipDomain];
        if (mentorConfig && person.role !== 'mentor') {
            badges.push(<Badge key="mentor" type="pill-color" size="sm" color={mentorConfig.color}>{mentorConfig.label}</Badge>);
        }
    }
    return badges;
};

export const getDisplayReasons = (person: Person, networkView: 'discover' | 'network', mutuals: { names: string[], count: number }, searchQuery: string, intentionFilter: string, roleFilter: string, locationFilter: string): string[] => {
    const reasons: string[] = [];
  
    if (mutuals.count > 0) {
        if (mutuals.count === 1) reasons.push(`${mutuals.names[0]} en commun`);
        else if (mutuals.count === 2) reasons.push(`${mutuals.names[0]} et ${mutuals.names[1]} en commun`);
        else reasons.push(`${mutuals.names[0]} et ${mutuals.count - 1} autre${mutuals.count > 2 ? 's' : ''} en commun`);
    }
  
    if (person.intentionCategory) {
        if (person.intentionCategory === 'cofounder') reasons.push('Cherche associé(s)');
        else if (person.intentionCategory === 'mentor') {
            if (person.mentorshipDomain) {
                const domainLabels = {
                    'finance': 'Mentor Finance', 'marketing': 'Mentor Marketing', 'product': 'Mentor Product',
                    'tech': 'Mentor Tech', 'design': 'Mentor Design', 'sales': 'Mentor Sales', 'business': 'Mentor Business'
                };
                reasons.push(domainLabels[person.mentorshipDomain as keyof typeof domainLabels] || 'Propose du mentorat');
            } else {
                reasons.push('Propose du mentorat');
            }
        } else if (person.intentionCategory === 'opportunities') {
            reasons.push('Cherche opportunités');
        }
    }
  
    if (person.role) {
        const roleLabels = {
            'founder': 'Founder', 'vc': 'VC', 'angel': 'Business Angel', 'mentor': 'Mentor',
            'executive': 'Executive', 'investor': 'Investor', 'entrepreneur': 'Entrepreneur'
        };
        reasons.push(roleLabels[person.role as keyof typeof roleLabels] || 'Entrepreneur');
    }
  
    if (intentionFilter !== 'all' && intentionFilter !== person.intentionCategory) {
        if (intentionFilter.startsWith('mentor-')) {
            const mentorDomain = intentionFilter.replace('mentor-', '');
            if (person.mentorshipDomain === mentorDomain) reasons.push(`Filtre: ${getIntentionLabel(intentionFilter)}`);
        }
    }
  
    if (roleFilter !== 'all') {
        const roleFromTags = getDefaultRoleFromTags(person.tags);
        if (roleFilter === roleFromTags || (person.role && roleFilter === person.role)) {
            reasons.push(`Filtre: ${roleOptions.find(opt => opt.id === roleFilter)?.label}`);
        }
    }
  
    if (locationFilter !== 'all') {
        const locationMatches = (locationFilter === 'france' && person.countryCode === 'FR') ||
            (locationFilter === 'germany' && person.countryCode === 'DE') ||
            (locationFilter === 'uk' && person.countryCode === 'GB') ||
            (locationFilter === 'europe' && ['FR', 'DE', 'GB', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'PT', 'SE', 'NO', 'DK', 'FI'].includes(person.countryCode));
        if (locationMatches) reasons.push(`Filtre: ${locationOptions.find(opt => opt.id === locationFilter)?.label}`);
    }
  
    if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (person.name.toLowerCase().includes(searchLower)) reasons.push('Recherche: Nom');
        else if (person.title.toLowerCase().includes(searchLower)) reasons.push('Recherche: Poste');
        else if (person.intention.toLowerCase().includes(searchLower)) reasons.push('Recherche: Intention');
        else if (person.tags.some(tag => tag.toLowerCase().includes(searchLower))) reasons.push('Recherche: Compétences');
    }
  
    if (networkView === 'network') reasons.push('Dans votre réseau');
    else reasons.push('Nouveau profil');
  
    if (person.experience.length > 0) {
        const recentExp = person.experience[0];
        if (['google', 'meta', 'amazon', 'apple', 'microsoft'].some(c => recentExp.company.toLowerCase().includes(c))) {
            reasons.push('Ex-FAANG');
        }
    }
  
    if (person.education.length > 0) {
        const education = person.education[0];
        if (['hec', 'essec', 'escp', 'stanford', 'harvard', 'mit'].some(s => education.school.toLowerCase().includes(s))) {
            reasons.push('Top école');
        }
    }
  
    return [...new Set(reasons)].filter(reason => reason !== undefined && reason !== null && reason.trim() !== '').slice(0, 2);
};

export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
        regex.test(part) ? <mark key={index} className="bg-transparent text-inherit font-bold">{part}</mark> : part
    );
};

export const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}j`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 10080)}w`;
    if (diffInMinutes < 525600) return `${Math.floor(diffInMinutes / 43200)}m`;
    return `${Math.floor(diffInMinutes / 525600)}y`;
}; 