'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../base/buttons/button';
import { Separator } from '@/components/base/separator/separator';
import { Edit3, Briefcase, GraduationCap } from 'lucide-react';
import { CompanyIcon } from './CompanyIcon';
import { formatExperienceDate } from '@/utils/dateUtils';
import { Badge } from '@/components/base/badges/badges';
import { Tags } from '@/enums';
import { tags as tagList } from '@/constant';
import { cn } from '@/lib/utils';

export const AboutCard = ({ profileData, currentUser, onEdit }: { profileData: any, currentUser: boolean, onEdit: () => void }) => {
    // AboutCard affiche toutes les expériences/éducations (pas seulement la plus récente)
    const experiences = profileData.allExperiences || profileData.experience || [];
    const educations = profileData.allEducations || profileData.education || [];

    // Fonction helper pour afficher les tags
    const renderTags = (tags: Tags[] | null | undefined) => {
        if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, tagIndex) => {
                    const tagData = tagList.find((t) => t.enum === tag);
                    if (!tagData) return null;
                    return (
                        <Badge
                            key={`tag-${tag}-${tagIndex}`}
                            type="pill-color"
                            color="brand"
                            size="sm"
                            className={cn(
                                tagData.bgColor,
                                tagData.textColor,
                                tagData.hoverBgColor,
                            )}
                        >
                            {tagData.title} {tagData.icon}
                        </Badge>
                    );
                })}
            </div>
        );
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>À Propos</CardTitle>
                {currentUser && (
                <Button color="tertiary" size="sm" onClick={onEdit}>
                    <Edit3 className="h-4 w-4" />
                </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-sm mb-3">Expérience</h4>
                    {experiences.length > 0 ? (
                        experiences.map((exp: any) => (
                            <div key={exp.id} className="flex gap-3 items-start mb-4">
                                <CompanyIcon domain={exp.domain} companyName={exp.company} logoUrl={exp.logoUrl} />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-[#101828]">{exp.title}</p>
                                    <p className="text-xs text-gray-500">{exp.company} • {formatExperienceDate(exp.startDate)} - {formatExperienceDate(exp.endDate)}</p>
                                    {renderTags(exp.tags)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-2 py-4 text-gray-400">
                            <Briefcase className="h-4 w-4 shrink-0" />
                            <p className="text-sm">Aucune expérience renseignée</p>
                        </div>
                    )}
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-sm mb-3">Formation</h4>
                    {educations.length > 0 ? (
                        educations.map((edu: any) => (
                            <div key={edu.id} className="flex gap-3 items-start mb-4">
                                <CompanyIcon domain={edu.domain} companyName={edu.school} logoUrl={edu.logoUrl} />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-[#101828]">{edu.degree}</p>
                                    <p className="text-xs text-gray-500">{edu.school} • {formatExperienceDate(edu.startDate)} - {formatExperienceDate(edu.endDate)}</p>
                                    {renderTags(edu.tags)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-2 py-4 text-gray-400">
                            <GraduationCap className="h-4 w-4 shrink-0" />
                            <p className="text-sm">Aucune formation renseignée</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 