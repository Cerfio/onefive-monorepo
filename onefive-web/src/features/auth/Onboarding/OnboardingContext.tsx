'use client';

import { DialCodeType } from '@/shared/types/dial-code';
import { createContext, useState, useContext } from 'react';
import dialCodeData from '@/assets/dial-code-emoji.json';
import { ProfileRole } from '@/sharing-enum/profile';

export interface LinkedInExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
}

export interface LinkedInEducation {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface LinkedInOnboardingData {
  profile: {
    firstName: string;
    lastName: string;
    headline?: string;
    location?: string;
    countryCode?: string;
    city?: string;
    profilePictureUrl?: string;
  };
  experiences: LinkedInExperience[];
  educations: LinkedInEducation[];
  skills: string[];
}

const OnboardingContextProvider = ({ children }: React.PropsWithChildren) => {
  const [firstname, setFirstname] = useState(sessionStorage.getItem('firstname') || '');
  const [lastname, setLastname] = useState(sessionStorage.getItem('lastname') || '');
  const [countryCode, setCountryCode] = useState(sessionStorage.getItem('countryCode') || '');
  const [city, setCity] = useState(sessionStorage.getItem('city') || '');
  const [gender, setGender] = useState('');
  const [anotherGender, setAnotherGender] = useState<{
    genderName: string;
    addressGender: 'man' | 'woman' | 'other';
  }>({
    addressGender: 'man',
    genderName: '',
  });
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [profileFollowed, setProfileFollowed] = useState<string[]>([]);
  const [startupsFollowed, setStartupsFollowed] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState(sessionStorage.getItem('pictureUrl') || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [dialCode, setDialCode] = useState<DialCodeType>(dialCodeData[0]);
  const [mainRole, setMainRole] = useState<ProfileRole | null>(null);
  const [secondaryRole, setSecondaryRole] = useState<ProfileRole | null>(null);
  const [referredByCode, setReferredByCode] = useState('');
  
  // LinkedIn onboarding data
  const [linkedInData, setLinkedInData] = useState<LinkedInOnboardingData | null>(null);
  const [selectedExperiences, setSelectedExperiences] = useState<LinkedInExperience[]>([]);
  const [selectedEducations, setSelectedEducations] = useState<LinkedInEducation[]>([]);

  return (
    <OnboardingContext.Provider
      value={{
        dialCode,
        setDialCode,
        firstname,
        setFirstname,
        lastname,
        setLastname,
        countryCode,
        setCountryCode,
        city,
        setCity,
        dateOfBirth,
        setDateOfBirth,
        gender,
        setGender,
        anotherGender,
        setAnotherGender,
        phoneNumber,
        setPhoneNumber,
        tags,
        setTags,
        profileFollowed,
        setProfileFollowed,
        startupsFollowed,
        setStartupsFollowed,
        profilePicture,
        setProfilePicture,
        avatarFile,
        setAvatarFile,
        buttonDisabled,
        setButtonDisabled,
        mainRole,
        setMainRole,
        secondaryRole,
        setSecondaryRole,
        referredByCode,
        setReferredByCode,
        linkedInData,
        setLinkedInData,
        selectedExperiences,
        setSelectedExperiences,
        selectedEducations,
        setSelectedEducations,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContextProvider;

interface IOnboardingContext {
  firstname: string;
  setFirstname: React.Dispatch<React.SetStateAction<string>>;
  lastname: string;
  setLastname: React.Dispatch<React.SetStateAction<string>>;
  countryCode: string;
  setCountryCode: React.Dispatch<React.SetStateAction<string>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>;
  anotherGender: {
    genderName: string;
    addressGender: 'man' | 'woman' | 'other';
  };
  setAnotherGender: React.Dispatch<
    React.SetStateAction<{
      genderName: string;
      addressGender: 'man' | 'woman' | 'other';
    }>
  >;
  dateOfBirth: string;
  setDateOfBirth: React.Dispatch<React.SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  dialCode: DialCodeType;
  setDialCode: React.Dispatch<React.SetStateAction<DialCodeType>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  profileFollowed: string[];
  setProfileFollowed: React.Dispatch<React.SetStateAction<string[]>>;
  startupsFollowed: string[];
  setStartupsFollowed: React.Dispatch<React.SetStateAction<string[]>>;
  profilePicture: string;
  setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
  avatarFile: File | null;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  mainRole: ProfileRole | null;
  setMainRole: React.Dispatch<React.SetStateAction<ProfileRole | null>>;
  secondaryRole: ProfileRole | null;
  setSecondaryRole: React.Dispatch<React.SetStateAction<ProfileRole | null>>;
  referredByCode: string;
  setReferredByCode: React.Dispatch<React.SetStateAction<string>>;
  linkedInData: LinkedInOnboardingData | null;
  setLinkedInData: React.Dispatch<React.SetStateAction<LinkedInOnboardingData | null>>;
  selectedExperiences: LinkedInExperience[];
  setSelectedExperiences: React.Dispatch<React.SetStateAction<LinkedInExperience[]>>;
  selectedEducations: LinkedInEducation[];
  setSelectedEducations: React.Dispatch<React.SetStateAction<LinkedInEducation[]>>;
}

export const OnboardingContext = createContext<IOnboardingContext | undefined>(undefined);

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboardingContext must be used within a OnboardingContextProvider');
  }

  return context;
};
