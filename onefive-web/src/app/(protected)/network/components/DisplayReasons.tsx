import React from 'react';
import {
    Users01 as MutualUsersIcon,
    Users01 as Users,
    Zap as Lightbulb,
    SearchLg as Search,
    Building01 as Building,
    ChartBreakoutSquare as TrendingUp,
    CheckCircle as UserCheck,
    Folder as Briefcase,
    Plus as UserPlus
} from '@untitledui/icons';

const DisplayReasons = ({ reasons }: { reasons: string[] }) => {
    const validReasons = reasons.filter(reason => reason !== undefined && reason !== null && reason.trim() !== '');
    if (validReasons.length === 0) return null;

    const iconMap: { [key: string]: React.ReactNode } = {
        'en commun': <MutualUsersIcon className="h-3.5 w-3.5 flex-shrink-0" />,
        'Cherche associé': <Users className="h-3.5 w-3.5 flex-shrink-0" />,
        'Mentor': <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />,
        'Cherche opportunités': <Search className="h-3.5 w-3.5 flex-shrink-0" />,
        'Founder': <Building className="h-3.5 w-3.5 flex-shrink-0" />,
        'VC': <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />,
        'Business Angel': <UserCheck className="h-3.5 w-3.5 flex-shrink-0" />,
        'Ex-FAANG': <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />,
        'Top école': <Users className="h-3.5 w-3.5 flex-shrink-0" />,
        'Filtre:': <Search className="h-3.5 w-3.5 flex-shrink-0" />,
        'Recherche:': <Search className="h-3.5 w-3.5 flex-shrink-0" />,
        'Dans votre réseau': <Users className="h-3.5 w-3.5 flex-shrink-0" />,
        'Nouveau profil': <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />,
    };

    const getIcon = (reason: string) => {
        if (!reason) return null;
        for (const key in iconMap) {
            if (reason.includes(key)) {
                return iconMap[key];
            }
        }
        return null;
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-4 min-h-[2rem]">
            {validReasons.map((reason, index) => (
                <React.Fragment key={index}>
                    <span className="flex items-center gap-1.5">
                        {getIcon(reason)}
                        <span>{reason}</span>
                    </span>
                    {index < validReasons.length - 1 && <span className="text-gray-300">•</span>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default DisplayReasons; 