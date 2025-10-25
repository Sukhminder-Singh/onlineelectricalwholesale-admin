import { useAuth } from "../context/AuthContext";
import { useProfileData } from "../hooks/useProfileData";
import { useModal } from "../hooks/useModal";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { showSuccessToast, showErrorToast } from "../components/ui/toast";
import { User, Mail, Phone, MapPin, Calendar, Globe, Hash, Building, CreditCard, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function UserProfiles() {
  const { user, updateUserProfile } = useAuth();
  const { profileData, updateFields } = useProfileData();
  const { isOpen, openModal, closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    country: '',
    cityState: '',
    postalCode: '',
    taxId: ''
  });

  // Initialize form data with user data and profile data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        country: profileData.country || '',
        cityState: profileData.cityState || '',
        postalCode: profileData.postalCode || '',
        taxId: profileData.taxId || ''
      });
    }
  }, [user, profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user || isSubmitting) {
      return;
    }
    
    // Basic validation for required fields
    if (!formData.firstName.trim()) {
      showErrorToast('Validation Error', 'First name is required.');
      return;
    }
    
    if (!formData.lastName.trim()) {
      showErrorToast('Validation Error', 'Last name is required.');
      return;
    }
    
    if (!formData.email.trim()) {
      showErrorToast('Validation Error', 'Email is required.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showErrorToast('Validation Error', 'Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data (firstName, lastName, email) for authApi.updateProfile
      const userUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      // Call the API to update user profile using existing authApi.updateProfile
      const success = await updateUserProfile(userUpdateData);
      
      if (success) {
        // Update local profile data for non-user fields
        updateFields({
          phone: formData.phone,
          bio: formData.bio,
          country: formData.country,
          cityState: formData.cityState,
          postalCode: formData.postalCode,
          taxId: formData.taxId
        });
        
        showSuccessToast(
          'Profile Updated',
          'Your profile information has been updated successfully.'
        );
        closeModal();
      } else {
        showErrorToast(
          'Update Failed',
          'Failed to update profile. Please try again.'
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast(
        'Update Error',
        'An error occurred while updating your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to display data or "-" if empty
  const displayData = (value: string | undefined) => {
    return value && value.trim() !== '' ? value : '-';
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  if (!user) {
    return (
      <>
        <PageMeta
          title="User Profile | TailAdmin"
          description="User Profile Dashboard"
        />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="User Profile | TailAdmin"
        description="User Profile Dashboard"
      />
      <PageBreadcrumb pageTitle="Profile" />
      
      {/* Minimal Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.firstName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {displayData(user.firstName)} {displayData(user.lastName)}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {displayData(user.username)}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {displayData(user.role)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {displayData(user.email)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayData(profileData.phone)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Country</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayData(profileData.country)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City/State</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayData(profileData.cityState)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Postal Code</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayData(profileData.postalCode)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">TAX ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayData(profileData.taxId)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profileData.bio && profileData.bio.trim() !== '' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {profileData.bio}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl mx-4">
        <div className="relative w-full max-w-2xl overflow-y-auto bg-white rounded-2xl p-4 dark:bg-gray-900 lg:p-6 max-h-[90vh]">
          {/* Modal Header with Close Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Edit Profile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your information
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <form className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>First Name <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Bio</Label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none text-sm"
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Brief bio..."
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Location & Business
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Country</Label>
                    <Input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <Label>City/State</Label>
                    <Input
                      type="text"
                      value={formData.cityState}
                      onChange={(e) => handleInputChange('cityState', e.target.value)}
                      placeholder="Enter city/state"
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div>
                    <Label>TAX ID</Label>
                    <Input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="Enter TAX ID"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <Button size="sm" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSubmitting}
              className={isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
