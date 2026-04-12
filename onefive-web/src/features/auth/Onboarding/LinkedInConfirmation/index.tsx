'use client';
import { useState } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, GraduationCap, MapPin, Award, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { LinkedInOnboardingData } from '../OnboardingContext';

interface LinkedInConfirmationProps {
  data: LinkedInOnboardingData;
  onConfirm: (selectedData: {
    experienceIndexes: number[];
    educationIndexes: number[];
  }) => void;
  onCancel: () => void;
}

export const LinkedInConfirmation = ({ data, onConfirm, onCancel }: LinkedInConfirmationProps) => {
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>(
    data.experiences.map((_, idx) => idx)
  );
  const [selectedEducations, setSelectedEducations] = useState<number[]>(
    data.educations.map((_, idx) => idx)
  );

  const toggleExperience = (index: number) => {
    setSelectedExperiences(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleEducation = (index: number) => {
    setSelectedEducations(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      experienceIndexes: selectedExperiences,
      educationIndexes: selectedEducations,
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A66C2] to-[#004182] px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              {data.profile.profilePictureUrl ? (
                <AvatarImage src={data.profile.profilePictureUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
              )}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {data.profile.firstName} {data.profile.lastName}
              </h2>
              {data.profile.headline && (
                <p className="text-blue-100 mt-1">{data.profile.headline}</p>
              )}
              {data.profile.location && (
                <div className="flex items-center gap-2 mt-2 text-blue-100">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{data.profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ✨ <strong>Parfait !</strong> Nous avons récupéré vos informations LinkedIn. 
              Sélectionnez les expériences et formations que vous souhaitez importer dans votre profil.
            </p>
          </div>

          {/* Experiences */}
          {data.experiences.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Expériences professionnelles ({data.experiences.length})
                </h3>
              </div>
              <div className="space-y-3">
                {data.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedExperiences.includes(index)
                        ? 'border-[#0A66C2] bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => toggleExperience(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedExperiences.includes(index)}
                        onCheckedChange={() => toggleExperience(index)}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Présent'}
                        </p>
                        {exp.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {exp.location}</p>
                        )}
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educations */}
          {data.educations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Formation ({data.educations.length})
                </h3>
              </div>
              <div className="space-y-3">
                {data.educations.map((edu, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedEducations.includes(index)
                        ? 'border-[#0A66C2] bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => toggleEducation(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedEducations.includes(index)}
                        onCheckedChange={() => toggleEducation(index)}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{edu.school}</h4>
                        {edu.degree && (
                          <p className="text-sm text-gray-600">{edu.degree}</p>
                        )}
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Présent'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Compétences ({data.skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.slice(0, 20).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {data.skills.length > 20 && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                    +{data.skills.length - 20} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Message si aucune donnée */}
          {data.experiences.length === 0 && data.educations.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                ℹ️ Nous avons récupéré vos informations de base, mais aucune expérience ou formation n'a été trouvée.
                Vous pourrez les ajouter manuellement après avoir créé votre profil.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-4">
          <ShadcnButton variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </ShadcnButton>
          <ShadcnButton onClick={handleConfirm} className="flex-1">
            Créer mon profil {selectedExperiences.length + selectedEducations.length > 0 && `(${selectedExperiences.length + selectedEducations.length} éléments)`}
          </ShadcnButton>
        </div>
      </div>
    </motion.div>
  );
};

