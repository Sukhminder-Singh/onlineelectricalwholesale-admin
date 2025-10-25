import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface ProfileData {
  // Personal Information
  phone: string;
  bio: string;
  location: string;
  
  // Social Links
  facebook: string;
  xcom: string;
  linkedin: string;
  instagram: string;
  
  // Address Information
  country: string;
  cityState: string;
  postalCode: string;
  taxId: string;
}

const STORAGE_KEY = 'userProfileData';

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: '',
    bio: '',
    location: '',
    facebook: '',
    xcom: '',
    linkedin: '',
    instagram: '',
    country: '',
    cityState: '',
    postalCode: '',
    taxId: ''
  });

  // Load profile data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user._id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfileData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error parsing stored profile data:', error);
        }
      }
    }
  }, [user]);

  // Save profile data to localStorage
  const saveProfileData = (data: Partial<ProfileData>) => {
    if (!user) return;

    const updatedData = { ...profileData, ...data };
    setProfileData(updatedData);
    
    try {
      localStorage.setItem(`${STORAGE_KEY}_${user._id}`, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  // Update a specific field
  const updateField = (field: keyof ProfileData, value: string) => {
    saveProfileData({ [field]: value });
  };

  // Update multiple fields at once
  const updateFields = (fields: Partial<ProfileData>) => {
    saveProfileData(fields);
  };

  // Clear all profile data (useful for logout)
  const clearProfileData = () => {
    setProfileData({
      phone: '',
      bio: '',
      location: '',
      facebook: '',
      xcom: '',
      linkedin: '',
      instagram: '',
      country: '',
      cityState: '',
      postalCode: '',
      taxId: ''
    });
  };

  return {
    profileData,
    saveProfileData,
    updateField,
    updateFields,
    clearProfileData
  };
};
