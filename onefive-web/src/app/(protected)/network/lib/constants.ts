import { Users01 as Users, Mail01 as Megaphone, Zap as Lightbulb, Folder as Briefcase } from '@untitledui/icons';

export const allIntentionOptions = [
    { id: 'all', label: 'Toutes les intentions' },
    { id: 'cofounder', label: '🔍 Cherche Co-fondateur' },
    { id: 'cofounder-tech', label: '💻 Co-fondateur Tech' },
    { id: 'cofounder-business', label: '💼 Co-fondateur Business' },
    { id: 'cofounder-product', label: '🎯 Co-fondateur Product' },
    { id: 'fundraising', label: '💰 Lève des fonds' },
    { id: 'fundraising-seed', label: '🌱 Lève Seed (<500k€)' },
    { id: 'fundraising-series-a', label: '🚀 Lève Série A (1-5M€)' },
    { id: 'hiring', label: '👥 Recrute activement' },
    { id: 'hiring-tech', label: '👨‍💻 Recrute Tech' },
    { id: 'hiring-sales', label: '📈 Recrute Commercial' },
    { id: 'hiring-marketing', label: '📢 Recrute Marketing' },
    { id: 'opportunities', label: '🎪 Cherche opportunités' },
    { id: 'job-opportunity', label: '💼 Cherche un job' },
    { id: 'investment', label: '🎯 Cherche investissements' },
    { id: 'partnership', label: '🤝 Cherche partenariats' },
    { id: 'mentor-all', label: '🧠 Mentorat - Tous domaines' },
    { id: 'mentor-startup', label: '🚀 Mentor Startup général' },
    { id: 'mentor-tech', label: '💻 Mentor Tech & Dev' },
    { id: 'mentor-product', label: '🎯 Mentor Product' },
    { id: 'mentor-growth', label: '📈 Mentor Growth & Marketing' },
    { id: 'mentor-fundraising', label: '💰 Mentor Fundraising' },
    { id: 'mentor-sales', label: '📊 Mentor Sales & BizDev' },
];

// Roles matching ProfileRole enum from profile-role.enum.ts
export const roleOptions = [
    { id: 'all', label: 'Tous les rôles' },
    { id: 'FOUNDER', label: '🚀 Fondateur de Startup' },
    { id: 'BUSINESS_ANGEL', label: '💰 Business Angel' },
    { id: 'VENTURE_CAPITALIST', label: '📊 Venture Capitalist' },
    { id: 'INSTITUTIONAL_INVESTOR', label: '🏢 Investisseur Institutionnel' },
    { id: 'MENTOR', label: '🧑‍🏫 Mentor Startup' },
    { id: 'STRATEGIC_ADVISOR', label: '🧐 Conseiller Stratégique' },
    { id: 'STUDENT_ENTREPRENEUR', label: '📚 Étudiant Entrepreneur' },
    { id: 'SERVICE_PROVIDER', label: '🔧 Prestataire pour Startups' },
    { id: 'MEDIA', label: '📰 Journaliste / Créateur Média' },
    { id: 'INCUBATOR_ACCELERATOR', label: '🏘️ Structure d\'Accompagnement' },
    { id: 'RECRUITER_HR', label: '🧑‍💼 Recruteur / RH Startup' },
    { id: 'OTHER', label: '👤 Autre Profil' },
];

// Location search is now free text - no predefined options needed
export const locationOptions = [
    { id: 'all', label: 'Toutes les villes' },
];

export const sortOptions = [
    { id: 'recent', label: 'Plus récent' },
    { id: 'name', label: 'Nom (A-Z)' },
    { id: 'location', label: 'Localisation' },
];

// Clés alignées sur le vocabulaire intentionCategory réellement émis par le back.
export const intentionConfig = {
    hiring: { icon: Briefcase, text: 'Recrute', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    investing: { icon: Megaphone, text: 'Lève des fonds', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    opportunities: { icon: Users, text: 'Ouvert aux opportunités', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    mentoring: { icon: Lightbulb, text: 'Propose du mentorat', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
}; 